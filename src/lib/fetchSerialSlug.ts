import * as cheerio from "cheerio";

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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`https://v1.animasu.app/anime/${slug}/`, {
            signal: controller.signal,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
            // Don't let Next.js cache these scraper requests
            cache: "no-store",
        });

        clearTimeout(timeout);

        if (!res.ok) return null;

        const html = await res.text();
        const $ = cheerio.load(html);

        const href = $('a[href*="/serial/"]').attr("href");
        if (!href) return null;

        // Extract the slug from a URL like https://v1.animasu.app/serial/monogatari/
        const match = href.match(/\/serial\/([^/]+)/);
        return match ? match[1] : null;
    } catch {
        // Timeout, network error, or any other failure — fail silently
        return null;
    }
}
