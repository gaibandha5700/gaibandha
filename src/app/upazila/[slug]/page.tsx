import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { getUpazilaBySlug, getUpazilas, getUnionsByUpazila } from "@/lib/directory";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const upazilas = await getUpazilas();
  return upazilas.map((upazila) => ({ slug: upazila.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) return { title: "উপজেলা পাওয়া যায়নি" };

  const title = `${upazila.name_bn} উপজেলা — ইউনিয়ন ও স্থানীয় তথ্য`;
  const description = `${upazila.name_bn} উপজেলার ইউনিয়ন, স্থানীয় প্রশাসনিক এলাকা ও গাইবান্ধা জেলার প্রয়োজনীয় তথ্য দেখুন।`;
  const url = new URL(`/upazila/${upazila.slug}`, getSiteUrl());

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "bn_BD" },
    twitter: { card: "summary", title, description },
  };
}

export default async function UpazilaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) notFound();

  const unions = await getUnionsByUpazila(upazila.id);
  const url = new URL(`/upazila/${upazila.slug}`, getSiteUrl());
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    name: upazila.name_bn,
    alternateName: upazila.name_en,
    containedInPlace: { "@type": "AdministrativeArea", name: "গাইবান্ধা জেলা, বাংলাদেশ" },
    url: url.toString(),
    inLanguage: "bn-BD",
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link>
          <Link href="/upazila" className="text-sm font-semibold text-emerald-800">সকল উপজেলা</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> /
          <Link href="/upazila" className="mx-2 hover:text-emerald-700">উপজেলা</Link> / {upazila.name_bn}
        </nav>
        <p className="text-sm font-bold tracking-wide text-emerald-700">গাইবান্ধা জেলা · রংপুর বিভাগ</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{upazila.name_bn} উপজেলা</h1>
        <p className="mt-4 max-w-2xl leading-8 text-slate-600">
          {upazila.name_bn} উপজেলার ইউনিয়ন পরিষদগুলোর তালিকা ও স্থানীয় প্রশাসনিক এলাকার তথ্য। প্রতিটি ইউনিয়ন নির্বাচন করে বিস্তারিত দেখুন।
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm text-emerald-900">ইউনিয়ন পরিষদ</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-800">{unions.length.toLocaleString("bn-BD")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">জনসংখ্যা · ২০২২</p>
            <p className="mt-1 text-2xl font-extrabold">{upazila.population_total_2022 == null ? "তথ্য নেই" : upazila.population_total_2022.toLocaleString("bn-BD")}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">খানা · ২০২২</p>
            <p className="mt-1 text-2xl font-extrabold">{upazila.households_total_2022 == null ? "তথ্য নেই" : upazila.households_total_2022.toLocaleString("bn-BD")}</p>
          </div>
        </div>
        {upazila.census_source_url && (
          <p className="mt-3 text-xs text-slate-500">
            জনশুমারি ২০২২-এর তথ্যসূত্র: <a className="text-emerald-700 underline" href={upazila.census_source_url} target="_blank" rel="noreferrer">BBS Community Report ↗</a>
          </p>
        )}
        <h2 className="mt-10 text-2xl font-bold">ইউনিয়নসমূহ</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unions.map((union) => (
            <Link key={union.id} href={`/upazila/${upazila.slug}/${union.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 font-semibold transition hover:border-emerald-300 hover:shadow-sm">
              <span>{union.name_bn}</span>
              <span className="mt-1 block text-xs font-normal text-slate-500">{union.name_en}</span>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-xs leading-6 text-slate-500">
          প্রশাসনিক নাম ও জিও-কোডের উৎস: বাংলাদেশ পরিসংখ্যান ব্যুরো, জনশুমারি ও গৃহগণনা ২০২২, কমিউনিটি রিপোর্ট: গাইবান্ধা।
        </p>
      </section>
    </main>
  );
}
