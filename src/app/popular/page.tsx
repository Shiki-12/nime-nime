import { getPopularAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";
import type { OngoingAnime, Pagination } from "@/types/anime";

// Tier 2: Moderately Static — popularity rankings update occasionally
export const revalidate = 10800; // 3 hours

interface PopularPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const sp = await searchParams;
  const currentPage = Number(sp.page) || 1;

  let animeList: OngoingAnime[] = [];
  let pagination: Pagination = { hasNext: false, hasPrev: false, currentPage };
  let fetchError: string | null = null;

  try {
    const res = await getPopularAnime(currentPage);
    animeList = res.animes;
    pagination = res.pagination;
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to fetch popular anime.";
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <section className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-hn-text sm:text-3xl">
          <span className="text-hn-primary">Popular</span> Anime
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-hn-text-muted/60">
          The most watched and highest rated anime series right now.
        </p>
      </section>

      {fetchError && (
        <div className="rounded-lg bg-red-500/5 p-6 text-center">
          <p className="text-sm text-hn-text-muted/70">{fetchError}</p>
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
                href={`/popular?page=${currentPage - 1}`}
                className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-hn-text hover:bg-hn-card-hover"
              >
                ← Previous
              </Link>
            )}
            <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
              {currentPage}
            </span>
            {pagination.hasNext && (
              <Link
                href={`/popular?page=${currentPage + 1}`}
                className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-hn-text hover:bg-hn-card-hover"
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
