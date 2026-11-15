import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, getUpazilaBySlug, getUpazilas, getUnionBySlug, getUnionsByUpazila, getWardsByUnion } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string; unionSlug: string }> };

export async function generateStaticParams() {
  const upazilas = await getUpazilas();
  const params = await Promise.all(upazilas.map(async (upazila) => {
    const unions = await getUnionsByUpazila(upazila.id);
    return unions.map((union) => ({ slug: upazila.slug, unionSlug: union.slug }));
  }));
  return params.flat();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, unionSlug } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) return { title: "ইউনিয়ন পাওয়া যায়নি" };
  const union = await getUnionBySlug(upazila.id, unionSlug);
  if (!union) return { title: "ইউনিয়ন পাওয়া যায়নি" };

  const title = `${union.name_bn} ইউনিয়ন — ${upazila.name_bn}, গাইবান্ধা`;
  const description = `${union.name_bn} ইউনিয়ন পরিষদের পরিচিতি ও ${upazila.name_bn} উপজেলার স্থানীয় তথ্য দেখুন।`;
  const url = new URL(`/upazila/${upazila.slug}/${union.slug}`, getSiteUrl());

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "bn_BD" },
    twitter: { card: "summary", title, description },
  };
}

export default async function UnionDetailPage({ params }: PageProps) {
  const { slug, unionSlug } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) notFound();
  const union = await getUnionBySlug(upazila.id, unionSlug);
  if (!union) notFound();
  const [localEntries, wards] = await Promise.all([getDirectoryEntries({ unionId: union.id }), getWardsByUnion(union.id)]);

  const url = new URL(`/upazila/${upazila.slug}/${union.slug}`, getSiteUrl());
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${union.name_bn} ইউনিয়ন`,
    alternateName: union.name_en,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `${upazila.name_bn}, গাইবান্ধা জেলা, বাংলাদেশ`,
    },
    url: url.toString(),
    inLanguage: "bn-BD",
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> /
          <Link href="/upazila" className="mx-2 hover:text-emerald-700">উপজেলা</Link> /
          <Link href={`/upazila/${upazila.slug}`} className="mx-2 hover:text-emerald-700">{upazila.name_bn}</Link> /
          {union.name_bn}
        </nav>
        <p className="text-sm font-bold text-emerald-700">{upazila.name_bn} উপজেলা · গাইবান্ধা জেলা</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{union.name_bn} ইউনিয়ন</h1>
        <p className="mt-4 leading-8 text-slate-600">
          {union.name_bn} ইউনিয়ন গাইবান্ধা জেলার {upazila.name_bn} উপজেলার অন্তর্গত একটি ইউনিয়ন পরিষদ। এই পৃষ্ঠায় ইউনিয়নটির প্রশাসনিক পরিচিতি ও যাচাইকৃত স্থানীয় তথ্য পর্যায়ক্রমে যুক্ত করা হবে।
        </p>
        <section className="mt-10"><h2 className="text-2xl font-bold">ওয়ার্ডসমূহ</h2><p className="mt-2 text-sm text-slate-600">প্রকাশিত ও যাচাইকৃত ওয়ার্ডের তালিকা।</p><div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">{wards.map((ward) => (<Link key={ward.id} href={`/upazila/${upazila.slug}/${union.slug}/ward/${ward.ward_number}`} className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-emerald-300 hover:shadow-sm"><span className="block text-xs text-slate-500">ওয়ার্ড</span><strong className="mt-1 block text-xl text-emerald-800">{ward.ward_number.toLocaleString("bn-BD")}</strong></Link>))}</div>{wards.length === 0 && <p className="mt-3 text-sm text-slate-500">এখনো কোনো প্রকাশিত ও যাচাইকৃত ওয়ার্ডের তথ্য নেই।</p>}</section>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">এই ইউনিয়নের প্রতিষ্ঠান ও সেবা</h2>
          {localEntries.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {localEntries.map((entry) => {
                const category = DIRECTORY_CATEGORIES.find((item) => item.slug === entry.category);
                return (
                  <Link key={entry.id} href={`/directory/${entry.category}/${entry.slug}`} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                    <span className="text-xs font-semibold text-emerald-700">{category?.label}</span>
                    <span className="mt-1 block font-bold">{entry.name_bn}</span>
                    {entry.summary && <span className="mt-2 block text-sm leading-6 text-slate-600">{entry.summary}</span>}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-7 text-slate-600">এই ইউনিয়নের জন্য এখনো কোনো প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠান বা সেবার তথ্য যোগ করা হয়নি।</p>
          )}
        </section>
        <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">জনসংখ্যা · জনশুমারি ২০২২</dt><dd className="mt-1 font-bold">{union.population_total_2022 == null ? "তথ্য পাওয়া যায়নি" : union.population_total_2022.toLocaleString("bn-BD")}</dd></div>
          <div><dt className="text-sm text-slate-500">খানা · ২০২২</dt><dd className="mt-1 font-bold">{union.households_total_2022 == null ? "তথ্য পাওয়া যায়নি" : union.households_total_2022.toLocaleString("bn-BD")}</dd></div>
          <div><dt className="text-sm text-slate-500">পুরুষ · ২০২২</dt><dd className="mt-1 font-bold">{union.population_male_2022 == null ? "তথ্য পাওয়া যায়নি" : union.population_male_2022.toLocaleString("bn-BD")}</dd></div>
          <div><dt className="text-sm text-slate-500">নারী · ২০২২</dt><dd className="mt-1 font-bold">{union.population_female_2022 == null ? "তথ্য পাওয়া যায়নি" : union.population_female_2022.toLocaleString("bn-BD")}</dd></div>
          <div><dt className="text-sm text-slate-500">হিজড়া · ২০২২</dt><dd className="mt-1 font-bold">{union.population_hijra_2022 == null ? "তথ্য পাওয়া যায়নি" : union.population_hijra_2022.toLocaleString("bn-BD")}</dd></div>
          <div><dt className="text-sm text-slate-500">লিঙ্গ অনুপাত · ২০২২</dt><dd className="mt-1 font-bold">{union.sex_ratio_2022 == null ? "তথ্য পাওয়া যায়নি" : union.sex_ratio_2022.toLocaleString("bn-BD")}</dd></div>
          <div><dt className="text-sm text-slate-500">ইউনিয়নের নাম</dt><dd className="mt-1 font-bold">{union.name_bn}</dd></div>
          <div><dt className="text-sm text-slate-500">উপজেলা</dt><dd className="mt-1 font-bold">{upazila.name_bn}</dd></div>
          <div><dt className="text-sm text-slate-500">জেলা</dt><dd className="mt-1 font-bold">গাইবান্ধা</dd></div>
        </dl>
        {union.census_source_url && <p className="mt-5 text-xs text-slate-500">জনশুমারি ২০২২-এর তথ্যসূত্র: <a className="text-emerald-700 underline" href={union.census_source_url} target="_blank" rel="noreferrer">BBS Community Report ↗</a></p>}
        <p className="mt-7 text-xs leading-6 text-slate-500">
          প্রশাসনিক নাম ও জিও-কোডের উৎস: বাংলাদেশ পরিসংখ্যান ব্যুরো, জনশুমারি ও গৃহগণনা ২০২২, কমিউনিটি রিপোর্ট: গাইবান্ধা।
        </p>
        <Link href={`/upazila/${upazila.slug}`} className="mt-8 inline-flex font-bold text-emerald-700">← {upazila.name_bn} উপজেলার সব ইউনিয়ন</Link>
      </article>
    <SiteFooter />
      </main>
  );
}
