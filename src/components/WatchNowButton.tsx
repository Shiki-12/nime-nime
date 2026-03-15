"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { EpisodeItem } from "@/types/anime";

// ─── Props ─────────────────────────────────────────────────────────
interface WatchNowButtonProps {
    animeSlug: string;
    episodes: EpisodeItem[];
}

// ─── Helper: extract episode number from a slug or name ────────────
// Episode names look like "Episode 1", "Episode 12", etc.
// Episode slugs look like "some-anime-episode-3"
function extractEpisodeNumber(ep: EpisodeItem): number {
    // Try name first: "Episode 12" → 12
    const nameMatch = ep.name.match(/(\d+)/);
    if (nameMatch) return parseInt(nameMatch[1], 10);

    // Fallback: try slug trailing number
    const slugMatch = ep.slug.match(/(\d+)$/);
    if (slugMatch) return parseInt(slugMatch[1], 10);

    return 0;
}

export default function WatchNowButton({ animeSlug, episodes }: WatchNowButtonProps) {
    // Single state object set once on mount to avoid cascading renders
    const [state, setState] = useState<{
        mounted: boolean;
        href: string;
        label: string;
    }>({ mounted: false, href: "#episodes", label: "Watch Now" });

    // ── Hydration-safe: compute everything in one shot after mount ──
    useEffect(() => {
        let href = "#episodes";
        let label = "Watch Now";

        try {
            const raw = window.localStorage.getItem("nimenime-watch-history");

            if (!raw) {
                // No history at all → "Watch Now" linking to Ep 1
                if (episodes.length > 0) {
                    href = `/anime/watch/${episodes[0].slug}?anime=${animeSlug}`;
                }
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setState({ mounted: true, href, label });
                return;
            }

            const history = JSON.parse(raw) as Record<
                string,
                { watchedEpisodes?: string[] }
            >;

            const entry = history[animeSlug];

            if (!entry || !entry.watchedEpisodes || entry.watchedEpisodes.length === 0) {
                // Anime exists in history but no episodes watched → Ep 1
                if (episodes.length > 0) {
                    href = `/anime/watch/${episodes[0].slug}?anime=${animeSlug}`;
                }
                setState({ mounted: true, href, label });
                return;
            }

            // ── Scenario B: user HAS watched episodes ──────────────
            const slugToEpisode = new Map<string, EpisodeItem>();
            for (const ep of episodes) {
                slugToEpisode.set(ep.slug, ep);
            }

            // Find the highest episode NUMBER among watched slugs
            let maxEpNumber = -1;
            let maxEpSlug = episodes[0]?.slug ?? "";

            for (const watchedSlug of entry.watchedEpisodes) {
                const ep = slugToEpisode.get(watchedSlug);
                if (!ep) continue;

                const epNum = extractEpisodeNumber(ep);
                if (epNum > maxEpNumber) {
                    maxEpNumber = epNum;
                    maxEpSlug = ep.slug;
                }
            }

            if (maxEpNumber > 0) {
                label = `Continue Ep ${maxEpNumber}`;
                href = `/anime/watch/${maxEpSlug}?anime=${animeSlug}`;
            } else {
                // Fallback: couldn't parse numbers, use last watched
                const lastSlug = entry.watchedEpisodes[entry.watchedEpisodes.length - 1];
                label = "Continue Watching";
                href = `/anime/watch/${lastSlug}?anime=${animeSlug}`;
            }
        } catch {
            // localStorage parse error → fallback to Ep 1
            if (episodes.length > 0) {
                href = `/anime/watch/${episodes[0].slug}?anime=${animeSlug}`;
            }
        }

        setState({ mounted: true, href, label });
    }, [animeSlug, episodes]);

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
