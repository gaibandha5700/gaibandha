import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "আমাদের গাইবান্ধা — জেলার তথ্য, সেবা ও সম্ভাবনার ঠিকানা", template: "%s | আমাদের গাইবান্ধা" },
  description: "গাইবান্ধা জেলার উপজেলা, ইউনিয়ন, পৌরসভা, ওয়ার্ড, শিক্ষা প্রতিষ্ঠান, হাসপাতাল, সরকারি অফিস, ব্যবসা ও দর্শনীয় স্থানের তথ্য ও স্থানীয় সেবা খুঁজুন এক জায়গায়।",
  applicationName: "আমাদের গাইবান্ধা",
  keywords: ["আমাদের গাইবান্ধা", "গাইবান্ধা", "Gaibandha", "Gaibandha district", "গাইবান্ধা জেলা", "গাইবান্ধা উপজেলা", "শিক্ষা প্রতিষ্ঠান", "হাসপাতাল", "স্থানীয় সেবা"],
  icons: { icon: [{ url: "/favicon.ico", type: "image/x-icon" }, { url: "/icon.svg", type: "image/svg+xml" }], shortcut: ["/favicon.ico"], apple: ["/icon.svg"] },
  openGraph: {
    title: "আমাদের গাইবান্ধা — জেলার ডিজিটাল তথ্যভান্ডার",
    description: "গাইবান্ধা জেলার প্রয়োজনীয় তথ্য, প্রতিষ্ঠান ও স্থানীয় সেবা খুঁজুন এক জায়গায়।",
    url: siteUrl, siteName: "আমাদের গাইবান্ধা", locale: "bn_BD", type: "website",
  },
  twitter: {
    card: "summary_large_image", title: "আমাদের গাইবান্ধা — জেলার ডিজিটাল তথ্যভান্ডার",
    description: "গাইবান্ধা জেলার প্রয়োজনীয় তথ্য, প্রতিষ্ঠান ও স্থানীয় সেবা খুঁজুন এক জায়গায়।",
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org", "@type": "WebSite",
  name: "আমাদের গাইবান্ধা", alternateName: ["গাইবান্ধা", "Gaibandha"],
  url: siteUrl.toString(), inLanguage: "bn-BD",
  description: "গাইবান্ধা জেলার উপজেলা, প্রতিষ্ঠান, স্থানীয় সেবা ও প্রয়োজনীয় তথ্যের উন্মুক্ত ডিজিটাল তথ্যভান্ডার।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
