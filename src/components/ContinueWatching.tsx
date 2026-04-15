"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────
export interface ContinueWatchingItem {
    animeSlug: string;
    title: string;
    image: string;
    type: string;
    episodeId: string;
    episodeName: string;
}

interface ContinueWatchingProps {
    history: ContinueWatchingItem[];
}

const EXPAND_KEY = "nimenime-cw-expanded";

export default function ContinueWatching({ history }: ContinueWatchingProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // On mount, load preference
    useEffect(() => {
        setIsMounted(true);
        if (history.length === 0) return;
        try {
            const pref = localStorage.getItem(EXPAND_KEY);
            if (pref !== null) {
                setIsExpanded(pref === "true");
            }
        } catch {
            /* silent */
        }
    }, [history.length]);

    function toggleExpand() {
        const nextState = !isExpanded;
        setIsExpanded(nextState);
        try {
            localStorage.setItem(EXPAND_KEY, String(nextState));
        } catch {
            /* silent */
        }
    }

    // Hide entirely if no history
    if (history.length === 0) return null;

    return (
        <section className="mb-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-1 rounded-full bg-hn-primary" />
                    <h2 className="text-xl font-bold text-hn-text">
                        Continue{" "}
                        <span className="text-hn-primary">Watching</span>
                    </h2>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/history"
                        className="flex items-center gap-1 text-xs font-semibold text-hn-text-muted/60 transition-colors hover:text-hn-primary"
                    >
                        See All
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
                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </Link>

                    <button
                        onClick={toggleExpand}
                        disabled={!isMounted}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-hn-text-muted/60 transition-all duration-200 hover:bg-white/5 hover:text-hn-text disabled:opacity-50"
                        aria-label={isExpanded ? "Collapse continue watching" : "Expand continue watching"}
                        aria-expanded={isExpanded}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={2.5} 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
                        >
                            <path d="m18 15-6-6-6 6"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scrollable row wrapper with smooth transition */}
            <div 
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="scrollbar-hide -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scroll-smooth"
                    >
                        {history.map((item) => (
                            <Link
                                key={`${item.animeSlug}-${item.episodeId}`}
                                href={`/anime/watch/${item.episodeId}?anime=${item.animeSlug}`}
                                className="group relative flex w-[140px] shrink-0 snap-start flex-col sm:w-[155px]"
                            >
                                {/* Poster */}
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width:640px) 140px, 155px"
                                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                                    />

                                    {/* Hover overlay with play button */}
                                    <div
                                        className="absolute inset-0 z-[5] flex items-center justify-center bg-black/0 transition-[background-color] duration-300 ease-in-out group-hover:bg-black/45"
                                        aria-hidden="true"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm opacity-60 scale-100 md:opacity-0 md:scale-50 transition-all duration-300 ease-out md:group-hover:opacity-100 md:group-hover:scale-100">
                                            <svg
                                                className="h-4.5 w-4.5 text-white ml-0.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Episode badge — bottom left */}
                                    <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-[4px] bg-hn-dark/85 px-2 py-0.5 text-[11px] font-semibold text-hn-text backdrop-blur-sm">
                                        <svg
                                            className="h-3 w-3 text-hn-primary"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                        </svg>
                                        {item.episodeName || "Unknown Episode"}
                                    </span>

                                    {/* Type badge — top right */}
                                    {item.type && (
                                        <span className="absolute right-2 top-2 z-10 rounded-[4px] bg-hn-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hn-dark shadow-sm">
                                            {item.type}
                                        </span>
                                    )}

                                    {/* Subtle progress/continue indicator line */}
                                    <div className="absolute bottom-0 left-0 right-0 z-10 h-[3px] bg-hn-primary/60" />
                                </div>

                                {/* Title */}
                                <div className="mt-2 px-0.5">
                                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-hn-text transition-colors duration-200 group-hover:text-hn-primary">
                                        {item.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
