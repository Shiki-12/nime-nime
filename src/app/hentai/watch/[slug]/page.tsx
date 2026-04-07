import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchHentaiDetail,
  fetchHentaiRssFeed,
  groupHentaiBySeries,
} from "@/lib/hentaiApi";
import type { HentaiRssItem } from "@/types/hentai";
import type { Metadata } from "next";

export const revalidate = 10800; // 3 hours ISR

// ─── Types ─────────────────────────────────────────────────────────

interface HentaiWatchPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic metadata ──────────────────────────────────────────────

export async function generateMetadata({
  params,
}: HentaiWatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchHentaiDetail(slug);
  const title = data?.info?.[0]?.videoname ?? slug;

  return {
    title: `${title} — NimeNime`,
    description: data?.info?.[0]?.description?.slice(0, 160) ?? "",
    robots: { index: false, follow: false },
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

function getEpisodeLabelLong(slug: string): string {
  const match = slug.match(/-(\d+)$/);
  return match ? `Episode ${match[1]}` : "Watch";
}

// ─── Page component ────────────────────────────────────────────────

export default async function HentaiWatchPage({
  params,
}: HentaiWatchPageProps) {
  const { slug } = await params;

  // Fetch episode detail
  const data = await fetchHentaiDetail(slug);
  if (!data || !data.info || data.info.length === 0) {
    return notFound();
  }

  const info = data.info[0];
  const genres = data.genres ?? [];

  // Derive base series slug
  const baseSlug = slug
    .replace(/-(episode|ep)-?\d+$/i, "")
    .replace(/-\d+$/, "");

  // Fetch sibling episodes from RSS → group → find this series
  let siblingEpisodes: HentaiRssItem[] = [];
  let seriesTitle = info.videoname;

  try {
    const rssItems = await fetchHentaiRssFeed();
    const allSeries = groupHentaiBySeries(rssItems);
    const series = allSeries.find((s) => s.baseSlug === baseSlug);

    if (series) {
      siblingEpisodes = series.episodes;
      seriesTitle = series.seriesTitle;
    }
  } catch {
    // Graceful fallback — just show the player without episode selector
  }

  const releaseDate = info.releasedate
    ? new Date(info.releasedate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const description = info.description
    ?.replace(/\\r\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  return (
    <div className="min-h-screen bg-hn-dark">
      {/* ─── Top Bar ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pt-24 lg:px-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-[13px] text-hn-text/30">
          <Link href="/" className="transition-colors hover:text-hn-primary">
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
          <Link
            href={`/hentai/series/${baseSlug}`}
            className="transition-colors hover:text-hn-primary"
          >
            {seriesTitle}
          </Link>
          <span>/</span>
          <span className="text-hn-text/50">{getEpisodeLabelLong(slug)}</span>
        </div>

        {/* Back link */}
        <Link
          href={`/hentai/series/${baseSlug}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-hn-primary/70 transition-colors hover:text-hn-primary"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to {seriesTitle}
        </Link>
      </div>

      {/* ─── Video Player ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-hn-body shadow-lg shadow-hn-primary/10">
          <iframe
            src={`https://hentaiocean.com/embed/${slug}`}
            className="h-full w-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen"
            title={info.videoname}
          />
        </div>
      </div>

      {/* ─── Episode Selector ─────────────────────────────────────── */}
      {siblingEpisodes.length > 1 && (
        <div className="mx-auto max-w-5xl px-4 pt-6 lg:px-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-hn-primary" />
            <h2 className="text-sm font-semibold text-hn-text/80">
              Episodes
            </h2>
            <span className="text-xs text-hn-text/30">
              {siblingEpisodes.length} available
            </span>
          </div>

          {/* Scrollable episode list */}
          <div className="scrollbar-thin overflow-x-auto pb-2">
            <div className="flex gap-2">
              {siblingEpisodes.map((ep, index) => {
                const isCurrent = ep.slug === slug;

                return isCurrent ? (
                  <div
                    key={ep.slug}
                    className="relative flex shrink-0 items-center gap-2.5 rounded-lg bg-hn-primary/15 p-2 ring-1 ring-hn-primary/40"
                    style={{ minWidth: "200px" }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={`https://hentaiocean.com/thumbnail/${ep.slug}.webp`}
                        alt={ep.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                      {/* Now playing indicator */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="flex items-center gap-0.5">
                          <span className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-hn-primary" style={{ animationDelay: "0ms" }} />
                          <span className="inline-block h-4 w-0.5 animate-pulse rounded-full bg-hn-primary" style={{ animationDelay: "150ms" }} />
                          <span className="inline-block h-2.5 w-0.5 animate-pulse rounded-full bg-hn-primary" style={{ animationDelay: "300ms" }} />
                          <span className="inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-hn-primary" style={{ animationDelay: "100ms" }} />
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-hn-primary">
                        ▶ Now Playing
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-hn-text/70">
                        {getEpisodeLabelLong(ep.slug)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={ep.slug}
                    href={`/hentai/watch/${ep.slug}`}
                    className="group relative flex shrink-0 items-center gap-2.5 rounded-lg bg-hn-card p-2 transition-all duration-200 hover:bg-hn-card-hover hover:ring-1 hover:ring-hn-primary/30"
                    style={{ minWidth: "200px" }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={`https://hentaiocean.com/thumbnail/${ep.slug}.webp`}
                        alt={ep.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
                        <svg
                          className="h-4 w-4 text-hn-text-muted/90"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-hn-text/80 transition-colors group-hover:text-hn-primary">
                        {getEpisodeLabelLong(ep.slug)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-hn-text/30">
                        #{index + 1}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Metadata Section ─────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 lg:px-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-hn-text md:text-3xl">
          {info.videoname}
        </h1>

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded bg-hn-nsfw px-2.5 py-1 text-xs font-bold text-hn-text">
            18+
          </span>
          <span className="rounded bg-hn-primary/15 px-2.5 py-1 text-xs font-semibold text-hn-primary">
            {info.status === 1 ? "Released" : "Upcoming"}
          </span>
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
          {info.series && (
            <span className="rounded bg-hn-secondary/15 px-2.5 py-1 text-xs font-medium text-hn-secondary">
              Series: {info.series}
            </span>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
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

        {/* Divider */}
        <div className="my-6 h-px bg-hn-text/[0.06]" />

        {/* Synopsis */}
        {description && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-hn-text/40">
              Synopsis
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-hn-text/70">
              {description}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="my-6 h-px bg-hn-text/[0.06]" />

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href={`/hentai/series/${baseSlug}`}
            className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-card-hover"
          >
            ← Back to Series
          </Link>
          <a
            href={`https://hentaiocean.com/watch/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-hn-text/10 px-5 py-2.5 text-sm font-medium text-hn-text/50 transition-all hover:border-hn-text/20 hover:text-hn-text/80"
          >
            View on HentaiOcean ↗
          </a>
        </div>
      </div>
    </div>
  );
}
