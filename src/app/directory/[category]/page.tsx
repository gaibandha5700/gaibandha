import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DIRECTORY_CATEGORIES,
  getAllDirectoryEntries,
  getMunicipalitiesByUpazila,
  getUnionsByUpazila,
  getUpazilas,
  isDirectoryCategory,
  getWardsByUnion,
  getWardsByMunicipality,
} from "@/lib/directory";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { parseDirectoryAreaFilter, validateDirectoryAreaSelection, validateDirectoryWardSelection } from "@/lib/directory-area-filter.mjs";

export const revalidate = 60;
export const dynamicParams = true;
type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string; upazila?: string; area?: string; ward?: string }>;
};

export async function generateStaticParams() {
  return DIRECTORY_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ category: slug }, filters] = await Promise.all([params, searchParams]);
  if (!isDirectoryCategory(slug)) return { title: "বিভাগ পাওয়া যায়নি", robots: { index: false, follow: true } };
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  const hasFilters = Boolean(filters.q?.trim() || filters.upazila || filters.area || filters.ward);
  const hasPublishedEntries = (await getAllDirectoryEntries()).some((item) => item.category === slug);
  const title = category.label + " — গাইবান্ধা";
  const description = "গাইবান্ধা জেলার " + category.label + " সম্পর্কিত প্রকাশিত ও যাচাইকৃত স্থানীয় তথ্য, ঠিকানা ও যোগাযোগের বিবরণ দেখুন।";
  const socialTitle = category.label + " — গাইবান্ধা | আমাদের গাইবান্ধা";
  const canonical = "/directory/" + slug;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: "আমাদের গাইবান্ধা",
      locale: "bn_BD",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: socialTitle, description },
    robots: { index: !hasFilters && hasPublishedEntries, follow: true },
  };
}

export default async function DirectoryCategoryPage({ params, searchParams }: PageProps) {
  const [{ category: slug }, filters] = await Promise.all([params, searchParams]);
  if (!isDirectoryCategory(slug)) notFound();
  const category = DIRECTORY_CATEGORIES.find((item) => item.slug === slug)!;
  const q = (filters.q ?? "").trim();
  const upazilaId = filters.upazila ?? "";
  const area = filters.area ?? "";
  const wardId = filters.ward ?? "";
  const parsedArea = parseDirectoryAreaFilter(area);
  const [upazilas, allEntries] = await Promise.all([
    getUpazilas(),
    getAllDirectoryEntries(),
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
        municipalities: municipalities.map((item) => ({ value: `municipality:${item.id}`, label: `${item.name_bn.replace(/\s*পৌরসভা\s*$/, "")} পৌরসভা · ${upazila.name_bn}` })),
      };
    }));
  const areas = areaGroups.flatMap((group) => [...group.unions, ...group.municipalities]);
  const areaValidation = validateDirectoryAreaSelection(area, parsedArea, areas.map((item) => item.value));
  const selectedArea = areaValidation.parsed;
  const selectedWards = selectedArea?.type === "union"
    ? await getWardsByUnion(selectedArea.id)
    : selectedArea?.type === "municipality"
      ? await getWardsByMunicipality(selectedArea.id)
      : [];
  const wardValidation = validateDirectoryWardSelection(wardId, areaValidation.value, selectedWards.map((item) => item.id));
  let entries = allEntries.filter((item) => item.category === slug && (!upazilaId || item.upazila_id === upazilaId));
  if (selectedArea?.type === "union") entries = entries.filter((item) => item.union_id === selectedArea.id);
  if (selectedArea?.type === "municipality") entries = entries.filter((item) => item.municipality_id === selectedArea.id);
  if (wardValidation.value) entries = entries.filter((item) => item.ward_id === wardValidation.value);
  if (q) {
    const term = q.toLocaleLowerCase("bn-BD");
    entries = entries.filter((item) => [item.name_bn, item.name_en, item.summary, item.description, item.address]
      .some((value) => value?.toLocaleLowerCase("bn-BD").includes(term)));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Breadcrumbs items={[{ href: "/directory", label: "তথ্যভান্ডার" }, { href: `/directory/${slug}`, label: category.label }]} />
        <p className="text-sm font-bold text-emerald-700">গাইবান্ধা জেলা · স্থানীয় তথ্য</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{category.label}</h1>
        <p className="mt-3 leading-7 text-slate-600">{category.description} — প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠানের তালিকা।</p>
        {(!areaValidation.valid || !wardValidation.valid) && <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{!areaValidation.valid ? "নির্বাচিত এলাকা বর্তমান উপজেলার তালিকার সঙ্গে মেলেনি। এলাকা ফিল্টার বাদ দেওয়া হয়েছে; সঠিক এলাকা নির্বাচন করে আবার চেষ্টা করুন।" : "নির্বাচিত ওয়ার্ড বর্তমান এলাকার তালিকার সঙ্গে মেলেনি। ওয়ার্ড ফিল্টার বাদ দেওয়া হয়েছে; সঠিক ওয়ার্ড নির্বাচন করে আবার চেষ্টা করুন।"}</p>}
        <form action={`/directory/${slug}`} method="get" className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
          <label className="sm:col-span-2"><span className="mb-1 block text-xs font-semibold text-slate-600">নাম দিয়ে খুঁজুন</span><input name="q" defaultValue={q} placeholder="প্রতিষ্ঠানের নাম বা ঠিকানা" className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-600" /></label>
          <label><span className="mb-1 block text-xs font-semibold text-slate-600">উপজেলা</span><select name="upazila" defaultValue={upazilaId} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">সব উপজেলা</option>{upazilas.map((item) => <option key={item.id} value={item.id}>{item.name_bn}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-semibold text-slate-600">ইউনিয়ন / পৌরসভা</span><select name="area" defaultValue={areaValidation.value} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">সব এলাকা</option>{areas.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-semibold text-slate-600">ওয়ার্ড</span><select name="ward" defaultValue={wardValidation.value} disabled={!areaValidation.value || selectedWards.length === 0} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-50 disabled:text-slate-400"><option value="">সব ওয়ার্ড</option>{selectedWards.map((item) => <option key={item.id} value={item.id}>{item.ward_number.toLocaleString("bn-BD")} নম্বর ওয়ার্ড</option>)}</select></label>
          <div className="flex items-center gap-2 sm:col-span-5"><button className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">ফিল্টার প্রয়োগ</button><Link href={`/directory/${slug}`} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">ফিল্টার মুছুন</Link><span className="ml-auto text-sm text-slate-500">{entries.length.toLocaleString("bn-BD")}টি ফলাফল</span></div>
        </form>
        <div className="mt-6 flex justify-end"><Link href="/submit" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">নতুন প্রতিষ্ঠানের তথ্য জমা দিন</Link></div>
        {entries.length ? (
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
            <p className="mt-2 leading-7 text-slate-600">নির্বাচিত ফিল্টার বা অনুসন্ধান অনুযায়ী প্রকাশিত ও যাচাইকৃত তথ্য নেই। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা এই বিভাগের নতুন তথ্য জমা দিন।</p>
            <Link href={`/submit?category=${slug}`} className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">এই বিভাগের তথ্য জমা দিন</Link>
          </div>
        )}
      </section>
    <SiteFooter />
      </main>
  );
}
