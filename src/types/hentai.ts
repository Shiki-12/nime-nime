// ─── HentaiOcean RSS Feed Item ─────────────────────────────────────
export interface HentaiRssItem {
  slug: string;
  title: string;
  pubDate: string;
  thumbnailUrl: string;
  embedUrl: string;
}

// ─── Grouped Series ────────────────────────────────────────────────
export interface HentaiSeries {
  baseSlug: string;
  seriesTitle: string;
  coverImage: string;
  latestDate: string;
  episodeCount: number;
  episodes: HentaiRssItem[];
}

// ─── HentaiOcean Fetch API Detail ──────────────────────────────────
export interface HentaiDetailInfo {
  id: number;
  urlname: string;
  videoname: string;
  description: string;
  releasedate: string;
  uploaddate: string;
  coverimg: string;
  series: string | null;
  status: number;
  recentrelease: number;
}

export interface HentaiGenre {
  genre: string;
}

export interface HentaiDetailResponse {
  info: HentaiDetailInfo[];
  genres: HentaiGenre[];
}
