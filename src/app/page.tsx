import Link from "next/link";
import { getMunicipalitiesByUpazila, getUpazilas, getUnionsByUpazila } from "@/lib/directory";
import {
  ArrowRight, Building2, Bus, GraduationCap, HeartPulse,
  Landmark, MapPin, MapPinned, Search, ShieldCheck, ShoppingBag,
  Trees, Users, Waves
} from "lucide-react";

const categories = [
  { slug: "education", title: "শিক্ষা প্রতিষ্ঠান", desc: "স্কুল, কলেজ, মাদ্রাসা ও কারিগরি প্রতিষ্ঠানের তথ্য", icon: GraduationCap },
  { slug: "health", title: "হাসপাতাল ও স্বাস্থ্যসেবা", desc: "হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক ও জরুরি সেবা", icon: HeartPulse },
  { slug: "police", title: "থানা ও আইনশৃঙ্খলা", desc: "থানা, পুলিশ ফাঁড়ি ও প্রয়োজনীয় যোগাযোগ", icon: ShieldCheck },
  { slug: "government", title: "সরকারি অফিস", desc: "জেলা ও উপজেলা পর্যায়ের সরকারি দপ্তর", icon: Landmark },
  { slug: "business", title: "ব্যবসা ও প্রতিষ্ঠান", desc: "স্থানীয় ব্যবসা, দোকান, ব্যাংক ও সেবাদাতা", icon: ShoppingBag },
  { slug: "tourism", title: "দর্শনীয় স্থান", desc: "নদী, চর, ঐতিহাসিক ও ভ্রমণের জায়গা", icon: Trees },
  { slug: "transport", title: "পরিবহন", desc: "বাস কাউন্টার ও স্থানীয় যাতায়াতের তথ্য", icon: Bus },
  { slug: "community", title: "কমিউনিটি", desc: "সামাজিক সংগঠন ও স্বেচ্ছাসেবী উদ্যোগ", icon: Users }
];

