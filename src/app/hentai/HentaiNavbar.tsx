"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HentaiSearchAutocomplete from "./HentaiSearchAutocomplete";

const HENTAI_NAV_LINKS = [
  { label: "Collection", href: "/hentai" },
  { label: "Genres", href: "/hentai/genres" },
];

interface HentaiNavbarProps {
  userName: string;
}

export default function HentaiNavbar({ userName }: HentaiNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="header-glass fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex h-14 md:h-[60px] max-w-[1440px] items-center gap-4 px-4 lg:px-8">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {/* Logo / Brand */}
        <Link href="/hentai" className="group flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-white">
            Nime<span className="text-hn-primary">Nime</span>
          </span>
          <span className="rounded bg-hn-nsfw px-1.5 py-0.5 text-[9px] font-bold text-white">
            18+
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 pl-6 lg:flex">
          {HENTAI_NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/hentai"
                ? pathname === "/hentai" || /^\/hentai\?/.test(pathname)
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-hn-primary"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-hn-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop Search (autocomplete) */}
        <div className="hidden w-full max-w-[320px] md:block">
          <HentaiSearchAutocomplete />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Back to main site */}
          <Link
            href="/"
            className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white sm:flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            Main Site
          </Link>

          {/* User indicator */}
          <div className="flex h-8 items-center gap-2 rounded-full bg-hn-primary/15 px-3 text-xs font-medium text-hn-primary">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            {userName}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-hn-dark px-5 pb-6 pt-4 lg:hidden">
          {/* Mobile search */}
          <div className="mb-3">
            <HentaiSearchAutocomplete />
          </div>

          <nav className="flex flex-col gap-0.5">
            {HENTAI_NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/hentai"
                  ? pathname === "/hentai"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-hn-primary/10 text-hn-primary"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Back to main site (mobile) */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              ← Back to Main NimeNime
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
