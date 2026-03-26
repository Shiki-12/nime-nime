/**
 * ─── Jikan API v4 — Rate-Limit-Aware Fetch Wrapper ──────────────────
 *
 * Jikan enforces 3 req/s and 60 req/min.  When the limit is hit the
 * server replies with HTTP 429.  This module wraps `fetch` with:
 *
 *   1. Exponential back-off + retry  (1 s → 2 s → 4 s, max 3 attempts)
 *   2. Automatic error propagation — if every attempt fails we **throw**
 *      so Next.js never caches a poisoned "N/A" fallback.
 */

const JIKAN_BASE = "https://api.jikan.moe/v4";
const MAX_RETRIES = 3;
const RETRYABLE_CODES = new Set([429, 500, 503]);

/** Simple async sleep (ms). */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch JSON from the Jikan API with automatic retry on rate-limit.
 *
 * @param path  – Path *after* `/v4`, e.g. `/anime?q=Naruto&limit=1`
 * @param init  – Optional extra RequestInit (signal, headers …)
 * @returns       Parsed JSON body of type `T`.
 * @throws        If every retry attempt fails.
 */
export async function jikanFetch<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const url = `${JIKAN_BASE}${path}`;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const res = await fetch(url, {
            ...init,
            headers: {
                Accept: "application/json",
                ...(init?.headers as Record<string, string> | undefined),
            },
        });

        // ── Success ────────────────────────────────────────────────
        if (res.ok) {
            return (await res.json()) as T;
        }

        // ── Retryable failure ──────────────────────────────────────
        if (RETRYABLE_CODES.has(res.status)) {
            const delay = Math.pow(2, attempt) * 1000; // 1 s, 2 s, 4 s
            console.warn(
                `[jikanFetch] ${res.status} on ${url} — retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`
            );
            await sleep(delay);
            continue;
        }

        // ── Non-retryable failure (e.g. 404) ───────────────────────
        throw new Error(
            `[jikanFetch] ${res.status} ${res.statusText} — ${url}`
        );
    }

    // All retries exhausted — throw so Next.js does NOT cache the failure.
    throw new Error(
        `[jikanFetch] All ${MAX_RETRIES} retries exhausted for ${url}`
    );
}

/**
 * Strip noise from an anime title before sending it to Jikan search.
 *
 * Removes: "Sub Indo", "Season X", "Part X", "OVA", "Specials",
 * trailing season numbers, parenthetical remarks, and excess whitespace.
 */
export function cleanTitle(raw: string): string {
    return raw
        .replace(/\s*sub\s*indo/gi, "")
        .replace(/\s*season\s*\d*/gi, "")
        .replace(/\s*part\s*\d*/gi, "")
        .replace(/\s*\bOVA\b/gi, "")
        .replace(/\s*\bSpecials?\b/gi, "")
        .replace(/\s*\(.*?\)\s*/g, " ")    // remove parenthetical text
        .replace(/\s+/g, " ")              // collapse whitespace
        .trim();
}
