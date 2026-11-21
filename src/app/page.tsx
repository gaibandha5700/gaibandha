import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getMunicipalitiesByUpazila, getUpazilas, getUnionsByUpazila, getAllDirectoryEntries, DIRECTORY_CATEGORIES, type PublicBoundaryFeature } from "@/lib/directory";
import { ArrowUpRight, Search, MapPinned, BookOpen } from "lucide-react";
import { getPublicBoundaryGeoJSON } from "@/lib/map-data";

export const revalidate = 3600;

function districtMapGeometry(feature: PublicBoundaryFeature) {
  const polygons: number[][][][] = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates as number[][][]]
    : feature.geometry.coordinates as number[][][][];
  const pairs = polygons.flat(2) as number[][];
  if (!pairs.length) return null;
  const minX = Math.min(...pairs.map(p => p[0]));
  const maxX = Math.max(...pairs.map(p => p[0]));
  const minY = Math.min(...pairs.map(p => p[1]));
  const maxY = Math.max(...pairs.map(p => p[1]));
  const width = 420, height = 300, pad = 24;
  const dx = Math.max(maxX - minX, 0.00001), dy = Math.max(maxY - minY, 0.00001);
  const scale = Math.min((width - pad * 2) / dx, (height - pad * 2) / dy);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const project = (point: number[]) => [width / 2 + (point[0] - cx) * scale, height / 2 - (point[1] - cy) * scale];
  const path = polygons.map(polygon => polygon.map(ring => {
    const points = ring.map(project);
    if (!points.length) return "";
    return "M" + points[0][0].toFixed(2) + "," + points[0][1].toFixed(2) +
      points.slice(1).map(p => "L" + p[0].toFixed(2) + "," + p[1].toFixed(2)).join("") + "Z";
  }).join("")).join("");
  const label = project([feature.properties.label_lon, feature.properties.label_lat]);
  return { path, label };
}

function DistrictMapPreview({ feature }: { feature: PublicBoundaryFeature | null }) {
  const geometry = feature ? districtMapGeometry(feature) : null;
  if (!feature || !geometry?.path) {
    return <div className="home-map-art" role="img" aria-label="প্রকাশিত জেলা সীমানার মানচিত্র সাময়িকভাবে পাওয়া যাচ্ছে না"><MapPinned size={44}/><span>GAIBANDHA</span><p className="absolute bottom-12 z-10 px-4 text-center text-sm">প্রকাশিত সীমানার তথ্য এখন পাওয়া যাচ্ছে না</p></div>;
  }
  return <div className="home-map-art">
    <svg viewBox="0 0 420 300" role="img" aria-label="প্রকাশিত ও যাচাইকৃত গাইবান্ধা জেলা সীমানার মানচিত্র" className="h-full w-full p-5">
      <path d={geometry.path} fill="#c7d8b9" stroke="#37664c" strokeWidth="2" fillRule="evenodd" />
      <text x={geometry.label[0]} y={geometry.label[1]} textAnchor="middle" fontSize="16" fontWeight="700" fill="#19372a">{feature.properties.name_bn}</text>
    </svg>
    <span>GAIBANDHA</span>
  </div>;
}

