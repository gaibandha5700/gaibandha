import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, isDirectoryCategory } from "@/lib/directory";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return DIRECTORY_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  if (!isDirectoryCategory(slug)) return { title: "বিভাগ পাওয়া যায়নি" };
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  return {
    title: `${category.label} — গাইবান্ধা`,
    description: `গাইবান্ধা জেলার ${category.label} সম্পর্কিত প্রকাশিত ও যাচাইকৃত স্থানীয় তথ্য, ঠিকানা ও যোগাযোগের বিবরণ দেখুন।`,
    alternates: { canonical: `/directory/${slug}` },
  };
}

export default async function DirectoryCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  if (!isDirectoryCategory(slug)) notFound();
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  const entries = await getDirectoryEntries({ category: slug });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link>
          <Link href="/directory" className="text-sm font-semibold text-emerald-800">সব বিভাগ</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> /
          <Link href="/directory" className="mx-2 hover:text-emerald-700">ডিরেক্টরি</Link> / {category.label}
        </nav>
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলা · স্থানীয় তথ্য</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{category.label}</h1>
        <p className="mt-3 leading-7 text-slate-600">{category.description} — গাইবান্ধা জেলার উপজেলা ও ইউনিয়নভিত্তিক তালিকা।</p>
        {entries.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/directory/${slug}/${entry.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                <h2 className="font-bold">{entry.name_bn}</h2>
                {entry.name_en && <p className="mt-1 text-sm text-slate-500">{entry.name_en}</p>}
                {entry.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{entry.summary}</p>}
                {entry.address && <p className="mt-3 text-xs text-slate-500">{entry.address}</p>}
                <span className="mt-4 block text-sm font-semibold text-emerald-700">বিস্তারিত →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8">
            <h2 className="text-lg font-bold">এখনো যাচাইকৃত তথ্য যোগ করা হয়নি</h2>
            <p className="mt-2 leading-7 text-slate-600">এই বিভাগের তথ্য সংগ্রহ ও যাচাই চলছে। যাচাই সম্পন্ন হলে এখানে প্রতিষ্ঠানের নাম, ঠিকানা ও যোগাযোগের তথ্য প্রকাশ করা হবে।</p>
          </div>
        )}
      </section>
    </main>
  );
}
