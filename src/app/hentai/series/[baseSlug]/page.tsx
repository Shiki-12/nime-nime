import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchHentaiRssFeed,
  groupHentaiBySeries,
  fetchHentaiDetail,
} from "@/lib/hentaiApi";
import type { Metadata } from "next";

export const revalidate = 3600; // 1 hour ISR

// ─── Types ─────────────────────────────────────────────────────────

interface SeriesDetailPageProps {
  params: Promise<{ baseSlug: string }>;
}

// ─── Dynamic metadata ──────────────────────────────────────────────

export async function generateMetadata({
  params,
}: SeriesDetailPageProps): Promise<Metadata> {
  const { baseSlug } = await params;
  const rssItems = await fetchHentaiRssFeed();
  const allSeries = groupHentaiBySeries(rssItems);
  const series = allSeries.find((s) => s.baseSlug === baseSlug);

  return {
    title: `${series?.seriesTitle ?? baseSlug} — NimeNime`,
    description: `Watch all episodes of ${series?.seriesTitle ?? baseSlug}.`,
    robots: { index: false, follow: false },
  };
}

// ─── Page component ────────────────────────────────────────────────

export default async function SeriesDetailPage({
  params,
}: SeriesDetailPageProps) {
  const { baseSlug } = await params;

  // Find the series from grouped RSS data
  const rssItems = await fetchHentaiRssFeed();
  const allSeries = groupHentaiBySeries(rssItems);
  const series = allSeries.find((s) => s.baseSlug === baseSlug);

  if (!series) return notFound();

  // Fetch detail metadata from the first episode for description/genres
  // Fetch detail metadata from the first episode for description/genres/cover
  const detail = await fetchHentaiDetail(series.episodes[0].slug);
  const info = detail?.info?.[0] ?? null;
  const genres = detail?.genres ?? [];

  // Use native high-res cover, fallback to RSS thumbnail
  const coverImage = info?.coverimg
    ? `https://hentaiocean.com/assets/cover/${info.coverimg}`
    : series.coverImage;

  const description = info?.description
    ?.replace(/\\r\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  const releaseDate = info?.releasedate
    ? new Date(info.releasedate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Extract episode number from slug for display
  function getEpisodeLabel(slug: string): string {
    const match = slug.match(/-(\d+)$/);
    return match ? `Episode ${match[1]}` : "Watch";
  }

  return (
    <div className="min-h-screen bg-hn-dark">
      {/* ─── Hero Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background blur cover */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover blur-2xl opacity-20 scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-hn-dark/60 via-hn-dark/80 to-hn-dark" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-24 lg:px-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-[13px] text-hn-text/30">
            <Link
              href="/"
              className="transition-colors hover:text-hn-primary"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/hentai"
              className="transition-colors hover:text-hn-primary"
            >
              Hentai
            </Link>
            <span>/</span>
            <span className="text-hn-text/50">{series.seriesTitle}</span>
          </div>

          <div className="flex gap-6">
            {/* Cover */}
            <div className="hidden shrink-0 sm:block">
              <div className="relative aspect-[3/4.2] w-40 overflow-hidden rounded-lg shadow-xl shadow-black/40 md:w-48">
                <Image
                  src={coverImage}
                  alt={series.seriesTitle}
                  fill
                  className="object-cover"
                  priority
                />
                {/* 18+ badge */}
                <div className="absolute left-0 top-0 bg-hn-nsfw/90 px-2 py-1 text-[11px] font-bold text-hn-text">
                  18+
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-hn-text md:text-3xl lg:text-4xl">
                {series.seriesTitle}
              </h1>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded bg-hn-nsfw px-2.5 py-1 text-xs font-bold text-hn-text">
                  18+
                </span>
                <span className="rounded bg-hn-primary/15 px-2.5 py-1 text-xs font-semibold text-hn-primary">
                  {series.episodeCount} Episode{series.episodeCount > 1 ? "s" : ""}
                </span>
                {info?.status === 1 && (
                  <span className="rounded bg-hn-green/15 px-2.5 py-1 text-xs font-semibold text-hn-green">
                    Released
                  </span>
                )}
                {releaseDate && (
                  <span className="flex items-center gap-1.5 rounded bg-hn-text/[0.06] px-2.5 py-1 text-xs text-hn-text/50">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {releaseDate}
                  </span>
                )}
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <span
                      key={g.genre}
                      className="rounded-full border border-hn-primary/20 bg-hn-primary/10 px-3 py-1 text-sm text-hn-primary"
                    >
                      {g.genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {description && (
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-hn-text/60">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Episode List ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 lg:px-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="h-5 w-1 rounded-full bg-hn-primary" />
          <h2 className="text-lg font-bold text-hn-text">Episodes</h2>
          <span className="text-xs text-hn-text/30">
            {series.episodeCount} available
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {series.episodes.map((ep, index) => (
            <Link
              key={ep.slug}
              href={`/hentai/watch/${ep.slug}`}
              className="group flex items-center gap-3 rounded-lg bg-hn-card p-3 transition-all duration-200 hover:bg-hn-card-hover hover:ring-1 hover:ring-hn-primary/30"
            >
              {/* Episode thumbnail */}
              <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={`https://hentaiocean.com/thumbnail/${ep.slug}.webp`}
                  alt={ep.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all group-hover:bg-black/10">
                  <svg
                    className="h-5 w-5 text-hn-text-muted/90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                  </svg>
                </div>
              </div>

              {/* Episode info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-hn-text/90 transition-colors group-hover:text-hn-primary">
                  {getEpisodeLabel(ep.slug)}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-hn-text/40">
                  {ep.pubDate
                    ? new Date(ep.pubDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>

              {/* Episode number badge */}
              <span className="shrink-0 rounded bg-hn-text/[0.06] px-2 py-1 text-xs font-bold text-hn-text/40">
                #{index + 1}
              </span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-hn-text/[0.06]" />

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/hentai"
            className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-card-hover"
          >
            ← Back to Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
