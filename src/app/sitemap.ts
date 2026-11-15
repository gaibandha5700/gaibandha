import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import {
  DIRECTORY_CATEGORIES,
  getDirectoryEntries,
  getMunicipalitiesByUpazila,
  getWardsByMunicipality,
  getWardsByUnion,
  getUpazilas,
  getUnionsByUpazila,
} from "@/lib/directory";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl.toString(), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/upazila", siteUrl).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.9 },\n    { url: new URL("/municipality", siteUrl).toString(), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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
      const wards = await getWardsByUnion(union.id);
      for (const ward of wards) {
        entries.push({
          url: new URL(`/upazila/${upazila.slug}/${union.slug}/ward/${ward.ward_number}`, siteUrl).toString(),
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }

    for (const municipality of municipalities) {
      entries.push({
        url: new URL(`/municipality/${municipality.slug}`, siteUrl).toString(),
        lastModified: municipality.updated_at ? new Date(municipality.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
      const wards = await getWardsByMunicipality(municipality.id);
      for (const ward of wards) {
        entries.push({
          url: new URL(`/municipality/${municipality.slug}/ward/${ward.ward_number}`, siteUrl).toString(),
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  for (const category of DIRECTORY_CATEGORIES) {
    entries.push({
      url: new URL(`/directory/${category.slug}`, siteUrl).toString(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    const directoryEntries = await getDirectoryEntries({ category: category.slug });
    for (const item of directoryEntries) {
      entries.push({
        url: new URL(`/directory/${category.slug}/${item.slug}`, siteUrl).toString(),
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
