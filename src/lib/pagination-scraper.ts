/**
 * ─── Cached TotalPages Extractor ──────────────────────────────────────
 *
 * Performs a lightweight HTML fetch directly against the Animasu website
 * to extract the last page number from its pagination DOM.
 *
 * Results are cached for 6 hours per unique key (query / genre slug)
 * via Next.js `unstable_cache` to avoid rate-limiting and latency.
 */

import { unstable_cache } from "next/cache";
import * as cheerio from "cheerio";
import { BROWSER_HEADERS } from "@/lib/fetcher";

const ANIMASU_BASE = "https://v1.animasu.app";

/**
 * Internal: fetch the raw HTML and extract the highest page number
 * from the pagination container.
 *
 * Animasu pagination structure uses links with `/page/N/` in the href.
 * Example anchors: <a href="…/page/2/?s=naruto">2</a>
 *
 * We extract all numbers from those hrefs and return the max.
 */
async function _scrapeTotalPages(url: string): Promise<number> {
    try {
        const res = await fetch(url, {
            headers: BROWSER_HEADERS,
            next: { revalidate: 21600 }, // 6-hour HTTP cache as secondary layer
        });

        if (!res.ok) return 1;

        const html = await res.text();
        const $ = cheerio.load(html);

        // Collect all page numbers from pagination anchors
        const pageNumbers: number[] = [];

        // Strategy 1: Parse hrefs containing /page/N/
        $("a[href*='/page/']").each((_, el) => {
            const href = $(el).attr("href") || "";
            const match = href.match(/\/page\/(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num)) pageNumbers.push(num);
            }
        });

        // Strategy 2: Also check text content of common pagination containers
        $(".page-numbers, .pagination, .nav-links")
            .find("a, span")
            .each((_, el) => {
                const text = $(el).text().trim();
                const num = parseInt(text, 10);
                if (!isNaN(num)) pageNumbers.push(num);
            });

        if (pageNumbers.length === 0) return 1;

        return Math.max(...pageNumbers);
    } catch {
        // Silently fail — default to 1 so the UI degrades gracefully
        return 1;
    }
}

/**
 * Get the total pages for an Animasu **search** query.
 * Cached for 6 hours per query string.
 *
 * URL pattern: https://v1.animasu.app/?s={query}
 */
export const fetchSearchTotalPages = (query: string): Promise<number> =>
    unstable_cache(
        () => _scrapeTotalPages(`${ANIMASU_BASE}/?s=${encodeURIComponent(query)}`),
        [`pagination-search-${query.toLowerCase().trim()}`],
        { revalidate: 21600, tags: ["pagination"] }
    )();

/**
 * Get the total pages for an Animasu **genre** listing.
 * Cached for 6 hours per genre slug.
 *
 * URL pattern: https://v1.animasu.app/genre/{slug}/
 */
export const fetchGenreTotalPages = (genreSlug: string): Promise<number> =>
    unstable_cache(
        () => _scrapeTotalPages(`${ANIMASU_BASE}/genre/${genreSlug}/`),
        [`pagination-genre-${genreSlug}`],
        { revalidate: 21600, tags: ["pagination"] }
    )();
