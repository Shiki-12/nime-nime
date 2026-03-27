import Image from "next/image";
import Link from "next/link";
import {
  fetchHentaiRssFeed,
  groupHentaiBySeries,
  scrapeHentaiCover,
} from "@/lib/hentaiApi";
import type { HentaiSeries } from "@/types/hentai";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Search Hentai — NimeNime",
  robots: { index: false, follow: false },
};

interface HentaiSearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HentaiSearchPage({
  searchParams,
}: HentaiSearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  let results: HentaiSeries[] = [];
  let paginatedSeries: HentaiSeries[] = [];
  let totalPages = 1;
  let safePage = 1;

  if (query) {
    try {
      const rssItems = await fetchHentaiRssFeed();
      const allSeries = groupHentaiBySeries(rssItems);
      const lowerQ = query.toLowerCase();
      results = allSeries.filter((s) =>
        s.seriesTitle.toLowerCase().includes(lowerQ)
      );

      const ITEMS_PER_PAGE = 20;
      const currentPage = Math.max(1, Number(params.page) || 1);
      totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
      safePage = Math.min(currentPage, totalPages);
      const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
      paginatedSeries = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      if (paginatedSeries.length > 0) {
        paginatedSeries = await Promise.all(
          paginatedSeries.map(async (series) => {
            try {
              const scrapedUrl = await scrapeHentaiCover(series.episodes[0].slug);
              if (scrapedUrl) return { ...series, coverImage: scrapedUrl };
            } catch {}
            return series;
          })
        );
      }
    } catch {
      // Graceful fallback
    }
  }

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
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
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center flex-wrap gap-2.5">
        <div className="h-6 w-1 rounded-full bg-hn-primary" />
        <h1 className="text-2xl font-bold text-hn-text">
          {query ? `Search: "${query}"` : "Search Hentai"}
        </h1>
        <span className="text-xs text-hn-text/30">
          {query ? `${results.length} result${results.length !== 1 ? "s" : ""}` : ""}
        </span>
        <div className="ml-auto w-full flex items-center justify-end sm:w-auto mt-2 sm:mt-0 gap-3">
          <Link
            href="/hentai"
            className="text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
          >
            ← Back to Collection
          </Link>
        </div>
      </div>

      {/* No query */}
      {!query && (
        <div className="py-20 text-center">
          <p className="text-sm text-hn-text/40">
            Use the search bar above to find hentai series.
          </p>
        </div>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-hn-text/40">
            No series found matching &quot;{query}&quot;.
          </p>
        </div>
      )}

      {/* Results grid */}
      {paginatedSeries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {paginatedSeries.map((series) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {safePage > 1 ? (
            <Link
              href={`/hentai/search?q=${encodeURIComponent(query)}&page=${safePage - 1}`}
              className="rounded-lg bg-hn-text/[0.06] px-4 py-2 text-[13px] font-medium text-hn-text/60 backdrop-blur-sm transition-colors hover:bg-hn-text/[0.12] hover:text-hn-text"
            >
              ← Prev
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg bg-hn-text/[0.03] px-4 py-2 text-[13px] font-medium text-hn-text/20">
              ← Prev
            </span>
          )}

          {getPageNumbers().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-[13px] text-hn-text/30">…</span>
            ) : (
              <Link
                key={page}
                href={`/hentai/search?q=${encodeURIComponent(query)}&page=${page}`}
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
              href={`/hentai/search?q=${encodeURIComponent(query)}&page=${safePage + 1}`}
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
