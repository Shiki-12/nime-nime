import type {
    AnimeListResponse,
    AnimeDetailResponse,
    EpisodeResponse,
    GenreListResponse,
    ScheduleResponse,
    OngoingAnime,
} from "@/types/anime";
import { nimeFetch } from "@/lib/fetcher";

const BASE_URL = "https://www.sankavollerei.com/anime/animasu";

/**
 * Generic fetcher with error handling, browser-spoofing headers,
 * and Next.js ISR revalidation (anti-403 on GCP).
 */
async function apiFetch<T>(
    endpoint: string,
    revalidate: number = 3600 // default: Tier 3 (1 hour)
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const res = await nimeFetch(url, revalidate);

    if (!res.ok) {
        throw new Error(
            `API Error: ${res.status} ${res.statusText} — ${url}`
        );
    }

    const json: T = await res.json();
    return json;
}

// ─── Home / Ongoing / Completed ────────────────────────────────────

export async function getHomeAnime(
    page: number = 1
): Promise<AnimeListResponse> {
    // The /home endpoint returns { ongoing: [...], recent: [...] }
    // instead of the standard { animes: [...], pagination: {...} }.
    // Normalize it so the page component can treat all tabs uniformly.
    const raw = await apiFetch<{
        status: string;
        ongoing?: OngoingAnime[];
        recent?: OngoingAnime[];
    }>(`/home?page=${page}`, 1800); // Tier 3: 30 minutes (ongoing feeds)

    return {
        status: raw.status,
        creator: "",
        source: "",
        animes: [...(raw.ongoing ?? []), ...(raw.recent ?? [])],
        pagination: { hasNext: false, hasPrev: false, currentPage: page },
    };
}

export async function getOngoingAnime(
    page: number = 1
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(`/ongoing?page=${page}`, 1800); // Tier 3: 30 minutes
}

export async function getCompletedAnime(
    page: number = 1
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(`/completed?page=${page}`, 3600); // Tier 3: 1 hour
}

// ─── Detail & Episode ──────────────────────────────────────────────

export async function getAnimeDetail(
    slug: string
): Promise<AnimeDetailResponse> {
    return apiFetch<AnimeDetailResponse>(`/detail/${slug}`, 10800); // Tier 2: 3 hours
}

export async function getEpisodeData(
    episodeSlug: string
): Promise<EpisodeResponse> {
    return apiFetch<EpisodeResponse>(`/episode/${episodeSlug}`, 10800); // Tier 2: 3 hours
}

// ─── Search ────────────────────────────────────────────────────────

export async function searchAnime(
    query: string,
    page: number = 1
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(
        `/search/${encodeURIComponent(query)}?page=${page}`,
        300 // Tier 4: 5 minutes
    );
}

// ─── Genres ────────────────────────────────────────────────────────

export async function getGenres(): Promise<GenreListResponse> {
    return apiFetch<GenreListResponse>("/genres", 86400); // Tier 1: 24 hours
}

export async function getAnimeByGenre(
    genreSlug: string,
    page: number = 1
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(
        `/genre/${genreSlug}?page=${page}`,
        86400 // Tier 1: 24 hours (genre listings are stable)
    );
}

// ─── Categories ────────────────────────────────────────────────────

export async function getMovies(
    page: number = 1
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(`/movies?page=${page}`, 86400); // Tier 1: 24 hours
}

export async function getPopularAnime(
    page: number = 1
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(`/popular?page=${page}`, 10800); // Tier 2: 3 hours
}

// ─── Schedule ──────────────────────────────────────────────────────

export async function getAnimeSchedule(): Promise<ScheduleResponse> {
    return apiFetch<ScheduleResponse>("/schedule", 1800); // Tier 3: 30 minutes
}

// ─── Advanced Search ────────────────────────────────────────────────

export async function getAdvancedSearch(
    queryString: string
): Promise<AnimeListResponse> {
    return apiFetch<AnimeListResponse>(
        `/advanced-search?${queryString}`,
        10800 // Tier 2: 3 hours
    );
}

// ─── MAL Rating (Jikan API v4) ─────────────────────────────────────

export async function getMalRating(animeTitle: string): Promise<string> {
    try {
        const res = await nimeFetch(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeTitle)}&limit=1`,
            86400
        );

        if (!res.ok) return "N/A";

        const json = await res.json();
        const score = json?.data?.[0]?.score;

        return score != null ? String(score) : "N/A";
    } catch {
        return "N/A";
    }
}
