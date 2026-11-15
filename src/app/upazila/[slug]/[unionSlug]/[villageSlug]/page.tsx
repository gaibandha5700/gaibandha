import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import {
  getUpazilaBySlug,
  getUpazilas,
  getUnionBySlug,
  getUnionsByUpazila,
  getVillageBySlug,
  getVillagesByUnion,
} from "@/lib/directory";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string; unionSlug: string; villageSlug: string }>;
};

export async function generateStaticParams() {
  const upazilas = await getUpazilas();
  const nested = await Promise.all(
    upazilas.map(async (upazila) => {
      const unions = await getUnionsByUpazila(upazila.id);
      return Promise.all(
        unions.map(async (union) => {
          const villages = await getVillagesByUnion(union.id);
          return villages.map((village) => ({
            slug: upazila.slug,
            unionSlug: union.slug,
            villageSlug: village.slug,
          }));
        }),
      );
    }),
  );
  return nested.flat(2);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, unionSlug, villageSlug } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) return { title: "গ্রাম পাওয়া যায়নি" };
  const union = await getUnionBySlug(upazila.id, unionSlug);
  if (!union) return { title: "গ্রাম পাওয়া যায়নি" };
  const village = await getVillageBySlug(upazila.id, union.id, villageSlug);
  if (!village) return { title: "গ্রাম পাওয়া যায়নি" };

  const title = `${village.name_bn} গ্রাম — ${union.name_bn}, ${upazila.name_bn}`;
  const description = village.description
    ?? `${village.name_bn} গ্রামের ঠিকানা, মৌজা ও ${union.name_bn} ইউনিয়নের প্রশাসনিক তথ্য দেখুন।`;
  const url = new URL(
    `/upazila/${upazila.slug}/${union.slug}/${village.slug}`,
    getSiteUrl(),
  );

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "bn_BD" },
    twitter: { card: "summary", title, description },
  };
}

export default async function VillageDetailPage({ params }: PageProps) {
  const { slug, unionSlug, villageSlug } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) notFound();
  const union = await getUnionBySlug(upazila.id, unionSlug);
  if (!union) notFound();
  const village = await getVillageBySlug(upazila.id, union.id, villageSlug);
  if (!village) notFound();

  const url = new URL(
    `/upazila/${upazila.slug}/${union.slug}/${village.slug}`,
    getSiteUrl(),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: village.name_bn,
    alternateName: village.name_en,
    address: village.address,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${union.name_bn}, ${upazila.name_bn}, গাইবান্ধা জেলা, বাংলাদেশ`,
    },
    geo: village.latitude != null && village.longitude != null
      ? { "@type": "GeoCoordinates", latitude: village.latitude, longitude: village.longitude }
      : undefined,
    url: url.toString(),
    inLanguage: "bn-BD",
  };

  const number = (value: number | null) =>
    value == null ? "তথ্য পাওয়া যায়নি" : value.toLocaleString("bn-BD");

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link>
          <Link href={`/upazila/${upazila.slug}/${union.slug}`} className="text-sm font-semibold text-emerald-800">
            {union.name_bn} ইউনিয়ন
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> /
          <Link href="/upazila" className="mx-2 hover:text-emerald-700">উপজেলা</Link> /
          <Link href={`/upazila/${upazila.slug}`} className="mx-2 hover:text-emerald-700">{upazila.name_bn}</Link> /
          <Link href={`/upazila/${upazila.slug}/${union.slug}`} className="mx-2 hover:text-emerald-700">{union.name_bn}</Link> /
          {village.name_bn}
        </nav>
        <p className="text-sm font-bold text-emerald-700">{upazila.name_bn} উপজেলা · {union.name_bn} ইউনিয়ন</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{village.name_bn} গ্রাম</h1>
        {village.name_en && <p className="mt-2 text-slate-500">{village.name_en}</p>}
        {village.description && <p className="mt-5 leading-8 text-slate-600">{village.description}</p>}

        <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">উপজেলা</dt><dd className="mt-1 font-bold">{upazila.name_bn}</dd></div>
          <div><dt className="text-sm text-slate-500">ইউনিয়ন</dt><dd className="mt-1 font-bold">{union.name_bn}</dd></div>
          <div><dt className="text-sm text-slate-500">মৌজা</dt><dd className="mt-1 font-bold">{village.mouza_name_bn ?? village.mouza_name_en ?? "তথ্য পাওয়া যায়নি"}</dd></div>
          <div><dt className="text-sm text-slate-500">ডাকঘর</dt><dd className="mt-1 font-bold">{village.post_office ?? "তথ্য পাওয়া যায়নি"}</dd></div>
          <div><dt className="text-sm text-slate-500">পোস্টকোড</dt><dd className="mt-1 font-bold">{village.postal_code ?? "তথ্য পাওয়া যায়নি"}</dd></div>
          <div><dt className="text-sm text-slate-500">ঠিকানা</dt><dd className="mt-1 font-bold">{village.address ?? "তথ্য পাওয়া যায়নি"}</dd></div>
          <div><dt className="text-sm text-slate-500">জনসংখ্যা</dt><dd className="mt-1 font-bold">{number(village.population)}</dd></div>
          <div><dt className="text-sm text-slate-500">পরিবার</dt><dd className="mt-1 font-bold">{number(village.households)}</dd></div>
          <div><dt className="text-sm text-slate-500">আয়তন (বর্গ কিমি)</dt><dd className="mt-1 font-bold">{number(village.area_sq_km)}</dd></div>
          <div><dt className="text-sm text-slate-500">অবস্থান</dt><dd className="mt-1 font-bold">
            {village.latitude != null && village.longitude != null
              ? `${village.latitude}, ${village.longitude}`
              : "তথ্য পাওয়া যায়নি"}
          </dd></div>
        </dl>

        {village.source_url && (
          <p className="mt-6 text-xs leading-6 text-slate-500">
            তথ্যসূত্র: {village.source_name ?? "প্রকাশিত উৎস"} ·{" "}
            <a href={village.source_url} target="_blank" rel="noreferrer" className="text-emerald-700 underline">
              মূল উৎস দেখুন
            </a>
            {village.source_checked_at && ` · যাচাই: ${new Date(village.source_checked_at).toLocaleDateString("bn-BD")}`}
          </p>
        )}
        <Link href={`/upazila/${upazila.slug}/${union.slug}`} className="mt-8 inline-flex font-bold text-emerald-700">
          ← {union.name_bn} ইউনিয়নে ফিরে যান
        </Link>
      </article>
    </main>
  );
}
