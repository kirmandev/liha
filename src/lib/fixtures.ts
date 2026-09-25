import type { Catalogue, CatalogueCategory, CatalogueProduct } from "./catalogue";

/**
 * Test fixtures.
 *
 * The catalogue now lives in a CMS and changes without a deploy, so tests can
 * no longer assert against the real menu — a price edit in the admin would have
 * broken the suite. These fixtures state their own prices, which also makes
 * each test readable on its own rather than requiring the reader to go and look
 * up what a Matilda Cake costs today.
 */

export function makeProduct(
  slug: string,
  price: number,
  overrides: Partial<CatalogueProduct> = {},
): CatalogueProduct {
  return {
    slug,
    name: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    description: `A description of ${slug}.`,
    price,
    note: null,
    available: true,
    pairsWithSauces: false,
    image: null,
    imageAlt: slug,
    metaTitle: null,
    metaDescription: null,
    ...overrides,
  };
}

export function makeCategory(
  slug: string,
  items: CatalogueProduct[],
  overrides: Partial<CatalogueCategory> = {},
): CatalogueCategory {
  return {
    id: slug,
    slug,
    name: slug.replace(/-/g, " "),
    blurb: "",
    accent: "wine",
    isSecondary: false,
    items,
    ...overrides,
  };
}

/** Prices chosen so no two sums collide — a wrong total cannot look right. */
export const CAKE = makeProduct("test-cake", 700, { pairsWithSauces: true });
export const COOKIE = makeProduct("test-cookie", 360);
export const SLICE = makeProduct("test-slice", 150);
export const SAUCE_A = makeProduct("sauce-a", 120);
export const SAUCE_B = makeProduct("sauce-b", 130);

export function makeCatalogue(overrides: Partial<Catalogue> = {}): Catalogue {
  return {
    tenant: { id: "1", name: "Test Bakeshop", slug: "test" },
    settings: {
      minOrderValue: 500,
      deliverySubsidy: 100,
      taxRatePercent: 0,
      customLeadTimeDays: 4,
      sameDayCutoff: null,
      jazzCashNumber: null,
      bankAccount: null,
      loyaltyEnabled: false,
      deliveryZones: [],
    },
    categories: [
      makeCategory("cakes", [CAKE, SLICE]),
      makeCategory("cookies", [COOKIE]),
      makeCategory("sauces", [SAUCE_A, SAUCE_B], { isSecondary: true }),
    ],
    sauceAddOnSlugs: [SAUCE_A.slug, SAUCE_B.slug],
    featuredSlugs: [CAKE.slug, COOKIE.slug],
    generatedAt: "2026-09-25T00:00:00.000Z",
    ...overrides,
  };
}
