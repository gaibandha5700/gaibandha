import Link from "next/link";
import BrandLogo from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer-v2">
      <div className="site-footer-v2__inner">
        <div className="site-footer-v2__about">
          <BrandLogo footer />
          <p>গাইবান্ধা জেলার মানুষ, প্রতিষ্ঠান ও স্থানীয় সেবার নির্ভরযোগ্য তথ্য এক ঠিকানায়। নিজের এলাকার তথ্য জানুন, প্রয়োজনীয় সেবা খুঁজুন।</p>
        </div>
        <div className="site-footer-v2__links"><strong>এক্সপ্লোর করুন</strong><Link href="/district">জেলা পরিচিতি</Link><Link href="/upazila">উপজেলা</Link><Link href="/municipality">পৌরসভা</Link><Link href="/directory">তথ্যভান্ডার</Link><Link href="/search">তথ্য খুঁজুন</Link></div>
        <div className="site-footer-v2__links"><strong>অংশ নিন</strong><Link href="/submit">নতুন তথ্য জমা দিন</Link><Link href="/submit">তথ্য সংশোধনের অনুরোধ</Link><p>তথ্য হালনাগাদ ও যাচাইয়ের কাজে আপনার সহযোগিতা স্বাগত।</p></div>
      </div>
      <div className="site-footer-v2__bottom"><span>© {new Date().getFullYear().toLocaleString("bn-BD")} আমাদের গাইবান্ধা</span><span>গাইবান্ধার তথ্য, সবার জন্য</span></div>
    </footer>
  );
}
