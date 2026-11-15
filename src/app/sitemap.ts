import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getUpazilas, getUnionsByUpazila } from "@/lib/directory";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl.toString(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/upazila", siteUrl).toString(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const upazilas = await getUpazilas();
  for (const upazila of upazilas) {
    entries.push({
      url: new URL(`/upazila/${upazila.slug}`, siteUrl).toString(),
      lastModified: upazila.updated_at ? new Date(upazila.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    const unions = await getUnionsByUpazila(upazila.id);
    for (const union of unions) {
      entries.push({
        url: new URL(`/upazila/${upazila.slug}/${union.slug}`, siteUrl).toString(),
        lastModified: union.updated_at ? new Date(union.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
