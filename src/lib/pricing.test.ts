import { describe, expect, it } from "vitest";

import { site } from "@/content/site";
import {
  addLine,
  createLine,
  itemCount,
  lineId,
  orderTotals,
  removeLine,
  resolveLines,
  setLineQty,
  subtotal,
  taxAmount,
} from "./pricing";

// Real catalogue slugs, so a rename that breaks the cart breaks a test.
const CAKE = "matilda-cake"; // 699
const COOKIE = "brown-butter-chocolate-chip-cookie"; // 360
const MILK_SAUCE = "milk-chocolate-sauce"; // 120
const STRAWBERRY_SAUCE = "strawberry-sauce"; // 120

describe("lineId", () => {
  it("is just the slug when there are no add-ons", () => {
    expect(lineId(CAKE, [])).toBe(CAKE);
  });

  it("ignores the order add-ons were chosen in", () => {
    expect(lineId(CAKE, ["b", "a"])).toBe(lineId(CAKE, ["a", "b"]));
  });

  it("distinguishes the same product with different add-ons", () => {
    expect(lineId(CAKE, ["a"])).not.toBe(lineId(CAKE, ["b"]));
  });

  it("collapses a duplicate add-on rather than counting it twice", () => {
    expect(lineId(CAKE, ["a", "a"])).toBe(lineId(CAKE, ["a"]));
  });
});

describe("addLine", () => {
  it("merges quantities for an identical line instead of stacking rows", () => {
    const cart = addLine([createLine(CAKE, [], 1)], createLine(CAKE, [], 2));
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(3);
  });

  it("merges regardless of the order add-ons were picked in", () => {
    const cart = addLine(
      [createLine(CAKE, [MILK_SAUCE, STRAWBERRY_SAUCE], 1)],
      createLine(CAKE, [STRAWBERRY_SAUCE, MILK_SAUCE], 1),
    );
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(2);
  });

  it("keeps the same product with different add-ons as separate lines", () => {
    const cart = addLine([createLine(CAKE, [MILK_SAUCE], 1)], createLine(CAKE, [], 1));
    expect(cart).toHaveLength(2);
  });
});

describe("setLineQty", () => {
  it("updates the quantity", () => {
    const cart = setLineQty([createLine(CAKE, [], 1)], CAKE, 5);
    expect(cart[0].qty).toBe(5);
  });

  it("removes the line at zero rather than leaving a zero-quantity row", () => {
    expect(setLineQty([createLine(CAKE, [], 3)], CAKE, 0)).toEqual([]);
  });

  it("removes the line on a negative quantity too", () => {
    expect(setLineQty([createLine(CAKE, [], 3)], CAKE, -2)).toEqual([]);
  });
});

describe("removeLine", () => {
  it("drops only the named line", () => {
    const cart = removeLine([createLine(CAKE, [], 1), createLine(COOKIE, [], 1)], CAKE);
    expect(cart.map((line) => line.slug)).toEqual([COOKIE]);
  });
});

describe("resolveLines", () => {
  it("prices a plain line from the catalogue", () => {
    const [entry] = resolveLines([createLine(CAKE, [], 2)]);
    expect(entry.unitPrice).toBe(699);
    expect(entry.total).toBe(1398);
  });

  it("adds each add-on's own catalogue price to the unit price", () => {
    const [entry] = resolveLines([createLine(CAKE, [MILK_SAUCE, STRAWBERRY_SAUCE], 2)]);
    expect(entry.unitPrice).toBe(699 + 120 + 120);
    expect(entry.total).toBe((699 + 240) * 2);
    expect(entry.addOns).toHaveLength(2);
  });

  // A stale localStorage cart must not break the page for a returning visitor.
  it("drops lines whose product has left the menu", () => {
    expect(resolveLines([createLine("discontinued-cake", [], 1)])).toEqual([]);
  });

  it("drops an unknown add-on but keeps the product", () => {
    const [entry] = resolveLines([createLine(CAKE, ["not-a-sauce"], 1)]);
    expect(entry.unitPrice).toBe(699);
    expect(entry.addOns).toEqual([]);
  });
});

describe("itemCount", () => {
  it("counts units, not lines", () => {
    expect(itemCount([createLine(CAKE, [], 2), createLine(COOKIE, [], 3)])).toBe(5);
  });
});

describe("subtotal", () => {
  it("is zero for an empty cart", () => {
    expect(subtotal(resolveLines([]))).toBe(0);
  });

  it("sums every line", () => {
    expect(subtotal(resolveLines([createLine(CAKE, [], 1), createLine(COOKIE, [], 2)]))).toBe(
      699 + 720,
    );
  });
});

describe("taxAmount", () => {
  it("is zero when the rate is off, which is the current default", () => {
    expect(site.commerce.taxRatePercent).toBe(0);
    expect(taxAmount(1000)).toBe(0);
  });

  it("applies a rate when one is switched on", () => {
    expect(taxAmount(1000, 16)).toBe(160);
  });

  it("rounds to whole rupees", () => {
    expect(taxAmount(699, 16)).toBe(112); // 111.84
  });

  it("treats a negative rate as off rather than crediting the customer", () => {
    expect(taxAmount(1000, -5)).toBe(0);
  });
});

describe("orderTotals", () => {
  it("excludes delivery, which is quoted by hand after the order", () => {
    const totals = orderTotals(resolveLines([createLine(CAKE, [], 1)]));
    expect(totals.total).toBe(totals.subtotal + totals.tax);
  });

  it("reports how far an order is short of the minimum", () => {
    const totals = orderTotals(resolveLines([createLine("butter-cake-slice", [], 1)])); // 150
    expect(totals.meetsMinimum).toBe(false);
    expect(totals.shortOfMinimum).toBe(site.commerce.minOrderValue - 150);
  });

  it("clears the minimum once the subtotal reaches it", () => {
    const totals = orderTotals(resolveLines([createLine(CAKE, [], 1)])); // 699
    expect(totals.meetsMinimum).toBe(true);
    expect(totals.shortOfMinimum).toBe(0);
  });

  it("measures the minimum against the subtotal, tax excluded", () => {
    const totals = orderTotals(resolveLines([createLine("butter-cake-slice", [], 3)]), 16); // 450
    expect(totals.subtotal).toBe(450);
    expect(totals.meetsMinimum).toBe(false);
    expect(totals.shortOfMinimum).toBe(50);
  });
});
