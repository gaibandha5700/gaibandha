import { BrandLogo } from "@/components/brand-logo";
import { PrimaryNavigation } from "@/components/primary-navigation";

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
          <PrimaryNavigation />
        </div>
      </header>
    </>
  );
}
