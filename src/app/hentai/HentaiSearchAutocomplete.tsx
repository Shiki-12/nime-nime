"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  baseSlug: string;
  title: string;
  cover: string;
  episodeCount: number;
}

export default function HentaiSearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/hentai/search?q=${encodeURIComponent(q)}`);
        const data: SearchResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setIsOpen(false);
      router.push(`/hentai/search?q=${encodeURIComponent(q)}`);
      setQuery("");
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-lg bg-hn-text/[0.06] transition-all duration-200 focus-within:bg-hn-text/[0.1] focus-within:ring-1 focus-within:ring-hn-primary/30">
          <svg
            className="ml-3 h-4 w-4 shrink-0 text-hn-text/30"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search hentai..."
            className="w-full bg-transparent px-3 py-2 text-sm text-hn-text placeholder-hn-text-muted outline-none"
          />
          {loading && (
            <div className="mr-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-hn-text/10 border-t-hn-primary" />
          )}
          <button
            type="submit"
            className="mr-1 rounded-md bg-hn-text/[0.08] px-3 py-1 text-xs font-medium text-hn-text/50 transition-colors hover:bg-hn-text/[0.15] hover:text-hn-text"
          >
            Enter
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[200] overflow-hidden rounded-xl border border-hn-text/[0.08] bg-hn-card shadow-2xl shadow-black/60">
          {results.map((item) => (
            <Link
              key={item.baseSlug}
              href={`/hentai/series/${item.baseSlug}`}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-hn-text/[0.06]"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-hn-text/90">
                  {item.title}
                </p>
                <p className="text-[11px] text-hn-text/40">
                  {item.episodeCount} episode{item.episodeCount > 1 ? "s" : ""}
                </p>
              </div>
              {/* Arrow */}
              <svg className="h-4 w-4 shrink-0 text-hn-text/20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
          {/* Full search link */}
          <button
            onClick={() => {
              setIsOpen(false);
              const q = query.trim();
              if (q) router.push(`/hentai/search?q=${encodeURIComponent(q)}`);
              setQuery("");
            }}
            className="flex w-full items-center justify-center gap-1.5 border-t border-hn-text/[0.06] px-3 py-2.5 text-xs font-medium text-hn-primary/70 transition-colors hover:bg-hn-text/[0.04] hover:text-hn-primary"
          >
            View all results →
          </button>
        </div>
      )}
    </div>
  );
}
