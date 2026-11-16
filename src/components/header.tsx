import Link from "next/link";
import BrandLogo from "@/components/brand-logo";

const navigation = [
  { href: "/", label: "হোম" }, { href: "/district", label: "জেলা পরিচিতি" },
  { href: "/upazila", label: "উপজেলা" }, { href: "/municipality", label: "পৌরসভা" },
  { href: "/directory", label: "তথ্যভান্ডার" }, { href: "/search", label: "তথ্য খুঁজুন" },
];

export function SiteHeader() {
  return (
    <>
      <div className="site-topbar"><div className="site-topbar-inner"><span>গাইবান্ধা জেলার ডিজিটাল তথ্যভান্ডার</span><span>রংপুর বিভাগ · বাংলাদেশ</span></div></div>
      <header className="site-header"><div className="site-header-inner">
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
      </div></header>
    </>
  );
}
