/**
 * Order submission — the seam between checkout and wherever orders actually go.
 *
 * It now goes to the CMS, which **re-prices the order from its own catalogue**.
 * This module sends slugs and quantities and never sends a price. The totals
 * the cart shows exist so the customer can see a number before submitting; the
 * figures on the saved order are the server's, and if the two ever disagree the
 * server is right.
 *
 * WhatsApp is still how staff are told an order arrived, but it is no longer
 * the record — the order exists in the admin whether or not the message is
 * sent. That is the whole point of this phase.
 */

import { PAYMENT_METHODS, type PaymentMethod } from "@/content/site";
import type { ResolvedLine } from "./pricing";
import { buildWhatsAppUrl } from "./whatsapp";

export type CustomerDetails = {
  name: string;
  phone: string;
  address: string;
  note?: string;
  discountCode?: string;
  paymentMethod: PaymentMethod;
};

export type OrderDraft = {
  customer: CustomerDetails;
  lines: ResolvedLine[];
  /** What the cart displayed. Sent for nothing; the server computes its own. */
  totals: { subtotal: number; tax: number; taxRatePercent: number; total: number };
};

/** What the CMS returns once an order is persisted. */
export type PlacedOrder = {
  reference: string;
  status: string;
  subtotal: number;
  tax: number;
  taxRatePercent: number;
  total: number;
  /** Always false for now: codes are recorded and confirmed by staff. */
  discountApplied: boolean;
  items: Array<{ name: string; quantity: number; addOns: string[]; lineTotal: number }>;
};

export type SubmitResult =
  | { ok: true; order: PlacedOrder; handoffUrl: string; duplicate: boolean }
  | { ok: false; errors: Record<string, string> };

/**
 * Client-side checks, so an obviously incomplete form does not need a round
 * trip. The server validates everything again — this is for the typing
 * experience, never for correctness.
 */
export function validateDraft(
  draft: OrderDraft,
  minOrderValue: number,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const { name, phone, address } = draft.customer;

  if (name.trim().length < 2) errors.name = "Please tell us your name.";

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    errors.phone = "Please enter a valid phone number we can reach you on.";
  }

  if (address.trim().length < 10) {
    errors.address = "Please give a full address, including the area.";
  }

  if (draft.lines.length === 0) {
    errors.cart = "Your cart is empty.";
  } else if (draft.totals.subtotal < minOrderValue) {
    errors.cart = `Minimum order is Rs ${minOrderValue}. Add Rs ${
      minOrderValue - draft.totals.subtotal
    } more to check out.`;
  }

  return errors;
}

export function paymentMethodLabel(id: PaymentMethod): string {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
}

/**
 * A key that survives retries but not a genuinely new order.
 *
 * Generated once per checkout attempt and sent with the order, so a double-tap,
 * a flaky connection or an impatient refresh cannot create two orders. The
 * server returns the original instead.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** The body the CMS expects. Note the absence of any price. */
function toRequestBody(draft: OrderDraft, idempotencyKey: string) {
  return {
    idempotencyKey,
    items: draft.lines.map((entry) => ({
      slug: entry.product.slug,
      qty: entry.line.qty,
      addOns: entry.addOns.map((addOn) => addOn.slug),
    })),
    customer: {
      name: draft.customer.name.trim(),
      phone: draft.customer.phone.trim(),
      address: draft.customer.address.trim(),
      note: draft.customer.note?.trim() || undefined,
    },
    paymentMethod: draft.customer.paymentMethod,
    discountCode: draft.customer.discountCode?.trim().toUpperCase() || undefined,
  };
}

/** The WhatsApp message, built from the server's figures rather than the cart's. */
export function buildHandoffUrl(order: PlacedOrder, customer: CustomerDetails): string {
  return buildWhatsAppUrl({
    kind: "cartOrder",
    reference: order.reference,
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    paymentMethod: paymentMethodLabel(customer.paymentMethod),
    note: customer.note?.trim() || undefined,
    discountCode: customer.discountCode?.trim().toUpperCase() || undefined,
    items: order.items.map((item) => ({
      name: item.name,
      qty: item.quantity,
      addOns: item.addOns,
      total: item.lineTotal,
    })),
    subtotal: order.subtotal,
    taxRatePercent: order.taxRatePercent,
    tax: order.tax,
    total: order.total,
  });
}

/**
 * Places the order.
 *
 * Posts to the storefront's own API route rather than the CMS directly, so the
 * CMS origin and any credentials stay server-side and the browser makes a
 * same-origin request.
 */
export async function submitOrder(
  draft: OrderDraft,
  idempotencyKey: string,
): Promise<SubmitResult> {
  let response: Response;

  try {
    response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRequestBody(draft, idempotencyKey)),
    });
  } catch {
    return {
      ok: false,
      errors: {
        cart: "We could not reach the kitchen just now. Please check your connection and try again.",
      },
    };
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    // Fall through to the status-based message below.
  }

  if (!response.ok) {
    const errors = payload.errors as Record<string, string> | undefined;
    if (errors && Object.keys(errors).length > 0) return { ok: false, errors };
    return {
      ok: false,
      errors: { cart: "Something went wrong placing your order. Please try again." },
    };
  }

  const order = payload as unknown as PlacedOrder & { duplicate?: boolean };

  return {
    ok: true,
    order,
    handoffUrl: buildHandoffUrl(order, draft.customer),
    duplicate: Boolean(order.duplicate),
  };
}
