import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { CATALOGUE_TAG } from "@/lib/cms";

/**
 * Drops the cached catalogue when the CMS says content changed.
 *
 * Without this the shop is only as fresh as its revalidate window, and an owner
 * who changes a price, reloads the site and sees the old one concludes the
 * admin is broken — whatever the caching docs say.
 *
 * Authenticated by a shared secret in a header rather than a query string, so
 * it does not end up in access logs, browser history or a referrer. Compared in
 * constant time, because a timing oracle on a revalidation endpoint is still a
 * timing oracle.
 *
 * Revalidating by tag rather than by path: every page reads the same catalogue
 * through one fetch, so one tag covers the home page, the menu and all 33
 * product pages. Per-path invalidation would mean knowing which paths a product
 * appears on, which is exactly the coupling tags exist to avoid.
 */

export const runtime = "nodejs";

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    // Refuse rather than revalidate freely. An unsecured cache-purge endpoint is
    // a denial-of-service lever pointed at our own origin.
    return NextResponse.json({ error: "Revalidation is not configured." }, { status: 503 });
  }

  const supplied = request.headers.get("x-revalidate-secret") ?? "";
  if (!constantTimeEquals(supplied, expected)) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  let body: { collection?: string; id?: string | null } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // A body is informational only — the tag is the same either way.
  }

  // `{ expire: 0 }` rather than the recommended `"max"`: that profile serves
  // stale content for up to a year while revalidating in the background, which
  // for a price change means continuing to show the old price to real
  // customers. Here the next request blocks until fresh — a few hundred
  // milliseconds, once, in exchange for never quoting a stale price.
  revalidateTag(CATALOGUE_TAG, { expire: 0 });

  return NextResponse.json({
    revalidated: CATALOGUE_TAG,
    because: body.collection ?? "unspecified",
    at: new Date().toISOString(),
  });
}
