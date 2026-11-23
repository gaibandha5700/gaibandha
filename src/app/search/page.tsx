import type { Metadata } from "next";
import Link from "next/link";
import { DIRECTORY_CATEGORIES, getAllDirectoryEntries, getAllPublicMunicipalities, getAllPublicUnions, getAllPublicWards, getUpazilas } from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "তথ্য খুঁজুন",
  description: "গাইবান্ধা জেলার উপজেলা, ইউনিয়ন, পৌরসভা, ওয়ার্ড, প্রতিষ্ঠান ও স্থানীয় সেবা খুঁজুন।",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

const bnDigits = "০১২৩৪৫৬৭৮৯";
const normalizeSearchText = (value: string | null | undefined) => (value ?? "").trim().toLocaleLowerCase("bn-BD").replace(/[০-৯]/g, (digit) => String(bnDigits.indexOf(digit)));
const containsSearch = (value: string | null | undefined, query: string) => normalizeSearchText(value).includes(query);

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = normalizeSearchText(q);
  let entries: Awaited<ReturnType<typeof getAllDirectoryEntries>> = [];
  let upazilas: Awaited<ReturnType<typeof getUpazilas>> = [];
  let wardRows: Awaited<ReturnType<typeof getAllPublicWards>> = [];
  let unionRows: Awaited<ReturnType<typeof getAllPublicUnions>> = [];
  let municipalityRows: Awaited<ReturnType<typeof getAllPublicMunicipalities>> = [];

  if (query) {
    [entries, upazilas, wardRows, unionRows, municipalityRows] = await Promise.all([
      getAllDirectoryEntries(),
      getUpazilas(),
      getAllPublicWards(),
      getAllPublicUnions(),
      getAllPublicMunicipalities(),
    ]);
  }
  const upazilaById = new Map(upazilas.map((item) => [item.id, item] as const));
  const upazilaOrder = new Map<string, number>(upazilas.map((item, index) => [item.id, index] as const));
  const compareByUpazila = (a: { upazila_id: string; name_bn: string }, b: { upazila_id: string; name_bn: string }) =>
    (upazilaOrder.get(a.upazila_id) ?? 0) - (upazilaOrder.get(b.upazila_id) ?? 0) || a.name_bn.localeCompare(b.name_bn, "bn-BD");
  const unions = unionRows.map((union) => ({
    ...union,
    upazilaName: upazilaById.get(union.upazila_id)?.name_bn ?? "",
    upazilaSlug: upazilaById.get(union.upazila_id)?.slug ?? "",
  })).sort(compareByUpazila);
  const municipalities = municipalityRows.map((municipality) => ({
    ...municipality,
    upazilaName: upazilaById.get(municipality.upazila_id)?.name_bn ?? "",
  })).sort(compareByUpazila);
  const matchingMunicipalities = query ? municipalities.filter((item) => [item.name_bn, item.name_en, item.slug].some((value) => containsSearch(value, query))) : [];
  const matches = query ? entries.filter((entry) =>
    [entry.name_bn, entry.name_en, entry.summary, entry.description, entry.address, entry.slug]
      .some((value) => containsSearch(value, query))
  ) : [];
  const matchingUpazilas = query ? upazilas.filter((item) => [item.name_bn, item.name_en, item.slug].some((value) => containsSearch(value, query))) : [];
  const matchingUnions = query ? unions.filter((item) => [item.name_bn, item.name_en, item.slug].some((value) => containsSearch(value, query))) : [];
  const matchingDistrict = query && ["গাইবান্ধা", "gaibandha", "gaibandha district", "জেলা"].some((name) => containsSearch(name, query) || query.includes(normalizeSearchText(name)));
  const numericQuery = query && /^[0-9]+$/.test(query) ? Number(query) : null;
  const matchingWards = query ? wardRows.filter((ward) => numericQuery !== null
    ? ward.ward_number === numericQuery
    : [ward.name_bn, ward.name_en, `ওয়ার্ড ${ward.ward_number.toLocaleString("bn-BD")}`, `ward ${ward.ward_number}`, String(ward.ward_number)].some((value) => containsSearch(value, query))
  ) : [];
  const unionWardMatches = matchingWards.flatMap((ward) => {
    if (!ward.union_id) return [];
    const parent = unions.find((item) => item.id === ward.union_id);
    return parent ? [{ ward, parent }] : [];
  });
  const municipalityWardMatches = matchingWards.flatMap((ward) => {
    if (!ward.municipality_id) return [];
    const parent = municipalities.find((item) => item.id === ward.municipality_id);
    return parent ? [{ ward, parent }] : [];
  });
  const resultCount = matches.length + matchingUpazilas.length + matchingUnions.length + matchingMunicipalities.length + unionWardMatches.length + municipalityWardMatches.length + (matchingDistrict ? 1 : 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Breadcrumbs items={[{ href: "/search", label: "তথ্য খুঁজুন" }]} />
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলার তথ্যভান্ডার</p><h1 className="mt-2 text-3xl font-extrabold">তথ্য খুঁজুন</h1>
        <form action="/search" className="mt-6 flex gap-2"><input name="q" type="search" defaultValue={q} placeholder="উপজেলা, ইউনিয়ন, ওয়ার্ড বা প্রতিষ্ঠানের নাম" aria-label="তথ্য খুঁজুন" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600" /><button className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">খুঁজুন</button></form>
        {!query ? <p className="mt-8 text-slate-600">খোঁজার জন্য কোনো এলাকা, ওয়ার্ড, প্রতিষ্ঠান বা সেবার নাম লিখুন।</p> : <p className="mt-7 text-sm text-slate-600">“{q}” অনুসন্ধানে {resultCount.toLocaleString("bn-BD")}টি ফলাফল পাওয়া গেছে।</p>}
        {matchingDistrict && <section className="mt-8"><h2 className="text-xl font-bold">জেলা</h2><Link href="/district" className="mt-3 block rounded-xl border bg-white p-4 font-semibold">গাইবান্ধা জেলা · জেলা পরিচিতি</Link></section>}
        {matchingUpazilas.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">উপজেলা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingUpazilas.map((item) => <Link key={item.id} href={`/upazila/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} উপজেলা</Link>)}</div></section>}
        {matchingMunicipalities.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">পৌরসভা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingMunicipalities.map((item) => <Link key={item.id} href={`/municipality/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} <span className="block text-xs font-normal text-slate-500">{item.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {matchingUnions.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">ইউনিয়ন</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matchingUnions.map((item) => <Link key={item.id} href={`/upazila/${item.upazilaSlug}/${item.slug}`} className="rounded-xl border bg-white p-4 font-semibold">{item.name_bn} ইউনিয়ন <span className="block text-xs font-normal text-slate-500">{item.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {unionWardMatches.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">ইউনিয়ন ওয়ার্ড</h2><div className="mt-3 divide-y border-y">{unionWardMatches.map(({ward,parent}) => <Link key={ward.id} href={`/upazila/${parent.upazilaSlug}/${parent.slug}/ward/${ward.ward_number}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><strong>{ward.name_bn || `${ward.ward_number.toLocaleString("bn-BD")} নম্বর ওয়ার্ড`}</strong><span className="text-sm text-slate-500">{parent.name_bn} ইউনিয়ন · {parent.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {municipalityWardMatches.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">পৌর ওয়ার্ড</h2><div className="mt-3 divide-y border-y">{municipalityWardMatches.map(({ward,parent}) => <Link key={ward.id} href={`/municipality/${parent.slug}/ward/${ward.ward_number}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><strong>{ward.name_bn || `${ward.ward_number.toLocaleString("bn-BD")} নম্বর ওয়ার্ড`}</strong><span className="text-sm text-slate-500">{parent.name_bn} পৌরসভা · {parent.upazilaName} উপজেলা</span></Link>)}</div></section>}
        {matches.length > 0 && <section className="mt-8"><h2 className="text-xl font-bold">প্রতিষ্ঠান ও সেবা</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{matches.map((item) => <Link key={item.id} href={`/directory/${item.category}/${item.slug}`} className="rounded-xl border bg-white p-4"><span className="text-xs font-semibold text-emerald-700">{DIRECTORY_CATEGORIES.find((c) => c.slug === item.category)?.label}</span><strong className="mt-1 block">{item.name_bn}</strong>{item.address && <span className="mt-1 block text-sm text-slate-500">{item.address}</span>}</Link>)}</div></section>}
        {query && resultCount === 0 && (
          <section aria-labelledby="search-empty-title" className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8">
            <h2 id="search-empty-title" className="text-xl font-bold">কোনো ফলাফল পাওয়া যায়নি</h2>
            <p className="mt-3 leading-7 text-slate-600">
              “{q}” নামে কোনো প্রকাশিত ও যাচাইকৃত তথ্য পাওয়া যায়নি। বানান, সংক্ষিপ্ত নাম অথবা বাংলা ও ইংরেজি নাম দিয়ে আবার চেষ্টা করুন।
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>নামটি ছোট করে বা অন্য বানানে লিখুন।</li>
              <li>এলাকা, প্রতিষ্ঠান বা সেবার ধরন আলাদা করে খুঁজুন।</li>
              <li>ওয়ার্ড নম্বর খুঁজলে শুধু নম্বরটি লিখে চেষ্টা করুন।</li>
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link href="/upazila" className="rounded-xl border border-slate-200 p-4 font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50">উপজেলা দেখুন</Link>
              <Link href="/municipality" className="rounded-xl border border-slate-200 p-4 font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50">পৌরসভা দেখুন</Link>
              <Link href="/directory" className="rounded-xl border border-slate-200 p-4 font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50">প্রতিষ্ঠান ও সেবা দেখুন</Link>
            </div>
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm leading-6 text-emerald-900">তথ্যটি তালিকায় না থাকলে নতুন তথ্য জমা দিতে পারেন। প্রকাশের আগে তথ্য যাচাই করা হবে।</p>
              <Link href="/submit" className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 sm:mt-0">নতুন তথ্য জমা দিন</Link>
            </div>
          </section>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
