import { searchAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
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
    let fetchError: string | null = null;

    try {
        const res = await searchAnime(decodedQuery, currentPage);
        animeList = res.animes;
        pagination = res.pagination;
    } catch (err) {
        fetchError = err instanceof Error ? err.message : "Search failed.";
    }

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
            <div className="mb-6">
                <Link href="/" className="text-xs text-white/30 transition-colors hover:text-hn-primary">
                    ← Back to Home
                </Link>
                <h1 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
                    Search results for{" "}
                    <span className="text-hn-primary">&ldquo;{decodedQuery}&rdquo;</span>
                </h1>
                {!fetchError && (
                    <p className="mt-1 text-xs text-white/30">
                        {animeList.length} results found
                    </p>
                )}
            </div>

            {fetchError && (
                <div className="rounded-lg bg-red-500/5 p-6 text-center">
                    <p className="text-sm text-white/50">{fetchError}</p>
                </div>
            )}

            {!fetchError && animeList.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-lg font-semibold text-white">No results found</p>
                    <p className="mt-1 text-sm text-white/40">
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
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {pagination.hasPrev && (
                            <Link href={`/search/${query}?page=${currentPage - 1}`} className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white hover:bg-hn-card-hover">
                                ← Previous
                            </Link>
                        )}
                        <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
                            {currentPage}
                        </span>
                        {pagination.hasNext && (
                            <Link href={`/search/${query}?page=${currentPage + 1}`} className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white hover:bg-hn-card-hover">
                                Next →
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