export default async function Home() {
  const upazilas = await getUpazilas();
  const [unionGroups, municipalityGroups] = await Promise.all([
    Promise.all(upazilas.map((upazila) => getUnionsByUpazila(upazila.id))),
    Promise.all(upazilas.map((upazila) => getMunicipalitiesByUpazila(upazila.id))),
  ]);
  const unionCount = unionGroups.reduce((total, unions) => total + unions.length, 0);
  const municipalityCount = municipalityGroups.reduce((total, municipalities) => total + municipalities.length, 0);

  return (
    <main>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>গাইবান্ধা জেলার ডিজিটাল তথ্যভান্ডার</span>
          <span>রংপুর বিভাগ, বাংলাদেশ</span>
        </div>
      </div>

      <header className="container nav">
        <Link className="brand" href="/" aria-label="গাইবান্ধা হোম">
          <span className="brand-mark"><MapPinned size={23} /></span>
          <span>গাইবান্ধা</span>
        </Link>
        <nav className="nav-links" aria-label="প্রধান নেভিগেশন">
          <Link href="#upazila">উপজেলা</Link><Link href="/municipality">পৌরসভা</Link>
          <Link href="#categories">সেবাসমূহ</Link>
          <Link href="/search">তথ্য খুঁজুন</Link><Link href="#about">আমাদের সম্পর্কে</Link>
        </nav>
        <Link className="admin-link desktop-directory-link" href="/directory">তথ্যভান্ডার</Link>
        <details className="mobile-menu"><summary aria-label="মেনু খুলুন">মেনু</summary><div className="mobile-menu-panel"><Link href="#upazila">উপজেলা</Link><Link href="/municipality">পৌরসভা</Link><Link href="#categories">সেবাসমূহ</Link><Link href="/directory">তথ্যভান্ডার</Link><Link href="/search">তথ্য খুঁজুন</Link><Link href="#about">আমাদের সম্পর্কে</Link></div></details>
      </header>

      <section className="hero">
        <div className="container hero-content">
          <span className="eyebrow"><MapPin size={14} /> রংপুর বিভাগের একটি ঐতিহ্যবাহী জেলা</span>
          <h1>আমার গাইবান্ধা,<br />আমার পরিচয়</h1>
          <p>গাইবান্ধা জেলার প্রয়োজনীয় তথ্য, স্থানীয় সেবা, শিক্ষা প্রতিষ্ঠান, স্বাস্থ্যসেবা ও সম্ভাবনার ঠিকানা—সবকিছু খুঁজুন এক জায়গায়।</p>
          <form className="search-box" action="/search">
            <Search size={21} />
            <input name="q" type="search" placeholder="কী খুঁজছেন? যেমন: হাসপাতাল, কলেজ, উপজেলা..." aria-label="তথ্য খুঁজুন" />
            <button type="submit">খুঁজুন</button>
          </form>
          <p className="hero-note">উপজেলা, প্রতিষ্ঠান, সেবা ও এলাকার নাম দিয়ে খুঁজুন</p>
        </div>
      </section>

      <div className="container">
        <section className="stats" aria-label="গাইবান্ধা জেলার পরিচিতি">
          <div className="stat"><div className="stat-label">উপজেলা</div><div className="stat-value">{upazilas.length.toLocaleString("bn-BD", { minimumIntegerDigits: 2 })}</div><small>জেলার প্রশাসনিক উপজেলা</small></div>
          <div className="stat"><div className="stat-label">ইউনিয়ন</div><div className="stat-value">{unionCount.toLocaleString("bn-BD")}</div><small>উপজেলাভিত্তিক ইউনিয়ন</small></div>
          <div className="stat"><div className="stat-label">পৌরসভা</div><div className="stat-value">{municipalityCount.toLocaleString("bn-BD")}</div><small>প্রকাশিত ও যাচাইকৃত পৌরসভা</small></div>
          <div className="stat"><div className="stat-label">তথ্যভান্ডার</div><div className="stat-value">যাচাইকৃত</div><small>প্রকাশিত তথ্য নিয়মিত হালনাগাদ</small></div>
        </section>
      </div>

      <section className="section" id="upazila">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">জেলা পরিচিতি</div><h2>গাইবান্ধার {upazilas.length.toLocaleString("bn-BD")}টি উপজেলা</h2><p className="section-sub">আপনার এলাকার তথ্য খুঁজতে উপজেলা নির্বাচন করুন।</p></div>
            <Link className="text-link" href="/upazila">সব উপজেলা <ArrowRight size={16} /></Link>
          </div>
          <div className="grid-7">
            {upazilas.map((item) => (
              <Link className="upazila-card" href={`/upazila/${item.slug}`} key={item.slug}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="upazila-icon"><Building2 size={20} /></span>
                  <div><strong>{item.name_bn}</strong><span>{item.name_en ?? item.description ?? "উপজেলার বিস্তারিত তথ্য দেখুন"}</span></div>
                </div>
                <ArrowRight size={17} color="#8a9a91" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft" id="categories">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">এক জায়গায় প্রয়োজনীয় সেবা</div><h2>তথ্য খুঁজুন বিভাগ অনুযায়ী</h2><p className="section-sub">দৈনন্দিন প্রয়োজনের গুরুত্বপূর্ণ তথ্য সহজে খুঁজে নিন।</p></div>
            <Link className="text-link" href="/directory">সব বিভাগ <ArrowRight size={16} /></Link>
          </div>
          <div className="category-grid">
            {categories.map(({ title, desc, icon: Icon }) => (
              <Link className="category-card" href="/directory" key={title}>
                <span className="category-icon"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <div className="info-banner">
            <div><h2>গাইবান্ধার তথ্য এক জায়গায়</h2><p>উপজেলা, ইউনিয়ন, পৌরসভা, ওয়ার্ড ও স্থানীয় প্রতিষ্ঠানের যাচাইকৃত তথ্য সহজে খুঁজে নিন।</p></div>
            <Link className="banner-button" href="/directory">তথ্যভান্ডার দেখুন <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div><Link className="brand" href="/"><span className="brand-mark"><Waves size={22} /></span><span>গাইবান্ধা</span></Link><p>গাইবান্ধা জেলার মানুষ ও এলাকার জন্য একটি উন্মুক্ত ডিজিটাল তথ্যভান্ডার গড়ে তোলার উদ্যোগ।</p></div>
            <div><h4>দ্রুত লিংক</h4><Link href="#upazila">উপজেলা পরিচিতি</Link><Link href="#categories">তথ্য বিভাগ</Link><Link href="#about">তথ্য জমা দিন</Link></div>
            <div><h4>গুরুত্বপূর্ণ বিভাগ</h4><Link href="/directory/education">শিক্ষা প্রতিষ্ঠান</Link><Link href="/directory/health">স্বাস্থ্যসেবা</Link><Link href="/directory/government">সরকারি অফিস</Link></div>
          </div>
          <div className="footer-bottom">© {new Date().getFullYear()} গাইবান্ধা। সর্বস্বত্ব সংরক্ষিত। তথ্য যাচাই ও হালনাগাদের কাজ চলমান।</div>
        </div>
      </footer>
    </main>
  );
}