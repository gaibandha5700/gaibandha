import type { Metadata } from "next";
import Link from "next/link";
import SubmissionForm from "@/components/submission-form";

export const metadata: Metadata = {
  title: "তথ্য জমা দিন বা সংশোধন করুন",
  description: "গাইবান্ধা জেলার প্রতিষ্ঠান ও স্থানীয় সেবার নতুন তথ্য জমা দিন অথবা বিদ্যমান তথ্য সংশোধনের অনুরোধ জানান।",
  alternates: { canonical: "/submit" },
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ type?: string; entry_id?: string; name?: string; category?: string }> };

export default async function SubmitPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialType = params.type === "correction" ? "correction" : "new_entry";
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      <section className="mx-auto max-w-3xl px-4 py-12">
        <nav className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / <Link href="/directory">তথ্যভান্ডার</Link> / তথ্য জমা</nav>
        <p className="text-sm font-bold text-emerald-700">জনসম্পৃক্ত তথ্যভান্ডার</p>
        <h1 className="mt-2 text-3xl font-extrabold">নতুন তথ্য দিন বা ভুল সংশোধন করুন</h1>
        <p className="mt-3 mb-7 leading-7 text-slate-600">আপনার দেওয়া তথ্য প্রথমে পর্যালোচনার জন্য সংরক্ষিত হবে। যাচাই না হওয়া পর্যন্ত কোনো তথ্য ওয়েবসাইটে প্রকাশ করা হবে না।</p>
        <SubmissionForm initialType={initialType} initialEntryId={params.entry_id ?? ""} initialName={params.name ?? ""} initialCategory={params.category ?? ""} />
      </section>
      
    </main>
  );
}
