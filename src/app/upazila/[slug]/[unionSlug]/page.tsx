import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { getUpazilaBySlug, getUpazilas, getUnionBySlug, getUnionsByUpazila } from "@/lib/directory";

export const revalidate = 3600;
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link>
          <Link href="/upazila" className="text-sm font-semibold text-emerald-800">সকল উপজেলা</Link>
        </div>
      </header>
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
        <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">ইউনিয়নের নাম</dt><dd className="mt-1 font-bold">{union.name_bn}</dd></div>
          <div><dt className="text-sm text-slate-500">ইংরেজি নাম</dt><dd className="mt-1 font-bold">{union.name_en}</dd></div>
          <div><dt className="text-sm text-slate-500">উপজেলা</dt><dd className="mt-1 font-bold">{upazila.name_bn}</dd></div>
          <div><dt className="text-sm text-slate-500">জেলা</dt><dd className="mt-1 font-bold">গাইবান্ধা</dd></div>
        </dl>
        <p className="mt-7 text-xs leading-6 text-slate-500">
          প্রশাসনিক নাম ও জিও-কোডের উৎস: বাংলাদেশ পরিসংখ্যান ব্যুরো, জনশুমারি ও গৃহগণনা ২০২২, কমিউনিটি রিপোর্ট: গাইবান্ধা।
        </p>
        <Link href={`/upazila/${upazila.slug}`} className="mt-8 inline-flex font-bold text-emerald-700">← {upazila.name_bn} উপজেলার সব ইউনিয়ন</Link>
      </article>
    </main>
  );
}
