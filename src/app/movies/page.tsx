import { getMovies } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";
import type { OngoingAnime, Pagination } from "@/types/anime";

// Tier 1: Highly Static — movie catalog rarely changes
export const revalidate = 86400; // 24 hours

interface MoviesPageProps {
  searchParams: Promise<{ page?: string }>;
}
export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const sp = await searchParams;
  const currentPage = Number(sp.page) || 1;

  let animeList: OngoingAnime[] = [];
  let pagination: Pagination = { hasNext: false, hasPrev: false, currentPage };
  let fetchError: string | null = null;

  try {
    const res = await getMovies(currentPage);
    animeList = res.animes;
    pagination = res.pagination;
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to fetch movies.";
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <section className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Anime <span className="text-hn-primary">Movies</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
          Feature-length anime films — from theatrical blockbusters to hidden
          gems.
        </p>
      </section>

      {fetchError && (
        <div className="rounded-lg bg-red-500/5 p-6 text-center">
          <p className="text-sm text-white/50">{fetchError}</p>
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
              <Link
                href={`/movies?page=${currentPage - 1}`}
                className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white hover:bg-hn-card-hover"
              >
                ← Previous
              </Link>
            )}
            <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
              {currentPage}
            </span>
            {pagination.hasNext && (
              <Link
                href={`/movies?page=${currentPage + 1}`}
                className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white hover:bg-hn-card-hover"
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
