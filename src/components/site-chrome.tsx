import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand"><span className="site-brand-mark">গা</span><span>আমাদের গাইবান্ধা</span></Link>
        <nav className="site-nav" aria-label="প্রধান নেভিগেশন">
          <Link href="/">হোম</Link><Link href="/upazila">উপজেলা</Link><Link href="/municipality">পৌরসভা</Link><Link href="/directory">তথ্যভান্ডার</Link><Link href="/search">খুঁজুন</Link>
        </nav>
        <details className="site-mobile-nav"><summary>মেনু</summary><div className="site-mobile-panel"><Link href="/">হোম</Link><Link href="/upazila">উপজেলা</Link><Link href="/municipality">পৌরসভা</Link><Link href="/directory">তথ্যভান্ডার</Link><Link href="/search">তথ্য খুঁজুন</Link><Link href="/submit">তথ্য জমা দিন</Link></div></details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div><Link href="/" className="site-footer-brand">আমাদের গাইবান্ধা</Link><p>গাইবান্ধা জেলার প্রশাসনিক এলাকা, প্রতিষ্ঠান ও স্থানীয় সেবার তথ্যভান্ডার।</p></div>
        <div><strong>দ্রুত লিংক</strong><Link href="/upazila">উপজেলা</Link><Link href="/municipality">পৌরসভা</Link><Link href="/directory">তথ্যভান্ডার</Link><Link href="/search">তথ্য খুঁজুন</Link></div>
        <div><strong>তথ্যের নীতি</strong><p>শুধু প্রকাশিত ও যাচাইকৃত তথ্য দেখানো হয়। তথ্য হালনাগাদ ও যাচাই চলমান।</p><Link href="/directory">প্রতিষ্ঠানের তথ্য দেখুন</Link></div>
      </div>
      <div className="site-footer-bottom">© {new Date().getFullYear().toLocaleString("bn-BD")} আমাদের গাইবান্ধা · তথ্যের যথার্থতা যাচাই করে ব্যবহার করুন</div>
    </footer>
  );
}
