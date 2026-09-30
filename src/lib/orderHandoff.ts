/**
 * Carries a just-placed order from checkout to the confirmation page.
 *
 * sessionStorage rather than localStorage: a confirmation is about *this* visit,
 * and it should not still be sitting there tomorrow. Rather than a query string,
 * because the order contains the customer's address and phone, which have no
 * business being in a URL, a browser history entry or a referrer header.
 *
 * Orders are persisted in the CMS now, so this is no longer the record — it is
 * only what the confirmation page renders for this visit. The eventual
 * replacement is a page that fetches by reference once customers can sign in;
 * until accounts exist there is nothing to authenticate such a fetch against,
 * and an order reference alone is not a credential.
 */

import type { CustomerDetails, PlacedOrder } from "./order";

const KEY = "liha.lastOrder.v1";

/** Only what the confirmation page renders — not the full resolved catalogue entries. */
export type StoredOrder = {
  reference: string;
  placedAt: string;
  handoffUrl: string;
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  note?: string;
  discountCode?: string;
  items: Array<{ name: string; qty: number; addOns: string[]; total: number }>;
  subtotal: number;
  taxRatePercent: number;
  tax: number;
  total: number;
};

/**
 * Every figure here comes from the server's response, not from the cart. The
 * confirmation page is the customer's receipt, and a receipt showing what the
 * browser guessed rather than what was actually recorded would be worse than
 * showing nothing.
 */
export function toStoredOrder(
  order: PlacedOrder,
  customer: CustomerDetails,
  handoffUrl: string,
): StoredOrder {
  return {
    reference: order.reference,
    placedAt: new Date().toISOString(),
    handoffUrl,
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    paymentMethod: customer.paymentMethod,
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
  };
}

export function storeSubmittedOrder(
  order: PlacedOrder,
  customer: CustomerDetails,
  handoffUrl: string,
): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(toStoredOrder(order, customer, handoffUrl)));
  } catch {
    // Storage blocked. The confirmation page falls back to its empty state
    // rather than the checkout throwing after the order was already composed.
  }
}

export function readSubmittedOrder(): StoredOrder | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const order = parsed as StoredOrder;
    return typeof order.reference === "string" && Array.isArray(order.items) ? order : null;
  } catch {
    return null;
  }
}
