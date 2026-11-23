import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DIRECTORY_CATEGORIES, getAllPublicCensusSourceRecords, getAllPublicDirectorySourceRecords } from "@/lib/directory";
import { summarizePublicSourceCoverage } from "@/lib/source-coverage.mjs";

export const revalidate = 3600;
export const metadata = { title: "তথ্যসূত্র ও যাচাই-পদ্ধতি", description: "আমাদের গাইবান্ধায় প্রকাশিত তথ্য, উৎস, যাচাই, সীমানা ও coverage সীমাবদ্ধতা।", alternates: { canonical: "/sources" } };

const formatNumber = (value: number) => value.toLocaleString("bn-BD");
const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka" }) : "যাচাইয়ের তারিখ পাওয়া যায়নি";

type Metrics = { total: number; sourceUrlCount: number; checkedCount: number; latestCheckedAt: string | null };

function CoverageCard({ title, metrics, available, children }: { title: string; metrics: Metrics; available: boolean; children: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
    <h3 className="text-xl font-bold">{title}</h3>
    {available ? <>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div><dt className="text-sm text-slate-500">রেকর্ড</dt><dd className="mt-1 text-xl font-bold">{formatNumber(metrics.total)}</dd></div>
        <div><dt className="text-sm text-slate-500">উৎস লিংক</dt><dd className="mt-1 font-semibold">{formatNumber(metrics.sourceUrlCount)} / {formatNumber(metrics.total)}</dd></div>
        <div><dt className="text-sm text-slate-500">যাচাইয়ের তারিখ</dt><dd className="mt-1 font-semibold">{formatNumber(metrics.checkedCount)} / {formatNumber(metrics.total)}</dd></div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-slate-600">সর্বশেষ উৎস যাচাই: <strong className="text-[#19372a]">{formatDate(metrics.latestCheckedAt)}</strong></p>
      {children}
    </> : <p className="mt-3 leading-7 text-slate-600">বর্তমান coverage তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না। নিচের প্রকাশনা ও যাচাই নীতিগুলো প্রযোজ্য থাকবে।</p>}
  </section>;
}

export default async function SourcesPage() {
  const [censusResult, directoryResult] = await Promise.allSettled([
    getAllPublicCensusSourceRecords(),
    getAllPublicDirectorySourceRecords(),
  ]);
  const censusRecords = censusResult.status === "fulfilled" ? censusResult.value : [];
  const directoryRecords = directoryResult.status === "fulfilled" ? directoryResult.value : [];
  const coverage = summarizePublicSourceCoverage(censusRecords, directoryRecords);
  const censusAvailable = censusResult.status === "fulfilled";
  const directoryAvailable = directoryResult.status === "fulfilled";
  const levelLabels: Array<[keyof typeof coverage.census.levels, string]> = [
    ["district", "জেলা"], ["upazila", "উপজেলা"], ["union", "ইউনিয়ন"], ["municipality", "পৌরসভা"], ["municipal_ward", "পৌর ওয়ার্ড"], ["union_ward", "ইউনিয়ন ওয়ার্ড"], ["other", "অন্যান্য"],
  ];

  return <main className="min-h-screen bg-[#fbfaf6] text-[#19372a]"><SiteHeader/><article className="mx-auto max-w-4xl px-5 py-12">
    <Breadcrumbs items={[{ href: "/sources", label: "তথ্যসূত্র" }]} />
    <p className="font-semibold text-[#287154]">স্বচ্ছতা ও তথ্যের উৎস</p>
    <h1 className="mt-2 text-3xl font-bold md:text-5xl">তথ্য কোথা থেকে আসে</h1>
    <p className="mt-5 max-w-3xl leading-8 text-slate-600">তথ্যের উৎস, সময়কাল, যাচাইয়ের অবস্থা ও coverage সীমাবদ্ধতা আলাদা করে জানানো আমাদের প্রকাশনা নীতির অংশ।</p>

    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-2xl font-bold">বর্তমান উৎস-coverage</h2>
      <p className="mt-2 leading-7 text-slate-600">এই হিসাব শুধু প্রকাশিত ও যাচাইকৃত রেকর্ডের উৎস-সংক্রান্ত metadata থেকে তৈরি। রেকর্ড হালনাগাদের সময় ও উৎস যাচাইয়ের সময় আলাদা; এখানে সর্বশেষ উৎস যাচাইয়ের তারিখ দেখানো হয়।</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <CoverageCard title="জনশুমারি ২০২২" metrics={coverage.census} available={censusAvailable}>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            {levelLabels.filter(([key]) => coverage.census.levels[key] > 0 || key === "union_ward").map(([key, label]) => <li key={key}>{label}: <strong className="text-[#19372a]">{coverage.census.levels[key] > 0 ? formatNumber(coverage.census.levels[key]) : "রেকর্ড নেই"}</strong></li>)}
          </ul>
        </CoverageCard>
        <CoverageCard title="প্রতিষ্ঠান ও সেবা Directory" metrics={coverage.directory} available={directoryAvailable}>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            {DIRECTORY_CATEGORIES.filter(category => (coverage.directory.categories[category.slug] ?? 0) > 0).map(category => <li key={category.slug}>{category.label}: <strong className="text-[#19372a]">{formatNumber(coverage.directory.categories[category.slug])}</strong></li>)}
          </ul>
        </CoverageCard>
      </div>
    </section>

    <h2 className="mt-10 text-2xl font-bold">জনশুমারি ও প্রশাসনিক পরিসংখ্যান</h2>
    <p className="mt-3 leading-7 text-slate-600">প্রকাশিত Census তথ্যের উৎস হিসেবে বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS), Population and Housing Census 2022, Community Report: Gaibandha ব্যবহার করা হয়। প্রতিটি তথ্যের পাশে উৎস, সময়কাল ও পদ্ধতিগত নোট যেখানে উপলভ্য সেখানে দেখানো হবে।</p>
    <a className="mt-3 inline-block break-all text-sm text-[#287154] underline" href="https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/cdf2438f-c019-4c89-b003-40862511176d.pdf" target="_blank" rel="noreferrer">BBS Community Report: Gaibandha (PDF)</a>

    <h2 className="mt-10 text-2xl font-bold">GIS সীমানা</h2>
    <p className="mt-3 leading-7 text-slate-600">প্রকাশিত administrative boundary data ArcGIS Bangladesh CRIIPS, MapServer layers 121, 122 ও 123-এর উৎস ও BBS 2022 attribution অনুসরণ করে। GIS data validation/record matching independent field verification নয়। ৪টি পৌরসভা polygon বিদ্যমান পৌর ওয়ার্ড polygons একত্র করে derived; সেগুলোর স্বাধীন official polygon verification প্রতিষ্ঠিত নয়। ইউনিয়ন ওয়ার্ড polygons বর্তমানে coverage-এ নেই।</p>
    <a className="mt-3 inline-block break-all text-sm text-[#287154] underline" href="https://www.arcgisbd.com/server/rest/services/ADB005/CRIIPS/MapServer" target="_blank" rel="noreferrer">ArcGIS Bangladesh CRIIPS boundary service</a>

    <h2 className="mt-10 text-2xl font-bold">Directory তথ্য ও যাচাই</h2>
    <p className="mt-3 leading-7 text-slate-600">Directory entry-র source_name, source_url, source_checked_at এবং source_note রেকর্ডে থাকলে প্রদর্শন করা হয়। শুধু verified এবং published তথ্য public view-তে আসে। কোনো প্রতিষ্ঠানের location coordinate যাচাই না হলে map-এ সেটি দেখানো হয় না।</p>

    <h2 className="mt-10 text-2xl font-bold">তথ্যের coverage ও সীমাবদ্ধতা</h2>
    <ul className="mt-3 space-y-3 leading-7 text-slate-600"><li>• Census statistics: জেলা, উপজেলা, ইউনিয়ন ও পৌরসভা/পৌর ওয়ার্ডের প্রকাশিত রেকর্ড coverage অনুযায়ী।</li><li>• Administrative boundaries: জেলা, উপজেলা, ইউনিয়ন এবং পৌরসভা/পৌর ওয়ার্ডের বর্তমান প্রকাশিত coverage; ইউনিয়ন ওয়ার্ড polygon অনুপস্থিত।</li><li>• তথ্যের অনুপস্থিতি মানে শূন্য নয়। সংশ্লিষ্ট উৎসে পাওয়া যায়নি বলে দেখানো হয়।</li><li>• প্রশাসনিক স্তরগুলোর সংখ্যা/জনসংখ্যা যোগ করে overlapping totals তৈরি করা হয় না।</li></ul>

    <h2 className="mt-10 text-2xl font-bold">সংশোধন ও হালনাগাদ</h2>
    <p className="mt-3 leading-7 text-slate-600">তথ্য ভুল বা অসম্পূর্ণ মনে হলে সংশোধনের অনুরোধ জমা দিন। পর্যালোচনা ও যাচাই শেষে তথ্য প্রকাশ/হালনাগাদ করা হবে।</p>
    <Link className="mt-4 inline-block text-[#287154] underline" href="/submit">তথ্য সংশোধন বা নতুন তথ্য জমা দিন</Link>
  </article><SiteFooter/></main>;
}
