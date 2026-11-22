import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getLatestPublicDataUpdatedAt } from "@/lib/public-data-update";
import { latestUpdatedAt } from "@/lib/sitemap-lastmod.mjs";
import {
  DIRECTORY_CATEGORIES,
  getDirectoryEntries,
  getMunicipalitiesByUpazila,
  getUpazilas,
  getUnionsByUpazila,
} from "@/lib/directory";

export const revalidate = 3600;
const PAGE_SIZE = 500;

function dateFromTimestamp(value: string | null) {
  return value ? new Date(value) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const publicDataUpdatedAt = await getLatestPublicDataUpdatedAt();
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl.toString(),
      ...(dateFromTimestamp(publicDataUpdatedAt) ? { lastModified: dateFromTimestamp(publicDataUpdatedAt) } : {}),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...["/district", "/map", "/sources", "/about", "/privacy", "/contact"].map((path) => ({
      url: new URL(path, siteUrl).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: new URL("/statistics", siteUrl).toString(), changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/data", siteUrl).toString(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const upazilas = await getUpazilas();
  const upazilaIndexUpdatedAt = latestUpdatedAt(upazilas);
  entries.push({
    url: new URL("/upazila", siteUrl).toString(),
    ...(dateFromTimestamp(upazilaIndexUpdatedAt) ? { lastModified: dateFromTimestamp(upazilaIndexUpdatedAt) } : {}),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  const municipalityUpdates: Array<{ updated_at?: string | null }> = [];
  for (const upazila of upazilas) {
    const upazilaUpdatedAt = latestUpdatedAt([upazila]);
    entries.push({
      url: new URL(`/upazila/${upazila.slug}`, siteUrl).toString(),
      ...(dateFromTimestamp(upazilaUpdatedAt) ? { lastModified: dateFromTimestamp(upazilaUpdatedAt) } : {}),
      changeFrequency: "monthly",
      priority: 0.8,
    });

    const [unions, municipalities] = await Promise.all([
      getUnionsByUpazila(upazila.id),
      getMunicipalitiesByUpazila(upazila.id),
    ]);
    municipalityUpdates.push(...municipalities.map(({ updated_at }) => ({ updated_at })));

    for (const union of unions) {
      const unionUpdatedAt = latestUpdatedAt([union]);
      entries.push({
        url: new URL(`/upazila/${upazila.slug}/${union.slug}`, siteUrl).toString(),
        ...(dateFromTimestamp(unionUpdatedAt) ? { lastModified: dateFromTimestamp(unionUpdatedAt) } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const municipality of municipalities) {
      const municipalityUpdatedAt = latestUpdatedAt([municipality]);
      entries.push({
        url: new URL(`/municipality/${municipality.slug}`, siteUrl).toString(),
        ...(dateFromTimestamp(municipalityUpdatedAt) ? { lastModified: dateFromTimestamp(municipalityUpdatedAt) } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  const municipalityIndexUpdatedAt = latestUpdatedAt(municipalityUpdates);
  entries.push({
    url: new URL("/municipality", siteUrl).toString(),
    ...(dateFromTimestamp(municipalityIndexUpdatedAt) ? { lastModified: dateFromTimestamp(municipalityIndexUpdatedAt) } : {}),
    changeFrequency: "weekly",
    priority: 0.8,
  });

  const directoryUpdates: Array<{ updated_at?: string | null }> = [];
  // Only publish category and detail URLs that actually contain public, verified records.
  // Paginate so directories larger than one API response are not silently omitted.
  for (const category of DIRECTORY_CATEGORIES) {
    let offset = 0;
    let categoryHasEntries = false;
    const categoryUpdates: Array<{ updated_at?: string | null }> = [];

    while (true) {
      const page = await getDirectoryEntries({
        category: category.slug,
        limit: PAGE_SIZE,
        offset,
      });

      if (page.length > 0) categoryHasEntries = true;
      categoryUpdates.push(...page.map(({ updated_at }) => ({ updated_at })));
      directoryUpdates.push(...page.map(({ updated_at }) => ({ updated_at })));

      for (const item of page) {
        const itemUpdatedAt = latestUpdatedAt([item]);
        entries.push({
          url: new URL(`/directory/${category.slug}/${item.slug}`, siteUrl).toString(),
          ...(dateFromTimestamp(itemUpdatedAt) ? { lastModified: dateFromTimestamp(itemUpdatedAt) } : {}),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      if (page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    if (categoryHasEntries) {
      const categoryUpdatedAt = latestUpdatedAt(categoryUpdates);
      entries.push({
        url: new URL(`/directory/${category.slug}`, siteUrl).toString(),
        ...(dateFromTimestamp(categoryUpdatedAt) ? { lastModified: dateFromTimestamp(categoryUpdatedAt) } : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const directoryIndexUpdatedAt = latestUpdatedAt(directoryUpdates);
  entries.push({
    url: new URL("/directory", siteUrl).toString(),
    ...(dateFromTimestamp(directoryIndexUpdatedAt) ? { lastModified: dateFromTimestamp(directoryIndexUpdatedAt) } : {}),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  // Ward pages are reachable from parent pages but are intentionally not submitted
  // until each has sufficient unique content to merit indexing.
  return entries;
}
