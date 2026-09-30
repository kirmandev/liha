import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Checks a discount code, without spending it.
 *
 * Proxied through our own origin for the same reasons order submission is: the
 * CMS origin stays a server-side detail, and the business is resolved from the
 * hostname the customer actually visited rather than anything the browser can
 * set.
 *
 * Only slugs and quantities are forwarded. The CMS recomputes the subtotal from
 * its own catalogue — a browser claiming a large subtotal could otherwise clear
 * a code's minimum-order threshold.
 */

export const runtime = "nodejs";

const CMS_URL = process.env.CMS_URL ?? "http://localhost:3005";

export async function POST(request: Request) {
  const host = (await headers()).get("host");
  if (!host) {
    return NextResponse.json({ valid: false, message: "Unknown shop." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, message: "Malformed request." }, { status: 400 });
  }

  const url = `${CMS_URL.replace(/\/$/, "")}/api/storefront/discount?host=${encodeURIComponent(host)}`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forwarded so the CMS rate-limits the real caller rather than this
        // server, which would otherwise look like one very busy customer.
        "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { valid: false, message: "Could not check that code just now. Please try again." },
      { status: 502 },
    );
  }
}
