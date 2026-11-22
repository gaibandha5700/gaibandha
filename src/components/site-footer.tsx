import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { getLatestPublicDataUpdatedAt } from "@/lib/public-data-update";

function formatBangladeshDateTime(value: string) {
  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

export async function SiteFooter() {
  const latestUpdate = await getLatestPublicDataUpdatedAt();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-about">
          <BrandLogo footer />
          <p>
            গাইবান্ধা জেলার মানুষ, প্রতিষ্ঠান ও স্থানীয় সেবার নির্ভরযোগ্য তথ্য এক
            ঠিকানায়। নিজের এলাকার তথ্য জানুন, প্রয়োজনীয় সেবা খুঁজুন।
          </p>
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
        <span aria-label="সর্বশেষ তথ্য হালনাগাদ">
          সর্বশেষ তথ্য হালনাগাদ:{" "}
          {latestUpdate ? (
            <time dateTime={latestUpdate}>{formatBangladeshDateTime(latestUpdate)}</time>
          ) : (
            "সময় পাওয়া যায়নি"
          )}
        </span>
      </div>
    </footer>
  );
}
