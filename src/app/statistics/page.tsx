import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getUpazilas, getUnionsByUpazila, getMunicipalitiesByUpazila, getWardsByMunicipality } from "@/lib/directory";

export const revalidate = 3600;
export const metadata = {
  title: "জনসংখ্যা ও পরিসংখ্যান",
  description: "গাইবান্ধা জেলার প্রকাশিত প্রশাসনিক ও জনসংখ্যার পরিসংখ্যান।",
};
const fmt = (n: number | null | undefined) => n == null ? "—" : n.toLocaleString("bn-BD");
const dateFmt = (date: string | null | undefined) => date ? new Date(date).toLocaleDateString("bn-BD") : "তথ্য পাওয়া যায়নি";

export default async function StatisticsPage() {
  const upazilas = await getUpazilas();
  const [unionGroups, municipalityGroups] = await Promise.all([
    Promise.all(upazilas.map(u => getUnionsByUpazila(u.id))),
    Promise.all(upazilas.map(u => getMunicipalitiesByUpazila(u.id))),
  ]);
  const municipalities = municipalityGroups.flat();
  const wardGroups = await Promise.all(municipalities.map(m => getWardsByMunicipality(m.id)));
  const known = upazilas.filter(u => u.population_total_2022 != null);
  const populationSum = known.reduce((sum, u) => sum + (u.population_total_2022 ?? 0), 0);
  const householdSum = upazilas.filter(u => u.households_total_2022 != null).reduce((sum, u) => sum + (u.households_total_2022 ?? 0), 0);
  const municipalWardCount = wardGroups.reduce((sum, group) => sum + group.length, 0);

  return <main className="min-h-screen bg-[#fbfaf6] text-[#19372a]"><SiteHeader/>
    <section className="mx-auto max-w-6xl px-5 py-12">
      <nav className="mb-5 text-sm text-slate-500"><Link href="/">হোম</Link> / পরিসংখ্যান</nav>
      <p className="font-bold text-emerald-700">জনশুমারি ও গৃহগণনা ২০২২</p>
      <h1 className="mt-2 text-3xl font-bold md:text-5xl">গাইবান্ধার পরিসংখ্যান</h1>
      <p className="mt-4 max-w-3xl leading-8 text-slate-600">প্রকাশিত ও যাচাইকৃত প্রশাসনিক স্তরের তথ্য। অনুপস্থিত মানকে শূন্য ধরা হয়নি; টেবিলে “—” মানে তথ্য পাওয়া যায়নি।</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Stat label="উপজেলা" value={fmt(upazilas.length)}/><Stat label="উপজেলা রেকর্ডের জনসংখ্যার যোগফল*" value={fmt(known.length ? populationSum : null)}/><Stat label="উপজেলা রেকর্ডের খানার যোগফল*" value={fmt(householdSum || null)}/></div>

      <h2 className="mt-12 text-2xl font-bold">উপজেলা তুলনা</h2>
      <div className="mt-4 overflow-x-auto border-y border-slate-200"><table className="w-full min-w-[620px] text-sm"><thead className="bg-[#eeefe7]"><tr>{["উপজেলা","জনসংখ্যা","পুরুষ","নারী","খানা"].map(x=><th key={x} className="px-4 py-3 text-left">{x}</th>)}</tr></thead><tbody>{upazilas.map(u=><tr key={u.id} className="border-t"><td className="px-4 py-3"><Link className="font-semibold underline" href={"/upazila/"+u.slug}>{u.name_bn}</Link></td><td className="px-4 py-3">{fmt(u.population_total_2022)}</td><td className="px-4 py-3">{fmt(u.population_male_2022)}</td><td className="px-4 py-3">{fmt(u.population_female_2022)}</td><td className="px-4 py-3">{fmt(u.households_total_2022)}</td></tr>)}</tbody></table></div>

      <h2 className="mt-12 text-2xl font-bold">ইউনিয়ন পরিসংখ্যান</h2>
      <p className="mt-2 text-slate-600">উপজেলা অনুযায়ী ইউনিয়নের উপলভ্য জনসংখ্যা ও খানার তথ্য দেখুন।</p>
      {upazilas.map((upazila, i)=><details key={upazila.id} className="mt-3 border-b"><summary className="cursor-pointer py-4 font-semibold">{upazila.name_bn} ({unionGroups[i].length.toLocaleString("bn-BD")} ইউনিয়ন)</summary><div className="overflow-x-auto pb-4"><table className="w-full min-w-[480px] text-sm"><thead><tr><th className="p-3 text-left">ইউনিয়ন</th><th className="p-3 text-left">জনসংখ্যা</th><th className="p-3 text-left">খানা</th></tr></thead><tbody>{unionGroups[i].map(union=><tr key={union.id} className="border-t"><td className="p-3"><Link className="underline" href={"/upazila/"+upazila.slug+"/"+union.slug}>{union.name_bn}</Link></td><td className="p-3">{fmt(union.population_total_2022)}</td><td className="p-3">{fmt(union.households_total_2022)}</td></tr>)}</tbody></table></div></details>)}

      <h2 className="mt-12 text-2xl font-bold">পৌরসভা</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{municipalities.map(m=><Link key={m.id} href={"/municipality/"+m.slug} className="border p-4 hover:border-emerald-400"><strong>{m.name_bn}</strong><p className="mt-2 text-sm text-slate-600">জনসংখ্যা: {fmt(m.population_total_2022)} · খানা: {fmt(m.households_total_2022)}</p></Link>)}</div>

      <h2 className="mt-12 text-2xl font-bold">পৌর ওয়ার্ডের পরিসংখ্যান</h2>
      <p className="mt-2 leading-7 text-slate-600">পৌরসভার প্রকাশিত ও যাচাইকৃত ওয়ার্ডগুলোর জনশুমারি ২০২২-এর তথ্য। ইউনিয়ন ওয়ার্ডের Census data বর্তমানে পাওয়া যায়নি।</p>
      {municipalities.map((municipality, i)=><details key={municipality.id} className="mt-3 border-b"><summary className="cursor-pointer py-4 font-semibold">{municipality.name_bn} পৌরসভা · {wardGroups[i].length.toLocaleString("bn-BD")}টি ওয়ার্ড <span className="text-sm font-normal text-slate-500">({upazilas.find(u=>u.id===municipality.upazila_id)?.name_bn})</span></summary><div className="overflow-x-auto pb-4"><table className="w-full min-w-[760px] text-sm"><thead className="bg-[#eeefe7]"><tr>{["ওয়ার্ড","জনসংখ্যা","পুরুষ","নারী","খানা","উৎস ও যাচাই"].map(x=><th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>{wardGroups[i].map(ward=><tr key={ward.id} className="border-t"><td className="p-3"><Link className="underline" href={"/municipality/"+municipality.slug+"/ward/"+ward.ward_number}>{ward.ward_number.toLocaleString("bn-BD")}</Link></td><td className="p-3">{fmt(ward.population_total_2022)}</td><td className="p-3">{fmt(ward.population_male_2022)}</td><td className="p-3">{fmt(ward.population_female_2022)}</td><td className="p-3">{fmt(ward.households_total_2022)}</td><td className="p-3">{ward.census_source_url?<a className="text-[#287154] underline" href={ward.census_source_url} target="_blank" rel="noreferrer">{ward.census_source_name??"মূল উৎস"}{ward.census_source_page?" · "+ward.census_source_page:""}</a>:(ward.census_source_name??"তথ্যসূত্র পাওয়া যায়নি")}<span className="mt-1 block text-xs text-slate-500">যাচাই: {dateFmt(ward.census_checked_at)}</span></td></tr>)}</tbody></table></div></details>)}
      {municipalWardCount===0&&<p className="mt-4 text-slate-600">পৌর ওয়ার্ডের প্রকাশিত Census তথ্য পাওয়া যায়নি।</p>}
      <aside className="mt-10 border-l-2 border-amber-600 pl-4 text-sm leading-7 text-slate-600">*উপজেলার উপলভ্য রেকর্ডের সমষ্টি। ইউনিয়ন ও পৌরসভা উপজেলা totals-এর মধ্যে অন্তর্ভুক্ত থাকতে পারে—তাই পৃথক স্তরের তথ্য যোগ করে জেলা totals তৈরি করা হয়নি। পৌর ওয়ার্ডের তথ্য পৌরসভা/উপজেলা totals-এর অংশ; আলাদা করে যোগ করবেন না।</aside>
    </section><SiteFooter/></main>;
}
function Stat({label,value}:{label:string,value:string}){return <div className="border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>}
