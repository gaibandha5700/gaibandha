import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDirectoryEntries, getMunicipalityBySlug, getWardsByMunicipality } from "@/lib/directory";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string; wardNumber: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, wardNumber } = await params;
  const municipality = await getMunicipalityBySlug(slug);
  return { title: municipality ? `${municipality.name_bn} পৌরসভার ${wardNumber} নম্বর ওয়ার্ড` : "ওয়ার্ড পাওয়া যায়নি", robots: { index: false, follow: true }, alternates: { canonical: `/municipality/${slug}/ward/${wardNumber}` } };
}
export default async function MunicipalityWardPage({ params }: Props) {
  const { slug, wardNumber } = await params;
  const municipality = await getMunicipalityBySlug(slug);
  if (!municipality) notFound();
  const wards = await getWardsByMunicipality(municipality.id);
  const ward = wards.find((item) => item.ward_number === Number(wardNumber));
  const localEntries = ward ? await getDirectoryEntries({ wardId: ward.id }) : [];
  if (!ward) notFound();
  return <main className="min-h-screen bg-slate-50 text-slate-900"><article className="mx-auto max-w-4xl px-4 py-12"><p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলা · {municipality.name_bn} পৌরসভা</p><h1 className="mt-2 text-3xl font-extrabold">{ward.ward_number.toLocaleString("bn-BD")} নম্বর ওয়ার্ড</h1><p className="mt-4 leading-8 text-slate-600">{ward.name_bn}। এই ওয়ার্ডের প্রকাশিত প্রশাসনিক পরিচিতি ও উপলভ্য পরিসংখ্যান নিচে দেওয়া হলো।</p><dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">জনসংখ্যা · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.population_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">খানা · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.households_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">পুরুষ · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.population_male_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">নারী · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.population_female_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">হিজড়া · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.population_hijra_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">লিঙ্গ অনুপাত · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.sex_ratio_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div></dl>{localEntries.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">এই ওয়ার্ডের প্রতিষ্ঠান ও সেবা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{localEntries.map((entry) => <Link key={entry.id} href={`/directory/${entry.category}/${entry.slug}`} className="rounded-xl border bg-white p-4"><strong>{entry.name_bn}</strong>{entry.address && <span className="mt-1 block text-sm text-slate-500">{entry.address}</span>}</Link>)}</div></section>}{ward.source_note && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">{ward.source_note}</p>}<Link href={`/municipality/${slug}`} className="mt-8 inline-flex font-bold text-emerald-700">← {municipality.name_bn} পৌরসভার সব ওয়ার্ড</Link></article>
</main>;
}
