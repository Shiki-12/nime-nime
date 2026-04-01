"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  { label: "Discuss", href: "/discuss" },
];

// ─── User Avatar Dropdown ──────────────────────────────────────────
function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── Loading state ────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />
    );
  }

  // ── Unauthenticated: link to /login ──────────────────────────
  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/40 transition-all duration-200 hover:bg-hn-primary/15 hover:text-hn-primary hover:shadow-[0_0_12px_rgba(255,186,222,0.15)]"
        aria-label="Sign in"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </Link>
    );
  }

  // ── Authenticated: avatar + dropdown ─────────────────────────
  const initials = (session.user.name ?? session.user.email ?? "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-hn-primary/15 text-sm font-bold text-hn-primary transition-all duration-200 hover:bg-hn-primary/25 hover:shadow-[0_0_12px_rgba(255,186,222,0.2)] overflow-hidden"
        aria-label="User menu"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? "Avatar"}
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initials
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-white/[0.06] bg-hn-card shadow-2xl shadow-black/40">
          {/* User info */}
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">
              {session.user.name ?? "User"}
            </p>
            {session.user.email && (
              <p className="truncate text-xs text-white/40">
                {session.user.email}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Account Settings
            </Link>
            <Link
              href="/settings/appearance"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
              </svg>
              Appearance
            </Link>
            {session.user.nsfwEnabled && (
              <>
                <div className="mx-3 my-1 border-t border-white/[0.06]" />
                <Link
                  href="/hentai"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400/80 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-red-600 text-[8px] font-bold text-white">18</span>
                  18+ Section
                </Link>
              </>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Hide main navbar on the isolated /hentai section (it has its own)
  if (pathname.startsWith("/hentai")) return null;

  return (
    <header className="navbar-glass fixed left-0 right-0 top-0 z-50 w-full">
      <div className="flex h-14 md:h-[60px] w-full items-center gap-3 px-4 sm:px-6 lg:px-10">
        {/* ── Left zone: Hamburger + Logo ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hamburger — visible on all sizes for aniwatch style, functional on mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white lg:hidden"
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

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-1.5 shrink-0">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Nime<span className="text-hn-primary">Nime</span>
            </span>
          </Link>
        </div>

        {/* ── Center zone: Desktop Nav Links ── */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-hn-primary"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {link.label}
                {/* Active indicator underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-hn-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Right zone: Search + Actions ── */}
        <div className="flex items-center gap-2">
          {/* Desktop search */}
          <div className="hidden w-full max-w-[320px] md:block">
            <SearchBar />
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => {
              setMobileOpen(true);
              setTimeout(() => {
                const searchInput = document.querySelector('.md\\:hidden input') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }, 100);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>

          {/* Random button */}
          <a
            href="/api/random"
            className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.04] hover:text-white sm:flex"
            aria-label="Random anime"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
            </svg>
            Random
          </a>

          {/* User menu (auth-aware) */}
          <UserMenu />
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/[0.06] bg-hn-dark/95 backdrop-blur-xl px-5 pb-6 pt-4">
          <div className="mb-4 md:hidden">
            <SearchBar />
          </div>
          <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
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
          </nav>
        </div>
      </div>
    </header>
  );
}
