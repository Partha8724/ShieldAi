import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCleanSiteUrl(req?: Request | string) {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const isProduction = process.env.NODE_ENV === "production";
  
  // Clean quotes and spaces first
  siteUrl = siteUrl.replace(/^["']|["']$/g, "").trim();
  
  const isLocalhost = siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");
  
  if (!siteUrl || (isLocalhost && isProduction)) {
    if (req) {
      if (typeof req === "string") {
        try {
          siteUrl = new URL(req).origin;
        } catch {
          siteUrl = "https://shieldai.co";
        }
      } else if (req instanceof Request) {
        try {
          siteUrl = new URL(req.url).origin;
        } catch {
          siteUrl = "https://shieldai.co";
        }
      }
    } else {
      siteUrl = "https://shieldai.co"; // ultimate fallback
    }
  }
  
  // Strip trailing slashes
  siteUrl = siteUrl.replace(/\/+$/, "");
  return siteUrl;
}

