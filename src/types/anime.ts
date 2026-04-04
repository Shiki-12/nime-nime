// ─── Ongoing / Search / Genre / Movies Anime List ─────────────────
export interface OngoingAnime {
  title: string;
  slug: string;
  poster: string;
  episode: string;
  status_or_day: string;
  type: string;
}

export interface Pagination {
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
  totalPages?: number;
}

export interface AnimeListResponse {
  status: string;
  creator: string;
  source: string;
  animes: OngoingAnime[];
  pagination: Pagination;
}

// ─── Genre List ────────────────────────────────────────────────────
export interface Genre {
  name: string;
  slug: string;
}

export interface GenreListResponse {
  status: string;
  creator: string;
  source: string;
  genres: Genre[];
}

// ─── Anime Detail ──────────────────────────────────────────────────
export interface EpisodeItem {
  name: string;
  slug: string;
}

export interface AnimeDetail {
  title: string;
  synonym: string;
  poster: string;
  rating: string;
  synopsis: string;
  trailer: string;
  genres: Genre[];
  status: string;
  aired: string;
  type: string;
  duration: string;
  author: string;
  studio: string;
  season: string;
  episodes: EpisodeItem[];
  batches: unknown[];
  characters: unknown[];
}

export interface AnimeDetailResponse {
  status: string;
  creator: string;
  source: string;
  detail: AnimeDetail;
}

// ─── Episode / Streaming ───────────────────────────────────────────
export interface StreamSource {
  name: string;
  url: string;
}

export interface EpisodeResponse {
  status: string;
  creator: string;
  source: string;
  title: string;
  streams: StreamSource[];
  downloads: unknown[];
}

// ─── Schedule ──────────────────────────────────────────────────────
export interface ScheduleResponse {
  status: string;
  creator: string;
  source: string;
  schedule: Record<string, OngoingAnime[]>;
}
