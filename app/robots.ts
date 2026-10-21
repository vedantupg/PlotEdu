import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/home", "/api", "/s/", "/apply", "/onboarding"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
