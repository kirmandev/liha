import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Proxies a checkout submission to the CMS.
 *
 * The browser posts here rather than straight at the CMS so that the CMS origin
 * stays a server-side detail, the request is same-origin (no CORS preflight on
 * the critical path), and the *hostname the customer actually visited* is what
 * resolves the business — a header the browser cannot spoof into another
 * tenant's shop.
 *
 * This route deliberately does no validation and no pricing. Both belong on the
 * CMS, which owns the catalogue; duplicating them here would mean two places to
 * keep in step and two chances to disagree about what an order costs.
 */

export const runtime = "nodejs";

const CMS_URL = process.env.CMS_URL ?? "http://localhost:3005";

export async function POST(request: Request) {
  const host = (await headers()).get("host");

  if (!host) {
    return NextResponse.json(
      { errors: { cart: "We could not identify the shop for this request." } },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errors: { cart: "Malformed request." } }, { status: 400 });
  }

  const url = `${CMS_URL.replace(/\/$/, "")}/api/storefront/orders?host=${encodeURIComponent(host)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      // An order is worth waiting for, but not forever — a customer staring at
      // a spinner will refresh, which is what the idempotency key is for.
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error(
      `[orders] CMS unreachable: ${error instanceof Error ? error.message : String(error)}`,
    );
    return NextResponse.json(
      {
        errors: {
          cart: "We could not reach the kitchen just now. Please try again in a moment.",
        },
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();

  // Passed through verbatim: the CMS already returns field-keyed errors the
  // checkout form knows how to render, and rewriting them here would only lose
  // detail.
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
