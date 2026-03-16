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
    const { history } = useWatchHistory();

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

        const entry = history[animeSlug];

        if (entry && entry.watchedEpisodes && entry.watchedEpisodes.length > 0) {
            // Use the most recently watched episode (by timestamp)
            // The hook already sets lastWatchedEpisode to the most recent one
            const lastSlug = entry.lastWatchedEpisode;
            const lastEpName = entry.lastWatchedEpisodeName;

            if (lastSlug) {
                label = lastEpName
                    ? `Continue ${lastEpName}`
                    : "Continue Watching";
                href = `/anime/watch/${lastSlug}?anime=${animeSlug}`;
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ mounted: true, href, label });
    }, [animeSlug, episodes, history]);

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
            <svg
                className="h-4 w-4 transition-transform group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
            </svg>
            {state.label}
        </Link>
    );
}
