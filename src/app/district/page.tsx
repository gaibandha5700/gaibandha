import type { Metadata } from "next";
import Link from "next/link";
import { getDistrictBySlug, getDirectoryEntries, getMunicipalitiesByUpazila, getUpazilas, getUnionsByUpazila, getPublishedWards, DIRECTORY_CATEGORIES } from "@/lib/directory";
import { getSiteUrl } from "@/lib/site-url";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "গাইবান্ধা জেলা পরিচিতি ও জনসংখ্যা",
  description: "গাইবান্ধা জেলার পরিচিতি, জনসংখ্যা, জনশুমারি ২০২২-এর পরিসংখ্যান, উপজেলা, ইউনিয়ন ও পৌরসভার তথ্য।",
  alternates: { canonical: "/district" },
  openGraph: {
    title: "গাইবান্ধা জেলা — পরিচিতি ও পরিসংখ্যান",
    description: "গাইবান্ধা জেলার প্রশাসনিক কাঠামো ও জনশুমারি ২০২২-এর যাচাইকৃত পরিসংখ্যান।",
    url: new URL("/district", getSiteUrl()),
    type: "article",
    locale: "bn_BD",
  },
};

const number = (value: number | null | undefined) =>
  value == null ? "তথ্য নেই" : value.toLocaleString("bn-BD");

export default async function DistrictPage() {
  const district = await getDistrictBySlug("gaibandha");
  if (!district) notFound();

  const [upazilas, directoryEntries, wards] = await Promise.all([
    getUpazilas(),
    getDirectoryEntries({ limit: 500 }),
    getPublishedWards(),
  ]);
  const groups = await Promise.all(upazilas.map(async (upazila) => {
    const [unions, municipalities] = await Promise.all([
      getUnionsByUpazila(upazila.id),
      getMunicipalitiesByUpazila(upazila.id),
    ]);
    return { upazila, unions, municipalities };
  }));
  const unionCount = groups.reduce((total, group) => total + group.unions.length, 0);
  const municipalityCount = groups.reduce((total, group) => total + group.municipalities.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    name: district.name_bn,
    alternateName: district.name_en,
    containedInPlace: { "@type": "AdministrativeArea", name: "রংপুর বিভাগ, বাংলাদেশ" },
    url: new URL("/district", getSiteUrl()).toString(),
    inLanguage: "bn-BD",
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <article className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> / জেলা পরিচিতি
        </nav>
        <p className="text-sm font-bold tracking-wide text-emerald-700">রংপুর বিভাগ · বাংলাদেশ</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">{district.name_bn} জেলা</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          গাইবান্ধা জেলার প্রশাসনিক পরিচিতি, জনসংখ্যা এবং উপজেলা, ইউনিয়ন ও পৌরসভার প্রকাশিত ও যাচাইকৃত তথ্য এক জায়গায় দেখুন।
        </p>

        <section aria-label="জেলার পরিসংখ্যান" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:col-span-2">
            <p className="text-sm font-medium text-emerald-900">মোট জনসংখ্যা · ২০২২</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-900 sm:text-4xl">{number(district.population_total_2022)}</p>
            <p className="mt-1 text-xs text-emerald-800">জনশুমারি ও গৃহগণনা ২০২২</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">মোট খানা · ২০২২</p>
            <p className="mt-2 text-2xl font-extrabold">{number(district.households_total_2022)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">লিঙ্গ অনুপাত · ২০২২</p>
            <p className="mt-2 text-2xl font-extrabold">{district.sex_ratio_2022 == null ? "তথ্য নেই" : Number(district.sex_ratio_2022).toLocaleString("bn-BD")}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">জনসংখ্যার বিবরণ</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div><dt className="text-sm text-slate-500">পুরুষ</dt><dd className="mt-1 text-xl font-bold">{number(district.population_male_2022)}</dd></div>
            <div><dt className="text-sm text-slate-500">নারী</dt><dd className="mt-1 text-xl font-bold">{number(district.population_female_2022)}</dd></div>
            <div><dt className="text-sm text-slate-500">হিজড়া</dt><dd className="mt-1 text-xl font-bold">{number(district.population_hijra_2022)}</dd></div>
          </dl>
          {district.census_source_url && (
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
              তথ্যসূত্র: <a href={district.census_source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 underline">{district.census_source_name ?? "বাংলাদেশ পরিসংখ্যান ব্যুরো — জনশুমারি ২০২২"} ↗</a>
              {district.census_checked_at && <> · সর্বশেষ যাচাই: {new Date(district.census_checked_at).toLocaleDateString("bn-BD")}</>}
            </p>
          )}
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-bold text-emerald-700">প্রশাসনিক কাঠামো</p><h2 className="mt-1 text-2xl font-extrabold">জেলার স্থানীয় প্রশাসনিক এলাকা</h2></div>
            <Link href="/upazila" className="text-sm font-bold text-emerald-700">সব উপজেলা দেখুন →</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["উপজেলা", upazilas.length, "/upazila"],
              ["ইউনিয়ন", unionCount, "/upazila"],
              ["পৌরসভা", municipalityCount, "/municipality"],
              ["ওয়ার্ড", wards.length, "/upazila"],
              ["যাচাইকৃত প্রতিষ্ঠান", directoryEntries.length, "/directory"],
            ].map(([label, count, href]) => (
              <Link key={String(label)} href={String(href)} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-extrabold">{Number(count).toLocaleString("bn-BD")}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map(({ upazila, unions, municipalities }) => (
              <Link key={upazila.id} href={`/upazila/${upazila.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                <h3 className="text-lg font-bold">{upazila.name_bn} উপজেলা</h3>
                <p className="mt-2 text-sm text-slate-500">{unions.length.toLocaleString("bn-BD")}টি ইউনিয়ন · {municipalities.length.toLocaleString("bn-BD")}টি পৌরসভা</p>
                <span className="mt-4 block text-sm font-semibold text-emerald-700">বিস্তারিত দেখুন →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold text-emerald-700">স্থানীয় সেবা</p><h2 className="mt-1 text-2xl font-extrabold">প্রতিষ্ঠান ও সেবার বিভাগ</h2></div><Link href="/directory" className="text-sm font-bold text-emerald-700">সব বিভাগ →</Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DIRECTORY_CATEGORIES.map((category) => {
              const count = directoryEntries.filter((entry) => entry.category === category.slug).length;
              return <Link key={category.slug} href={`/directory/${category.slug}`} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300">
                <h3 className="font-bold">{category.label}</h3><p className="mt-1 text-sm text-slate-500">{count.toLocaleString("bn-BD")}টি যাচাইকৃত তথ্য</p>
              </Link>;
            })}
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
