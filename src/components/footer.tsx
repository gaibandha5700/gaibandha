import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { getLastDatabaseUpdate } from "@/lib/directory";

const dateFormatter = new Intl.DateTimeFormat("bn-BD", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
});

export async function SiteFooter() {
  const lastUpdated = await getLastDatabaseUpdate();
  const formattedUpdate = lastUpdated
    ? dateFormatter.format(new Date(lastUpdated))
    : "তথ্য পাওয়া যায়নি";

  return (
    <footer className="site-footer-v2">
      <div className="site-footer-v2__inner">
        <div className="site-footer-v2__about">
          <BrandLogo footer />
          <p>গাইবান্ধা জেলার মানুষ, প্রতিষ্ঠান ও স্থানীয় সেবার নির্ভরযোগ্য তথ্য এক ঠিকানায়। নিজের এলাকার তথ্য জানুন, প্রয়োজনীয় সেবা খুঁজুন।</p>
        </div>
        <div className="site-footer-v2__links">
          <strong>এক্সপ্লোর করুন</strong>
          <Link href="/district">জেলা পরিচিতি</Link>
          <Link href="/upazila">উপজেলা</Link>
          <Link href="/municipality">পৌরসভা</Link>
          <Link href="/directory">তথ্যভান্ডার</Link>
          <Link href="/search">তথ্য খুঁজুন</Link>
        </div>
        <div className="site-footer-v2__links">
          <strong>অংশ নিন</strong>
          <Link href="/submit">নতুন তথ্য জমা দিন</Link>
          <Link href="/submit">তথ্য সংশোধনের অনুরোধ</Link>
          <p>তথ্য হালনাগাদ ও যাচাইয়ের কাজে আপনার সহযোগিতা স্বাগত।</p>
        </div>
      </div>
      <div className="site-footer-v2__bottom">
        <span>© {new Date().getFullYear().toLocaleString("bn-BD")} আমাদের গাইবান্ধা</span>
        <span>
          <span className="site-footer-v2__update-label">সর্বশেষ ডেটাবেস আপডেট:</span>{" "}
          <time dateTime={lastUpdated ?? undefined}>{formattedUpdate}</time>
        </span>
      </div>
    </footer>
  );
}
