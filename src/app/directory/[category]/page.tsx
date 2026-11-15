import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
  DIRECTORY_CATEGORIES,
  getDirectoryEntries,
  getMunicipalitiesByUpazila,
  getUnionsByUpazila,
  getUpazilas,
  isDirectoryCategory,
} from "@/lib/directory";

export const revalidate = 60;
export const dynamicParams = true;
type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string; upazila?: string; area?: string }>;
};

export async function generateStaticParams() {
  return DIRECTORY_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  if (!isDirectoryCategory(slug)) return { title: "বিভাগ পাওয়া যায়নি" };
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  return {
    title: `${category.label} — গাইবান্ধা`,
    description: `গাইবান্ধা জেলার ${category.label} সম্পর্কিত প্রকাশিত ও যাচাইকৃত স্থানীয় তথ্য, ঠিকানা ও যোগাযোগের বিবরণ দেখুন।`,
    alternates: { canonical: `/directory/${slug}` },
  };
}

export default async function DirectoryCategoryPage({ params, searchParams }: PageProps) {
  const [{ category: slug }, filters] = await Promise.all([params, searchParams]);
  if (!isDirectoryCategory(slug)) notFound();
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  const q = (filters.q ?? "").trim();
  const upazilaId = filters.upazila ?? "";
  const area = filters.area ?? "";
  const [upazilas, allEntries] = await Promise.all([
    getUpazilas(),
    getDirectoryEntries({ category: slug, upazilaId: upazilaId || undefined }),
  ]);
  const areaGroups = await Promise.all(upazilas
    .filter((item) => !upazilaId || item.id === upazilaId)
    .map(async (upazila) => {
      const [unions, municipalities] = await Promise.all([
        getUnionsByUpazila(upazila.id),
        getMunicipalitiesByUpazila(upazila.id),
      ]);
      return {
        unions: unions.map((item) => ({ value: `union:${item.id}`, label: `${item.name_bn} ইউনিয়ন · ${upazila.name_bn}` })),
        municipalities: municipalities.map((item) => ({ value: `municipality:${item.id}`, label: `${item.name_bn} পৌরসভা · ${upazila.name_bn}` })),
      };
    }));
  const areas = areaGroups.flatMap((group) => [...group.unions, ...group.municipalities]);
  let entries = allEntries;
  if (area.startsWith("union:")) entries = entries.filter((item) => item.union_id === area.slice(6));
  if (area.startsWith("municipality:")) entries = entries.filter((item) => item.municipality_id === area.slice(12));
  if (q) {
    const term = q.toLocaleLowerCase("bn-BD");
    entries = entries.filter((item) => [item.name_bn, item.name_en, item.summary, item.description, item.address]
      .some((value) => value?.toLocaleLowerCase("bn-BD").includes(term)));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <nav aria-label="ধাপ নির্দেশনা" className="mb-5 text-sm text-slate-500">
          <Link href="/">হোম</Link> / <Link href="/directory" className="mx-2">তথ্যভান্ডার</Link> / {category.label}
        </nav>
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলা · স্থানীয় তথ্য</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{category.label}</h1>
        <p className="mt-3 leading-7 text-slate-600">{category.description} — প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠানের তালিকা।</p>
        <form action={`/directory/${slug}`} method="get" className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
          <label className="sm:col-span-2"><span className="mb-1 block text-xs font-semibold text-slate-600">নাম দিয়ে খুঁজুন</span><input name="q" defaultValue={q} placeholder="প্রতিষ্ঠানের নাম বা ঠিকানা" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" /></label>
          <label><span className="mb-1 block text-xs font-semibold text-slate-600">উপজেলা</span><select name="upazila" defaultValue={upazilaId} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">সব উপজেলা</option>{upazilas.map((item) => <option key={item.id} value={item.id}>{item.name_bn}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-semibold text-slate-600">ইউনিয়ন / পৌরসভা</span><select name="area" defaultValue={area} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">সব এলাকা</option>{areas.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <div className="flex items-center gap-2 sm:col-span-4"><button className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">ফিল্টার প্রয়োগ</button><Link href={`/directory/${slug}`} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">ফিল্টার মুছুন</Link><span className="ml-auto text-sm text-slate-500">{entries.length.toLocaleString("bn-BD")}টি ফলাফল</span></div>
        </form>
        <div className="mt-6 flex justify-end"><Link href="/submit" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">নতুন প্রতিষ্ঠানের তথ্য জমা দিন</Link></div>\n        {entries.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/directory/${slug}/${entry.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm">
                <h2 className="font-bold">{entry.name_bn}</h2>
                                {entry.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{entry.summary}</p>}
                {entry.address && <p className="mt-3 text-xs text-slate-500">{entry.address}</p>}
                <span className="mt-4 block text-sm font-semibold text-emerald-700">বিস্তারিত →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8">
            <h2 className="text-lg font-bold">কোনো তথ্য পাওয়া যায়নি</h2>
            <p className="mt-2 leading-7 text-slate-600">নির্বাচিত ফিল্টার বা অনুসন্ধান অনুযায়ী প্রকাশিত ও যাচাইকৃত তথ্য নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        )}
      </section>
    <SiteFooter />
      </main>
  );
}
