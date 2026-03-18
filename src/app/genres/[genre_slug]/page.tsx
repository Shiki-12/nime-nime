import Link from "next/link";
import { getAnimeByGenre } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
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
    let fetchError: string | null = null;

    try {
        const res = await getAnimeByGenre(genre_slug, currentPage);
        animeList = res.animes;
        pagination = res.pagination;
    } catch (err) {
        fetchError = err instanceof Error ? err.message : "Failed to fetch data.";
    }

    const displayName = genre_slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
            <div className="mb-6">
                <Link href="/genres" className="text-xs text-white/30 transition-colors hover:text-hn-primary">
                    ← All Genres
                </Link>
                <h1 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
                    Genre: <span className="text-hn-primary">{displayName}</span>
                </h1>
            </div>

            {fetchError && (
                <div className="rounded-lg bg-red-500/5 p-6 text-center">
                    <p className="text-sm text-white/50">{fetchError}</p>
                </div>
            )}

            {!fetchError && animeList.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-white/50">No anime found in this genre.</p>
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
                            <Link href={`/genres/${genre_slug}?page=${currentPage - 1}`} className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white hover:bg-hn-card-hover">
                                ← Previous
                            </Link>
                        )}
                        <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
                            {currentPage}
                        </span>
                        {pagination.hasNext && (
                            <Link href={`/genres/${genre_slug}?page=${currentPage + 1}`} className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white hover:bg-hn-card-hover">
                                Next →
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
