import type { MetadataRoute } from "next";

import { site } from "@/content/site";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/menu", priority: 0.9 },
  { path: "/custom", priority: 0.9 },
  { path: "/corporate", priority: 0.7 },
  { path: "/about", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route.priority,
  }));
}
