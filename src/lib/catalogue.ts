/**
 * The catalogue as the storefront sees it.
 *
 * These types mirror the CMS's `/api/storefront` response exactly. They are
 * declared here rather than imported from the CMS because the two are separate
 * deployments: the shop must keep rendering if the CMS is mid-deploy, and a
 * shared type package would couple their release cycles for no benefit.
 *
 * The contract is the JSON shape. If it changes on one side, `catalogue.test.ts`
 * is where that shows up.
 */

export type CatalogueProduct = {
  slug: string;
  name: string;
  description: string;
  /** PKR, whole rupees. */
  price: number;
  note: string | null;
  /** False means sold out — the product still has a page and still lists. */
  available: boolean;
  pairsWithSauces: boolean;
  /** Absolute URL served by the CMS, or null when no photograph is attached. */
  image: string | null;
  imageAlt: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type CatalogueCategory = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  accent: string;
  /** Extras like sauces and gift cards. Listed after the main menu. */
  isSecondary: boolean;
  items: CatalogueProduct[];
};

export type StoreSettings = {
  minOrderValue: number;
  deliverySubsidy: number;
  taxRatePercent: number;
  customLeadTimeDays: number;
  sameDayCutoff: string | null;
  jazzCashNumber: string | null;
  bankAccount: { bank: string; title: string; number: string } | null;
  loyaltyEnabled: boolean;
  deliveryZones: string[];
};

export type Catalogue = {
  tenant: { id: string; name: string; slug: string };
  settings: StoreSettings;
  categories: CatalogueCategory[];
  /** Slugs offered as paid extras on products flagged `pairsWithSauces`. */
  sauceAddOnSlugs: string[];
  /** The home page's "start here" picks, in the order the owner chose. */
  featuredSlugs: string[];
  generatedAt: string;
};

/** A product plus the category it belongs to, which cards and pages both need. */
export type CatalogueEntry = CatalogueProduct & { category: CatalogueCategory };

/**
 * Slug to product, for the cart.
 *
 * The cart stores slugs, not products, so every price calculation needs a
 * lookup. Building a Map once per render beats scanning eleven nested arrays
 * for each of a dozen cart lines.
 */
export type ProductIndex = Map<string, CatalogueEntry>;

export function indexProducts(catalogue: Catalogue): ProductIndex {
  const index: ProductIndex = new Map();
  for (const category of catalogue.categories) {
    for (const item of category.items) {
      index.set(item.slug, { ...item, category });
    }
  }
  return index;
}

export function allEntries(catalogue: Catalogue): CatalogueEntry[] {
  return catalogue.categories.flatMap((category) =>
    category.items.map((item) => ({ ...item, category })),
  );
}

export function findEntry(catalogue: Catalogue, slug: string): CatalogueEntry | undefined {
  for (const category of catalogue.categories) {
    const item = category.items.find((entry) => entry.slug === slug);
    if (item) return { ...item, category };
  }
  return undefined;
}

export function primaryCategories(catalogue: Catalogue): CatalogueCategory[] {
  return catalogue.categories.filter((category) => !category.isSecondary);
}

/** The sauces offered as add-ons, resolved to full products. */
export function sauceAddOns(catalogue: Catalogue): CatalogueEntry[] {
  return catalogue.sauceAddOnSlugs
    .map((slug) => findEntry(catalogue, slug))
    .filter((entry): entry is CatalogueEntry => entry != null);
}

/** The home page picks, resolved and still in the owner's chosen order. */
export function featuredEntries(catalogue: Catalogue): CatalogueEntry[] {
  return catalogue.featuredSlugs
    .map((slug) => findEntry(catalogue, slug))
    .filter((entry): entry is CatalogueEntry => entry != null);
}

export function priceRange(category: CatalogueCategory): string | null {
  const prices = category.items.map((item) => item.price).filter((price) => price > 0);
  if (prices.length === 0) return null;
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? `Rs ${low}` : `Rs ${low}–${high}`;
}
