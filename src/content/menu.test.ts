import { describe, expect, it } from "vitest";

import { allProducts, categories, priceRange, signatureItems } from "./menu";

describe("menu data", () => {
  it("has no duplicate product ids within a category", () => {
    for (const category of categories) {
      const ids = category.items.map((item) => item.id);
      expect(new Set(ids).size, `duplicate id in ${category.id}`).toBe(ids.length);
    }
  });

  it("has no duplicate category ids", () => {
    const ids = categories.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every priced item a positive price", () => {
    for (const product of allProducts) {
      if (product.price != null) expect(product.price).toBeGreaterThan(0);
    }
  });

  it("resolves every front-page pick to a real product", () => {
    expect(signatureItems).toHaveLength(4);
    for (const item of signatureItems) {
      expect(item.category).toBeDefined();
    }
  });
});

describe("priceRange", () => {
  it("collapses to a single price when every item costs the same", () => {
    expect(
      priceRange({
        id: "x",
        name: "x",
        blurb: "",
        accent: "wine",
        orderVia: "foodpanda",
        items: [
          { id: "a", name: "A", price: 350 },
          { id: "b", name: "B", price: 350 },
        ],
      }),
    ).toBe("Rs 350");
  });

  it("spans low to high otherwise", () => {
    expect(
      priceRange({
        id: "x",
        name: "x",
        blurb: "",
        accent: "wine",
        orderVia: "foodpanda",
        items: [
          { id: "a", name: "A", price: 300 },
          { id: "b", name: "B", price: 900 },
        ],
      }),
    ).toBe("Rs 300–900");
  });

  it("returns null for quote-based categories so the UI can say something else", () => {
    expect(
      priceRange({
        id: "custom",
        name: "Custom",
        blurb: "",
        accent: "blush",
        orderVia: "whatsapp",
        items: [{ id: "c", name: "Custom cake" }],
      }),
    ).toBeNull();
  });
});
