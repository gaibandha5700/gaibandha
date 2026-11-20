import type { Metadata } from "next";
import Link from "next/link";
import { getDirectoryEntries, DIRECTORY_CATEGORIES } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "গাইবান্ধার স্থানীয় তথ্য ও প্রতিষ্ঠান ডিরেক্টরি",
  description: "গাইবান্ধা জেলার প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠান, সরকারি অফিস, শিক্ষা ও স্বাস্থ্যসেবার তথ্য খুঁজুন।",
  alternates: { canonical: "/directory" },
};

export default async function DirectoryPage() {
  const counts = await Promise.all(
    DIRECTORY_CATEGORIES.map(async (category) => ({
      ...category,
      count: (await getDirectoryEntries({ category: category.slug })).length,
    })),
  );
  const publishedCategories = counts.filter((category) => category.count > 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="ধাপ নির্দেশনা" className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / তথ্য ডিরেক্টরি</nav>
        <p className="text-sm font-bold tracking-wide text-emerald-700">স্থানীয় তথ্যভান্ডার</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">গাইবান্ধার প্রতিষ্ঠান ও সেবা</h1>
        <p className="mt-4 max-w-2xl leading-8 text-slate-600">বিভাগ নির্বাচন করে প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠানের তথ্য, ঠিকানা ও যোগাযোগের বিবরণ দেখুন।</p>
        <form action="/search" className="mt-7 flex gap-2">
          <input name="q" type="search" placeholder="প্রতিষ্ঠান বা সেবার নাম লিখুন" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600" />
          <button className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">খুঁজুন</button>
        </form>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedCategories.map((category) => (
            <Link key={category.slug} href={`/directory/${category.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
              <h2 className="text-lg font-bold">{category.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
              <p className="mt-4 text-sm font-semibold text-emerald-700">{category.count.toLocaleString("bn-BD")}টি যাচাইকৃত তথ্য · দেখুন →</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-sm leading-6 text-emerald-900">আপনার জানা কোনো প্রতিষ্ঠান তালিকায় নেই?</p><Link href="/submit" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">নতুন তথ্য জমা দিন</Link></div>
      </section>
    <SiteFooter />
      </main>
  );
}
