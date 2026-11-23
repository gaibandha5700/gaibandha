"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { primaryNavigation, submitNavigation } from "@/config/site-navigation";
import { isNavigationItemActive } from "@/lib/navigation-active.mjs";

export function PrimaryNavigation() {
  const pathname = usePathname() ?? "";
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  }, [pathname]);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <>
      <nav className="site-nav" aria-label="প্রধান নেভিগেশন">
        {primaryNavigation.map((item) => (
          <Link
            href={item.href}
            key={item.href}
            aria-current={isNavigationItemActive(pathname, item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href={submitNavigation.href}
          className="site-submit-link"
          aria-current={isNavigationItemActive(pathname, submitNavigation.href) ? "page" : undefined}
        >
          {submitNavigation.label} <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <details ref={mobileMenuRef} className="site-mobile-nav">
        <summary>
          <span className="site-menu-icon" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>মেনু</span>
        </summary>
        <nav className="site-mobile-panel" aria-label="মোবাইল নেভিগেশন">
          {primaryNavigation.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              onClick={closeMobileMenu}
              aria-current={isNavigationItemActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={submitNavigation.href}
            className="site-mobile-submit"
            onClick={closeMobileMenu}
            aria-current={isNavigationItemActive(pathname, submitNavigation.href) ? "page" : undefined}
          >
            {submitNavigation.label}
          </Link>
        </nav>
      </details>
    </>
  );
}
