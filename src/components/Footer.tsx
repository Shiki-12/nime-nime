"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_SECTIONS = [
  {
    title: "NimeNime",
    links: [
      { label: "Home", href: "/" },
      { label: "Genres", href: "/genres" },
      { label: "Movies", href: "/movies" },
      { label: "Popular", href: "/popular" },
    ],
  },
  {
    title: "Download APK!!",
    links: [
      { label: "Download App", href: "/download" },
    ],
  },
  {
    title: "Your Library",
    links: [
      { label: "Saved Anime", href: "/saved" },
      { label: "Search", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "DMCA", href: "/dmca" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on the isolated /hentai section
  if (pathname.startsWith("/hentai")) return null;

  return (
    <footer className="relative overflow-hidden border-t border-hn-border/50 bg-hn-dark">
      {/* Gradient glow behind footer */}
      <div className="absolute -top-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-hn-primary/40 to-transparent" />

      <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-hn-text">
                Nime<span className="text-hn-primary">Nime</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-hn-text-muted">
              Your premium destination for streaming anime. Discover ongoing
              series, explore genres, and watch in high quality. NimeNime does
              not store any files on its server.
            </p>

            {/* Social-like badges */}
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full bg-hn-primary/10 px-3 py-1 text-[10px] font-semibold text-hn-primary">
                HD Quality
              </span>
              <span className="rounded-full bg-hn-secondary/10 px-3 py-1 text-[10px] font-semibold text-hn-secondary">
                Sub & Dub
              </span>
              <span className="rounded-full bg-hn-blue/10 px-3 py-1 text-[10px] font-semibold text-hn-blue">
                No Ads
              </span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-hn-text-muted">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-hn-text-muted/70 transition-colors hover:text-hn-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-hn-border/50 pt-6 sm:flex-row">
          <p className="text-[11px] text-hn-text-muted/50">
            &copy; {new Date().getFullYear()} NimeNime. For educational purposes
            only.
          </p>
          <p className="max-w-md text-center text-[10px] uppercase tracking-widest text-hn-text-muted/40">
            This site does not store any files on its server. All contents are
            provided by non-affiliated third parties.
          </p>
        </div>
      </div>
    </footer>
  );
}
