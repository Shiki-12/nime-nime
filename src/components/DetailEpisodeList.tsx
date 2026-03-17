"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { EpisodeItem } from "@/types/anime";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface DetailEpisodeListProps {
    episodes: EpisodeItem[];
    animeSlug: string;
    animeTitle: string;
    animePoster: string;
    animeType: string;
}

export default function DetailEpisodeList({
    episodes,
    animeSlug,
    animeTitle,
    animePoster,
    animeType,
}: DetailEpisodeListProps) {
    const [search, setSearch] = useState("");
    const { isEpisodeWatched, toggleEpisodeWatched } = useWatchHistory();
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll helpers
    const scrollToLatest = () =>
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    const scrollToFirst = () =>
        containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
        });

    // Filter episodes by search query (matches name/number)
    const filtered = search.trim()
        ? episodes.filter((ep) =>
              ep.name.toLowerCase().includes(search.toLowerCase())
          )
        : episodes;

    const watchedCount = episodes.filter((ep) =>
        isEpisodeWatched(animeSlug, ep.slug)
    ).length;

    return (
        <section>
            {/* Header row */}
            <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-hn-primary" />
                <h2 className="text-base font-bold text-white">Episodes</h2>
                <span className="rounded bg-hn-primary/15 px-2 py-0.5 text-[11px] font-bold text-hn-primary">
                    {episodes.length}
                </span>
                {watchedCount > 0 && (
                    <span className="rounded bg-hn-green/15 px-2 py-0.5 text-[11px] font-semibold text-hn-green">
                        {watchedCount} watched
                    </span>
                )}
            </div>

            {/* Search input */}
            <div className="relative mb-3">
                <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
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
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search episode number or title..."
                    className="w-full rounded-lg border border-white/5 bg-hn-card py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40 focus:bg-hn-card-hover"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-white/30 transition-colors hover:text-white"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Quick-scroll buttons */}
            <div className="mb-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={scrollToLatest}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5M4.5 18.75h15" />
                    </svg>
                    Latest Episode
                </button>
                <button
                    type="button"
                    onClick={scrollToFirst}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 11.25l-7.5 7.5-7.5-7.5M4.5 5.25h15" />
                    </svg>
                    First Episode
                </button>
            </div>

            {/* Episode list */}
            <div ref={containerRef} className="max-h-[600px] space-y-1 overflow-y-auto rounded-lg bg-hn-card p-2 scrollbar-thin">
                {filtered.length === 0 && (
                    <div className="flex h-24 items-center justify-center">
                        <p className="text-sm text-white/30">
                            No episodes matching &quot;{search}&quot;
                        </p>
                    </div>
                )}

                {filtered.map((ep) => {
                    const watched = isEpisodeWatched(animeSlug, ep.slug);

                    return (
                        <div key={ep.slug} className="group relative">
                            <Link
                                href={`/anime/watch/${ep.slug}?anime=${animeSlug}`}
                                className={`flex items-center gap-3 rounded-lg pl-3 pr-20 py-2.5 transition-all ${
                                    watched
                                        ? "bg-white/[0.02] hover:bg-hn-card-hover"
                                        : "hover:bg-hn-card-hover"
                                }`}
                            >
                                {/* Icon */}
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                                        watched
                                            ? "bg-hn-green/10 text-hn-green"
                                            : "bg-hn-primary/10 text-hn-primary group-hover:bg-hn-primary group-hover:text-hn-dark"
                                    }`}
                                >
                                    {watched ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    ) : (
                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Title */}
                                <span
                                    className={`flex-1 truncate text-[13px] font-medium transition-colors ${
                                        watched
                                            ? "text-white/35 group-hover:text-white/60"
                                            : "text-white/70 group-hover:text-hn-primary"
                                    }`}
                                >
                                    {ep.name}
                                </span>

                                {/* Watched badge & Arrow */}
                                <div className="flex items-center gap-2">
                                    {watched && (
                                        <span className="shrink-0 rounded bg-hn-green/10 px-2 py-0.5 text-[10px] font-semibold text-hn-green/60">
                                            Watched
                                        </span>
                                    )}
                                    <svg
                                        className="h-3.5 w-3.5 shrink-0 text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-white/40"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            </Link>

                            {/* Manual Toggle Checkmark */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleEpisodeWatched(
                                        { 
                                            slug: animeSlug, 
                                            title: animeTitle, 
                                            poster: animePoster, 
                                            type: animeType,
                                            totalEpisodes: episodes.length
                                        },
                                        { slug: ep.slug, name: ep.name }
                                    );
                                }}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
                                    watched 
                                        ? "bg-hn-green text-hn-dark shadow-lg shadow-hn-green/20" 
                                        : "bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/40"
                                }`}
                                title={watched ? "Mark as unwatched" : "Mark as watched"}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
