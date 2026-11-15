import Link from "next/link";
import {
  ArrowRight, BookOpen, Building2, Bus, GraduationCap, HeartPulse,
  Landmark, MapPin, MapPinned, Search, ShieldCheck, ShoppingBag,
  Trees, Users, Waves
} from "lucide-react";

const upazilas = [
  { name: "গাইবান্ধা সদর", slug: "gaibandha-sadar", note: "জেলা সদর" },
  { name: "সাদুল্লাপুর", slug: "sadullapur", note: "উপজেলা" },
  { name: "পলাশবাড়ী", slug: "palashbari", note: "উপজেলা" },
  { name: "সাঘাটা", slug: "saghata", note: "উপজেলা" },
  { name: "গোবিন্দগঞ্জ", slug: "gobindaganj", note: "উপজেলা" },
  { name: "ফুলছড়ি", slug: "fulchhari", note: "উপজেলা" },
  { name: "সুন্দরগঞ্জ", slug: "sundarganj", note: "উপজেলা" }
];

const categories = [
  { title: "শিক্ষা প্রতিষ্ঠান", desc: "স্কুল, কলেজ, মাদ্রাসা ও কারিগরি প্রতিষ্ঠানের তথ্য", icon: GraduationCap },
  { title: "হাসপাতাল ও স্বাস্থ্যসেবা", desc: "হাসপাতাল, ক্লিনিক, ডায়াগনস্টিক ও জরুরি সেবা", icon: HeartPulse },
  { title: "থানা ও আইনশৃঙ্খলা", desc: "থানা, পুলিশ ফাঁড়ি ও প্রয়োজনীয় যোগাযোগ", icon: ShieldCheck },
  { title: "সরকারি অফিস", desc: "জেলা ও উপজেলা পর্যায়ের সরকারি দপ্তর", icon: Landmark },
  { title: "ব্যবসা ও প্রতিষ্ঠান", desc: "স্থানীয় ব্যবসা, দোকান, ব্যাংক ও সেবাদাতা", icon: ShoppingBag },
  { title: "দর্শনীয় স্থান", desc: "নদী, চর, ঐতিহাসিক ও ভ্রমণের জায়গা", icon: Trees },
  { title: "পরিবহন", desc: "বাস কাউন্টার ও স্থানীয় যাতায়াতের তথ্য", icon: Bus },
  { title: "কমিউনিটি", desc: "সামাজিক সংগঠন ও স্বেচ্ছাসেবী উদ্যোগ", icon: Users }
];

export default function Home() {
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
          <Link href="#upazila">উপজেলা</Link>
          <Link href="#categories">সেবাসমূহ</Link>
          <Link href="#about">আমাদের সম্পর্কে</Link>
        </nav>
        <Link className="admin-link" href="mailto:admin@gaibandha.local">যোগাযোগ</Link>
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
          <div className="stat"><div className="stat-label">উপজেলা</div><div className="stat-value">০৭</div><small>জেলার প্রশাসনিক উপজেলা</small></div>
          <div className="stat"><div className="stat-label">বিভাগ</div><div className="stat-value">রংপুর</div><small>রংপুর বিভাগ, বাংলাদেশ</small></div>
          <div className="stat"><div className="stat-label">প্রধান নদী</div><div className="stat-value">যমুনা</div><small>তিস্তা, ব্রহ্মপুত্রসহ নদীবিধৌত জনপদ</small></div>
          <div className="stat"><div className="stat-label">প্ল্যাটফর্ম</div><div className="stat-value">ডিজিটাল</div><small>তথ্য ও স্থানীয় সেবার এক ঠিকানা</small></div>
        </section>
      </div>

      <section className="section" id="upazila">
        <div className="container">
          <div className="section-head">
            <div><div className="kicker">জেলা পরিচিতি</div><h2>গাইবান্ধার ৭টি উপজেলা</h2><p className="section-sub">আপনার এলাকার তথ্য খুঁজতে উপজেলা নির্বাচন করুন।</p></div>
            <Link className="text-link" href="/upazila">সব উপজেলা <ArrowRight size={16} /></Link>
          </div>
          <div className="grid-7">
            {upazilas.map((item) => (
              <Link className="upazila-card" href={`/upazila/${item.slug}`} key={item.slug}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="upazila-icon"><Building2 size={20} /></span>
                  <div><strong>{item.name}</strong><span>{item.note}</span></div>
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
            <div><h2>আপনার এলাকার তথ্য যোগ করতে চান?</h2><p>প্রতিষ্ঠান বা সেবার সঠিক তথ্য আমাদের জানান। যাচাইয়ের পর তথ্যভান্ডারে যুক্ত করা হবে।</p></div>
            <Link className="banner-button" href="mailto:admin@gaibandha.local">তথ্য জমা দিন <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div><Link className="brand" href="/"><span className="brand-mark"><Waves size={22} /></span><span>গাইবান্ধা</span></Link><p>গাইবান্ধা জেলার মানুষ ও এলাকার জন্য একটি উন্মুক্ত ডিজিটাল তথ্যভান্ডার গড়ে তোলার উদ্যোগ।</p></div>
            <div><h4>দ্রুত লিংক</h4><Link href="#upazila">উপজেলা পরিচিতি</Link><Link href="#categories">তথ্য বিভাগ</Link><Link href="#about">তথ্য জমা দিন</Link></div>
            <div><h4>গুরুত্বপূর্ণ বিভাগ</h4><Link href="/directory">শিক্ষা ও স্বাস্থ্য</Link><Link href="/directory">সরকারি অফিস</Link><Link href="/directory">ব্যবসা ও কমিউনিটি</Link></div>
          </div>
          <div className="footer-bottom">© {new Date().getFullYear()} গাইবান্ধা। সর্বস্বত্ব সংরক্ষিত। তথ্য যাচাই ও হালনাগাদের কাজ চলমান।</div>
        </div>
      </footer>
    </main>
  );
}