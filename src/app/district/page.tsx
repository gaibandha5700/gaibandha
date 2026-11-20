import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getUpazilas, getUnionsByUpazila, getMunicipalitiesByUpazila } from "@/lib/directory";

export const revalidate = 3600;
export const metadata = { title: "জেলা পরিচিতি", description: "গাইবান্ধা জেলার প্রশাসনিক পরিচিতি ও জনশুমারি ২০২২-এর প্রকাশিত তথ্য।" };
const fmt = (value: number | string | null | undefined) => value == null ? "তথ্য পাওয়া যায়নি" : Number(value).toLocaleString("bn-BD");

async function getDistrictSnapshot() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const districtResponse = await fetch(`${url}/rest/v1/districts?select=id,name_bn,name_en,district_code,population_total_2022,population_male_2022,population_female_2022,population_hijra_2022,households_total_2022,households_general_2022,households_institutional_2022,households_other_2022,census_source_name,census_source_url,census_checked_at&is_published=eq.true&is_verified=eq.true&limit=1`, { headers, next: { revalidate: 3600 } });
  if (!districtResponse.ok) return null;
  const districts = await districtResponse.json() as Array<{id:string;name_bn:string;name_en:string;district_code:string;population_total_2022:number|null;population_male_2022:number|null;population_female_2022:number|null;population_hijra_2022:number|null;households_total_2022:number|null;households_general_2022:number|null;households_institutional_2022:number|null;households_other_2022:number|null;census_source_name:string|null;census_source_url:string|null;census_checked_at:string|null}>;
  const district = districts[0];
  if (!district) return null;
  const census = await fetch(`${url}/rest/v1/census_statistics?select=census_year,area_sq_km,population_density_per_sq_km,source_name,source_url,source_page,methodology_note,source_checked_at&district_id=eq.${encodeURIComponent(district.id)}&is_published=eq.true&is_verified=eq.true&limit=1`, { headers, next: { revalidate: 3600 } });
  const censusRows = census.ok ? await census.json() as Array<{census_year:number;area_sq_km:number|null;population_density_per_sq_km:number|null;source_name:string|null;source_url:string|null;source_page:string|null;methodology_note:string|null;source_checked_at:string|null}> : [];
  return { district, census: censusRows[0] ?? null };
}

export default async function DistrictPage() {
  const [snapshot, upazilas] = await Promise.all([getDistrictSnapshot(), getUpazilas()]);
  const groups = await Promise.all(upazilas.map(u => Promise.all([getUnionsByUpazila(u.id),getMunicipalitiesByUpazila(u.id)])));
  const unionCount = groups.reduce((sum,g) => sum + g[0].length,0), municipalityCount = groups.reduce((sum,g) => sum + g[1].length,0);
  const d = snapshot?.district, c = snapshot?.census;
  const facts = [
    ["জনসংখ্যা", d?.population_total_2022], ["পুরুষ", d?.population_male_2022], ["নারী", d?.population_female_2022],
    ["খানা", d?.households_total_2022], ["আয়তন (বর্গ কিমি)", c?.area_sq_km], ["জনঘনত্ব (প্রতি বর্গ কিমি)", c?.population_density_per_sq_km],
  ];
  return <main className="min-h-screen bg-[#fbfaf6] text-[#19372a]"><SiteHeader/><section className="mx-auto max-w-5xl px-5 py-12">
    <nav className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / জেলা পরিচিতি</nav><p className="font-semibold text-[#287154]">রংপুর বিভাগ · বাংলাদেশ</p><h1 className="mt-2 text-3xl font-bold md:text-5xl">গাইবান্ধা জেলা</h1>
    <p className="mt-4 max-w-3xl leading-8 text-slate-600">প্রশাসনিক কাঠামো, জনশুমারি ২০২২-এর প্রকাশিত তথ্য ও এলাকার পরিচিতি। তথ্যের উৎস ও সীমাবদ্ধতা প্রতিটি অংশে উল্লেখ করা হয়েছে।</p>
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">{[["উপজেলা",upazilas.length],["ইউনিয়ন",unionCount],["পৌরসভা",municipalityCount]].map(([label,value])=><div key={label} className="border-y border-[#d6dfd4] py-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{Number(value).toLocaleString("bn-BD")}</p></div>)}</div>
    <h2 className="mt-12 text-2xl font-bold">জনশুমারি ও গৃহগণনা ২০২২</h2>{d&&c?<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{facts.map(([label,value])=><div key={label} className="border bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold">{fmt(value as number|string|null)}</p></div>)}</div>:<p className="mt-4 text-slate-600">প্রকাশিত ও যাচাইকৃত জেলা-স্তরের Census তথ্য পাওয়া যায়নি।</p>}
    {d&&c&&<div className="mt-6 border-l-2 border-[#b68a48] pl-4 text-sm leading-7 text-slate-600"><p>তথ্যসূত্র: {c.source_name??d.census_source_name??"তথ্যসূত্র পাওয়া যায়নি"}{c.source_page? ` · ${c.source_page}`:""}</p>{c.methodology_note&&<p>{c.methodology_note}</p>}<p>যাচাই/হালনাগাদ: {c.source_checked_at?new Date(c.source_checked_at).toLocaleDateString("bn-BD"):"তথ্য পাওয়া যায়নি"}</p>{(c.source_url||d.census_source_url)&&<a className="text-[#287154] underline" href={c.source_url??d.census_source_url??undefined} target="_blank" rel="noreferrer">মূল উৎস দেখুন</a>}</div>}
    <h2 className="mt-12 text-2xl font-bold">প্রশাসনিক এলাকা</h2><div className="mt-4 divide-y border-y border-[#d6dfd4]">{upazilas.map(u=><Link key={u.id} href={`/upazila/${u.slug}`} className="flex items-center justify-between gap-4 py-4 hover:text-[#287154]"><span className="font-semibold">{u.name_bn}</span><span className="text-sm text-slate-500">উপজেলার তথ্য ↗</span></Link>)}</div>
    <div className="mt-8 flex flex-wrap gap-4"><Link href="/map" className="font-semibold text-[#287154] underline">মানচিত্রে দেখুন</Link><Link href="/statistics" className="font-semibold text-[#287154] underline">পরিসংখ্যান</Link><Link href="/sources" className="font-semibold text-[#287154] underline">তথ্যসূত্র</Link></div>
  </section><SiteFooter/></main>;
}
