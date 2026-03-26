import Image from "next/image";
import Link from "next/link";
import {
  fetchHentaiRssFeed,
  groupHentaiBySeries,
  fetchHentaiDetail,
} from "@/lib/hentaiApi";
import type { HentaiSeries } from "@/types/hentai";
import type { Metadata } from "next";

// ─── Types ─────────────────────────────────────────────────────────

interface GenreDetailPageProps {
  params: Promise<{ genre: string }>;
}

// ─── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: GenreDetailPageProps): Promise<Metadata> {
  const { genre } = await params;
  const displayName = genre.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${displayName} Hentai — NimeNime`,
    robots: { index: false, follow: false },
  };
}

// ─── Page ──────────────────────────────────────────────────────────

export default async function HentaiGenreDetailPage({
  params,
}: GenreDetailPageProps) {
  const { genre } = await params;
  const displayName = genre.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Get all series
  const rssItems = await fetchHentaiRssFeed();
  const allSeries = groupHentaiBySeries(rssItems);

  // For each series, fetch detail and check if the genre matches.
  // To avoid hammering the API, we batch-check a subset and filter.
  // Strategy: fetch detail for each series (these are ISR cached at 3h)
  // and filter by genre.
  const matchingSeries: HentaiSeries[] = [];

  // Process in batches of 10 to avoid overwhelming the API
  const BATCH_SIZE = 10;
  for (let i = 0; i < allSeries.length; i += BATCH_SIZE) {
    const batch = allSeries.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(
      batch.map((s) => fetchHentaiDetail(s.episodes[0].slug))
    );

    for (let j = 0; j < batch.length; j++) {
      const detail = details[j];
      if (!detail?.genres) continue;

      const genreMatch = detail.genres.some(
        (g) =>
          g.genre.toLowerCase().replace(/\s+/g, "-") === genre.toLowerCase() ||
          g.genre.toLowerCase() === genre.toLowerCase().replace(/-/g, " ")
      );

      if (genreMatch) {
        matchingSeries.push(batch[j]);
      }
    }
  }

  if (matchingSeries.length === 0) {
    // Still render the page but with an empty state — don't 404
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-20 lg:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          <span className="text-hn-primary">{displayName}</span>{" "}
          <span className="text-hn-text">Hentai</span>
        </h1>
        <p className="mt-2 text-sm text-hn-text/40">
          {matchingSeries.length > 0
            ? `${matchingSeries.length} series found with the "${displayName}" genre.`
            : `Searching for series tagged with "${displayName}"...`}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/hentai/genres"
            className="rounded-full bg-hn-text/[0.06] px-4 py-1.5 text-xs font-medium text-hn-text/50 transition-colors hover:bg-hn-text/[0.1] hover:text-hn-text"
          >
            ← All Genres
          </Link>
          <Link
            href="/hentai"
            className="rounded-full bg-hn-text/[0.06] px-4 py-1.5 text-xs font-medium text-hn-text/50 transition-colors hover:bg-hn-text/[0.1] hover:text-hn-text"
          >
            ← Collection
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {matchingSeries.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-hn-text/40">
            No series found with the &quot;{displayName}&quot; genre tag.
          </p>
          <p className="mt-1 text-xs text-hn-text/20">
            Genre data relies on HentaiOcean metadata — not all series may be tagged.
          </p>
        </div>
      )}

      {/* Results grid */}
      {matchingSeries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {matchingSeries.map((series) => (
            <Link
              key={series.baseSlug}
              href={`/hentai/series/${series.baseSlug}`}
              className="group relative block overflow-hidden rounded-lg bg-hn-card transition-all duration-300 hover:ring-1 hover:ring-hn-primary/30"
            >
              <div className="relative aspect-[3/4.2] w-full overflow-hidden">
                <Image
                  src={series.coverImage}
                  alt={series.seriesTitle}
                  fill
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="card-hover-overlay absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/40 to-transparent">
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-12">
                    <span className="flex items-center gap-1.5 rounded-full bg-hn-primary px-4 py-1.5 text-xs font-bold text-hn-dark shadow-lg shadow-hn-primary/30">
                      View Series
                    </span>
                  </div>
                </div>
                <div className="absolute left-0 top-0 bg-hn-nsfw/90 px-2 py-1 text-[11px] font-bold text-hn-text backdrop-blur-sm">
                  18+
                </div>
                <span className="absolute right-0 top-0 bg-hn-primary/90 px-2 py-1 text-[10px] font-bold uppercase text-hn-dark">
                  {series.episodeCount} EP
                </span>
              </div>
              <div className="px-3 py-3">
                <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-hn-text/90 transition-colors group-hover:text-hn-primary">
                  {series.seriesTitle}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
