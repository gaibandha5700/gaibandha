import type { Metadata } from "next";
import Link from "next/link";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, getMunicipalitiesByUpazila, getUpazilas, getUnionsByUpazila } from "@/lib/directory";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "তথ্য খুঁজুন",
  description: "গাইবান্ধা জেলার উপজেলা, ইউনিয়ন, প্রতিষ্ঠান ও স্থানীয় সেবা খুঁজুন।",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase("bn-BD");
  const [entries, upazilas] = await Promise.all([getDirectoryEntries(), getUpazilas()]);
  const [unionGroups, municipalityGroups] = await Promise.all([\n    Promise.all(upazilas.map((u) => getUnionsByUpazila(u.id))),\n    Promise.all(upazilas.map((u) => getMunicipalitiesByUpazila(u.id))),\n  ]);
  const unions = unionGroups.flat().map((union) => ({
    ...union,
    upazilaName: upazilas.find((u) => u.id === union.upazila_id)?.name_bn ?? "",
    upazilaSlug: upazilas.find((u) => u.id === union.upazila_id)?.slug ?? "",
  }));
  const municipalities = municipalityGroups.flat().map((municipality) => ({ ...municipality, upazilaName: upazilas.find((u) => u.id === municipality.upazila_id)?.name_bn ?? "" }));\n  const matchingMunicipalities = query ? municipalities.filter((item) => item.name_bn.toLocaleLowerCase("bn-BD").includes(query)) : [];\n  const matches = query ? entries.filter((entry) =>
    [entry.name_bn, entry.name_en, entry.summary, entry.description, entry.address]
      .some((value) => value?.toLocaleLowerCase("bn-BD").includes(query))
  ) : [];
  const matchingUpazilas = query ? upazilas.filter((item) => item.name_bn.toLocaleLowerCase("bn-BD").includes(query)) : [];
  const matchingUnions = query ? unions.filter((item) => item.name_bn.toLocaleLowerCase("bn-BD").includes(query)) : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5"><Link href="/" className="text-xl font-extrabold text-emerald-800">গাইবান্ধা</Link><Link href="/directory" className="text-sm font-semibold text-emerald-800">তথ্য ডিরেক্টরি</Link></div></header>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলার তথ্যভান্ডার</p><h1 className="mt-2 text-3xl font-extrabold">তথ্য খুঁজুন</h1>
        <form action="/search" className="mt-6 flex gap-2"><input name="q" defaultValue={q} autoFocus placeholder="উপজেলা, ইউনিয়ন বা প্রতিষ্ঠানের নাম" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600" /><button className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">খুঁজুন</button></form>
        {!query ? <p className="mt-8 text-slate-600">খোঁজার জন্য কোনো উপজেলা, ইউনিয়ন, প্রতিষ্ঠান বা সেবার নাম লিখুন।</p> : <p className="mt-7 text-sm text-slate-600">“{q}” অনুসন্ধানে { (matches.length + matchingUpazilas.length + matchingUnions.length + matchingMunicipalities.length).toLocaleString("bn-BD") }টি ফলাফল পাওয়া গেছে।</p>}
        {matchingUpazilas.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">উপজেলা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingUpazilas.map((item) => <Link key={item.id} href={`/upazila/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} উপজেলা</Link>)}</div></section>}
        {matchingMunicipalities.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">পৌরসভা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingMunicipalities.map((item) => <Link key={item.id} href={`/municipality/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} পৌরসভা <span className="block text-xs font-normal text-slate-500">{item.upazilaName} উপজেলা</span></Link>)}</div></section>}\n        {matchingUnions.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">ইউনিয়ন</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingUnions.map((item) => <Link key={item.id} href={`/upazila/${item.upazilaSlug}/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} ইউনিয়ন <span className="block text-xs font-normal text-slate-500">{item.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {matches.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">প্রতিষ্ঠান ও সেবা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matches.map((item) => <Link key={item.id} href={`/directory/${item.category}/${item.slug}`} className="rounded-xl border bg-white p-4"><span className="text-xs font-semibold text-emerald-700">{DIRECTORY_CATEGORIES.find((c) => c.slug === item.category)?.label}</span><strong className="mt-1 block">{item.name_bn}</strong>{item.address && <span className="mt-1 block text-sm text-slate-500">{item.address}</span>}</Link>)}</div></section>}
        {query && !matches.length && !matchingUpazilas.length && !matchingUnions.length && !matchingMunicipalities.length && <p className="mt-8 rounded-xl border border-dashed bg-white p-6 text-slate-600">এই নামে কোনো প্রকাশিত ও যাচাইকৃত তথ্য পাওয়া যায়নি। বানান পরিবর্তন করে আবার চেষ্টা করুন।</p>}
      </section>
    </main>
  );
}
