import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, getDirectoryEntry, getEducationInstitution, getMunicipalityById, getUpazilaById, getUnionById, isDirectoryCategory } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  const params = await Promise.all(DIRECTORY_CATEGORIES.map(async (category) => {
    const entries = await getDirectoryEntries({ category: category.slug });
    return entries.map((entry) => ({ category: category.slug, slug: entry.slug }));
  }));
  return params.flat();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isDirectoryCategory(category)) return { title: "তথ্য পাওয়া যায়নি" };
  const entry = await getDirectoryEntry(category, slug);
  if (!entry) return { title: "তথ্য পাওয়া যায়নি" };
  const title = entry.meta_title || `${entry.name_bn} — গাইবান্ধা`;
  const description = entry.meta_description || entry.summary || `${entry.name_bn} সম্পর্কে ঠিকানা, যোগাযোগ ও স্থানীয় তথ্য দেখুন।`;
  const url = new URL(`/directory/${category}/${entry.slug}`, getSiteUrl());
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "bn_BD" },
    twitter: { card: "summary", title, description },
  };
}

export default async function DirectoryEntryPage({ params }: PageProps) {
  const { category: slug, slug: entrySlug } = await params;
  if (!isDirectoryCategory(slug)) notFound();
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  const entry = await getDirectoryEntry(slug, entrySlug);
  if (!entry) notFound();
  const [education, upazila, union, municipality] = await Promise.all([
    slug === "education" ? getEducationInstitution(entry.id) : Promise.resolve(null),
    entry.upazila_id ? getUpazilaById(entry.upazila_id) : Promise.resolve(null),
    entry.union_id ? getUnionById(entry.union_id) : Promise.resolve(null),
    entry.municipality_id ? getMunicipalityById(entry.municipality_id) : Promise.resolve(null),
  ]);

  const url = new URL(`/directory/${slug}/${entry.slug}`, getSiteUrl());
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: entry.name_bn,
    alternateName: entry.name_en,
    description: entry.summary || entry.description,
    address: entry.address ? { "@type": "PostalAddress", streetAddress: entry.address, addressLocality: "গাইবান্ধা", addressRegion: "রংপুর", addressCountry: "BD" } : undefined,
    telephone: entry.phone || undefined,
    email: entry.email || undefined,
    url: entry.website_url || url.toString(),
    image: entry.image_url || undefined,
    geo: entry.latitude !== null && entry.longitude !== null ? { "@type": "GeoCoordinates", latitude: entry.latitude, longitude: entry.longitude } : undefined,
    containedInPlace: { "@type": "AdministrativeArea", name: "গাইবান্ধা জেলা, বাংলাদেশ" },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-4 py-12">
        <Breadcrumbs items={[{ href: "/directory", label: "তথ্যভান্ডার" }, { href: `/directory/${slug}`, label: category.label }, { href: `/directory/${slug}/${entry.slug}`, label: entry.name_bn }]} />
        <p className="text-sm font-bold text-emerald-700">{category.label} · গাইবান্ধা জেলা</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{entry.name_bn}</h1>
                {entry.summary && <p className="mt-5 text-lg leading-8 text-slate-700">{entry.summary}</p>}
        {entry.description && <div className="mt-5 whitespace-pre-line leading-8 text-slate-700">{entry.description}</div>}
        {education && (
          <section className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6">
            <h2 className="text-xl font-bold">শিক্ষাপ্রতিষ্ঠানের তথ্য</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {education.eiin && <div><dt className="text-sm text-slate-500">EIIN</dt><dd className="mt-1 font-semibold">{education.eiin}</dd></div>}
              <div><dt className="text-sm text-slate-500">প্রতিষ্ঠানের ধরন</dt><dd className="mt-1 font-semibold">{({ school: "স্কুল", college: "কলেজ", school_college: "স্কুল অ্যান্ড কলেজ", madrasa: "মাদ্রাসা", technical: "কারিগরি", university: "বিশ্ববিদ্যালয়", other: "অন্যান্য" } as Record<string, string>)[education.institution_type] ?? "অন্যান্য"}</dd></div>
              {education.education_level && <div><dt className="text-sm text-slate-500">শিক্ষার স্তর</dt><dd className="mt-1 font-semibold">{education.education_level}</dd></div>}
              {education.management_type && <div><dt className="text-sm text-slate-500">পরিচালনা</dt><dd className="mt-1 font-semibold">{({ government: "সরকারি", private: "বেসরকারি", non_government: "বেসরকারি", autonomous: "স্বায়ত্তশাসিত", other: "অন্যান্য" } as Record<string, string>)[education.management_type] ?? education.management_type}</dd></div>}
              {education.gender_type && <div><dt className="text-sm text-slate-500">শিক্ষার্থী</dt><dd className="mt-1 font-semibold">{({ boys: "বালক", girls: "বালিকা", co_education: "সহশিক্ষা", other: "অন্যান্য" } as Record<string, string>)[education.gender_type] ?? education.gender_type}</dd></div>}
              {education.mpo_status && <div><dt className="text-sm text-slate-500">MPO অবস্থা</dt><dd className="mt-1 font-semibold">{education.mpo_status}</dd></div>}
              {education.education_board && <div><dt className="text-sm text-slate-500">শিক্ষা বোর্ড</dt><dd className="mt-1 font-semibold">{education.education_board}</dd></div>}
              {education.established_year && <div><dt className="text-sm text-slate-500">প্রতিষ্ঠাকাল</dt><dd className="mt-1 font-semibold">{education.established_year.toLocaleString("bn-BD")}</dd></div>}
              {education.recognition_source && <div><dt className="text-sm text-slate-500">তথ্যসূত্র</dt><dd className="mt-1 font-semibold">{education.recognition_source}</dd></div>}
            </dl>
            {education.recognition_url && <a className="mt-4 inline-block text-sm font-semibold text-emerald-700 underline" href={education.recognition_url} target="_blank" rel="noreferrer">সরকারি উৎস দেখুন ↗</a>}
          </section>
        )}
        <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          {entry.address && <div><dt className="text-sm text-slate-500">ঠিকানা</dt><dd className="mt-1 font-semibold">{entry.address}</dd></div>}
          {entry.phone && <div><dt className="text-sm text-slate-500">ফোন</dt><dd className="mt-1 font-semibold"><a href={`tel:${entry.phone}`}>{entry.phone}</a></dd></div>}
          {entry.email && <div><dt className="text-sm text-slate-500">ইমেইল</dt><dd className="mt-1 font-semibold"><a href={`mailto:${entry.email}`}>{entry.email}</a></dd></div>}
          {entry.website_url && <div><dt className="text-sm text-slate-500">ওয়েবসাইট</dt><dd className="mt-1 font-semibold"><a href={entry.website_url} rel="nofollow noopener noreferrer" target="_blank">অফিশিয়াল ওয়েবসাইট ↗</a></dd></div>}
        </dl>
        {(upazila || union || municipality) && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">প্রশাসনিক অবস্থান</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {upazila && <div><dt className="text-sm text-slate-500">উপজেলা</dt><dd className="mt-1 font-semibold">{upazila.name_bn}</dd></div>}
              {union && <div><dt className="text-sm text-slate-500">ইউনিয়ন</dt><dd className="mt-1 font-semibold">{union.name_bn}</dd></div>}
              {municipality && <div><dt className="text-sm text-slate-500">পৌরসভা</dt><dd className="mt-1 font-semibold">{municipality.name_bn}</dd></div>}
            </dl>
            {union && upazila && <Link className="mt-4 inline-block text-sm font-semibold text-emerald-700" href={`/upazila/${upazila.slug}/${union.slug}`}>ইউনিয়নের তথ্য দেখুন →</Link>}
            {municipality && <Link className="mt-4 inline-block text-sm font-semibold text-emerald-700" href={`/municipality/${municipality.slug}`}>পৌরসভার তথ্য দেখুন →</Link>}
          </section>
        )}
        {entry.source_name && <p className="mt-6 text-xs text-slate-500">তথ্যসূত্র: {entry.source_url ? <a className="font-semibold text-emerald-700 underline" href={entry.source_url} target="_blank" rel="noopener noreferrer">{entry.source_name} ↗</a> : entry.source_name}{entry.source_checked_at ? ` · যাচাই: ${new Date(entry.source_checked_at).toLocaleDateString("bn-BD")}` : ""}</p>}
        {entry.latitude !== null && entry.longitude !== null && (
          <p className="mt-5 text-sm"><a className="font-semibold text-emerald-700" href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`} target="_blank" rel="noopener noreferrer">গুগল ম্যাপে অবস্থান দেখুন ↗</a></p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-sm leading-6 text-emerald-900">এই তথ্যটি ভুল বা পুরোনো মনে হলে সংশোধনের অনুরোধ জানান।</p><Link href={`/submit?type=correction&entry_id=${entry.id}&name=${encodeURIComponent(entry.name_bn)}&category=${slug}`} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">সংশোধনের অনুরোধ</Link></div>
      </article>
    <SiteFooter />
      </main>
  );
}
