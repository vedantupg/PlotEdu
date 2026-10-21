import type { MetadataRoute } from "next";
import { COURSE_ONE } from "@/lib/content/course";
import { getGlossary } from "@/lib/data/queries";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const terms = await getGlossary();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses/${COURSE_ONE.slug}`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/glossary`, changeFrequency: "weekly", priority: 0.8 },
    ...terms.map((t) => ({
      url: `${SITE_URL}/glossary/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
