"use client";

import Link from "next/link";
import type { EpisodeItem } from "@/types/anime";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface SidebarEpisodeListProps {
    episodes: EpisodeItem[];
    currentEpisodeSlug: string;
    animeSlug: string;
    animeTitle: string;
    animePoster: string;
    animeType: string;
}

export default function SidebarEpisodeList({
    episodes,
    currentEpisodeSlug,
    animeSlug,
    animeTitle,
    animePoster,
    animeType,
}: SidebarEpisodeListProps) {
    const { isEpisodeWatched, toggleEpisodeWatched } = useWatchHistory();

    return (
        <aside className="hidden lg:block">
            <div className="sticky top-[76px] rounded-lg bg-hn-card p-3">
                <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-white">Episodes</h3>
                    <span className="rounded bg-hn-primary/15 px-2 py-0.5 text-[10px] font-bold text-hn-primary">
                        {episodes.length}
                    </span>
                </div>
                <div className="max-h-[calc(100vh-180px)] space-y-1 overflow-y-auto pr-1 scrollbar-thin">
                    {episodes.map((ep) => {
                        const isActive = ep.slug === currentEpisodeSlug;
                        const watched =
                            !isActive &&
                            animeSlug != null &&
                            isEpisodeWatched(animeSlug, ep.slug);
                        const href = animeSlug
                            ? `/anime/watch/${ep.slug}?anime=${animeSlug}`
                            : `/anime/watch/${ep.slug}`;

                        return (
                            <div key={ep.slug} className="group relative">
                                <Link
                                    href={href}
                                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-[12px] font-medium transition-all ${
                                        isActive
                                            ? "bg-hn-primary text-hn-dark"
                                            : watched
                                              ? "bg-white/[0.03] text-white/30"
                                              : "text-white/50 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {watched ? (
                                        <svg className="h-3 w-3 shrink-0 text-hn-green" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    ) : (
                                        <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                                            { slug: animeSlug, title: animeTitle, poster: animePoster, type: animeType },
                                            { slug: ep.slug, name: ep.name }
                                        );
                                    }}
                                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                                        watched 
                                            ? "bg-hn-green text-hn-dark opacity-100" 
                                            : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white"
                                    }`}
                                >
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
