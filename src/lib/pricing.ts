/**
 * Cart arithmetic. Pure functions over plain data — no React, no storage, no
 * formatting. Everything that could quietly produce a wrong number lives here
 * so it can be tested directly.
 *
 * Money is whole PKR throughout. There are no sub-rupee prices on the menu, so
 * integers avoid float drift entirely; tax is the one place rounding applies.
 */

import { findProduct, type CatalogueEntry } from "@/content/menu";
import { site } from "@/content/site";

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
 * Joins cart lines against the catalogue. Lines whose product no longer exists
 * are dropped rather than rendered as broken rows — the menu is edited by hand,
 * and a stale localStorage cart must not break the page for a returning visitor.
 */
export function resolveLines(lines: readonly CartLine[]): ResolvedLine[] {
  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const product = findProduct(line.slug);
    if (!product || product.price == null) continue;
    const addOns = line.addOns
      .map((slug) => findProduct(slug))
      .filter((entry): entry is CatalogueEntry => entry != null && entry.price != null);
    const unitPrice = product.price + addOns.reduce((sum, entry) => sum + (entry.price ?? 0), 0);
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
 * rate is 0, which is the current default — the line is built so a rate can be
 * switched on later without touching checkout.
 */
export function taxAmount(
  subtotalPkr: number,
  // Annotated `number` rather than inferred: `site` is `as const`, so the
  // default narrows the parameter to the literal 0 and no other rate type-checks.
  ratePercent: number = site.commerce.taxRatePercent,
): number {
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
};

/**
 * Order totals. Delivery is *not* included: SRS §9 says the rider fare depends
 * on distance and the service used, is not known until a rider is booked, and
 * is confirmed with the customer before dispatch. Showing a precise delivered
 * total here would be a number we cannot stand behind.
 */
export function orderTotals(
  resolved: readonly ResolvedLine[],
  ratePercent: number = site.commerce.taxRatePercent,
): OrderTotals {
  const sub = subtotal(resolved);
  const tax = taxAmount(sub, ratePercent);
  const shortOfMinimum = Math.max(0, site.commerce.minOrderValue - sub);
  return {
    subtotal: sub,
    taxRatePercent: ratePercent,
    tax,
    total: sub + tax,
    shortOfMinimum,
    meetsMinimum: shortOfMinimum === 0,
  };
}