export default async function Home() {
  const upazilas = await getUpazilas();
  const [unionGroups, municipalityGroups, allEntries, boundaryData] = await Promise.all([
    Promise.all(upazilas.map(u => getUnionsByUpazila(u.id))),
    Promise.all(upazilas.map(u => getMunicipalitiesByUpazila(u.id))),
    getAllDirectoryEntries(),
    getPublicBoundaryGeoJSON(),
  ]);
  const unionCount = unionGroups.reduce((n, g) => n + g.length, 0);
  const municipalityCount = municipalityGroups.reduce((n, g) => n + g.length, 0);
  const categories = DIRECTORY_CATEGORIES.map(c => ({ ...c, entries: allEntries.filter(e => e.category === c.slug) })).filter(c => c.entries.length > 0);
  const directoryCount = allEntries.length;
  const districtFeature = boundaryData?.features.find(f => f.properties.level === "district") ?? null;
  const recentEntries = [...allEntries].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3);

  return <main className="home-editorial"><SiteHeader/>
    <section className="home-intro"><div className="home-intro-inner"><div className="home-intro-copy">
      <p className="home-overline"><span className="home-overline-dot"/> জেলার তথ্য, এক জায়গায়</p>
      <h1>গাইবান্ধাকে<br/><em>জানুন।</em></h1>
      <p className="home-lead">নিজের জেলা, নিজের এলাকা—মানুষ, প্রতিষ্ঠান ও জনপদের দরকারি তথ্য সহজে খুঁজে পাওয়ার একটি উন্মুক্ত ঠিকানা।</p>
      <form className="home-search" action="/search"><Search aria-hidden="true" size={21}/><input name="q" type="search" placeholder="এলাকা, প্রতিষ্ঠান বা সেবা খুঁজুন" aria-label="তথ্য খুঁজুন"/><button type="submit">খুঁজুন <span>↗</span></button></form>
      <p className="home-search-hint">যেমন—সাদুল্লাপুর, হাসপাতাল, কলেজ, ইউনিয়ন</p></div>
      <div className="home-intro-art" aria-hidden="true"><div className="art-ring art-ring-one"/><div className="art-ring art-ring-two"/><div className="art-map-label">GAIBANDHA <span>বাংলাদেশ</span></div><div className="art-coordinates">উত্তরাঞ্চলের নদীসমতল</div><div className="art-caption">নদী ও জনপদের জেলা</div></div></div></section>
    <section className="home-facts" aria-label="প্রশাসনিক তথ্য"><div className="home-facts-inner"><div className="home-fact-lead"><span>জেলা পরিচিতি</span><strong>গাইবান্ধা</strong><small>রংপুর বিভাগ · বাংলাদেশ</small></div><div className="home-fact"><strong>{upazilas.length.toLocaleString("bn-BD")}</strong><span>উপজেলা</span></div><div className="home-fact"><strong>{unionCount.toLocaleString("bn-BD")}</strong><span>ইউনিয়ন</span></div><div className="home-fact"><strong>{municipalityCount.toLocaleString("bn-BD")}</strong><span>পৌরসভা</span></div><div className="home-fact"><strong>{directoryCount.toLocaleString("bn-BD")}</strong><span>প্রকাশিত প্রতিষ্ঠান</span></div></div></section>
    <section className="home-section home-area-section"><div className="home-section-head"><div><p className="home-section-label">আপনার এলাকার তথ্য</p><h2>জেলা থেকে<br/>নিজের জনপদে</h2></div><p>উপজেলা ধরে দেখুন ইউনিয়ন, স্থানীয় প্রতিষ্ঠান এবং এলাকার উপলভ্য তথ্য।</p></div>
      <div className="home-upazila-list">{upazilas.map((item, index) => <Link href={"/upazila/" + item.slug} key={item.slug} className="home-upazila-row"><span className="home-row-number">{(index + 1).toLocaleString("bn-BD", { minimumIntegerDigits: 2 })}</span><strong>{item.name_bn}</strong><span className="home-row-description">{item.description ?? "উপজেলার তথ্য ও ইউনিয়ন"}</span><ArrowUpRight size={20}/></Link>)}</div><Link className="home-inline-link" href="/upazila">সব উপজেলার তথ্য <span>↗</span></Link></section>
    <section className="home-section home-directory-section"><div className="home-section-head"><div><p className="home-section-label">দৈনন্দিন প্রয়োজন</p><h2>খুঁজে নিন<br/>প্রয়োজনীয় সেবা</h2></div><p>জেলার প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠান এবং সেবার তথ্য সরাসরি ডিরেক্টরি থেকে।</p></div>
      <div className="home-directory-layout"><div className="home-directory-feature"><BookOpen size={26} strokeWidth={1.5}/><h3>স্থানীয় তথ্যভান্ডার</h3><p>প্রতিষ্ঠানের ঠিকানা, যোগাযোগ ও উপলভ্য বিবরণ—একটি সহজ অনুসন্ধানে।</p><Link href="/directory">তথ্যভান্ডার খুলুন <span>↗</span></Link></div><div className="home-category-list">{categories.slice(0, 4).map(c => <Link href={"/directory/" + c.slug} key={c.slug} className="home-category-row"><span><strong>{c.label}</strong><small>{c.description}</small></span><span className="home-category-count">{c.entries.length.toLocaleString("bn-BD")} <ArrowUpRight size={18}/></span></Link>)}{categories.length > 4 && <Link href="/directory" className="home-category-more">আরও বিভাগ দেখুন <span>↗</span></Link>}</div></div></section>
    <section className="home-section home-recent-section"><div className="home-section-head"><div><p className="home-section-label">সাম্প্রতিক হালনাগাদ</p><h2>সর্বশেষ প্রকাশিত<br/>তথ্য</h2></div><p>প্রকাশিত ও যাচাইকৃত তথ্যের মধ্যে সম্প্রতি হালনাগাদ হওয়া রেকর্ডগুলো।</p></div>
      <div className="divide-y divide-[#d8dfd3] border-y border-[#d8dfd3]">{recentEntries.map(entry => {
        const category = DIRECTORY_CATEGORIES.find(c => c.slug === entry.category)?.label ?? "প্রতিষ্ঠান";
        const checked = entry.source_checked_at;
        const date = checked ?? entry.updated_at;
        const label = checked ? "উৎস যাচাই" : "রেকর্ড হালনাগাদ";
        return <Link href={"/directory/" + entry.category + "/" + entry.slug} key={entry.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold text-[#287154]">{category}</span>
          <span className="min-w-0 flex-1 sm:px-4"><strong className="block">{entry.name_bn}</strong>{entry.address && <span className="mt-1 block text-sm text-slate-500">{entry.address}</span>}</span>
          <span className="shrink-0 text-xs text-slate-500">{label} · {new Date(date).toLocaleDateString("bn-BD")}</span>
        </Link>;
      })}</div>
      <Link className="home-inline-link" href="/directory">তথ্যভান্ডার দেখুন <span>↗</span></Link></section>
    <section className="home-map-callout"><div className="home-map-text"><p className="home-section-label">প্রশাসনিক মানচিত্র</p><h2>এলাকাকে দেখুন<br/>মানচিত্রে</h2><p>প্রশাসনিক তথ্য ও প্রকাশিত এলাকার তথ্য খুঁজে দেখুন।</p><Link href="/map">মানচিত্রে এলাকা দেখুন <span>↗</span></Link></div><DistrictMapPreview feature={districtFeature}/></section>
    <section className="home-contribute"><div><p className="home-section-label">তথ্য সবার, দায়িত্বও সবার</p><h2>কোনো তথ্য বাদ পড়েছে?</h2><p>নতুন তথ্য বা সংশোধনের অনুরোধ পাঠান। যাচাই শেষে তথ্যভান্ডারে যুক্ত করা হবে।</p></div><Link href="/submit">তথ্য যোগ করতে সাহায্য করুন <span>↗</span></Link></section><SiteFooter/></main>;
}
