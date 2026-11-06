import type { MetadataRoute } from "next";
import { liveTools, SITE } from "@/tools/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...liveTools.map((tool) => ({
      url: `${SITE.url}/tools/${tool.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
