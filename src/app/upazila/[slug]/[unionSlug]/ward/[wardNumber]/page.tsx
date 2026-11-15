import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUpazilaBySlug, getUnionBySlug, getWardsByUnion } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string; unionSlug: string; wardNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, unionSlug, wardNumber } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) return { title: "ওয়ার্ড পাওয়া যায়নি" };
  const union = await getUnionBySlug(upazila.id, unionSlug);
  return { title: union ? `${union.name_bn} ইউনিয়ন, ${wardNumber} নম্বর ওয়ার্ড — গাইবান্ধা` : "ওয়ার্ড পাওয়া যায়নি", robots: { index: false, follow: true }, alternates: { canonical: `/upazila/${slug}/${unionSlug}/ward/${wardNumber}` } };
}

export default async function UnionWardPage({ params }: Props) {
  const { slug, unionSlug, wardNumber } = await params;
  const upazila = await getUpazilaBySlug(slug);
  if (!upazila) notFound();
  const union = await getUnionBySlug(upazila.id, unionSlug);
  if (!union) notFound();
  const wards = await getWardsByUnion(union.id);
  const ward = wards.find((item) => item.ward_number === Number(wardNumber));
  if (!ward) notFound();
  return <main className="min-h-screen bg-slate-50 text-slate-900"><SiteHeader /><article className="mx-auto max-w-4xl px-4 py-12"><p className="text-sm font-bold text-emerald-700">{upazila.name_bn} উপজেলা · {union.name_bn} ইউনিয়ন</p><h1 className="mt-2 text-3xl font-extrabold">{ward.ward_number.toLocaleString("bn-BD")} নম্বর ওয়ার্ড</h1><p className="mt-4 leading-8 text-slate-600">{ward.name_bn}। এই ওয়ার্ডের প্রকাশিত প্রশাসনিক পরিচিতি ও উপলভ্য পরিসংখ্যান নিচে দেওয়া হলো।</p><dl className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">জনসংখ্যা · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.population_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div><div className="rounded-xl border bg-white p-5"><dt className="text-sm text-slate-500">খানা · ২০২২</dt><dd className="mt-1 text-2xl font-bold">{ward.households_total_2022?.toLocaleString("bn-BD") ?? "তথ্য নেই"}</dd></div></dl>{ward.source_note && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">{ward.source_note}</p>}{ward.census_source_url && <p className="mt-4 text-xs text-slate-500">তথ্যসূত্র: <a href={ward.census_source_url} target="_blank" rel="noreferrer" className="text-emerald-700 underline">জনশুমারি ২০২২</a></p>}<Link href={`/upazila/${slug}/${unionSlug}`} className="mt-8 inline-flex font-bold text-emerald-700">← {union.name_bn} ইউনিয়নের সব ওয়ার্ড</Link></article><SiteFooter />
      </main>;
}
