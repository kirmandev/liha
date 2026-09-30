/**
 * Cart arithmetic. Pure functions over plain data — no React, no storage, no
 * network. Everything that could quietly produce a wrong number lives here so
 * it can be tested directly.
 *
 * The catalogue and the shop's settings are passed in rather than imported.
 * They now come from the CMS and change without a deploy, so a module-level
 * import would either be stale or drag a network call into functions that
 * should stay pure. Passing them also makes every test state its own prices
 * instead of depending on today's menu.
 *
 * Money is whole PKR throughout. There are no sub-rupee prices on the menu, so
 * integers avoid float drift entirely; tax is the one place rounding applies.
 */

import type { CatalogueEntry, ProductIndex, StoreSettings } from "./catalogue";

export type CartLine = {
  /** Stable identity: slug plus sorted add-on slugs. See `lineId`. */
  id: string;
  slug: string;
  qty: number;
  /** Slugs of sauces added to this line. */
  addOns: string[];
};

/**
 * Two lines are the same line when they are the same product with the same
 * add-ons, regardless of the order those add-ons were picked. Sorting before
 * joining is what makes ["a","b"] and ["b","a"] merge instead of stacking up as
 * two near-identical rows in the cart.
 */
export function lineId(slug: string, addOns: readonly string[]): string {
  const sorted = [...new Set(addOns)].sort();
  return sorted.length ? `${slug}+${sorted.join("+")}` : slug;
}

export function createLine(slug: string, addOns: readonly string[] = [], qty = 1): CartLine {
  const unique = [...new Set(addOns)].sort();
  return { id: lineId(slug, unique), slug, qty, addOns: unique };
}

/** Adds a line to a cart, merging quantities when an identical line exists. */
export function addLine(lines: readonly CartLine[], incoming: CartLine): CartLine[] {
  const existing = lines.find((line) => line.id === incoming.id);
  if (!existing) return [...lines, incoming];
  return lines.map((line) =>
    line.id === incoming.id ? { ...line, qty: line.qty + incoming.qty } : line,
  );
}

/** Sets a line's quantity. A quantity of zero or less removes the line. */
export function setLineQty(lines: readonly CartLine[], id: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((line) => line.id !== id);
  return lines.map((line) => (line.id === id ? { ...line, qty } : line));
}

export function removeLine(lines: readonly CartLine[], id: string): CartLine[] {
  return lines.filter((line) => line.id !== id);
}

export type ResolvedLine = {
  line: CartLine;
  product: CatalogueEntry;
  addOns: CatalogueEntry[];
  /** Product price plus add-ons, for a single unit. */
  unitPrice: number;
  /** `unitPrice` multiplied by quantity. */
  total: number;
};

/**
 * Joins cart lines against the catalogue.
 *
 * Lines whose product has left the menu are dropped rather than rendered as
 * broken rows. The catalogue is now edited in a CMS by someone who does not
 * know a visitor has that item in a week-old localStorage cart, so this is a
 * routine case, not an edge one.
 */
export function resolveLines(
  lines: readonly CartLine[],
  index: ProductIndex,
): ResolvedLine[] {
  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const product = index.get(line.slug);
    if (!product) continue;
    const addOns = line.addOns
      .map((slug) => index.get(slug))
      .filter((entry): entry is CatalogueEntry => entry != null);
    const unitPrice = product.price + addOns.reduce((sum, entry) => sum + entry.price, 0);
    resolved.push({ line, product, addOns, unitPrice, total: unitPrice * line.qty });
  }
  return resolved;
}

export function itemCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function subtotal(resolved: readonly ResolvedLine[]): number {
  return resolved.reduce((sum, entry) => sum + entry.total, 0);
}

/**
 * Tax on the subtotal, rounded to whole rupees. Returns 0 when the configured
 * rate is 0, which is the current default — the line exists so a rate can be
 * switched on in the admin without touching checkout.
 */
export function taxAmount(subtotalPkr: number, ratePercent: number): number {
  if (ratePercent <= 0) return 0;
  return Math.round((subtotalPkr * ratePercent) / 100);
}

export type OrderTotals = {
  subtotal: number;
  taxRatePercent: number;
  tax: number;
  /** Subtotal plus tax. Delivery is deliberately excluded — see below. */
  total: number;
  /** Rupees short of the minimum, or 0 when the order clears it. */
  shortOfMinimum: number;
  meetsMinimum: boolean;
  minOrderValue: number;
};

/**
 * Order totals. Delivery is *not* included: the rider fare depends on distance
 * and the service used, is not known until a rider is booked, and is confirmed
 * with the customer before dispatch. Showing a precise delivered total here
 * would be a number the shop cannot stand behind.
 */
export function orderTotals(
  resolved: readonly ResolvedLine[],
  settings: Pick<StoreSettings, "taxRatePercent" | "minOrderValue">,
): OrderTotals {
  const sub = subtotal(resolved);
  const tax = taxAmount(sub, settings.taxRatePercent);
  const shortOfMinimum = Math.max(0, settings.minOrderValue - sub);
  return {
    subtotal: sub,
    taxRatePercent: settings.taxRatePercent,
    tax,
    total: sub + tax,
    shortOfMinimum,
    meetsMinimum: shortOfMinimum === 0,
    minOrderValue: settings.minOrderValue,
  };
}
