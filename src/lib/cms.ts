import { headers } from "next/headers";
import { cache } from "react";

import type { Catalogue } from "./catalogue";

/**
 * Reads the catalogue from the CMS.
 *
 * One request returns the whole shop — tenant, settings and every category with
 * its products. At roughly 30KB that is cheaper than the round trips paginating
 * it would cost, and it means a page renders from a single cache entry.
 *
 * Two layers of caching, doing different jobs:
 *
 *   `cache()`        deduplicates within one render, so a page calling this
 *                    from four components hits the network once.
 *   `next: { tags }` persists across requests until the CMS calls our
 *                    /api/revalidate webhook on publish.
 *
 * The `revalidate` window is a backstop for a webhook that never arrives — a
 * CMS restart, a dropped request, a misconfigured secret. Five minutes of
 * staleness is a tolerable worst case; an indefinitely stale menu is not.
 */

export const CATALOGUE_TAG = "catalogue";

const CMS_URL = process.env.CMS_URL ?? "http://localhost:3005";

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
  const url = `${CMS_URL.replace(/\/$/, "")}/api/storefront?host=${encodeURIComponent(host)}`;

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
    // No business owns this hostname. Distinct from the CMS being down, and the
    // caller turns it into a 404 page rather than an error.
    throw new CmsUnavailableError(`No shop is configured for "${host}".`, 404);
  }

  if (!response.ok) {
    throw new CmsUnavailableError(`CMS replied ${response.status} for ${host}.`, response.status);
  }

  return (await response.json()) as Catalogue;
}

/** Per-render memoised catalogue for an explicit host. */
export const getCatalogueForHost = cache(fetchCatalogue);

/**
 * The catalogue for the business that owns the current request's hostname.
 *
 * Resolving by host rather than by a configured constant is what makes one
 * deployment able to serve several shops — and why there is deliberately no
 * fallback tenant. Defaulting to "the first one" is exactly how one business's
 * menu ends up on another's domain.
 */
export const getCatalogue = cache(async (): Promise<Catalogue> => {
  const host = (await headers()).get("host");
  if (!host) throw new CmsUnavailableError("The request carried no Host header.", 400);
  return getCatalogueForHost(host);
});
