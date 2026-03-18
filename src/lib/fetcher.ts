/**
 * ─── Anti-403 Browser-Spoofing Fetch Wrapper ────────────────────────
 *
 * GCP datacenter IPs are blocked by the target API's WAF (Cloudflare)
 * because bare `fetch` lacks browser-like headers.
 *
 * This module exports:
 *   • BROWSER_HEADERS  – a flat headers object for use in API routes
 *   • nimeFetch(url, revalidate?)  – a drop-in `fetch` wrapper for
 *     Next.js server components / lib functions that adds spoofing
 *     headers + ISR caching via `next: { revalidate }`.
 */

/** Realistic Chrome 124 / Windows 10 header set. */
export const BROWSER_HEADERS: Record<string, string> = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.google.com/",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Ch-Ua":
        '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
    Pragma: "no-cache",
};

/**
 * Fetch wrapper that injects browser-spoofing headers and configures
 * Next.js App Router ISR caching.
 *
 * @param url        – Fully-qualified URL to fetch.
 * @param revalidate – Seconds until Next.js re-fetches (default 3600).
 *                     Pass `0` to always revalidate or `false` for no caching.
 * @param init       – Optional extra RequestInit (merged; headers are combined).
 */
export async function nimeFetch(
    url: string,
    revalidate: number | false = 3600,
    init?: RequestInit
): Promise<Response> {
    const { headers: extraHeaders, ...restInit } = init ?? {};

    // Merge caller-supplied headers on top of spoofing headers
    const mergedHeaders: Record<string, string> = {
        ...BROWSER_HEADERS,
        ...(extraHeaders instanceof Headers
            ? Object.fromEntries(extraHeaders.entries())
            : Array.isArray(extraHeaders)
              ? Object.fromEntries(extraHeaders)
              : (extraHeaders as Record<string, string>) ?? {}),
    };

    return fetch(url, {
        ...restInit,
        headers: mergedHeaders,
        ...(revalidate !== false ? { next: { revalidate } } : {}),
    });
}
