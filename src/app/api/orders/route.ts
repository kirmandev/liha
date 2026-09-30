import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { indexProducts } from "@/lib/catalogue";
import { staticCatalogue } from "@/lib/catalogue-static";
import { isStaticMode } from "@/lib/cms";

/**
 * Takes a checkout submission.
 *
 * **Live mode** proxies it to the CMS, which re-prices the order from its own
 * catalogue and records it. The browser posts here rather than straight at the
 * CMS so that the CMS origin stays a server-side detail, the request is
 * same-origin, and the *hostname the customer actually visited* is what
 * resolves the business — a header the browser cannot spoof into another
 * tenant's shop.
 *
 * **Static mode** — no CMS configured — re-prices against the typed catalogue
 * right here and hands back an order the WhatsApp message can be built from.
 * Nothing is persisted; WhatsApp is the record, which is exactly how the shop
 * ran before the admin existed. This is what lets `main` take orders the day
 * it is deployed.
 *
 * In both modes the client's prices are ignored. It sends slugs and
 * quantities; the server says what they cost.
 */

export const runtime = "nodejs";

const CMS_URL = process.env.CMS_URL?.replace(/\/$/, "");

type Incoming = {
  items?: Array<{ slug: string; qty: number; addOns?: string[] }>;
  customer?: { name?: string; phone?: string; address?: string; note?: string };
  paymentMethod?: string;
  discountCode?: string;
  idempotencyKey?: string;
};

const REFERENCE_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY349";

/** `LIHA-260930-K7QF`, from an alphabet without the glyphs people misread aloud. */
function localReference(at = new Date()): string {
  const yy = String(at.getFullYear()).slice(-2);
  const mm = String(at.getMonth() + 1).padStart(2, "0");
  const dd = String(at.getDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `LIHA-${yy}${mm}${dd}-${suffix}`;
}

function placeStatically(body: Incoming) {
  const errors: Record<string, string> = {};
  const customer = body.customer ?? {};

  if (!customer.name || customer.name.trim().length < 2) errors.name = "Please tell us your name.";
  const digits = (customer.phone ?? "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    errors.phone = "Please enter a valid phone number we can reach you on.";
  }
  if (!customer.address || customer.address.trim().length < 10) {
    errors.address = "Please give a full address, including the area.";
  }
  if (!Array.isArray(body.items) || body.items.length === 0) errors.cart = "Your cart is empty.";
  if (body.paymentMethod !== "jazzcash" && body.paymentMethod !== "bank") {
    errors.paymentMethod = "Please choose how you would like to pay.";
  }
  if (Object.keys(errors).length > 0) return NextResponse.json({ errors }, { status: 422 });

  const catalogue = staticCatalogue();
  const index = indexProducts(catalogue);
  const items = [];

  for (const line of body.items ?? []) {
    const product = index.get(line.slug);
    const quantity = Math.floor(Number(line.qty));
    if (!product || !Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json(
        { errors: { cart: `No longer available: ${line.slug}. Please remove it and try again.` } },
        { status: 409 },
      );
    }
    const addOns = (line.addOns ?? [])
      .map((slug) => index.get(slug))
      .filter((entry): entry is NonNullable<typeof entry> => entry != null);
    const unitPrice = product.price + addOns.reduce((sum, addOn) => sum + addOn.price, 0);
    items.push({
      name: product.name,
      quantity,
      addOns: addOns.map((addOn) => addOn.name),
      lineTotal: unitPrice * quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const { minOrderValue, taxRatePercent } = catalogue.settings;

  if (subtotal < minOrderValue) {
    return NextResponse.json(
      {
        errors: {
          cart: `Minimum order is Rs ${minOrderValue}. Add Rs ${minOrderValue - subtotal} more to check out.`,
        },
      },
      { status: 422 },
    );
  }

  const tax = taxRatePercent > 0 ? Math.round((subtotal * taxRatePercent) / 100) : 0;

  return NextResponse.json(
    {
      reference: localReference(),
      status: "placed",
      subtotal,
      tax,
      taxRatePercent,
      discountAmount: 0,
      pointsRedeemed: 0,
      pointsAmount: 0,
      total: subtotal + tax,
      // Codes are confirmed by staff over WhatsApp in this mode, never applied.
      discountApplied: false,
      pointsWillEarn: 0,
      items,
    },
    { status: 201 },
  );
}

export async function POST(request: Request) {
  let body: Incoming;
  try {
    body = (await request.json()) as Incoming;
  } catch {
    return NextResponse.json({ errors: { cart: "Malformed request." } }, { status: 400 });
  }

  if (isStaticMode() || !CMS_URL) return placeStatically(body);

  const host = (await headers()).get("host");
  if (!host) {
    return NextResponse.json(
      { errors: { cart: "We could not identify the shop for this request." } },
      { status: 400 },
    );
  }

  const url = `${CMS_URL}/api/storefront/orders?host=${encodeURIComponent(host)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
      },
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
      { errors: { cart: "We could not reach the kitchen just now. Please try again in a moment." } },
      { status: 502 },
    );
  }

  // Passed through verbatim: the CMS already returns field-keyed errors the
  // checkout form knows how to render.
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
