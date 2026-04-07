import { Suspense } from "react";
import Link from "next/link";
import { getAdvancedSearch } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import FilterForm from "@/components/FilterForm";
import type { OngoingAnime, Pagination } from "@/types/anime";

// Tier 2: Moderately Static — advanced search results
export const revalidate = 10800; // 3 hours

interface FilterPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FilterPage({ searchParams }: FilterPageProps) {
    const params = await searchParams;

    // Build query string from searchParams
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            value.forEach((v) => qs.append(key, v));
        } else {
            qs.append(key, value);
        }
    }

    const currentPage = Number(params.page) || 1;
    const hasFilters = qs.toString().replace(/page=\d+&?/, "").length > 0;

    let animeList: OngoingAnime[] = [];
    let pagination: Pagination = { hasNext: false, hasPrev: false, currentPage };
    let fetchError: string | null = null;

    if (hasFilters) {
        try {
            const res = await getAdvancedSearch(qs.toString());
            animeList = res.animes ?? [];
            pagination = res.pagination;
        } catch (err) {
            fetchError =
                err instanceof Error ? err.message : "Failed to fetch results.";
        }
    }

    // Reconstruct base params (without page) for pagination links
    const baseParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (key === "page" || value === undefined) continue;
        if (Array.isArray(value)) {
            value.forEach((v) => baseParams.append(key, v));
        } else {
            baseParams.append(key, value);
        }
    }
    const pageHref = (page: number) =>
        `/filter?${baseParams.toString()}&page=${page}`;

    return (
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-hn-text sm:text-3xl">
                    <span className="text-hn-primary">Advanced</span> Search
                </h1>
                <p className="mt-1 text-sm text-hn-text-muted/60">
                    Filter anime by genre, season, type, status, and more.
                </p>
            </div>

            {/* Filter Form (Client Component) */}
            <Suspense fallback={null}>
                <FilterForm />
            </Suspense>

            {/* Error */}
            {fetchError && (
                <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                    <h3 className="text-lg font-bold text-hn-text">API Unavailable</h3>
                    <p className="mt-1 text-sm text-hn-text-muted/70">{fetchError}</p>
                </div>
            )}

            {/* Empty state (no filters applied yet) */}
            {!hasFilters && !fetchError && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-hn-card/50 py-16">
                    <svg className="mb-4 h-14 w-14 text-hn-text-muted/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    <p className="text-base font-semibold text-hn-text-muted/50">
                        Select filters and hit &quot;Search Criteria&quot;
                    </p>
                    <p className="mt-1 text-sm text-hn-text/15">
                        Results will appear here.
                    </p>
                </div>
            )}

            {/* Results */}
            {hasFilters && animeList.length === 0 && !fetchError && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-hn-card/50 py-16">
                    <p className="text-base font-semibold text-hn-text-muted/50">
                        No results found
                    </p>
                    <p className="mt-1 text-sm text-hn-text/15">
                        Try adjusting your filters.
                    </p>
                </div>
            )}

            {animeList.length > 0 && (
                <>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full bg-hn-primary" />
                        <h2 className="text-base font-bold text-hn-text">
                            Results
                        </h2>
                        <span className="text-xs text-hn-text-muted/50">
                            Page {currentPage}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {animeList.map((anime) => (
                            <AnimeCard key={anime.slug} anime={anime} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {pagination.hasPrev && (
                            <Link
                                href={pageHref(currentPage - 1)}
                                className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-hn-text transition-all hover:bg-hn-card-hover"
                            >
                                ← Previous
                            </Link>
                        )}
                        <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
                            {currentPage}
                        </span>
                        {pagination.hasNext && (
                            <Link
                                href={pageHref(currentPage + 1)}
                                className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-hn-text transition-all hover:bg-hn-card-hover"
                            >
                                Next →
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
