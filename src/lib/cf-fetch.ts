/**
 * ─── Cloudflare-Aware Fetch Utility ─────────────────────────────────
 *
 * A shared HTML fetcher for all scrapers that hit ANIME_HTML_URL
 * (v1.animasu.work).  Implements a layered bypass strategy:
 *
 *   Layer 1 → Direct fetch with spoofed browser headers (free & fast)
 *   Layer 2 → Scraper API proxy when Cloudflare challenge is detected
 *   Layer 3 → Throw / graceful degradation (caller decides)
 *
 * Supports two providers (switchable via SCRAPER_PROVIDER env var):
 *   • ScraperAPI  – 5,000 free req/month, `render=true`
 *   • ZenRows     – 1,000 free req/month, `antibot=true`
 *
 * Usage:
 *   const html = await cfFetchHtml("https://v1.animasu.work/serial/one-piece/");
 *   const $ = cheerio.load(html);
 */

import { BROWSER_HEADERS } from "@/lib/fetcher";
import { SCRAPER_API_KEY, SCRAPER_PROVIDER } from "@/lib/config";

// ─── Cloudflare Detection ──────────────────────────────────────────

/**
 * Heuristics to detect a Cloudflare challenge / block page.
 * We check multiple signals because CF pages vary by protection level.
 */
function isCloudflareChallenged(status: number, html: string): boolean {
    // Status-based: CF typically returns 403 or 503 for challenge pages
    const isChallengeStatus = status === 403 || status === 503;

    // Content-based: known CF challenge page fingerprints
    const cfSignatures = [
        "<title>Just a moment...</title>",
        "cf-browser-verification",
        "cf_chl_opt",
        "challenge-platform",
        "/cdn-cgi/challenge-platform/",
        "Checking your browser",
        "Attention Required! | Cloudflare",
        "_cf_chl_tk",
    ];

    const hasSignature = cfSignatures.some((sig) =>
        html.includes(sig)
    );

    return isChallengeStatus && hasSignature;
}

// ─── Provider URL Builders ─────────────────────────────────────────

function buildScraperApiUrl(targetUrl: string, apiKey: string): string {
    const params = new URLSearchParams({
        api_key: apiKey,
        url: targetUrl,
        render: "true", // Enable JS rendering to solve CF challenge
    });
    return `https://api.scraperapi.com?${params.toString()}`;
}

function buildZenRowsUrl(targetUrl: string, apiKey: string): string {
    const params = new URLSearchParams({
        apikey: apiKey,
        url: targetUrl,
        js_render: "true",
        antibot: "true", // Dedicated Cloudflare bypass
    });
    return `https://api.zenrows.com/v1/?${params.toString()}`;
}

function buildProxyUrl(targetUrl: string, apiKey: string): string {
    switch (SCRAPER_PROVIDER) {
        case "zenrows":
            return buildZenRowsUrl(targetUrl, apiKey);
        case "scraperapi":
        default:
            return buildScraperApiUrl(targetUrl, apiKey);
    }
}

// ─── Main Fetch Function ───────────────────────────────────────────

/** Minimum timeout for proxy requests (ScraperAPI needs 15-30s to solve CF challenges) */
const PROXY_TIMEOUT_MS = 60_000;

export interface CfFetchOptions {
    /** Timeout in milliseconds for direct fetch attempts. Default: 15000 */
    timeoutMs?: number;
    /** If true, skip the direct fetch and go straight to Scraper API. Default: false */
    forceProxy?: boolean;
}

/**
 * Fetch raw HTML from a URL with Cloudflare bypass capability.
 *
 * @param url  - The target URL to fetch HTML from.
 * @param opts - Optional configuration.
 * @returns    - The raw HTML string, ready for cheerio.load().
 * @throws    - If all layers fail.
 */
