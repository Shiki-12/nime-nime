import { searchAnime } from "@/lib/api";
import { fetchSearchTotalPages } from "@/lib/pagination-scraper";
import AnimeCard from "@/components/AnimeCard";
import PaginationNav from "@/components/PaginationNav";
import Link from "next/link";
import type { OngoingAnime, Pagination } from "@/types/anime";

// Tier 4: Dynamic/Search — fresh enough to catch new content
export const revalidate = 300; // 5 minutes

interface SearchPageProps {
    params: Promise<{ query: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
    const { query } = await params;
    const sp = await searchParams;
    const currentPage = Number(sp.page) || 1;
    const decodedQuery = decodeURIComponent(query);

    let animeList: OngoingAnime[] = [];
    let pagination: Pagination = { hasNext: false, hasPrev: false, currentPage };

    const [searchResult, totalPages] = await Promise.all([
        searchAnime(decodedQuery, currentPage)
            .then((data) => ({ data, error: null }))
            .catch((error) => {
            console.error("[SearchPage] Failed to fetch search results:", error);
            return {
                data: null,
                error:
                    "The search API is currently unreachable. Please try again later.",
            };
        }),
        fetchSearchTotalPages(decodedQuery).catch((error) => {
            console.error("[SearchPage] Failed to fetch search pagination:", error);
            return 1;
        }),
    ]);
    const apiResult = searchResult.data;
    const fetchError = searchResult.error;

    if (apiResult) {
        animeList = apiResult.animes;
        pagination = apiResult.pagination;
    }

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
            <div className="mb-6">
                <Link href="/" className="text-xs text-hn-text-muted/50 transition-colors hover:text-hn-primary">
                    ← Back to Home
                </Link>
                <h1 className="mt-2 text-xl font-extrabold text-hn-text sm:text-2xl">
                    Search results for{" "}
                    <span className="text-hn-primary">&ldquo;{decodedQuery}&rdquo;</span>
                </h1>
                {!fetchError && (
                    <p className="mt-1 text-xs text-hn-text-muted/50">
                        {animeList.length} results found
                        {totalPages > 1 && (
                            <span className="ml-2">
                                · Page {currentPage} of {totalPages}
                            </span>
                        )}
                    </p>
                )}
            </div>

            {fetchError && (
                <div className="rounded-lg bg-red-500/5 p-6 text-center">
                    <p className="text-sm text-hn-text-muted/70">{fetchError}</p>
                </div>
            )}

            {!fetchError && animeList.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-lg font-semibold text-hn-text">No results found</p>
                    <p className="mt-1 text-sm text-hn-text-muted/60">
                        Try a different search term.
                    </p>
                </div>
            )}

            {animeList.length > 0 && (
                <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {animeList.map((anime) => (
                            <AnimeCard key={anime.slug} anime={anime} />
                        ))}
                    </div>
                    <PaginationNav
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasNext={pagination.hasNext}
                        hasPrev={pagination.hasPrev}
                        buildHref={(page) => `/search/${query}?page=${page}`}
                    />
                </>
            )}
        </div>
    );
}
