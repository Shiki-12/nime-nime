"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Filter", href: "/filter" },
  { label: "Genres", href: "/genres" },
  { label: "Movies", href: "/movies" },
  { label: "Popular", href: "/popular" },
  { label: "Schedule", href: "/schedule" },
  { label: "Saved", href: "/saved" },
  { label: "History", href: "/history" },
  
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="header-glass fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center gap-3 px-4 lg:px-6">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-1.5 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-white">
            Nime<span className="text-hn-primary">Nime</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-0.5 pl-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-hn-primary"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden w-full max-w-[320px] md:block">
          <SearchBar />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1">
          {/* Mobile search toggle */}
         <button 
            onClick={() => {
              setMobileOpen(true); 
              setTimeout(() => {
                const searchInput = document.querySelector('.md\\:hidden input') as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                }
              }, 100);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>

          {/* Random button */}
          <a
            href="/api/random"
            className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white sm:flex"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
              />
            </svg>
            Random
          </a>
          {/* User button */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hn-primary/10 text-hn-primary">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-hn-dark px-4 pb-4 pt-3 lg:hidden">
          <div className="mb-3 md:hidden">
            <SearchBar />
          </div>
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-hn-primary/10 text-hn-primary"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
