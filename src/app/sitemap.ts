import type { MetadataRoute } from "next";

import { site } from "@/content/site";
import { allEntries } from "@/lib/catalogue";
import { CmsUnavailableError, getCatalogue } from "@/lib/cms";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/menu", priority: 0.9 },
  { path: "/custom", priority: 0.9 },
  { path: "/corporate", priority: 0.7 },
  { path: "/about", priority: 0.6 },
];

/**
 * Cart, checkout and order-confirmation are deliberately absent: they are
 * per-visitor pages with nothing to index, and each carries `robots: noindex`.
 *
 * If the CMS is unreachable the static routes are still returned rather than
 * an empty sitemap, because an empty one actively tells search engines the site
 * has no pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const pages = ROUTES.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));

  try {
    const products = allEntries(await getCatalogue()).map((product) => ({
      url: `${site.url}/product/${product.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    return [...pages, ...products];
  } catch (error) {
    if (!(error instanceof CmsUnavailableError)) throw error;
    console.error(`[sitemap] catalogue unavailable: ${error.message}`);
    return pages;
  }
}
