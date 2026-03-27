import type {
  HentaiRssItem,
  HentaiSeries,
  HentaiDetailResponse,
} from "@/types/hentai";

const HENTAI_BASE = "https://hentaiocean.com";
const FETCH_TIMEOUT = 10_000; // 10 seconds

// ─── RSS Feed Parser ───────────────────────────────────────────────

/**
 * Fetch the HentaiOcean RSS feed and parse it into a typed array.
 * Uses regex-based XML parsing to avoid external dependencies.
 */
export async function fetchHentaiRssFeed(): Promise<HentaiRssItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(`${HENTAI_BASE}/rss.xml`, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // 1 hour ISR
    });

    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    return parseRssXml(xml);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse raw RSS XML into HentaiRssItem[].
 */
function parseRssXml(xml: string): HentaiRssItem[] {
  const items: HentaiRssItem[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const slug = extractTag(block, "guid") ?? "";
    const title = extractTag(block, "title") ?? "";
    const pubDate = extractTag(block, "pubDate") ?? "";
    const embedUrl = extractTag(block, "embedUrl") ?? "";

    const thumbMatch = block.match(/media:thumbnail\s+url="([^"]+)"/);
    const thumbnailUrl = thumbMatch?.[1] ?? "";

    if (slug && title) {
      items.push({ slug, title, pubDate, thumbnailUrl, embedUrl });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// ─── Series Grouping ──────────────────────────────────────────────

/**
 * Strip trailing episode numbers from a slug.
 * Handles: "title-1", "title-episode-1", "title-ep-3"
 */
function getBaseSlug(slug: string): string {
  return slug
    .replace(/-(episode|ep)-?\d+$/i, "")
    .replace(/-\d+$/, "");
}

/**
 * Strip trailing episode numbers from a title.
 * Handles: "Title 1", "Title Episode 1", "Title - Episode 3", "Title Part 2"
 */
function getSeriesTitle(title: string): string {
  return title
    .replace(/\s*[-–—]\s*(Episode|Ep\.?|Part)\s*\d+\s*$/i, "")
    .replace(/\s+(Episode|Ep\.?|Part)\s*\d+\s*$/i, "")
    .replace(/\s+\d+\s*$/, "")
    .trim();
}

/**
 * Group individual RSS episodes into series by their base slug.
 * Returns sorted by most recent episode date.
 */
export function groupHentaiBySeries(items: HentaiRssItem[]): HentaiSeries[] {
  const seriesMap = new Map<string, HentaiSeries>();

  for (const item of items) {
    const baseSlug = getBaseSlug(item.slug);
    const seriesTitle = getSeriesTitle(item.title);

    const existing = seriesMap.get(baseSlug);

    if (existing) {
      existing.episodes.push(item);
      existing.episodeCount = existing.episodes.length;

      // Update latest date if this episode is newer
      if (item.pubDate && new Date(item.pubDate) > new Date(existing.latestDate)) {
        existing.latestDate = item.pubDate;
      }
    } else {
      seriesMap.set(baseSlug, {
        baseSlug,
        seriesTitle: seriesTitle || item.title,
        coverImage: `${HENTAI_BASE}/thumbnail/${item.slug}.webp`,
        latestDate: item.pubDate,
        episodeCount: 1,
        episodes: [item],
      });
    }
  }

  // Sort episodes within each series by slug (natural episode order)
  for (const series of seriesMap.values()) {
    series.episodes.sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }));
  }

  // Sort series by most recent update
  return Array.from(seriesMap.values()).sort(
    (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );
}

// ─── Detail Fetcher ────────────────────────────────────────────────

/**
 * Fetch full hentai detail by slug via the HentaiOcean Fetch API.
 * Returns null on failure so downstream can handle gracefully.
 */
export async function fetchHentaiDetail(
  slug: string
): Promise<HentaiDetailResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(
      `${HENTAI_BASE}/api?action=hentai&slug=${encodeURIComponent(slug)}`,
      {
        signal: controller.signal,
        next: { revalidate: 10800 }, // 3 hours ISR
      }
    );

    if (!res.ok) return null;

    const json: HentaiDetailResponse = await res.json();
    return json;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Cheerio Cover Scraper ─────────────────────────────────────────

/**
 * Scrape the actual HentaiOcean watch page to extract the real
 * high-res cover image from the og:image meta tag.
 * Returns null on any failure so the caller can fallback to the RSS thumbnail.
 */
export async function scrapeHentaiCover(slug: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(`${HENTAI_BASE}/watch/${slug}`, {
      signal: controller.signal,
      next: { revalidate: 10800 }, // 3 hours ISR cache
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Dynamic import to keep cheerio out of client bundles
    const { load } = await import("cheerio");
    const $ = load(html);

    // Priority 1: OpenGraph image
    let imageUrl =
      $('meta[property="og:image"]').attr("content") ?? null;

    // Priority 2: link[rel="image_src"]
    if (!imageUrl) {
      imageUrl = $('link[rel="image_src"]').attr("href") ?? null;
    }

    // Priority 3: First img with src containing "cover" or "poster"
    if (!imageUrl) {
      $("img").each((_i, el) => {
        const src = $(el).attr("src") ?? "";
        if (
          src.includes("cover") ||
          src.includes("poster") ||
          src.includes("thumbnail")
        ) {
          imageUrl = src;
          return false; // break
        }
      });
    }

    if (!imageUrl) return null;

    // Ensure absolute URL
    if (imageUrl.startsWith("//")) {
      imageUrl = `https:${imageUrl}`;
    } else if (imageUrl.startsWith("/")) {
      imageUrl = `${HENTAI_BASE}${imageUrl}`;
    }

    return imageUrl;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

