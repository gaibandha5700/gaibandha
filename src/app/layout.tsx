import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "গাইবান্ধা — জেলার তথ্য, সেবা ও সম্ভাবনার ঠিকানা",
    template: "%s | গাইবান্ধা"
  },
  description:
    "গাইবান্ধা জেলার উপজেলা, ইউনিয়ন, শিক্ষা প্রতিষ্ঠান, হাসপাতাল, সরকারি অফিস, ব্যবসা ও দর্শনীয় স্থানের তথ্য এক জায়গায়।",
  applicationName: "গাইবান্ধা",
  keywords: ["গাইবান্ধা", "Gaibandha", "Gaibandha district", "উপজেলা", "শিক্ষা প্রতিষ্ঠান", "হাসপাতাল"],
  openGraph: {
    title: "গাইবান্ধা — জেলার ডিজিটাল তথ্যভান্ডার",
    description: "গাইবান্ধা জেলার প্রয়োজনীয় তথ্য ও স্থানীয় সেবা খুঁজুন এক জায়গায়।",
    locale: "bn_BD",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}