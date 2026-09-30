import { headers } from "next/headers";
import { cache } from "react";

import type { Catalogue } from "./catalogue";
import { staticCatalogue } from "./catalogue-static";

/**
 * Reads the catalogue.
 *
 * Two modes, chosen by whether `CMS_URL` is set:
 *
 *   **Live.** One request fetches the whole shop from the CMS for the
 *   business that owns the request hostname. Cached per render with `cache()`
 *   and across requests by tag, purged by the CMS's publish webhook, with a
 *   five-minute backstop for a webhook that never arrives.
 *
 *   **Static.** No CMS configured — the site serves the typed catalogue in
 *   `content/menu.ts` and the photographs in `public/products/`. This is what
 *   lets `main` deploy and trade before the admin exists on a server. Nothing
 *   about rendering changes; only where the data came from.
 *
 * The mode is explicit rather than "try live, fall back to static": a CMS that
 * is configured but unreachable is an outage to be seen, not papered over with
 * data that may be stale.
 */

export const CATALOGUE_TAG = "catalogue";

const CMS_URL = process.env.CMS_URL?.replace(/\/$/, "") || null;

/** True when the site is running from the typed catalogue rather than a CMS. */
export function isStaticMode(): boolean {
  return CMS_URL === null;
}

export class CmsUnavailableError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "CmsUnavailableError";
  }
}

async function fetchCatalogue(host: string): Promise<Catalogue> {
  const url = `${CMS_URL}/api/storefront?host=${encodeURIComponent(host)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      next: { tags: [CATALOGUE_TAG], revalidate: 300 },
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new CmsUnavailableError(
      `Could not reach the CMS at ${CMS_URL}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (response.status === 404) {
    // No business owns this hostname. Distinct from the CMS being down, and
    // the caller turns it into a 404 page rather than an error.
    throw new CmsUnavailableError(`No shop is configured for "${host}".`, 404);
  }

  if (!response.ok) {
    throw new CmsUnavailableError(`CMS replied ${response.status} for ${host}.`, response.status);
  }

  return (await response.json()) as Catalogue;
}

/** Per-render memoised catalogue for an explicit host. */
export const getCatalogueForHost = cache(async (raw: string): Promise<Catalogue> => {
  if (CMS_URL === null) return staticCatalogue();
  return fetchCatalogue(raw);
});

/**
 * The catalogue for the business that owns the current request's hostname.
 *
 * Resolving by host rather than by a configured constant is what makes one
 * deployment able to serve several shops — and why, in live mode, there is
 * deliberately no fallback tenant. Defaulting to "the first one" is exactly how
 * one business's menu ends up on another's domain.
 */
export const getCatalogue = cache(async (): Promise<Catalogue> => {
  if (CMS_URL === null) return staticCatalogue();
  const host = (await headers()).get("host");
  if (!host) throw new CmsUnavailableError("The request carried no Host header.", 400);
  return getCatalogueForHost(host);
});