export async function cfFetchHtml(
    url: string,
    opts: CfFetchOptions = {}
): Promise<string> {
    const { timeoutMs = 15_000, forceProxy = false } = opts;

    // ── Layer 1: Direct fetch ───────────────────────────────────────
    if (!forceProxy) {
        try {
            const html = await _directFetch(url, timeoutMs);
            if (html !== null) {
                console.log("[cf-fetch] ✓ Direct fetch succeeded for:", url);
                return html;
            }
            // html === null means CF challenge detected → fall through
        } catch (err) {
            console.warn("[cf-fetch] Direct fetch error:", (err as Error).message);
            // Fall through to Layer 2
        }
    }

    // ── Layer 2: Scraper API proxy ──────────────────────────────────
    if (SCRAPER_API_KEY) {
        try {
            const html = await _proxyFetch(url, timeoutMs);
            console.log("[cf-fetch] ✓ Proxy fetch succeeded for:", url);
            return html;
        } catch (err) {
            console.error(
                "[cf-fetch] ✗ Proxy fetch failed:",
                (err as Error).message
            );
        }
    } else {
        console.warn(
            "[cf-fetch] ⚠ SCRAPER_API_KEY not set — cannot bypass Cloudflare.",
            "Set SCRAPER_API_KEY in .env to enable Scraper API fallback."
        );
    }

    // ── Layer 3: Give up ────────────────────────────────────────────
    throw new Error(
        `[cf-fetch] All fetch layers failed for: ${url}. ` +
            (SCRAPER_API_KEY
                ? "Both direct and proxy fetches failed."
                : "Direct fetch hit Cloudflare and no SCRAPER_API_KEY is configured.")
    );
}

// ─── Internal: Direct Fetch ────────────────────────────────────────

/**
 * Attempt a direct fetch with browser-spoofed headers.
 * Returns the HTML string on success, or null if a CF challenge is detected.
 */
async function _directFetch(
    url: string,
    timeoutMs: number
): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                ...BROWSER_HEADERS,
                // Override Accept for HTML pages
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            cache: "no-store",
        });

        const html = await res.text();

        // Check for Cloudflare challenge
        if (isCloudflareChallenged(res.status, html)) {
            console.warn(
                `[cf-fetch] Cloudflare challenge detected (HTTP ${res.status}) for:`,
                url
            );
            return null; // Signal to try proxy
        }

        // Non-CF error
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} — ${url}`);
        }

        return html;
    } finally {
        clearTimeout(timeout);
    }
}

// ─── Internal: Proxy Fetch ─────────────────────────────────────────

/**
 * Fetch via the configured Scraper API provider.
 * The provider handles JS rendering and Cloudflare bypass.
 */
async function _proxyFetch(url: string, timeoutMs: number): Promise<string> {
    const proxyUrl = buildProxyUrl(url, SCRAPER_API_KEY);

    console.log(
        `[cf-fetch] Routing through ${SCRAPER_PROVIDER} proxy for:`,
        url
    );

    const controller = new AbortController();
    // Proxy requests need 15-30s for JS rendering + CF challenge solving;
    // use a fixed 60s floor so short caller timeouts (e.g. 8s) don't abort prematurely
    const proxyTimeout = Math.max(timeoutMs, PROXY_TIMEOUT_MS);
    const timeout = setTimeout(() => controller.abort(), proxyTimeout);

    try {
        const res = await fetch(proxyUrl, {
            signal: controller.signal,
            cache: "no-store",
        });

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(
                `${SCRAPER_PROVIDER} returned HTTP ${res.status}: ${body.slice(0, 200)}`
            );
        }

        const html = await res.text();

        // Sanity check: make sure the proxy didn't return a CF page itself
        if (isCloudflareChallenged(200, html)) {
            throw new Error(
                `${SCRAPER_PROVIDER} proxy returned a Cloudflare challenge page — the provider may not support this site.`
            );
        }

        return html;
    } finally {
        clearTimeout(timeout);
    }
}
