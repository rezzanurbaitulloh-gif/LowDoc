import type { MetadataRoute } from "next";

const BASE = "https://lowdoc.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/faq", "/privacy", "/terms", "/licenses", "/support"];
  return routes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: new Date(),
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/faq" ? 0.8 : 0.5,
  }));
}
