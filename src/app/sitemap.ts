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
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const publicDataUpdatedAt = await getLatestPublicDataUpdatedAt();
  const homepageLastModified = dateFromTimestamp(publicDataUpdatedAt);
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl.toString(),
      ...(homepageLastModified ? { lastModified: homepageLastModified } : {}),
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
  const upazilaIndexDate = dateFromTimestamp(latestUpdatedAt(upazilas));
  entries.push({
    url: new URL("/upazila", siteUrl).toString(),
    ...(upazilaIndexDate ? { lastModified: upazilaIndexDate } : {}),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  const municipalityUpdates: Array<{ updated_at?: string | null }> = [];
  for (const upazila of upazilas) {
    const upazilaDate = dateFromTimestamp(latestUpdatedAt([upazila]));
    entries.push({
      url: new URL(`/upazila/${upazila.slug}`, siteUrl).toString(),
      ...(upazilaDate ? { lastModified: upazilaDate } : {}),
      changeFrequency: "monthly",
      priority: 0.8,
    });

    const [unions, municipalities] = await Promise.all([
      getUnionsByUpazila(upazila.id),
      getMunicipalitiesByUpazila(upazila.id),
    ]);
    municipalityUpdates.push(...municipalities.map(({ updated_at }) => ({ updated_at })));

    for (const union of unions) {
      const unionDate = dateFromTimestamp(latestUpdatedAt([union]));
      entries.push({
        url: new URL(`/upazila/${upazila.slug}/${union.slug}`, siteUrl).toString(),
        ...(unionDate ? { lastModified: unionDate } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const municipality of municipalities) {
      const municipalityDate = dateFromTimestamp(latestUpdatedAt([municipality]));
      entries.push({
        url: new URL(`/municipality/${municipality.slug}`, siteUrl).toString(),
        ...(municipalityDate ? { lastModified: municipalityDate } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  const municipalityIndexDate = dateFromTimestamp(latestUpdatedAt(municipalityUpdates));
  entries.push({
    url: new URL("/municipality", siteUrl).toString(),
    ...(municipalityIndexDate ? { lastModified: municipalityIndexDate } : {}),
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
        const itemDate = dateFromTimestamp(latestUpdatedAt([item]));
        entries.push({
          url: new URL(`/directory/${category.slug}/${item.slug}`, siteUrl).toString(),
          ...(itemDate ? { lastModified: itemDate } : {}),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      if (page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    if (categoryHasEntries) {
      const categoryDate = dateFromTimestamp(latestUpdatedAt(categoryUpdates));
      entries.push({
        url: new URL(`/directory/${category.slug}`, siteUrl).toString(),
        ...(categoryDate ? { lastModified: categoryDate } : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const directoryIndexDate = dateFromTimestamp(latestUpdatedAt(directoryUpdates));
  entries.push({
    url: new URL("/directory", siteUrl).toString(),
    ...(directoryIndexDate ? { lastModified: directoryIndexDate } : {}),
    changeFrequency: "weekly",
    priority: 0.9,
  });

  // Ward pages are reachable from parent pages but are intentionally not submitted
  // until each has sufficient unique content to merit indexing.
  return entries;
}
