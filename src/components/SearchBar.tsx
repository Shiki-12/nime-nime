"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import type { OngoingAnime } from "@/types/anime";

// ─── Inline Spinner ────────────────────────────────────────────────
function Spinner() {
    return (
        <svg
            className="h-4 w-4 shrink-0 animate-spin text-hn-primary"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
            />
        </svg>
    );
}

// ─── Search Icon ───────────────────────────────────────────────────
function SearchIcon() {
    return (
        <svg
            className="h-4 w-4 shrink-0 text-hn-text"
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
    );
}

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<OngoingAnime[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [noResults, setNoResults] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // ── In-memory search cache ─────────────────────────────────────
    // Stores previous query → results so re-typing the same term
    // serves results instantly without hitting the API again.
    // Persists across re-renders but resets on unmount (page nav).
    const searchCache = useRef<Map<string, OngoingAnime[]>>(new Map());

    const debouncedQuery = useDebounce(query.trim(), 500);

    // ── Fetch results when debounced query changes ─────────────────
    useEffect(() => {
        // Reset if query is cleared
        if (!debouncedQuery) {
            setResults([]);
            setIsOpen(false);
            setNoResults(false);
            return;
        }

        // ── Cache hit: serve instantly, skip network call ──────────
        const cacheKey = debouncedQuery.toLowerCase();
        const cached = searchCache.current.get(cacheKey);

        if (cached !== undefined) {
            setResults(cached);
            setNoResults(cached.length === 0);
            setIsOpen(true);
            setIsLoading(false);
            return; // no fetch needed
        }

        // ── Cache miss: fetch from API ─────────────────────────────
        const controller = new AbortController();

        async function fetchResults() {
            setIsLoading(true);
            setNoResults(false);

            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedQuery)}&page=1`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error("API Error");

                const data = await res.json();
                const animes: OngoingAnime[] = data.animes ?? [];

                // Store in cache for future lookups
                searchCache.current.set(cacheKey, animes);

                setResults(animes);
                setNoResults(animes.length === 0);
                setIsOpen(true);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setResults([]);
                setNoResults(true);
                setIsOpen(true);
            } finally {
                setIsLoading(false);
            }
        }

        fetchResults();
        return () => controller.abort();
    }, [debouncedQuery]);

    // ── Click outside to close dropdown ────────────────────────────
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Close on Escape ────────────────────────────────────────────
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // ── Form submit = go to full search page ───────────────────────
    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = query.trim();
            if (trimmed) {
                router.push(`/search/${encodeURIComponent(trimmed)}`);
                setQuery("");
                setIsOpen(false);
                inputRef.current?.blur();
            }
        },
        [query, router]
    );

    // ── Navigate to result and close ───────────────────────────────
    const handleResultClick = useCallback(() => {
        setQuery("");
        setIsOpen(false);
    }, []);

    const showDropdown = isOpen && (results.length > 0 || noResults);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <form onSubmit={handleSubmit}>
                <div
                    className={`flex items-center gap-2.5 rounded-xl bg-hn-card px-3.5 py-2 transition-all duration-200 ${
                        showDropdown
                            ? "ring-1 ring-hn-primary/40 rounded-b-none"
                            : "hover:brightness-110"
                    }`}
                >
                    {/* Search icon or loading spinner */}
                    {isLoading ? <Spinner /> : <SearchIcon />}

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (!e.target.value.trim()) setIsOpen(false);
                        }}
                        onFocus={() => {
                            if (results.length > 0 || noResults) setIsOpen(true);
                        }}
                        placeholder="Search anime..."
                        autoComplete="off"
                        className="w-full bg-transparent text-[13px] text-white placeholder:text-hn-text focus:outline-none"
                    />

                    {/* Clear button */}
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setResults([]);
                                setIsOpen(false);
                                setNoResults(false);
                                inputRef.current?.focus();
                            }}
                            className="shrink-0 text-hn-text transition-colors hover:text-white"
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}

                    <kbd className="hidden shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-hn-text sm:inline-block">
                        Enter
                    </kbd>
                </div>
            </form>

            {/* ── Dropdown Results ─────────────────────────────────── */}
            {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 max-h-[380px] overflow-y-auto rounded-b-xl border border-white/[0.06] border-t-0 bg-hn-card shadow-xl backdrop-blur-xl">
                    {/* No results state */}
                    {noResults && (
                        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                            <svg
                                className="h-8 w-8 text-hn-text/40"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-hn-text">
                                No results for &quot;{debouncedQuery}&quot;
                            </p>
                            <p className="text-xs text-hn-text/60">
                                Try a different keyword
                            </p>
                        </div>
                    )}

                    {/* Result items */}
                    {results.length > 0 && (
                        <ul className="py-1.5">
                            {results.slice(0, 8).map((anime) => (
                                <li key={anime.slug}>
                                    <Link
                                        href={`/anime/${anime.slug}`}
                                        onClick={handleResultClick}
                                        className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-hn-dark"
                                    >
                                        {/* Poster thumbnail */}
                                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/5">
                                            <Image
                                                src={anime.poster}
                                                alt={anime.title}
                                                fill
                                                sizes="40px"
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] font-semibold text-white">
                                                {anime.title}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                {anime.type && (
                                                    <span className="rounded bg-hn-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-hn-primary">
                                                        {anime.type}
                                                    </span>
                                                )}
                                                {anime.status_or_day && (
                                                    <span className="text-[11px] text-hn-text">
                                                        {anime.status_or_day}
                                                    </span>
                                                )}
                                                {anime.episode && (
                                                    <span className="text-[11px] text-hn-text">
                                                        • {anime.episode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <svg
                                            className="h-4 w-4 shrink-0 text-hn-text/40"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                            />
                                        </svg>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Footer: link to full search page */}
                    {results.length > 0 && (
                        <div className="border-t border-white/[0.04] px-3 py-2">
                            <Link
                                href={`/search/${encodeURIComponent(debouncedQuery)}`}
                                onClick={handleResultClick}
                                className="flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
                            >
                                View all results
                                <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                    />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
