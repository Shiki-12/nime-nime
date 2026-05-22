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

// ─── Multi-Server Video Aggregator ─────────────────────────────────
export interface VideoServer {
  provider: string;
  quality: string;
  url: string;
}

// ─── Otakudesu API Response Types ──────────────────────────────────
export interface OtakudesuSearchResult {
  slug: string;
  title: string;
  animeId?: string;
  poster?: string;
  genres?: string[];
  status?: string;
  rating?: string;
}

export interface OtakudesuSearchResponse {
  status: string;
  data: {
    animeList: OtakudesuSearchResult[];
  };
}

export interface OtakudesuEpisodeEntry {
  eps: string;
  slug: string;
  episodeId: string;
}

export interface OtakudesuDetailResponse {
  status: string;
  data: {
    episodeList: OtakudesuEpisodeEntry[];
  };
}

export interface OtakudesuQuality {
  quality: string;
  url: string;
  title?: string;
  serverId?: string;
  serverList?: { title: string; serverId: string }[];
}

export interface OtakudesuEpisodeResponse {
  status: string;
  data: {
    defaultStreamingUrl: string;
    server: {
      qualities: OtakudesuQuality[];
    };
  };
}

// ─── Schedule ──────────────────────────────────────────────────────
export interface ScheduleResponse {
  status: string;
  creator: string;
  source: string;
  schedule: Record<string, OngoingAnime[]>;
}
