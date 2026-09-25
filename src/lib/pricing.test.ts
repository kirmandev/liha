import { describe, expect, it } from "vitest";

import { indexProducts } from "./catalogue";
import { CAKE, COOKIE, SAUCE_A, SAUCE_B, SLICE, makeCatalogue } from "./fixtures";
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

const catalogue = makeCatalogue();
const index = indexProducts(catalogue);
const SETTINGS = { taxRatePercent: 0, minOrderValue: 500 };

describe("lineId", () => {
  it("is just the slug when there are no add-ons", () => {
    expect(lineId(CAKE.slug, [])).toBe(CAKE.slug);
  });

  it("ignores the order add-ons were chosen in", () => {
    expect(lineId(CAKE.slug, ["b", "a"])).toBe(lineId(CAKE.slug, ["a", "b"]));
  });

  it("distinguishes the same product with different add-ons", () => {
    expect(lineId(CAKE.slug, ["a"])).not.toBe(lineId(CAKE.slug, ["b"]));
  });

  it("collapses a duplicate add-on rather than counting it twice", () => {
    expect(lineId(CAKE.slug, ["a", "a"])).toBe(lineId(CAKE.slug, ["a"]));
  });
});

describe("addLine", () => {
  it("merges quantities for an identical line instead of stacking rows", () => {
    const cart = addLine([createLine(CAKE.slug, [], 1)], createLine(CAKE.slug, [], 2));
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(3);
  });

  it("merges regardless of the order add-ons were picked in", () => {
    const cart = addLine(
      [createLine(CAKE.slug, [SAUCE_A.slug, SAUCE_B.slug], 1)],
      createLine(CAKE.slug, [SAUCE_B.slug, SAUCE_A.slug], 1),
    );
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(2);
  });

  it("keeps the same product with different add-ons as separate lines", () => {
    const cart = addLine([createLine(CAKE.slug, [SAUCE_A.slug], 1)], createLine(CAKE.slug, [], 1));
    expect(cart).toHaveLength(2);
  });
});

describe("setLineQty", () => {
  it("updates the quantity", () => {
    expect(setLineQty([createLine(CAKE.slug, [], 1)], CAKE.slug, 5)[0].qty).toBe(5);
  });

  it("removes the line at zero rather than leaving a zero-quantity row", () => {
    expect(setLineQty([createLine(CAKE.slug, [], 3)], CAKE.slug, 0)).toEqual([]);
  });

  it("removes the line on a negative quantity too", () => {
    expect(setLineQty([createLine(CAKE.slug, [], 3)], CAKE.slug, -2)).toEqual([]);
  });
});

describe("removeLine", () => {
  it("drops only the named line", () => {
    const cart = removeLine(
      [createLine(CAKE.slug, [], 1), createLine(COOKIE.slug, [], 1)],
      CAKE.slug,
    );
    expect(cart.map((line) => line.slug)).toEqual([COOKIE.slug]);
  });
});

describe("resolveLines", () => {
  it("prices a plain line from the catalogue", () => {
    const [entry] = resolveLines([createLine(CAKE.slug, [], 2)], index);
    expect(entry.unitPrice).toBe(700);
    expect(entry.total).toBe(1400);
  });

  it("adds each add-on's own catalogue price to the unit price", () => {
    const [entry] = resolveLines(
      [createLine(CAKE.slug, [SAUCE_A.slug, SAUCE_B.slug], 2)],
      index,
    );
    expect(entry.unitPrice).toBe(700 + 120 + 130);
    expect(entry.total).toBe(950 * 2);
    expect(entry.addOns).toHaveLength(2);
  });

  // The owner edits the menu in a CMS without knowing a visitor has a week-old
  // cart in localStorage, so this is routine rather than an edge case.
  it("drops lines whose product has left the menu", () => {
    expect(resolveLines([createLine("withdrawn-cake", [], 1)], index)).toEqual([]);
  });

  it("drops an unknown add-on but keeps the product", () => {
    const [entry] = resolveLines([createLine(CAKE.slug, ["not-a-sauce"], 1)], index);
    expect(entry.unitPrice).toBe(700);
    expect(entry.addOns).toEqual([]);
  });

  it("attaches the category, which cards and breadcrumbs both need", () => {
    const [entry] = resolveLines([createLine(CAKE.slug, [], 1)], index);
    expect(entry.product.category.slug).toBe("cakes");
  });
});

describe("itemCount", () => {
  it("counts units, not lines", () => {
    expect(itemCount([createLine(CAKE.slug, [], 2), createLine(COOKIE.slug, [], 3)])).toBe(5);
  });
});

describe("subtotal", () => {
  it("is zero for an empty cart", () => {
    expect(subtotal(resolveLines([], index))).toBe(0);
  });

  it("sums every line", () => {
    const resolved = resolveLines(
      [createLine(CAKE.slug, [], 1), createLine(COOKIE.slug, [], 2)],
      index,
    );
    expect(subtotal(resolved)).toBe(700 + 720);
  });
});

describe("taxAmount", () => {
  it("is zero when the rate is off, which is the shop's current default", () => {
    expect(taxAmount(1000, 0)).toBe(0);
  });

  it("applies a rate when one is switched on in the admin", () => {
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
    const totals = orderTotals(resolveLines([createLine(CAKE.slug, [], 1)], index), SETTINGS);
    expect(totals.total).toBe(totals.subtotal + totals.tax);
  });

  it("reports how far an order is short of the minimum", () => {
    const totals = orderTotals(resolveLines([createLine(SLICE.slug, [], 1)], index), SETTINGS);
    expect(totals.meetsMinimum).toBe(false);
    expect(totals.shortOfMinimum).toBe(350); // 500 - 150
  });

  it("clears the minimum once the subtotal reaches it", () => {
    const totals = orderTotals(resolveLines([createLine(CAKE.slug, [], 1)], index), SETTINGS);
    expect(totals.meetsMinimum).toBe(true);
    expect(totals.shortOfMinimum).toBe(0);
  });

  it("measures the minimum against the subtotal, tax excluded", () => {
    const totals = orderTotals(resolveLines([createLine(SLICE.slug, [], 3)], index), {
      taxRatePercent: 16,
      minOrderValue: 500,
    });
    expect(totals.subtotal).toBe(450);
    expect(totals.tax).toBe(72);
    // 450 + 72 clears 500, but the minimum is a subtotal rule — a customer
    // must not be pushed over it by tax they did not choose to pay.
    expect(totals.meetsMinimum).toBe(false);
    expect(totals.shortOfMinimum).toBe(50);
  });

  // The shop's settings are editable in the admin, so the arithmetic must
  // follow them rather than a constant compiled into the bundle.
  it("uses the minimum it is given rather than a hardcoded one", () => {
    const totals = orderTotals(resolveLines([createLine(SLICE.slug, [], 1)], index), {
      taxRatePercent: 0,
      minOrderValue: 100,
    });
    expect(totals.meetsMinimum).toBe(true);
    expect(totals.minOrderValue).toBe(100);
  });
});
