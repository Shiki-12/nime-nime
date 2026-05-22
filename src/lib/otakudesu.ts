/**
 * ─── Otakudesu (Sanka Vollerei) API Integration ─────────────────────
 *
 * Cached fetcher functions for the secondary anime streaming API.
 * All functions are wrapped in `unstable_cache` with aggressive TTL
 * to respect the 50 req/min rate limit.
 *
 * Every function is fault-tolerant: errors are caught and safe
 * defaults (null / []) are returned — never throws.
 */

import { unstable_cache } from "next/cache";
import { nimeFetch } from "@/lib/fetcher";
import { OTAKUDESU_API_URL, OTAKUDESU_CACHE_TTL } from "@/lib/config";
import { getEpisodeData } from "@/lib/api";
import type {
  OtakudesuSearchResult,
  OtakudesuDetailResponse,
  OtakudesuEpisodeEntry,
  OtakudesuEpisodeResponse,
  StreamSource,
  VideoServer,
} from "@/types/anime";

/**
 * Search the Otakudesu API for an anime by title.
 *
 * Returns the first search result or `null` if no match / error.
 * Cached for at least OTAKUDESU_CACHE_TTL seconds (1 hour).
 *
 * - Rejects inputs > 200 characters (returns null without network call)
 * - Applies encodeURIComponent to the title before constructing the URL
 * - Never throws
 */
export const searchOtakudesu = unstable_cache(
  async (title: string): Promise<OtakudesuSearchResult | null> => {
    try {
      // Reject overly long inputs without making a network call
      if (!title || title.length > 200) {
        console.log("[Otakudesu] Search rejected — empty or >200 chars:", { title: title?.slice(0, 50) });
        return null;
      }

      const encoded = encodeURIComponent(title.trim());
      const res = await nimeFetch(
        `${OTAKUDESU_API_URL}/search/${encoded}`,
        false // disable ISR double-cache; unstable_cache handles it
      );

      if (!res.ok) {
        console.log("[Otakudesu] Search HTTP error:", { status: res.status, title });
        return null;
      }

      const json = await res.json();
      const result = json.data?.animeList?.[0] ?? null;
      console.log("[Otakudesu] Search result:", result ? `Found "${result.title}" (animeId: ${result.animeId}, slug: ${result.slug})` : "No match");
      return result;
    } catch (error) {
      console.error("[Otakudesu Error] searchOtakudesu:", error);
      return null;
    }
  },
  ["otakudesu-search"],
  { revalidate: OTAKUDESU_CACHE_TTL }
);

/**
 * Fetch anime detail (episode list) from Otakudesu by slug.
 *
 * Returns the episode list array, or an empty array on any error.
 * Result is cached for at least OTAKUDESU_CACHE_TTL seconds.
 */
export const getOtakudesuDetail = unstable_cache(
  async (slug: string): Promise<OtakudesuEpisodeEntry[]> => {
    try {
      const encoded = encodeURIComponent(slug);
      const res = await nimeFetch(
        `${OTAKUDESU_API_URL}/anime/${encoded}`,
        false
      );
      if (!res.ok) {
        console.log("[Otakudesu] Detail HTTP error:", { status: res.status, slug });
        return [];
      }
      const json: OtakudesuDetailResponse = await res.json();
      const episodes = json.data?.episodeList ?? [];
      console.log("[Otakudesu] Detail fetched. Episodes count:", episodes.length, "| slug:", slug);
      return episodes;
    } catch (error) {
      console.error("[Otakudesu Error] getOtakudesuDetail:", error);
      return [];
    }
  },
  ["otakudesu-detail"],
  { revalidate: OTAKUDESU_CACHE_TTL }
);

/**
 * Fetch episode streaming servers from Otakudesu by episodeId.
 *
 * Uses "Lazy Decryption" — instead of resolving server URLs eagerly,
 * maps each server entry to our internal API route `/api/otakudesu-server/{serverId}`
 * which performs the decryption on-demand when the user selects a server.
 *
 * Falls back to `defaultStreamingUrl` if present.
 * Returns empty array on any error. Never throws.
 * Result is cached for at least OTAKUDESU_CACHE_TTL seconds.
 */
export const getOtakudesuEpisode = unstable_cache(
  async (episodeId: string): Promise<VideoServer[]> => {
    try {
      if (!episodeId || episodeId.trim().length === 0) {
        console.log("[Otakudesu] Episode fetch skipped — empty episodeId");
        return [];
      }

      const encoded = encodeURIComponent(episodeId.trim());
      const res = await nimeFetch(
        `${OTAKUDESU_API_URL}/episode/${encoded}`,
        false
      );
      if (!res.ok) {
        console.log("[Otakudesu] Episode HTTP error:", { status: res.status, episodeId });
        return [];
      }

      const json: OtakudesuEpisodeResponse = await res.json();
      const servers: VideoServer[] = [];

      // Fallback: defaultStreamingUrl if present (unshift to front)
      const defaultUrl = json.data?.defaultStreamingUrl;
      if (
        defaultUrl &&
        typeof defaultUrl === "string" &&
        defaultUrl.trim().length > 0
      ) {
        servers.push({
          provider: "Otakudesu",
          quality: "Default",
          url: defaultUrl,
        });
      }

      // Lazy decryption: map server entries to our redirect API route
      const qualities = json.data?.server?.qualities;
      if (Array.isArray(qualities) && qualities.length > 0) {
        console.log("[Otakudesu] Mapping", qualities.length, "quality groups for episode:", episodeId);

        for (const quality of qualities) {
          const qualityTitle = quality.title || quality.quality || "Unknown";
          const serverList = quality.serverList;

          if (Array.isArray(serverList)) {
            for (const server of serverList) {
              if (server.serverId) {
                servers.push({
                  provider: `Otakudesu - ${server.title}`,
                  quality: qualityTitle,
                  url: `/api/otakudesu-server/${server.serverId}`,
                });
              }
            }
          } else if (quality.serverId) {
            // Flat structure: quality itself has a serverId
            servers.push({
              provider: `Otakudesu - ${qualityTitle}`,
              quality: qualityTitle,
              url: `/api/otakudesu-server/${quality.serverId}`,
            });
          }
        }
      }

      console.log("[Otakudesu] Episode streams found:", servers.length, "| episodeId:", episodeId);
      return servers;
    } catch (error) {
      console.error("[Otakudesu Error] getOtakudesuEpisode:", error);
      return [];
    }
  },
  ["otakudesu-episode"],
  { revalidate: OTAKUDESU_CACHE_TTL }
);

