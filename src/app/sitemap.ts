import { MetadataRoute } from "next";
import { getCleanSiteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getCleanSiteUrl();

  const routes: Array<{ path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "/pricing", priority: 0.95, freq: "weekly" },
    { path: "/influencer", priority: 0.9, freq: "weekly" },
    { path: "/docs", priority: 0.85, freq: "weekly" },
    { path: "/documentation", priority: 0.85, freq: "weekly" },
    { path: "/contact-sales", priority: 0.8, freq: "monthly" },
    { path: "/waitlist", priority: 0.8, freq: "monthly" },
    { path: "/register", priority: 0.75, freq: "monthly" },
    { path: "/login", priority: 0.6, freq: "monthly" },
  ];

  return routes.map(({ path, priority, freq }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));
}
