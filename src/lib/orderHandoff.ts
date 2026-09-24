/**
 * Carries a just-placed order from checkout to the confirmation page.
 *
 * sessionStorage rather than localStorage: a confirmation is about *this* visit,
 * and it should not still be sitting there tomorrow. Rather than a query string,
 * because the order contains the customer's address and phone, which have no
 * business being in a URL, a browser history entry or a referrer header.
 *
 * This is scaffolding for the no-backend phase. Once orders are persisted, the
 * confirmation page fetches by reference and this file is deleted.
 */

import type { SubmittedOrder } from "./order";

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

export function toStoredOrder(order: SubmittedOrder): StoredOrder {
  const { customer } = order.draft;
  return {
    reference: order.reference,
    placedAt: order.placedAt,
    handoffUrl: order.handoffUrl,
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    paymentMethod: customer.paymentMethod,
    note: customer.note?.trim() || undefined,
    discountCode: customer.discountCode?.trim().toUpperCase() || undefined,
    items: order.draft.lines.map((entry) => ({
      name: entry.product.name,
      qty: entry.line.qty,
      addOns: entry.addOns.map((addOn) => addOn.name),
      total: entry.total,
    })),
    subtotal: order.draft.totals.subtotal,
    taxRatePercent: order.draft.totals.taxRatePercent,
    tax: order.draft.totals.tax,
    total: order.draft.totals.total,
  };
}

export function storeSubmittedOrder(order: SubmittedOrder): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(toStoredOrder(order)));
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
