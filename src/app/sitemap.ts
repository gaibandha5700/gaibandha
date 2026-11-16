import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import {
  DIRECTORY_CATEGORIES,
  getDirectoryEntries,
  getMunicipalitiesByUpazila,
  getUpazilas,
  getUnionsByUpazila,
} from "@/lib/directory";

export const revalidate = 3600;
const PAGE_SIZE = 500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl.toString(), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/district", siteUrl).toString(), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: new URL("/upazila", siteUrl).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: new URL("/municipality", siteUrl).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/directory", siteUrl).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const upazilas = await getUpazilas();
  for (const upazila of upazilas) {
    entries.push({
      url: new URL(`/upazila/${upazila.slug}`, siteUrl).toString(),
      lastModified: upazila.updated_at ? new Date(upazila.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    const [unions, municipalities] = await Promise.all([
      getUnionsByUpazila(upazila.id),
      getMunicipalitiesByUpazila(upazila.id),
    ]);

    for (const union of unions) {
      entries.push({
        url: new URL(`/upazila/${upazila.slug}/${union.slug}`, siteUrl).toString(),
        lastModified: union.updated_at ? new Date(union.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const municipality of municipalities) {
      entries.push({
        url: new URL(`/municipality/${municipality.slug}`, siteUrl).toString(),
        lastModified: municipality.updated_at ? new Date(municipality.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Only publish category and detail URLs that actually contain public, verified records.
  // Paginate so directories larger than one API response are not silently omitted.
  for (const category of DIRECTORY_CATEGORIES) {
    let offset = 0;
    let categoryHasEntries = false;

    while (true) {
      const page = await getDirectoryEntries({
        category: category.slug,
        limit: PAGE_SIZE,
        offset,
      });

      if (page.length > 0 && !categoryHasEntries) {
        categoryHasEntries = true;
        entries.push({
          url: new URL(`/directory/${category.slug}`, siteUrl).toString(),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      for (const item of page) {
        entries.push({
          url: new URL(`/directory/${category.slug}/${item.slug}`, siteUrl).toString(),
          lastModified: item.updated_at ? new Date(item.updated_at) : now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      if (page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
  }

  // Ward pages are reachable from parent pages but are intentionally not submitted
  // until each has sufficient unique content to merit indexing.
  return entries;
}
