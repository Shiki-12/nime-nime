import Image from "next/image";
import Link from "next/link";
import {
  fetchHentaiRssFeed,
  groupHentaiBySeries,
} from "@/lib/hentaiApi";
import type { HentaiSeries } from "@/types/hentai";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Search Hentai — NimeNime",
  robots: { index: false, follow: false },
};

interface HentaiSearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HentaiSearchPage({
  searchParams,
}: HentaiSearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  let results: HentaiSeries[] = [];

  if (query) {
    try {
      const rssItems = await fetchHentaiRssFeed();
      const allSeries = groupHentaiBySeries(rssItems);
      const lowerQ = query.toLowerCase();
      results = allSeries.filter((s) =>
        s.seriesTitle.toLowerCase().includes(lowerQ)
      );
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="h-6 w-1 rounded-full bg-hn-primary" />
        <h1 className="text-2xl font-bold text-hn-text">
          {query ? `Search: "${query}"` : "Search Hentai"}
        </h1>
        <span className="text-xs text-hn-text/30">
          {query ? `${results.length} result${results.length !== 1 ? "s" : ""}` : ""}
        </span>
        <Link
          href="/hentai"
          className="ml-auto text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
        >
          ← Back to Collection
        </Link>
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
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((series) => (
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
