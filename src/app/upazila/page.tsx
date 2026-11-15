import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";
import { getUpazilas } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "গাইবান্ধার সকল উপজেলা",
  description:
    "গাইবান্ধা জেলার ৭টি উপজেলার পরিচিতি, ইউনিয়ন ও স্থানীয় তথ্য এক জায়গায় দেখুন।",
  alternates: { canonical: "/upazila" },
  openGraph: {
    title: "গাইবান্ধার ৭টি উপজেলা",
    description: "গাইবান্ধা জেলার উপজেলা ও ইউনিয়নের তথ্যভান্ডার।",
    url: new URL("/upazila", getSiteUrl()),
    type: "website",
  },
};

export default async function UpazilaIndexPage() {
  const upazilas = await getUpazilas();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-700">হোম</Link> / উপজেলা
        </nav>
        <p className="text-sm font-bold tracking-wide text-emerald-700">জেলা পরিচিতি</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">গাইবান্ধা জেলার ৭টি উপজেলা</h1>
        <p className="mt-4 max-w-2xl leading-8 text-slate-600">
          গাইবান্ধা জেলার প্রতিটি উপজেলার ইউনিয়ন ও স্থানীয় প্রশাসনিক তথ্য জানতে আপনার উপজেলা নির্বাচন করুন।
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upazilas.map((upazila) => (
            <Link key={upazila.id} href={`/upazila/${upazila.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
              <h2 className="text-xl font-bold text-slate-900">{upazila.name_bn}</h2>
              <p className="mt-2 text-sm text-slate-500">{upazila.description ?? "উপজেলার বিস্তারিত তথ্য দেখুন"}</p>
              <span className="mt-5 inline-flex text-sm font-bold text-emerald-700">ইউনিয়ন ও বিস্তারিত দেখুন →</span>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-xs leading-6 text-slate-500">
          প্রশাসনিক নাম ও জিও-কোডের উৎস: বাংলাদেশ পরিসংখ্যান ব্যুরো, জনশুমারি ও গৃহগণনা ২০২২, কমিউনিটি রিপোর্ট: গাইবান্ধা।
        </p>
      </section>
    <SiteFooter />
      </main>
  );
}
