import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  allProducts,
  categories,
  findProduct,
  priceRange,
  productImage,
  sauceAddOns,
  signatureItems,
} from "./menu";

function category(items: Array<{ slug: string; name: string; description: string; price?: number }>) {
  return {
    id: "x",
    name: "x",
    blurb: "",
    accent: "wine" as const,
    orderVia: "foodpanda" as const,
    items,
  };
}

describe("menu data", () => {
  it("has no duplicate product slugs across the whole catalogue", () => {
    const slugs = allProducts.map((product) => product.slug);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    expect(duplicates, `duplicate slugs: ${duplicates.join(", ")}`).toEqual([]);
  });

  it("has no duplicate category ids", () => {
    const ids = categories.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every priced item a positive price", () => {
    for (const product of allProducts) {
      if (product.price != null) expect(product.price, product.slug).toBeGreaterThan(0);
    }
  });

  it("gives every product a description", () => {
    for (const product of allProducts) {
      expect(product.description.length, product.slug).toBeGreaterThan(10);
    }
  });

  it("uses url-safe slugs", () => {
    for (const product of allProducts) {
      expect(product.slug, product.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  // The photographs are downloaded by a script rather than committed by hand,
  // so this is the check that catches a product added without one.
  it("has a downloaded photograph for every product that claims one", () => {
    const missing = allProducts
      .filter((product) => !product.noPhoto)
      .filter((product) => !existsSync(join(process.cwd(), "public", "products", `${product.slug}.jpg`)))
      .map((product) => product.slug);
    expect(missing, `no photo on disk for: ${missing.join(", ")}`).toEqual([]);
  });

  it("returns no image path for products marked as having no photo", () => {
    const custom = findProduct("custom-cake");
    expect(custom).toBeDefined();
    expect(productImage(custom!)).toBeNull();
  });

  it("resolves every front-page pick to a real, priced product", () => {
    expect(signatureItems).toHaveLength(4);
    for (const item of signatureItems) {
      expect(item.category).toBeDefined();
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it("offers sauces that are themselves priced catalogue items", () => {
    expect(sauceAddOns.length).toBeGreaterThan(0);
    for (const sauce of sauceAddOns) {
      expect(sauce.price).toBeGreaterThan(0);
    }
  });

  it("only flags add-on eligibility on products that are not themselves sauces", () => {
    for (const product of allProducts) {
      if (product.pairsWithSauces) expect(product.category.id).not.toBe("signature-sauces");
    }
  });

  it("finds a product by slug and misses cleanly", () => {
    expect(findProduct("matilda-cake")?.name).toBe("Matilda Cake");
    expect(findProduct("no-such-cake")).toBeUndefined();
  });
});

describe("priceRange", () => {
  it("collapses to a single price when every item costs the same", () => {
    expect(
      priceRange(
        category([
          { slug: "a", name: "A", description: "x".repeat(11), price: 350 },
          { slug: "b", name: "B", description: "x".repeat(11), price: 350 },
        ]),
      ),
    ).toBe("Rs 350");
  });

  it("spans low to high otherwise", () => {
    expect(
      priceRange(
        category([
          { slug: "a", name: "A", description: "x".repeat(11), price: 300 },
          { slug: "b", name: "B", description: "x".repeat(11), price: 900 },
        ]),
      ),
    ).toBe("Rs 300–900");
  });

  it("returns null for quote-based categories so the UI can say something else", () => {
    expect(priceRange(category([{ slug: "c", name: "Custom cake", description: "x".repeat(11) }]))).toBeNull();
  });
});
