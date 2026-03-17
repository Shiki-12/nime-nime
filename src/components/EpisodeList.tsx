"use client";

import Link from "next/link";
import type { EpisodeItem } from "@/types/anime";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface EpisodeListProps {
    episodes: EpisodeItem[];
    currentEpisodeSlug: string;
    animeSlug: string;
    animeTitle: string;
    animePoster: string;
    animeType: string;
}

export default function EpisodeList({
    episodes,
    currentEpisodeSlug,
    animeSlug,
    animeTitle,
    animePoster,
    animeType,
}: EpisodeListProps) {
    const { isEpisodeWatched, toggleEpisodeWatched } = useWatchHistory();

    const currentIdx = episodes.findIndex(
        (ep) => ep.slug === currentEpisodeSlug
    );

    const prevEp = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;
    const nextEp = currentIdx > 0 ? episodes[currentIdx - 1] : null;

    const buildHref = (slug: string) =>
        animeSlug
            ? `/anime/watch/${slug}?anime=${animeSlug}`
            : `/anime/watch/${slug}`;

    return (
        <div className="mt-5 space-y-4">
            {/* Prev / Next Navigation */}
            <div className="flex items-center justify-between gap-3">
                {prevEp ? (
                    <Link
                        href={buildHref(prevEp.slug)}
                        className="group flex items-center gap-2 rounded-full bg-hn-card px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-hn-card-hover"
                    >
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                        <span className="hidden sm:inline">{prevEp.name}</span>
                        <span className="sm:hidden">Prev</span>
                    </Link>
                ) : (
                    <div />
                )}

                {nextEp ? (
                    <Link
                        href={buildHref(nextEp.slug)}
                        className="group flex items-center gap-2 rounded-full bg-hn-primary px-4 py-2 text-xs font-bold text-hn-dark transition-all hover:shadow-lg hover:shadow-hn-primary/25"
                    >
                        <span className="hidden sm:inline">{nextEp.name}</span>
                        <span className="sm:hidden">Next</span>
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </Link>
                ) : (
                    <div />
                )}
            </div>

            {/* Mobile Episode List (hidden on lg where sidebar shows) */}
            <div className="lg:hidden">
                <div className="mb-2 flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-hn-primary" />
                    <h3 className="text-sm font-bold text-white">
                        All Episodes ({episodes.length})
                    </h3>
                </div>

                <div className="max-h-[280px] overflow-y-auto rounded-lg bg-hn-card p-2 scrollbar-thin">
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                        {episodes.map((ep) => {
                            const isActive = ep.slug === currentEpisodeSlug;
                            const watched =
                                !isActive &&
                                animeSlug != null &&
                                isEpisodeWatched(animeSlug, ep.slug);

                            return (
                                <div key={ep.slug} className="group relative">
                                    <Link
                                        href={buildHref(ep.slug)}
                                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-medium transition-all ${
                                            isActive
                                                ? "bg-hn-primary text-hn-dark"
                                                : watched
                                                  ? "bg-white/[0.03] text-white/30"
                                                  : "text-white/50 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        {watched ? (
                                            <svg className="h-2.5 w-2.5 shrink-0 text-hn-green" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        ) : (
                                            <svg className="h-2.5 w-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                            </svg>
                                        )}
                                        <span className="truncate">{ep.name}</span>
                                    </Link>

                                    {/* Manual Toggle */}
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
                                        className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200 ${
                                            watched 
                                                ? "bg-hn-green text-hn-dark shadow-sm" 
                                                : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100"
                                        }`}
                                    >
                                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
