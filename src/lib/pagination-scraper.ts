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
import { ANIME_HTML_URL } from "@/lib/config";
import { cfFetchHtml } from "@/lib/cf-fetch";

const ANIMASU_BASE = ANIME_HTML_URL;

/**
 * Internal: fetch the raw HTML and extract the highest page number
 * from the pagination container.
 *
 * Uses multiple extraction strategies for robustness:
 *  1. Regex scan of ALL hrefs containing /page/N/
 *  2. Text content of pagination container elements
 *  3. Global regex fallback across the full HTML body
 */
async function _scrapeTotalPages(url: string): Promise<number> {
    try {
        console.log("[pagination-scraper] Fetching:", url);

        const html = await cfFetchHtml(url);
        const $ = cheerio.load(html);

        // Collect all page numbers from every extraction strategy
        const pageNumbers: number[] = [];

        // ── Strategy 1: Parse ALL hrefs containing /page/N/ ──────────
        $("a").each((_, el) => {
            const href = $(el).attr("href") || "";
            const match = href.match(/\/page\/(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > 0) pageNumbers.push(num);
            }
        });

        // ── Strategy 2: Text content of pagination containers ────────
        $(".page-numbers, .pagination, .nav-links, .paginator")
            .find("a, span")
            .each((_, el) => {
                const text = $(el).text().trim();
                const num = parseInt(text, 10);
                if (!isNaN(num) && num > 0) pageNumbers.push(num);
            });

        // ── Strategy 3: Global regex fallback on raw HTML ────────────
        // Catches pagination links even if not in a standard container
        const globalMatches = html.matchAll(/\/page\/(\d+)\/?/g);
        for (const m of globalMatches) {
            const num = parseInt(m[1], 10);
            if (!isNaN(num) && num > 0) pageNumbers.push(num);
        }

        const maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;

        console.log(
            "[pagination-scraper] URL:", url,
            "| Found", pageNumbers.length, "page refs",
            "| Max page:", maxPage
        );

        return maxPage;
    } catch (err) {
        console.error("[pagination-scraper] Scrape failed for:", url, err);
        // Silently fail — default to 1 so the UI degrades gracefully
        return 1;
    }
}

/**
 * Get the total pages for an Animasu **search** query.
 * Cached for 6 hours per query string.
 *
 * URL pattern: <SCRAPER_BASE_URL>/?s={query}
 * Note: Animasu expects `+` for spaces (WordPress standard),
 * so we use encodeURIComponent then replace %20 with +.
 */
export const fetchSearchTotalPages = (query: string): Promise<number> => {
    const normalizedQuery = query.toLowerCase().trim();
    // WordPress search uses + for spaces, not %20
    const encodedQuery = encodeURIComponent(normalizedQuery).replace(/%20/g, "+");
    const scrapeUrl = `${ANIMASU_BASE}/?s=${encodedQuery}`;

    return unstable_cache(
        () => _scrapeTotalPages(scrapeUrl),
        [`pagination-search-${normalizedQuery}`],
        { revalidate: 21600, tags: ["pagination"] }
    )();
};

/**
 * Get the total pages for an Animasu **genre** listing.
 * Cached for 6 hours per genre slug.
 *
 * URL pattern: <SCRAPER_BASE_URL>/genre/{slug}/
 */
export const fetchGenreTotalPages = (genreSlug: string): Promise<number> =>
    unstable_cache(
        () => _scrapeTotalPages(`${ANIMASU_BASE}/genre/${genreSlug}/`),
        [`pagination-genre-${genreSlug}`],
        { revalidate: 21600, tags: ["pagination"] }
    )();
