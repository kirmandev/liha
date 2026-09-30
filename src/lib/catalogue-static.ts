/**
 * The catalogue without a CMS.
 *
 * `content/menu.ts` is the seed the CMS was loaded from, and the photographs
 * it names are in `public/products/`. Together they are a complete, current
 * shop — so when no CMS is configured the storefront runs from them instead
 * of showing a maintenance page.
 *
 * This is what lets `main` deploy and trade today, before the admin exists on
 * a server. The moment `CMS_URL` is set the site reads live data and this file
 * is never consulted. It is a fallback, not a second source of truth: if the
 * two ever disagree, the CMS wins, and the fix is to re-seed it.
 */

import { categories as source } from "@/content/menu";
import { site } from "@/content/site";
import type { Catalogue, CatalogueCategory } from "./catalogue";

/** The four "start here" picks and the three hero photographs. */
const FEATURED = [
  "dubai-chocolate-cake-for-one",
  "brookie",
  "matilda-cake",
  "brown-butter-chocolate-chip-cookie",
];
const HERO = ["the-london-cake", "matilda-cake", "churros-with-chocolate-sauce"];

export function staticCatalogue(): Catalogue {
  const categories: CatalogueCategory[] = source
    .filter((category) => category.items.some((item) => item.price != null))
    .map((category) => ({
      id: category.id,
      slug: category.id,
      name: category.name,
      blurb: category.blurb,
      accent: category.accent,
      isSecondary: Boolean(category.secondary),
      items: category.items
        .filter((item) => item.price != null)
        .map((item) => ({
          slug: item.slug,
          name: item.name,
          description: item.description,
          price: item.price as number,
          note: item.note ?? null,
          available: true,
          pairsWithSauces: Boolean(item.pairsWithSauces),
          image: item.noPhoto ? null : `/products/${item.slug}.jpg`,
          imageAlt: item.name,
          metaTitle: null,
          metaDescription: null,
        })),
    }));

  const sauces = categories.find((category) => category.slug === "signature-sauces");

  return {
    tenant: { id: "static", name: site.fullName, slug: "liha" },
    settings: {
      minOrderValue: site.commerce.minOrderValue,
      deliverySubsidy: site.commerce.deliverySubsidy,
      taxRatePercent: site.commerce.taxRatePercent,
      customLeadTimeDays: site.customLeadTimeDays,
      sameDayCutoff: null,
      jazzCashNumber: site.commerce.payment.jazzCashNumber,
      bankAccount: site.commerce.payment.bankAccount,
      loyaltyEnabled: false,
      deliveryZones: [],
    },
    categories,
    sauceAddOnSlugs: sauces?.items.map((item) => item.slug) ?? [],
    featuredSlugs: FEATURED,
    heroSlugs: HERO,
    generatedAt: "static",
  };
}
