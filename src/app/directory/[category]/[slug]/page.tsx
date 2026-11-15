import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, getDirectoryEntry, isDirectoryCategory } from "@/lib/directory";

export const revalidate = 3600;
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link>
          <Link href={`/directory/${slug}`} className="text-sm font-semibold text-emerald-800">{category.label}</Link>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> /
          <Link href="/directory" className="mx-2 hover:text-emerald-700">ডিরেক্টরি</Link> /
          <Link href={`/directory/${slug}`} className="mx-2 hover:text-emerald-700">{category.label}</Link> /
          {entry.name_bn}
        </nav>
        <p className="text-sm font-bold text-emerald-700">{category.label} · গাইবান্ধা জেলা</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{entry.name_bn}</h1>
        {entry.name_en && <p className="mt-2 text-slate-500">{entry.name_en}</p>}
        {entry.summary && <p className="mt-5 text-lg leading-8 text-slate-700">{entry.summary}</p>}
        {entry.description && <div className="mt-5 whitespace-pre-line leading-8 text-slate-700">{entry.description}</div>}
        <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
          {entry.address && <div><dt className="text-sm text-slate-500">ঠিকানা</dt><dd className="mt-1 font-semibold">{entry.address}</dd></div>}
          {entry.phone && <div><dt className="text-sm text-slate-500">ফোন</dt><dd className="mt-1 font-semibold"><a href={`tel:${entry.phone}`}>{entry.phone}</a></dd></div>}
          {entry.email && <div><dt className="text-sm text-slate-500">ইমেইল</dt><dd className="mt-1 font-semibold"><a href={`mailto:${entry.email}`}>{entry.email}</a></dd></div>}
          {entry.website_url && <div><dt className="text-sm text-slate-500">ওয়েবসাইট</dt><dd className="mt-1 font-semibold"><a href={entry.website_url} rel="nofollow noopener noreferrer" target="_blank">অফিশিয়াল ওয়েবসাইট ↗</a></dd></div>}
        </dl>
        {entry.latitude !== null && entry.longitude !== null && (
          <p className="mt-5 text-sm"><a className="font-semibold text-emerald-700" href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`} target="_blank" rel="noopener noreferrer">গুগল ম্যাপে অবস্থান দেখুন ↗</a></p>
        )}
        <p className="mt-8 text-xs leading-6 text-slate-500">এই পৃষ্ঠায় কেবল প্রকাশিত ও যাচাইকৃত তথ্য দেখানো হয়। কোনো তথ্য ভুল হলে সংশোধনের জন্য যোগাযোগ করুন।</p>
      </article>
    </main>
  );
}
