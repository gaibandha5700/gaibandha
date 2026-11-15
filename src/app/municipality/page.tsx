import type { Metadata } from "next";
import Link from "next/link";
import { getMunicipalitiesByUpazila, getUpazilas } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "গাইবান্ধার পৌরসভাসমূহ",
  description: "গাইবান্ধা জেলার পৌরসভা, ওয়ার্ড ও স্থানীয় প্রশাসনিক তথ্য দেখুন।",
  alternates: { canonical: "/municipality" },
};

export default async function MunicipalityIndexPage() {
  const upazilas = await getUpazilas();
  const groups = await Promise.all(upazilas.map(async (upazila) => ({
    upazila,
    municipalities: await getMunicipalitiesByUpazila(upazila.id),
  })));
  const municipalities = groups.flatMap((group) => group.municipalities.map((municipality) => ({ ...municipality, upazilaName: group.upazila.name_bn })));
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12"><nav className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / পৌরসভা</nav><p className="text-sm font-bold text-emerald-700">স্থানীয় প্রশাসনিক এলাকা</p><h1 className="mt-2 text-3xl font-extrabold">গাইবান্ধার পৌরসভাসমূহ</h1><p className="mt-3 max-w-2xl leading-8 text-slate-600">পৌরসভা নির্বাচন করে ওয়ার্ড ও জনশুমারি ২০২২-এর উপলভ্য তথ্য দেখুন।</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{municipalities.map((item) => <Link key={item.id} href={`/municipality/${item.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-sm"><h2 className="text-lg font-bold">{item.name_bn} পৌরসভা</h2><p className="mt-2 text-sm text-slate-500">{item.upazilaName} উপজেলা</p><p className="mt-4 text-sm font-semibold text-emerald-700">{item.wards_count?.toLocaleString("bn-BD") ?? "—"}টি ওয়ার্ড · বিস্তারিত দেখুন →</p></Link>)}</div>{municipalities.length === 0 && <p className="mt-8 rounded-xl border border-dashed bg-white p-6 text-slate-600">এখনো কোনো প্রকাশিত ও যাচাইকৃত পৌরসভার তথ্য নেই।</p>}</section>
    <SiteFooter />
      </main>
  );
}