/**
 * Orchestrate the sequential Otakudesu pipeline:
 * search → detail → find episode → fetch streams.
 *
 * Matches episode by comparing the `eps` field (as string) to the
 * current episode number (also coerced to string).
 *
 * Returns an empty array at any step if no match is found.
 * Never throws — the entire pipeline is wrapped in try/catch.
 */
export async function fetchOtakudesuServers(
  animeTitle: string,
  episodeNumber: number | string
): Promise<VideoServer[]> {
  try {
    // Sanitize title: remove common suffixes that pollute search results
    const cleanTitle = animeTitle
      .replace(/(sub indo|subtitle indonesia|episode.*)/ig, '')
      .trim();

    console.log("[Otakudesu] Starting pipeline for:", { original: animeTitle, cleaned: cleanTitle, episodeNumber });

    // Step 1: Search for anime (cached)
    const searchResult = await searchOtakudesu(cleanTitle);
    console.log("[Otakudesu] Search Result:", searchResult ? "Found" : "Not Found");
    if (!searchResult) return [];

    // Step 2: Get anime detail with episode list (cached)
    const episodes = await getOtakudesuDetail(searchResult.animeId || searchResult.slug);
    console.log("[Otakudesu] Detail fetched. Episodes count:", episodes.length);
    if (episodes.length === 0) return [];

    // Step 3: Find matching episode by number (parseInt to handle type mismatch)
    const epNum = parseInt(String(episodeNumber), 10);
    const matchedEpisode = episodes.find(
      (ep) => parseInt(String(ep.eps), 10) === epNum
    );
    console.log("[Otakudesu] Matched Episode:", matchedEpisode ? `Yes (eps: ${matchedEpisode.eps}, id: ${matchedEpisode.episodeId || matchedEpisode.slug})` : `No — looking for "${epNum}" in [${episodes.slice(0, 5).map(e => e.eps).join(", ")}${episodes.length > 5 ? "..." : ""}]`);
    if (!matchedEpisode) return [];

    // Step 4: Fetch episode streaming data (cached)
    const servers = await getOtakudesuEpisode(
      matchedEpisode.episodeId || matchedEpisode.slug
    );
    console.log("[Otakudesu] Pipeline complete. Servers returned:", servers.length);
    return servers;
  } catch (error) {
    console.error("[Otakudesu Error] fetchOtakudesuServers pipeline:", error);
    return [];
  }
}

/**
 * Map primary API StreamSource entries to the unified VideoServer type.
 *
 * - Sets provider to "Animasu" for all entries
 * - Sets quality to the StreamSource name
 * - Excludes entries with empty/whitespace-only names
 * - Excludes entries with URLs not starting with http:// or https://
 *
 * Pure function — no side effects.
 */
export function mapStreamSourcesToVideoServers(
  streams: StreamSource[]
): VideoServer[] {
  return streams
    .filter((stream) => {
      const name = stream.name?.trim();
      if (!name) return false;

      const url = stream.url?.trim();
      if (!url) return false;
      if (!url.startsWith("http://") && !url.startsWith("https://")) return false;

      return true;
    })
    .map((stream) => ({
      provider: "Animasu",
      quality: stream.name,
      url: stream.url,
    }));
}

/**
 * Aggregate video servers from both the primary (Animasu) and secondary
 * (Otakudesu) APIs concurrently using Promise.allSettled.
 *
 * - Primary servers are placed before secondary servers in the result
 * - Uses AbortController with 10s timeout for primary, 5s for secondary
 * - Never throws — always returns a VideoServer[] (possibly empty)
 * - If both APIs fail or time out, returns an empty array
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.6
 */
export async function getAggregatedVideoServers(
  animeTitle: string,
  currentEpisodeNumber: number | string,
  primaryEpisodeSlug: string
): Promise<VideoServer[]> {
  try {
    // Task A: Fetch primary servers with 10s timeout
    const taskA = async (): Promise<VideoServer[]> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const episode = await getEpisodeData(primaryEpisodeSlug);
        return mapStreamSourcesToVideoServers(episode.streams ?? []);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Task B: Fetch secondary servers with 5s timeout
    const taskB = async (): Promise<VideoServer[]> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        return await fetchOtakudesuServers(animeTitle, currentEpisodeNumber);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Execute concurrently with fault tolerance
    const [resultA, resultB] = await Promise.allSettled([taskA(), taskB()]);

    // Extract successful results, default to empty array on failure
    const primaryServers =
      resultA.status === "fulfilled" ? resultA.value : [];
    const secondaryServers =
      resultB.status === "fulfilled" ? resultB.value : [];

    // Merge: primary first, secondary last
    return [...primaryServers, ...secondaryServers];
  } catch (error) {
    // Outer safety net — should never reach here, but guarantees no throw
    console.error("[Otakudesu Error] getAggregatedVideoServers outer catch:", error);
    return [];
  }
}
