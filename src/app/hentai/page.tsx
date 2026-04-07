import Image from "next/image";
import Link from "next/link";
import {
  fetchHentaiRssFeed,
  groupHentaiBySeries,
  fetchHentaiDetail,
} from "@/lib/hentaiApi";
import type { HentaiSeries } from "@/types/hentai";
import type { Metadata } from "next";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "Hentai Collection — NimeNime",
  description:
    "Browse the latest hentai anime series, updated daily from HentaiOcean.",
  robots: { index: false, follow: false },
};

const ITEMS_PER_PAGE = 10;

// ─── Inline card component (scoped to this route) ──────────────────

function SeriesCard({ series }: { series: HentaiSeries }) {
  const formattedDate = series.latestDate
    ? new Date(series.latestDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={`/hentai/series/${series.baseSlug}`}
      className="group relative block overflow-hidden rounded-lg bg-hn-card transition-all duration-300 hover:ring-1 hover:ring-hn-primary/30"
    >
      {/* Cover image */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden">
        <Image
          src={series.coverImage}
          alt={series.seriesTitle}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="card-hover-overlay absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/40 to-transparent">
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-12">
            <span className="flex items-center gap-1.5 rounded-full bg-hn-primary px-4 py-1.5 text-xs font-bold text-hn-dark shadow-lg shadow-hn-primary/30">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
              </svg>
              View Series
            </span>
          </div>
        </div>

        {/* 18+ badge (top-left) */}
        <div className="absolute left-0 top-0 flex items-center gap-1 bg-hn-nsfw/90 px-2 py-1 text-[11px] font-bold text-hn-text backdrop-blur-sm">
          18+
        </div>

        {/* Episode count (top-right) */}
        <span className="absolute right-0 top-0 bg-hn-primary/90 px-2 py-1 text-[10px] font-bold uppercase text-hn-dark">
          {series.episodeCount} EP
        </span>

        {/* Date badge (bottom-right) */}
        {formattedDate && (
          <span className="absolute bottom-1 right-1 rounded bg-hn-dark/80 px-1.5 py-0.5 text-[10px] text-hn-text/60 backdrop-blur-sm">
            {formattedDate}
          </span>
        )}
      </div>

      {/* Title */}
      <div className="px-3 py-3">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-hn-text/90 transition-colors group-hover:text-hn-primary">
          {series.seriesTitle}
        </h3>
      </div>
    </Link>
  );
}

// ─── Page component ────────────────────────────────────────────────

interface HentaiPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HentaiPage({ searchParams }: HentaiPageProps) {
  const params = await searchParams;
  let allSeries: HentaiSeries[] = [];
  let fetchError: string | null = null;

  try {
    const rssItems = await fetchHentaiRssFeed();
    allSeries = groupHentaiBySeries(rssItems);
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to fetch hentai data.";
  }

  // Pagination logic
  const currentPage = Math.max(1, Number(params.page) || 1);
  const totalPages = Math.max(1, Math.ceil(allSeries.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  let paginatedSeries = allSeries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ── Native API cover fetch (parallel for 10 paginated items only) ──
  if (paginatedSeries.length > 0) {
    const upgraded = await Promise.all(
      paginatedSeries.map(async (series) => {
        try {
          const detail = await fetchHentaiDetail(series.episodes[0].slug);
          const coverimg = detail?.info?.[0]?.coverimg;
          if (coverimg) {
            const highResCover = `https://hentaiocean.com/assets/cover/${coverimg}`;
            return { ...series, coverImage: highResCover };
          }
        } catch {
          // Fallback to RSS thumbnail
        }
        return series;
      })
    );
    paginatedSeries = upgraded;
  }

  // Build visible page numbers (max 7 with ellipsis)
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (safePage > 3) pages.push("...");
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-20 lg:px-6">
      {/* ── Hero Header ───────────────────────────────────────────── */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          <span className="text-hn-primary">Hentai</span>{" "}
          <span className="text-hn-text">Collection</span>
        </h1>
        <p className="mt-2 text-sm text-hn-text-muted">
          The highest rated adult anime series right now.
        </p>
        {allSeries.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-hn-text-muted">
            <span className="rounded-full bg-hn-text/[0.06] px-3 py-1">
              {allSeries.length} series
            </span>
            <span className="rounded-full bg-hn-text/[0.06] px-3 py-1">
              Page {safePage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="mx-auto mb-10 max-w-xl rounded-xl border border-hn-nsfw/20 bg-hn-nsfw-muted p-6 text-center">
          <h3 className="text-lg font-bold text-hn-text">API Unavailable</h3>
          <p className="mt-1 text-sm text-hn-text/50">
            The HentaiOcean API server is currently unreachable.
          </p>
          <p className="mt-2 break-all text-xs text-hn-text/20">{fetchError}</p>
          <Link
            href="/hentai"
            className="mt-4 inline-block rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark"
          >
            Try again
          </Link>
        </div>
      )}

      {/* Empty state */}
      {!fetchError && allSeries.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-hn-text-muted">No series found.</p>
        </div>
      )}

      {/* Grid */}
      {paginatedSeries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {paginatedSeries.map((series) => (
            <SeriesCard key={series.baseSlug} series={series} />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {safePage > 1 ? (
            <Link
              href={`/hentai?page=${safePage - 1}`}
              className="rounded-lg bg-hn-text/[0.06] px-4 py-2 text-[13px] font-medium text-hn-text/60 backdrop-blur-sm transition-colors hover:bg-hn-text/[0.12] hover:text-hn-text"
            >
              ← Previous
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg bg-hn-text/[0.03] px-4 py-2 text-[13px] font-medium text-hn-text/20">
              ← Previous
            </span>
          )}

          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-[13px] text-hn-text/30"
              >
                …
              </span>
            ) : (
              <Link
                key={page}
                href={`/hentai?page=${page}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                  page === safePage
                    ? "bg-hn-primary text-hn-dark shadow-lg shadow-hn-primary/30"
                    : "bg-hn-text/[0.06] text-hn-text/60 hover:bg-hn-text/[0.12] hover:text-hn-text"
                }`}
              >
                {page}
              </Link>
            )
          )}

          {safePage < totalPages ? (
            <Link
              href={`/hentai?page=${safePage + 1}`}
              className="rounded-lg bg-hn-text/[0.06] px-4 py-2 text-[13px] font-medium text-hn-text/60 backdrop-blur-sm transition-colors hover:bg-hn-text/[0.12] hover:text-hn-text"
            >
              Next →
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg bg-hn-text/[0.03] px-4 py-2 text-[13px] font-medium text-hn-text/20">
              Next →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
