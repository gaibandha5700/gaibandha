import type { Metadata } from "next";
import Link from "next/link";
import { DIRECTORY_CATEGORIES, getDirectoryEntries, getMunicipalitiesByUpazila, getUpazilas, getUnionsByUpazila, getPublishedWards, getDistrictBySlug } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "তথ্য খুঁজুন",
  description: "গাইবান্ধা জেলার জেলা, উপজেলা, ইউনিয়ন, ওয়ার্ড, প্রতিষ্ঠান ও স্থানীয় সেবা খুঁজুন।",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("bn-BD")
    .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = normalizeSearchText(q.trim());
  const [entries, upazilas, wards, district] = await Promise.all([getDirectoryEntries(), getUpazilas(), getPublishedWards(), getDistrictBySlug("gaibandha")]);
  const wardNumberQuery = query.match(/^(?:ওয়ার্ড\\s*(?:নং|নম্বর)?\\s*)?0*(\\d+)$/)?.[1];
  const [unionGroups, municipalityGroups] = await Promise.all([
    Promise.all(upazilas.map((u) => getUnionsByUpazila(u.id))),
    Promise.all(upazilas.map((u) => getMunicipalitiesByUpazila(u.id))),
  ]);
  const unions = unionGroups.flat().map((union) => ({
    ...union,
    upazilaName: upazilas.find((u) => u.id === union.upazila_id)?.name_bn ?? "",
    upazilaSlug: upazilas.find((u) => u.id === union.upazila_id)?.slug ?? "",
  }));
  const municipalities = municipalityGroups.flat().map((municipality) => ({ ...municipality, upazilaName: upazilas.find((u) => u.id === municipality.upazila_id)?.name_bn ?? "" }));
  const matchingWards = query ? wards.filter((ward) => wardNumberQuery ? ward.ward_number === Number(wardNumberQuery) : normalizeSearchText(ward.name_bn).includes(query)).map((ward) => {
    const union = unions.find((item) => item.id === ward.union_id);
    const municipality = municipalities.find((item) => item.id === ward.municipality_id);
    const upazila = upazilas.find((item) => item.id === (union?.upazila_id ?? municipality?.upazila_id));
    const href = union && upazila ? `/upazila/${upazila.slug}/${union.slug}/ward/${ward.ward_number}` : municipality ? `/municipality/${municipality.slug}/ward/${ward.ward_number}` : "";
    return { ...ward, href, parentName: union?.name_bn ?? municipality?.name_bn ?? "", upazilaName: upazila?.name_bn ?? "" };
  }).filter((ward) => ward.href) : [];
  const matchingDistrict = query && district && [district.name_bn, district.name_en].some((value) => value ? normalizeSearchText(value).includes(query) : false) ? district : null;
  const matchingMunicipalities = query ? municipalities.filter((item) => normalizeSearchText(item.name_bn).includes(query)) : [];
  const matches = query ? entries.filter((entry) =>
    [entry.name_bn, entry.name_en, entry.summary, entry.description, entry.address]
      .some((value) => value?.toLocaleLowerCase("bn-BD").includes(query))
  ) : [];
  const matchingUpazilas = query ? upazilas.filter((item) => item.name_bn.toLocaleLowerCase("bn-BD").includes(query)) : [];
  const matchingUnions = query ? unions.filter((item) => item.name_bn.toLocaleLowerCase("bn-BD").includes(query)) : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলার তথ্যভান্ডার</p><h1 className="mt-2 text-3xl font-extrabold">তথ্য খুঁজুন</h1>
        <form action="/search" className="mt-6 flex gap-2"><input name="q" defaultValue={q} autoFocus placeholder="জেলা, উপজেলা, ইউনিয়ন, ওয়ার্ড বা প্রতিষ্ঠানের নাম" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600" /><button className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">খুঁজুন</button></form>
        {!query ? <p className="mt-8 text-slate-600">খোঁজার জন্য কোনো উপজেলা, ইউনিয়ন, প্রতিষ্ঠান বা সেবার নাম লিখুন।</p> : <p className="mt-7 text-sm text-slate-600">“{q}” অনুসন্ধানে { (matches.length + matchingUpazilas.length + matchingUnions.length + matchingMunicipalities.length + matchingWards.length + (matchingDistrict ? 1 : 0)).toLocaleString("bn-BD") }টি ফলাফল পাওয়া গেছে।</p>}
        {matchingDistrict && <section className="mt-8"><h2 className="text-xl font-bold">জেলা</h2><Link href="/district" className="mt-3 inline-block rounded-xl border bg-white p-4 font-semibold">{matchingDistrict.name_bn} জেলা — পরিচিতি ও পরিসংখ্যান</Link></section>}
        {matchingUpazilas.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">উপজেলা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingUpazilas.map((item) => <Link key={item.id} href={`/upazila/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} উপজেলা</Link>)}</div></section>}
        {matchingMunicipalities.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">পৌরসভা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingMunicipalities.map((item) => <Link key={item.id} href={`/municipality/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} পৌরসভা <span className="block text-xs font-normal text-slate-500">{item.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {matchingUnions.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">ইউনিয়ন</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingUnions.map((item) => <Link key={item.id} href={`/upazila/${item.upazilaSlug}/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} ইউনিয়ন <span className="block text-xs font-normal text-slate-500">{item.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {matchingWards.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">ওয়ার্ড</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingWards.map((item) => <Link key={item.id} href={item.href} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} <span className="text-sm font-normal text-slate-500">({item.ward_number.toLocaleString("bn-BD")} নম্বর ওয়ার্ড)</span><span className="mt-1 block text-xs font-normal text-slate-500">{item.parentName} · {item.upazilaName}</span></Link>)}</div></section>}
        {matches.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">প্রতিষ্ঠান ও সেবা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matches.map((item) => <Link key={item.id} href={`/directory/${item.category}/${item.slug}`} className="rounded-xl border bg-white p-4"><span className="text-xs font-semibold text-emerald-700">{DIRECTORY_CATEGORIES.find((c) => c.slug === item.category)?.label}</span><strong className="mt-1 block">{item.name_bn}</strong>{item.address && <span className="mt-1 block text-sm text-slate-500">{item.address}</span>}</Link>)}</div></section>}
        {query && !matches.length && !matchingUpazilas.length && !matchingUnions.length && !matchingMunicipalities.length && !matchingWards.length && !matchingDistrict && <p className="mt-8 rounded-xl border border-dashed bg-white p-6 text-slate-600">এই নামে কোনো প্রকাশিত ও যাচাইকৃত তথ্য পাওয়া যায়নি। বানান পরিবর্তন করে আবার চেষ্টা করুন।</p>}
      </section>
    <SiteFooter />
      </main>
  );
}
