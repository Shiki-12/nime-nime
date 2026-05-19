import Link from "next/link";
import { getAnimeByGenre } from "@/lib/api";
import { fetchGenreTotalPages } from "@/lib/pagination-scraper";
import AnimeCard from "@/components/AnimeCard";
import PaginationNav from "@/components/PaginationNav";
import type { OngoingAnime, Pagination } from "@/types/anime";

// Tier 1: Highly Static — genre listings are stable
export const revalidate = 86400; // 24 hours

interface GenrePageProps {
    params: Promise<{ genre_slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function GenreFilterPage({ params, searchParams }: GenrePageProps) {
    const { genre_slug } = await params;
    const sp = await searchParams;
    const currentPage = Number(sp.page) || 1;

    let animeList: OngoingAnime[] = [];
    let pagination: Pagination = { hasNext: false, hasPrev: false, currentPage };

    const [animeResult, totalPages] = await Promise.all([
        getAnimeByGenre(genre_slug, currentPage)
            .then((data) => ({ data, error: null }))
            .catch((error) => {
            console.error("[GenreFilterPage] Failed to fetch genre anime:", error);
            return {
                data: null,
                error:
                    "The genre API is currently unreachable. Please try again later.",
            };
        }),
        fetchGenreTotalPages(genre_slug).catch((error) => {
            console.error("[GenreFilterPage] Failed to fetch genre pagination:", error);
            return 1;
        }),
    ]);
    const apiResult = animeResult.data;
    const fetchError = animeResult.error;

    if (apiResult) {
        animeList = apiResult.animes;
        pagination = apiResult.pagination;
    }

    const displayName = genre_slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
            <div className="mb-6">
                <Link href="/genres" className="text-xs text-hn-text-muted/50 transition-colors hover:text-hn-primary">
                    ← All Genres
                </Link>
                <h1 className="mt-2 text-xl font-extrabold text-hn-text sm:text-2xl">
                    Genre: <span className="text-hn-primary">{displayName}</span>
                </h1>
                {totalPages > 1 && (
                    <p className="mt-1 text-xs text-hn-text-muted/50">
                        Page {currentPage} of {totalPages}
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
                    <p className="text-hn-text-muted/70">No anime found in this genre.</p>
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
                        buildHref={(page) => `/genres/${genre_slug}?page=${page}`}
                    />
                </>
            )}
        </div>
    );
}
