import * as cheerio from "cheerio";
import { ANIME_HTML_URL } from "@/lib/config";
import { cfFetchHtml } from "@/lib/cf-fetch";

/**
 * Silently scrape the source website Animasu to check whether this anime
 * belongs to a franchise/serial.  Returns the serial slug (e.g. "monogatari")
 * if a link like `/serial/monogatari/` exists on the page, otherwise null.
 *
 * Designed to fail gracefully — any network error, timeout, or unexpected
 * HTML structure simply returns null without throwing.
 */
export async function fetchSerialSlug(slug: string): Promise<string | null> {
    try {
        const html = await cfFetchHtml(`${ANIME_HTML_URL}/anime/${slug}/`, {
            timeoutMs: 5000,
        });
        const $ = cheerio.load(html);

        const href = $('a[href*="/serial/"]').attr("href");
        if (!href) return null;

        // Extract the slug from a URL like <BASE_URL>/serial/monogatari/
        const match = href.match(/\/serial\/([^/]+)/);
        return match ? match[1] : null;
    } catch {
        // Timeout, network error, or any other failure — fail silently
        return null;
    }
}
