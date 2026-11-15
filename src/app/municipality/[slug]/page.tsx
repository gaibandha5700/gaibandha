import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMunicipalityBySlug, getUpazilaBySlug, getWardsByMunicipality } from "@/lib/directory";

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
  const [wards, upazilas] = await Promise.all([getWardsByMunicipality(municipality.id), Promise.resolve(null)]);
  const upazila = await getUpazilaBySlug((await import("@/lib/directory")).getUpazilas ? "" : "");
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5"><Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link><Link href="/upazila" className="text-sm font-semibold text-emerald-800">উপজেলা</Link></div></header>
      <article className="mx-auto max-w-5xl px-4 py-12">
        <nav className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / পৌরসভা</nav>
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলার স্থানীয় প্রশাসন</p>
        <h1 className="mt-2 text-3xl font-extrabold">{municipality.name_bn} পৌরসভা</h1>
        <p className="mt-3 max-w-2xl leading-8 text-slate-600">এই পাতায় পৌরসভার প্রকাশিত ও যাচাইকৃত ওয়ার্ড এবং জনশুমারি ২০২২-এর উপলভ্য তথ্য দেখানো হয়েছে।</p>
        <dl className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">ওয়ার্ড</dt><dd className="mt-1 text-2xl font-extrabold text-emerald-800">{wards.length.toLocaleString("bn-BD")}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">জনসংখ্যা · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.population_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">খানা · ২০২২</dt><dd className="mt-1 text-2xl font-extrabold">{municipality.households_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div></dl>
        <h2 className="mt-10 text-2xl font-bold">ওয়ার্ডসমূহ</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">{wards.map((ward) => <Link key={ward.id} href={`/municipality/${municipality.slug}/ward/${ward.ward_number}`} className="rounded-xl border bg-white p-4 text-center hover:border-emerald-300"><span className="block text-xs text-slate-500">ওয়ার্ড</span><strong className="mt-1 block text-xl text-emerald-800">{ward.ward_number.toLocaleString("bn-BD")}</strong></Link>)}</div>
        {wards.length === 0 && <p className="mt-4 rounded-xl border border-dashed bg-white p-5 text-sm text-slate-600">এখনো কোনো প্রকাশিত ও যাচাইকৃত ওয়ার্ডের তথ্য নেই।</p>}
        {municipality.census_source_url && <p className="mt-6 text-xs text-slate-500">তথ্যসূত্র: <a href={municipality.census_source_url} target="_blank" rel="noreferrer" className="text-emerald-700 underline">জনশুমারি ২০২২</a></p>}
      </article>
    </main>
  );
}
