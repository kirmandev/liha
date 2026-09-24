import type { MetadataRoute } from "next";

import { allProducts } from "@/content/menu";
import { site } from "@/content/site";

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
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages = ROUTES.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: route.priority,
  }));

  const products = allProducts.map((product) => ({
    url: `${site.url}/product/${product.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...pages, ...products];
}
