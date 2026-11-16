import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, getMunicipalityBySlug, getUpazilaById, getWardsByMunicipality } from "@/lib/directory";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const municipality = await getMunicipalityBySlug(slug);
  if (!municipality) return { title: "পৌরসভা পাওয়া যায়নি" };
  return { title: `${municipality.name_bn} পৌরসভা — গাইবান্ধা`, description: `${municipality.name_bn} পৌরসভার ওয়ার্ড ও প্রশাসনিক তথ্য দেখুন।`, alternates: { canonical: `/municipality/${slug}` } };
}

export default async function MunicipalityPage({ params }: Props) {
  const { slug } = await params;
  const municipality = await getMunicipalityBySlug(slug);
  if (!municipality) notFound();
  const [wards, localEntries, upazila] = await Promise.all([getWardsByMunicipality(municipality.id), getDirectoryEntries({ municipalityId: municipality.id }), getUpazilaById(municipality.upazila_id)]);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      <article className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / <Link href="/district" className="mx-2 hover:text-emerald-700">জেলা</Link> / <Link href="/municipality" className="mx-2 hover:text-emerald-700">পৌরসভা</Link> / {municipality.name_bn}</nav>
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলার স্থানীয় প্রশাসন</p>
        <h1 className="mt-2 text-3xl font-extrabold">{municipality.name_bn} পৌরসভা</h1>
        <p className="mt-3 max-w-2xl leading-8 text-slate-600">{upazila?.name_bn} উপজেলার অন্তর্গত {municipality.name_bn} পৌরসভার প্রকাশিত ও যাচাইকৃত ওয়ার্ড, জনশুমারি ২০২২-এর পরিসংখ্যান এবং স্থানীয় প্রতিষ্ঠান ও সেবার তথ্য।</p>
        <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">ওয়ার্ড</dt><dd className="mt-1 text-2xl font-extrabold text-emerald-800">{wards.length.toLocaleString("bn-BD")}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">জনসংখ্যা · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.population_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">খানা · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.households_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">পুরুষ · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.population_male_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">নারী · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.population_female_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div>
        <div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">হিজড়া · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.population_hijra_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div>
        <div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">লিঙ্গ অনুপাত · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.sex_ratio_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div></dl>
        <section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">এই পৌরসভার প্রতিষ্ঠান ও সেবা</h2><p className="mt-1 text-sm text-slate-500">প্রকাশিত ও যাচাইকৃত {localEntries.length.toLocaleString("bn-BD")}টি তথ্য</p></div><Link href="/directory" className="text-sm font-semibold text-emerald-700">তথ্যভান্ডার →</Link></div>
          {localEntries.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{localEntries.map((entry) => <Link key={entry.id} href={`/directory/${entry.category}/${entry.slug}`} className="rounded-xl border bg-white p-4 hover:border-emerald-300"><span className="text-xs font-semibold text-emerald-700">{DIRECTORY_CATEGORIES.find((item) => item.slug === entry.category)?.label}</span><strong className="mt-1 block">{entry.name_bn}</strong>{entry.address && <span className="mt-1 block text-sm text-slate-500">{entry.address}</span>}</Link>)}</div> : <p className="mt-3 rounded-xl border border-dashed bg-white p-5 text-sm text-slate-600">এই পৌরসভার জন্য এখনো কোনো প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠান বা সেবার তথ্য নেই।</p>}
        </section>
        <h2 className="mt-10 text-2xl font-bold">ওয়ার্ডসমূহ</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">{wards.map((ward) => <Link key={ward.id} href={`/municipality/${municipality.slug}/ward/${ward.ward_number}`} className="rounded-xl border bg-white p-4 text-center hover:border-emerald-300"><span className="block text-xs text-slate-500">ওয়ার্ড</span><strong className="mt-1 block text-xl text-emerald-800">{ward.ward_number.toLocaleString("bn-BD")}</strong></Link>)}</div>
        {wards.length === 0 && <p className="mt-4 rounded-xl border border-dashed bg-white p-5 text-sm text-slate-600">এখনো কোনো প্রকাশিত ও যাচাইকৃত ওয়ার্ডের তথ্য নেই।</p>}
        {municipality.census_source_url && <p className="mt-6 text-xs text-slate-500">তথ্যসূত্র: <a href={municipality.census_source_url} target="_blank" rel="noreferrer" className="text-emerald-700 underline">জনশুমারি ২০২২</a></p>}
      </article>
    
</main>
  );
}
