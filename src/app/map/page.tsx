import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import AdministrativeMap from "@/components/administrative-map";
import { getPublicBoundaryGeoJSON } from "@/lib/map-data";

export const revalidate = 3600;
export const metadata = {
  title: "প্রশাসনিক মানচিত্র",
  description: "গাইবান্ধা জেলার প্রকাশিত ও যাচাইকৃত প্রশাসনিক সীমানা মানচিত্রে দেখুন।",
};

export default async function MapPage() {
  const data = await getPublicBoundaryGeoJSON();
  return <main className="min-h-screen bg-[#fbfaf6] text-[#19372a]"><SiteHeader/>
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <nav className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / মানচিত্র</nav>
      <p className="font-semibold text-[#287154]">GIS · প্রশাসনিক সীমানা</p>
      <h1 className="mt-2 font-bold text-3xl md:text-5xl">গাইবান্ধার মানচিত্র</h1>
      <p className="mt-4 max-w-3xl leading-8 text-slate-600">প্রকাশিত সীমানা থেকে জেলা, উপজেলা, ইউনিয়ন, পৌরসভা ও পৌর ওয়ার্ডের মানচিত্র দেখুন। নির্বাচন করে সংশ্লিষ্ট তথ্যপৃষ্ঠায় যেতে পারবেন।</p>
      <div className="mt-8">
        {data ? <AdministrativeMap data={data}/> : <div className="border border-amber-200 bg-amber-50 p-6 leading-7 text-slate-700"><strong>মানচিত্রের তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না।</strong><p className="mt-2">GeoJSON feed চালু বা সংযোগ যাচাই করা হয়নি। পরবর্তী আপডেটে এই অবস্থার সমাধান হবে; এ সময়ে এলাকার তথ্য পৃষ্ঠাগুলো ব্যবহার করুন।</p><Link href="/upazila" className="mt-4 inline-block font-semibold text-[#287154] underline">উপজেলা তালিকা দেখুন</Link></div>}
      </div>
      <div className="mt-8 border-l-2 border-[#b68a48] pl-4 text-sm leading-7 text-slate-600">
        <p>সীমানা উৎস: ArcGIS Bangladesh CRIIPS, BBS 2022 attribution.</p>
        <p>৪টি পৌরসভার সীমানা বিদ্যমান পৌর ওয়ার্ড polygons একত্র করে তৈরি; সেগুলো স্বাধীনভাবে অফিসিয়াল সীমানা যাচাই করা হয়নি। ইউনিয়ন ওয়ার্ডের polygon coverage নেই।</p>
        <Link href="/sources" className="font-semibold text-[#287154] underline">সীমানার উৎস ও সীমাবদ্ধতা</Link>
      </div>
    </section><SiteFooter/></main>;
}
