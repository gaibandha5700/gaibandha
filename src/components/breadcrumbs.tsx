import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";

export type BreadcrumbItem = {
  href: string;
  label: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const siteUrl = getSiteUrl();
  const fullItems = [{ href: "/", label: "হোম" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href, siteUrl).toString(),
    })),
  };

  return (
    <>
      <nav aria-label="আপনি এখানে" className={`mb-5 text-sm text-slate-500 ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {fullItems.map((item, index) => (
            <li key={item.href} className="flex min-w-0 items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
              {index === fullItems.length - 1 ? (
                <span aria-current="page" className="font-medium text-slate-700">{item.label}</span>
              ) : (
                <Link href={item.href} className="rounded-sm hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{item.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
