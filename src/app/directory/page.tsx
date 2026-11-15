import type { Metadata } from "next";
import Link from "next/link";
import { getDirectoryEntries, DIRECTORY_CATEGORIES } from "@/lib/directory";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "গাইবান্ধার স্থানীয় তথ্য ও প্রতিষ্ঠান ডিরেক্টরি",
  description: "গাইবান্ধা জেলার শিক্ষা প্রতিষ্ঠান, হাসপাতাল, সরকারি অফিস, থানা, ব্যবসা, দর্শনীয় স্থান ও পরিবহন সেবার যাচাইকৃত তথ্য খুঁজুন।",
  alternates: { canonical: "/directory" },
};

export default async function DirectoryPage() {
  const counts = await Promise.all(
    DIRECTORY_CATEGORIES.map(async (category) => ({
      ...category,
      count: (await getDirectoryEntries({ category: category.slug, limit: 1 })).length,
    })),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link>
          <Link href="/upazila" className="text-sm font-semibold text-emerald-800">উপজেলা</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> / তথ্য ডিরেক্টরি
        </nav>
        <p className="text-sm font-bold tracking-wide text-emerald-700">স্থানীয় তথ্যভান্ডার</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">গাইবান্ধার প্রতিষ্ঠান ও সেবা</h1>
        <p className="mt-4 max-w-2xl leading-8 text-slate-600">
          উপজেলা ও ইউনিয়নভিত্তিক যাচাইকৃত প্রতিষ্ঠান, সরকারি সেবা এবং স্থানীয় গুরুত্বপূর্ণ স্থানের তথ্য বিভাগ অনুযায়ী দেখুন।
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map((category) => (
            <Link key={category.slug} href={`/directory/${category.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
              <h2 className="text-lg font-bold">{category.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
              <p className="mt-4 text-sm font-semibold text-emerald-700">তথ্য দেখুন →</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-xs leading-6 text-slate-500">
          এই ডিরেক্টরিতে কেবল প্রকাশিত ও যাচাইকৃত তথ্য দেখানো হয়। কোনো প্রতিষ্ঠানের তথ্য হালনাগাদ না থাকলে সেটি প্রকাশ করা হয় না।
        </p>
      </section>
    </main>
  );
}
