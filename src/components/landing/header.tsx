"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  landingContainerClass,
  landingHeadingFont,
  landingPrimaryCtaHeaderClass,
  landingPrimaryCtaHeaderMobileClass,
} from "@/components/landing/styles";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
];

function navLinkIsActive(pathname: string, locationHash: string, href: string): boolean {
  const i = href.indexOf("#");
  if (i >= 0) {
    return pathname === "/" && locationHash === href.slice(i);
  }
  return pathname === href;
}

function subscribeLocationHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getLocationHashSnapshot() {
  return window.location.hash;
}

function getServerLocationHashSnapshot() {
  return "";
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hash = useSyncExternalStore(
    subscribeLocationHash,
    getLocationHashSnapshot,
    getServerLocationHashSnapshot
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#10131a]/80 backdrop-blur-md">
      <div className={cn(landingContainerClass, "flex h-16 items-center justify-between")}>
        <Link
          href="/"
          className={cn(landingHeadingFont, "text-2xl font-extrabold tracking-[-0.06em] text-white")}
        >
          Job Pipe
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                landingHeadingFont,
                "text-base font-medium text-[#cbd5e1] transition-colors hover:text-white",
                navLinkIsActive(pathname, hash, link.href) && "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Button variant="ghost" asChild className="h-auto p-0 text-[#cbd5e1] hover:bg-transparent hover:text-white"><Link href="/setup" className={cn(landingHeadingFont, "text-base font-medium")}>Setup</Link></Button>
          <Button asChild className={cn(landingHeadingFont, landingPrimaryCtaHeaderClass)}><Link href="/dashboard">Go to Dashboard</Link></Button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center text-white md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/[0.06] bg-[#10131a] md:hidden">
          <nav className={cn(landingContainerClass, "flex flex-col gap-4 py-4")}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(landingHeadingFont, "text-base font-medium text-[#cbd5e1]")}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
              <Button variant="ghost" asChild className="justify-start text-[#cbd5e1] hover:bg-transparent hover:text-white"><Link href="/setup">Setup</Link></Button>
              <Button asChild className={cn(landingHeadingFont, landingPrimaryCtaHeaderMobileClass)}><Link href="/dashboard">Go to Dashboard</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
