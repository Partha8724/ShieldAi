import { MetadataRoute } from "next";
import { getCleanSiteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getCleanSiteUrl();
  const routes = ["", "/pricing", "/influencer", "/login", "/register", "/waitlist"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/influencer" ? 0.9 : 0.8,
  }));
}
