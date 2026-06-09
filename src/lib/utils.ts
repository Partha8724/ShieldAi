import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCleanSiteUrl(req?: Request | string) {
  let siteUrl = "";

  // 1. If req is provided, try to extract host from headers first (most accurate for live requests)
  if (req) {
    if (req instanceof Request) {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      if (host) {
        siteUrl = `${proto}://${host}`;
      } else {
        try {
          siteUrl = new URL(req.url).origin;
        } catch {}
      }
    } else if (typeof req === "string") {
      try {
        siteUrl = new URL(req).origin;
      } catch {}
    }
  }

  // 2. If no siteUrl resolved from request, fallback to env variables
  if (!siteUrl) {
    const nextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const cleanedPublicUrl = nextPublicSiteUrl.replace(/^["']|["']$/g, "").trim();
    const isProduction = process.env.NODE_ENV === "production";
    const isLocalPublic = cleanedPublicUrl.includes("localhost") || cleanedPublicUrl.includes("127.0.0.1");

    if (isProduction) {
      // On Vercel, prioritize VERCEL_PROJECT_PRODUCTION_URL (the main custom domain / vercel subdomain)
      const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
      if (vercelProdUrl) {
        siteUrl = vercelProdUrl.startsWith("http") ? vercelProdUrl : `https://${vercelProdUrl}`;
      } else if (cleanedPublicUrl && !isLocalPublic) {
        siteUrl = cleanedPublicUrl;
      } else {
        siteUrl = "https://shieldai.co"; // Ultimate default fallback
      }
    } else {
      // Local development
      siteUrl = cleanedPublicUrl || "http://localhost:3000";
    }
  }

  // Strip trailing slashes
  siteUrl = siteUrl.replace(/\/+$/, "");
  return siteUrl;
}

