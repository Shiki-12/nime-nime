/**
 * ─── Central Configuration ──────────────────────────────────────────
 *
 * Single source of truth for external anime URLs.
 *
 * We rely on **two** distinct domains:
 *   1. ANIME_API_URL  – JSON API wrapper (returns structured JSON)
 *   2. ANIME_HTML_URL – Raw source site (returns HTML, parsed with Cheerio)
 *
 * Both are read from environment variables so the domains can be
 * rotated without touching code.
 *
 * IMPORTANT: Values are guaranteed to have NO trailing slash.
 */

const rawApi = process.env.ANIME_API_URL || "https://www.sankavollerei.com/anime/animasu";
const rawHtml = process.env.ANIME_HTML_URL || "https://v1.animasu.app";
const rawOtakudesu = process.env.OTAKUDESU_API_URL || "https://www.sankavollerei.com/anime";

/** JSON API base URL — for structured data endpoints (/home, /search, /detail, etc.) */
export const ANIME_API_URL = rawApi.replace(/\/+$/, "");

/** Raw HTML base URL — for Cheerio scraping (pagination, serial pages, etc.) */
export const ANIME_HTML_URL = rawHtml.replace(/\/+$/, "");

/** Otakudesu (Sanka Vollerei) API base URL — secondary streaming provider */
export const OTAKUDESU_API_URL = rawOtakudesu.replace(/\/+$/, "");

/** Cache TTL for Otakudesu API responses in seconds (minimum 1 hour to respect 50 req/min rate limit) */
export const OTAKUDESU_CACHE_TTL = 3600;
