"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { EpisodeItem } from "@/types/anime";
import { useWatchHistory } from "@/hooks/useWatchHistory";

// ─── Props ─────────────────────────────────────────────────────────
interface WatchNowButtonProps {
    animeSlug: string;
    episodes: EpisodeItem[];
}

export default function WatchNowButton({ animeSlug, episodes }: WatchNowButtonProps) {
    const { getWatchedEpisodes } = useWatchHistory();

    // Single state object set once on mount to avoid cascading renders
    const [state, setState] = useState<{
        mounted: boolean;
        href: string;
        label: string;
    }>({ mounted: false, href: "#episodes", label: "Watch Now" });

    // ── Compute link based on watch history (from hook, not raw localStorage) ──
    useEffect(() => {
        let href = "#episodes";
        let label = "Watch Now";
        if (episodes.length > 0) {
            const earliestEpisode = episodes[episodes.length - 1];
            href = `/anime/watch/${earliestEpisode.slug}?anime=${animeSlug}`;
        }

        const watchedSet = getWatchedEpisodes(animeSlug);

        if (watchedSet.size > 0) {
            const watchedCount = watchedSet.size;
            const isCompleted = watchedCount >= episodes.length && episodes.length > 0;

            if (isCompleted) {
                label = "Completed (Watch Again)";
                const firstEp = episodes[episodes.length - 1]; // First ep is at the end of the list usually (desciding)
                href = `/anime/watch/${firstEp.slug}?anime=${animeSlug}`;
            } else {
                // Find the highest watched episode in the list (assuming episodes is sorted descending)
                const lastWatchedEp = episodes.find(ep => watchedSet.has(ep.slug));

                if (lastWatchedEp) {
                    label = "Continue Watching";
                    href = `/anime/watch/${lastWatchedEp.slug}?anime=${animeSlug}`;
                }
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ mounted: true, href, label });
    }, [animeSlug, episodes, getWatchedEpisodes]);

    // ── SSR fallback: generic skeleton-style button ────────────────
    if (!state.mounted) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-hn-primary/50 px-6 py-2.5 text-sm font-bold text-hn-dark/50">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                </svg>
                Watch Now
            </span>
        );
    }

    return (
        <Link
            href={state.href}
            className="group inline-flex items-center gap-2 rounded-full bg-hn-primary px-6 py-2.5 text-sm font-bold text-hn-dark shadow-lg shadow-hn-primary/25 transition-all hover:scale-105 hover:brightness-110 hover:shadow-hn-primary/40"
        >
            {state.label.includes("Again") ? (
                <svg className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            ) : (
                <svg
                    className="h-4 w-4 transition-transform group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                </svg>
            )}
            {state.label}
        </Link>
    );
}
