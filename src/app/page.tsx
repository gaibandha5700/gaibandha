import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getMunicipalitiesByUpazila, getUpazilas, getUnionsByUpazila, getAllDirectoryEntries, DIRECTORY_CATEGORIES } from "@/lib/directory";
import { ArrowUpRight, Search, MapPinned, BookOpen } from "lucide-react";
export const revalidate = 3600;
export default async function Home() {
 const upazilas=await getUpazilas();
 const [unionGroups,municipalityGroups,allEntries]=await Promise.all([
  Promise.all(upazilas.map(u=>getUnionsByUpazila(u.id))),
  Promise.all(upazilas.map(u=>getMunicipalitiesByUpazila(u.id))),
  getAllDirectoryEntries()
 ]);
 const unionCount=unionGroups.reduce((n,g)=>n+g.length,0);
 const municipalityCount=municipalityGroups.reduce((n,g)=>n+g.length,0);
 const categories=categoryGroups.filter(c=>c.entries.length>0);
 const directoryCount=categories.reduce((n,c)=>n+c.entries.length,0);
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
 <div className="home-upazila-list">{upazilas.map((item,index)=><Link href={`/upazila/${item.slug}`} key={item.slug} className="home-upazila-row"><span className="home-row-number">{(index+1).toLocaleString("bn-BD",{minimumIntegerDigits:2})}</span><strong>{item.name_bn}</strong><span className="home-row-description">{item.description??"উপজেলার তথ্য ও ইউনিয়ন"}</span><ArrowUpRight size={20}/></Link>)}</div><Link className="home-inline-link" href="/upazila">সব উপজেলার তথ্য <span>↗</span></Link></section>
 <section className="home-section home-directory-section"><div className="home-section-head"><div><p className="home-section-label">দৈনন্দিন প্রয়োজন</p><h2>খুঁজে নিন<br/>প্রয়োজনীয় সেবা</h2></div><p>জেলার প্রকাশিত ও যাচাইকৃত প্রতিষ্ঠান এবং সেবার তথ্য সরাসরি ডিরেক্টরি থেকে।</p></div>
 <div className="home-directory-layout"><div className="home-directory-feature"><BookOpen size={26} strokeWidth={1.5}/><h3>স্থানীয় তথ্যভান্ডার</h3><p>প্রতিষ্ঠানের ঠিকানা, যোগাযোগ ও উপলভ্য বিবরণ—একটি সহজ অনুসন্ধানে।</p><Link href="/directory">তথ্যভান্ডার খুলুন <span>↗</span></Link></div><div className="home-category-list">{categories.slice(0,4).map(c=><Link href={`/directory/${c.slug}`} key={c.slug} className="home-category-row"><span><strong>{c.label}</strong><small>{c.description}</small></span><span className="home-category-count">{c.entries.length.toLocaleString("bn-BD")} <ArrowUpRight size={18}/></span></Link>)}{categories.length>4&&<Link href="/directory" className="home-category-more">আরও বিভাগ দেখুন <span>↗</span></Link>}</div></div></section>
 <section className="home-map-callout"><div className="home-map-text"><p className="home-section-label">প্রশাসনিক মানচিত্র</p><h2>এলাকাকে দেখুন<br/>মানচিত্রে</h2><p>প্রশাসনিক তথ্য ও প্রকাশিত এলাকার তথ্য খুঁজে দেখুন।</p><Link href="/upazila">এলাকা ঘুরে দেখুন <span>↗</span></Link></div><div className="home-map-art" aria-hidden="true"><div className="map-contour contour-a"/><div className="map-contour contour-b"/><div className="map-contour contour-c"/><MapPinned size={44}/><span>GAIBANDHA</span></div></section>
 <section className="home-contribute"><div><p className="home-section-label">তথ্য সবার, দায়িত্বও সবার</p><h2>কোনো তথ্য বাদ পড়েছে?</h2><p>নতুন তথ্য বা সংশোধনের অনুরোধ পাঠান। যাচাই শেষে তথ্যভান্ডারে যুক্ত করা হবে।</p></div><Link href="/submit">তথ্য যোগ করতে সাহায্য করুন <span>↗</span></Link></section><SiteFooter/></main>;
}