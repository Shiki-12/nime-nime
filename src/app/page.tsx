import { getOngoingAnime, getCompletedAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import HeroCarousel from "@/components/HeroCarousel";
import Link from "next/link";
import type { OngoingAnime, Pagination } from "@/types/anime";

// Tier 3: Frequently Updated — ongoing/completed feeds update hourly
export const revalidate = 3600; // 1 hour

interface HomeProps {
  searchParams: Promise<{ tab?: string; page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const tab = params.tab;
  const currentPage = Number(params.page) || 1;

  // ─── Dedicated "Ongoing" view ────────────────────────────────────
  if (tab === "ongoing") {
    let animeList: OngoingAnime[] = [];
    let pagination: Pagination = {
      hasNext: false,
      hasPrev: false,
      currentPage,
    };
    let fetchError: string | null = null;

    try {
      const res = await getOngoingAnime(currentPage);
      animeList = res.animes ?? [];
      pagination = res.pagination;
    } catch (err) {
      fetchError =
        err instanceof Error ? err.message : "Failed to fetch anime data.";
    }

    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="h-6 w-1 rounded-full bg-hn-primary" />
          <h1 className="text-2xl font-bold text-white">All Ongoing Anime</h1>
          <span className="text-xs text-white/30">Page {currentPage}</span>
          <Link
            href="/"
            className="ml-auto text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <h3 className="text-lg font-bold text-white">API Unavailable</h3>
            <p className="mt-1 text-sm text-white/50">
              The anime API server is currently unreachable.
            </p>
            <p className="mt-2 break-all text-xs text-white/20">{fetchError}</p>
            <Link
              href={`/?tab=ongoing&page=${currentPage}`}
              className="mt-4 inline-block rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark"
            >
              Try again
            </Link>
          </div>
        )}

        {/* Grid */}
        {animeList.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {animeList.map((anime) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {pagination.hasPrev && (
            <Link
              href={`/?tab=ongoing&page=${currentPage - 1}`}
              className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-hn-card-hover"
            >
              ← Previous
            </Link>
          )}
          <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
            {currentPage}
          </span>
          {pagination.hasNext && (
            <Link
              href={`/?tab=ongoing&page=${currentPage + 1}`}
              className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-hn-card-hover"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ─── Dedicated "Completed" view ──────────────────────────────────
  if (tab === "completed") {
    let animeList: OngoingAnime[] = [];
    let pagination: Pagination = {
      hasNext: false,
      hasPrev: false,
      currentPage,
    };
    let fetchError: string | null = null;

    try {
      const res = await getCompletedAnime(currentPage);
      animeList = res.animes ?? [];
      pagination = res.pagination;
    } catch (err) {
      fetchError =
        err instanceof Error ? err.message : "Failed to fetch anime data.";
    }

    return (
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="h-6 w-1 rounded-full bg-hn-secondary" />
          <h1 className="text-2xl font-bold text-white">All Completed Anime</h1>
          <span className="text-xs text-white/30">Page {currentPage}</span>
          <Link
            href="/"
            className="ml-auto text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <h3 className="text-lg font-bold text-white">API Unavailable</h3>
            <p className="mt-1 text-sm text-white/50">
              The anime API server is currently unreachable.
            </p>
            <p className="mt-2 break-all text-xs text-white/20">{fetchError}</p>
            <Link
              href={`/?tab=completed&page=${currentPage}`}
              className="mt-4 inline-block rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark"
            >
              Try again
            </Link>
          </div>
        )}

        {/* Grid */}
        {animeList.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {animeList.map((anime) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {pagination.hasPrev && (
            <Link
              href={`/?tab=completed&page=${currentPage - 1}`}
              className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-hn-card-hover"
            >
              ← Previous
            </Link>
          )}
          <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
            {currentPage}
          </span>
          {pagination.hasNext && (
            <Link
              href={`/?tab=completed&page=${currentPage + 1}`}
              className="rounded-full bg-hn-card px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-hn-card-hover"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ─── Default homepage view ───────────────────────────────────────
  let ongoingList: OngoingAnime[] = [];
  let completedList: OngoingAnime[] = [];
  let fetchError: string | null = null;

  try {
    const [ongoingRes, completedRes] = await Promise.all([
      getOngoingAnime(1),
      getCompletedAnime(1),
    ]);
    ongoingList = ongoingRes.animes ?? [];
    completedList = completedRes.animes ?? [];
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to fetch anime data.";
  }

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="mx-auto max-w-[1440px] px-4 pb-16 lg:px-6">
        {/* Error */}
        {fetchError && (
          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <h3 className="text-lg font-bold text-white">API Unavailable</h3>
            <p className="mt-1 text-sm text-white/50">
              The anime API server is currently unreachable.
            </p>
            <p className="mt-2 break-all text-xs text-white/20">{fetchError}</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark"
            >
              Try again
            </Link>
          </div>
        )}

        {/* ── Ongoing Anime section ─────────────────────────────── */}
        {ongoingList.length > 0 && (
          <section className="mb-16">
            <div className="mb-7 flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-hn-primary" />
              <h2 className="text-lg font-bold text-white">Ongoing Anime</h2>
              <Link
                href="/?tab=ongoing"
                className="ml-auto text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
              >
                View all Ongoing →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ongoingList.map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* ── Completed Anime section ───────────────────────────── */}
        {completedList.length > 0 && (
          <section>
            <div className="mb-7 flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-hn-secondary" />
              <h2 className="text-lg font-bold text-white">Completed Anime</h2>
              <Link
                href="/?tab=completed"
                className="ml-auto text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
              >
                View all Completed →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {completedList.map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
