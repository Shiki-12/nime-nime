"use client";

import { useState, useEffect } from "react";
import { cleanTitle } from "@/lib/jikanFetch";

// ─── Types ──────────────────────────────────────────────────────────
interface JikanSearchResponse {
    data?: { score?: number; mal_id?: number }[];
}

interface JikanAnimeResponse {
    data?: { score?: number };
}

interface MalRatingCardProps {
    /** MAL anime ID — if available, used for a direct lookup (faster, more accurate). */
    malId?: number;
    /** Anime title — used as a fallback if `malId` is not available. */
    fallbackTitle: string;
}

// ─── Constants ──────────────────────────────────────────────────────
const JIKAN_BASE = "https://api.jikan.moe/v4";
const MAX_RETRIES = 3;
const RETRYABLE_CODES = new Set([429, 500, 503]);

/** Simple async sleep (ms). */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Client-side Jikan fetch with exponential back-off.
 * Mirrors the server-side `jikanFetch` but runs in the browser,
 * so it uses the **user's IP** and bypasses the server rate-limit entirely.
 */
async function clientJikanFetch<T>(
    path: string,
    signal?: AbortSignal
): Promise<T> {
    const url = `${JIKAN_BASE}${path}`;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const res = await fetch(url, {
            signal,
            headers: { Accept: "application/json" },
        });

        if (res.ok) return (await res.json()) as T;

        if (RETRYABLE_CODES.has(res.status)) {
            const delay = Math.pow(2, attempt) * 1000; // 1 s, 2 s, 4 s
            await sleep(delay);
            continue;
        }

        throw new Error(`[MalRatingCard] ${res.status} ${res.statusText}`);
    }

    throw new Error(`[MalRatingCard] All ${MAX_RETRIES} retries exhausted`);
}

// ─── Component ──────────────────────────────────────────────────────

export default function MalRatingCard({
    malId,
    fallbackTitle,
}: MalRatingCardProps) {
    const [score, setScore] = useState<string | null>(null); // null = loading
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchRating() {
            try {
                let rating: number | undefined;

                if (malId) {
                    // ── Direct lookup by MAL ID ────────────────────
                    const data = await clientJikanFetch<JikanAnimeResponse>(
                        `/anime/${malId}`,
                        controller.signal
                    );
                    rating = data?.data?.score;
                } else {
                    // ── Fallback: search by cleaned title ──────────
                    const cleaned = cleanTitle(fallbackTitle);
                    const data = await clientJikanFetch<JikanSearchResponse>(
                        `/anime?q=${encodeURIComponent(cleaned)}&limit=1`,
                        controller.signal
                    );
                    rating = data?.data?.[0]?.score;
                }

                setScore(rating != null ? String(rating) : "N/A");
            } catch (err: unknown) {
                if (
                    err instanceof DOMException &&
                    err.name === "AbortError"
                )
                    return;
                setFailed(true);
            }
        }

        fetchRating();
        return () => controller.abort();
    }, [malId, fallbackTitle]);

    // ── Skeleton ────────────────────────────────────────────────────
    if (score === null && !failed) {
        return (
            <div className="rounded-lg bg-hn-card p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                    Rating MAL
                </p>
                <div className="mt-2 h-5 w-12 animate-pulse rounded bg-white/[0.06]" />
            </div>
        );
    }

    // ── Loaded / Failed ─────────────────────────────────────────────
    return (
        <div className="rounded-lg bg-hn-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Rating MAL
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
                {failed ? "N/A" : score}
            </p>
        </div>
    );
}
