import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={footer ? "site-brand site-brand-footer" : "site-brand"}
      aria-label="আমাদের গাইবান্ধা — হোম"
    >
      <Image
        src="/brand/gaibandha-logo.svg"
        alt="আমাদের গাইবান্ধা"
        width={footer ? 205 : 150}
        height={footer ? 85 : 62}
        priority={!footer}
        className="site-brand-image"
      />
    </Link>
  );
}
