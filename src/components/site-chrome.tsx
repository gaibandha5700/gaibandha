import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/", label: "হোম" },
  { href: "/district", label: "জেলা পরিচিতি" },
  { href: "/map", label: "মানচিত্র" },
  { href: "/upazila", label: "উপজেলা" },

  { href: "/municipality", label: "পৌরসভা" },
  { href: "/directory", label: "তথ্যভান্ডার" },
  { href: "/statistics", label: "পরিসংখ্যান" },
  { href: "/data", label: "তথ্য ক্যাটালগ" },

  { href: "/search", label: "তথ্য খুঁজুন" },
];

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={footer ? "site-brand site-brand-footer" : "site-brand"} aria-label="আমাদের গাইবান্ধা — হোম">
      <Image
        src="/brand/gaibandha-logo.svg"
        alt="আমাদের গাইবান্ধা"
        width={footer ? 205 : 176}
        height={footer ? 85 : 72}
        priority={!footer}
        className="site-brand-image"
      />
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <span>গাইবান্ধা জেলার ডিজিটাল তথ্যভান্ডার</span>
          <span>রংপুর বিভাগ · বাংলাদেশ</span>
        </div>
      </div>
      <header className="site-header">
        <div className="site-header-inner">
          <BrandLogo />
          <nav className="site-nav" aria-label="প্রধান নেভিগেশন">
            {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
            <Link href="/submit" className="site-submit-link">তথ্য জমা দিন <span aria-hidden="true">↗</span></Link>
          </nav>
          <details className="site-mobile-nav">
            <summary><span className="site-menu-icon" aria-hidden="true"><i /><i /><i /></span><span>মেনু</span></summary>
            <nav className="site-mobile-panel" aria-label="মোবাইল নেভিগেশন">
              {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
              <Link href="/submit" className="site-mobile-submit">তথ্য জমা দিন</Link>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-about">
          <BrandLogo footer />
          <p>গাইবান্ধা জেলার মানুষ, প্রতিষ্ঠান ও স্থানীয় সেবার নির্ভরযোগ্য তথ্য এক ঠিকানায়। নিজের এলাকার তথ্য জানুন, প্রয়োজনীয় সেবা খুঁজুন।</p>
        </div>
        <div className="site-footer-links">
          <strong>এক্সপ্লোর করুন</strong>
          <Link href="/upazila">উপজেলা</Link>
          <Link href="/municipality">পৌরসভা</Link>
          <Link href="/directory">তথ্যভান্ডার</Link>
          <Link href="/statistics">পরিসংখ্যান</Link>
          <Link href="/data">তথ্য ক্যাটালগ</Link>
          <Link href="/district">জেলা পরিচিতি</Link>
          <Link href="/map">মানচিত্র</Link>
          <Link href="/sources">তথ্যসূত্র</Link>
          <Link href="/about">আমাদের সম্পর্কে</Link>
          <Link href="/contact">যোগাযোগ</Link>
          <Link href="/privacy">গোপনীয়তা</Link>
          <Link href="/search">তথ্য খুঁজুন</Link>
        </div>
        <div className="site-footer-links">
          <strong>অংশ নিন</strong>
          <Link href="/submit">নতুন তথ্য জমা দিন</Link>
          <Link href="/submit">তথ্য সংশোধনের অনুরোধ</Link>
          <p>তথ্য হালনাগাদ ও যাচাইয়ের কাজে আপনার সহযোগিতা স্বাগত।</p>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear().toLocaleString("bn-BD")} আমাদের গাইবান্ধা</span>
        <span>গাইবান্ধার তথ্য, সবার জন্য</span>
      </div>
    </footer>
  );
}
