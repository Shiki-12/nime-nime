import { getOngoingAnime, getCompletedAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import HeroCarousel from "@/components/HeroCarousel";
import ContinueWatching from "@/components/ContinueWatching";
import type { ContinueWatchingItem } from "@/components/ContinueWatching";
import Link from "next/link";
import type { OngoingAnime } from "@/types/anime";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    let fetchError: string | null = null;

    try {
      const res = await getOngoingAnime(currentPage);
      animeList = res.animes ?? [];
    } catch (err) {
      fetchError =
        err instanceof Error ? err.message : "Failed to fetch anime data.";
    }

    return (
      <div className="w-full px-4 pb-16 pt-24 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="h-6 w-1 rounded-full bg-hn-primary" />
          <h1 className="text-2xl font-bold text-hn-text">All Ongoing Anime</h1>
          <span className="text-xs text-hn-text-muted/50">Page {currentPage}</span>
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
            <h3 className="text-lg font-bold text-hn-text">API Unavailable</h3>
            <p className="mt-1 text-sm text-hn-text-muted">
              The anime API server is currently unreachable.
            </p>
            <p className="mt-2 break-all text-xs text-hn-text-muted/40">{fetchError}</p>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {animeList.map((anime) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {currentPage > 1 && (
            <Link
              href={`/?tab=ongoing&page=${currentPage - 1}`}
              className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-primary/15 hover:text-hn-primary"
            >
              ← Previous
            </Link>
          )}

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hn-primary text-sm font-bold text-hn-dark shadow-md">
            {currentPage}
          </span>

          {currentPage < 12 ? (
            <Link
              href={`/?tab=ongoing&page=${currentPage + 1}`}
              className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-primary/15 hover:text-hn-primary"
            >
              Next →
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-primary/15 hover:text-hn-primary"
            >
              Back to Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ─── Dedicated "Completed" view ──────────────────────────────────
  if (tab === "completed") {
    let animeList: OngoingAnime[] = [];
    let fetchError: string | null = null;

    try {
      const res = await getCompletedAnime(currentPage);
      animeList = res.animes ?? [];
    } catch (err) {
      fetchError =
        err instanceof Error ? err.message : "Failed to fetch anime data.";
    }

    return (
      <div className="w-full px-4 pb-16 pt-24 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="h-6 w-1 rounded-full bg-hn-secondary" />
          <h1 className="text-2xl font-bold text-hn-text">All Completed Anime</h1>
          <span className="text-xs text-hn-text-muted/50">Page {currentPage}</span>
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
            <h3 className="text-lg font-bold text-hn-text">API Unavailable</h3>
            <p className="mt-1 text-sm text-hn-text-muted">
              The anime API server is currently unreachable.
            </p>
            <p className="mt-2 break-all text-xs text-hn-text-muted/40">{fetchError}</p>
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
            {animeList.map((anime) => (
              <AnimeCard key={anime.slug} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {currentPage > 1 && (
            <Link
              href={`/?tab=completed&page=${currentPage - 1}`}
              className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-primary/15 hover:text-hn-primary"
            >
              ← Previous
            </Link>
          )}

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hn-primary text-sm font-bold text-hn-dark shadow-md">
            {currentPage}
          </span>

          {currentPage < 12 ? (
            <Link
              href={`/?tab=completed&page=${currentPage + 1}`}
              className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-primary/15 hover:text-hn-primary"
            >
              Next →
            </Link>
          ) : (
            <Link
              href="/"
              className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-primary/15 hover:text-hn-primary"
            >
              Back to Home
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

  // ── Fetch Continue Watching data (server-side) ───────────────────
  let historyData: ContinueWatchingItem[] = [];
  try {
    const session = await auth();
    if (session?.user?.id) {
      // Get the most recently watched episode per anime (grouped)
      const pagedGroups = await prisma.watchHistory.groupBy({
        by: ["animeId"],
        where: { userId: session.user.id },
        _max: { watchedAt: true },
        orderBy: { _max: { watchedAt: "desc" } },
        take: 10,
      });

      if (pagedGroups.length > 0) {
        const records = await prisma.watchHistory.findMany({
          where: {
            userId: session.user.id,
            OR: pagedGroups.map((g) => ({
              animeId: g.animeId,
              watchedAt: g._max.watchedAt!,
            })),
          },
        });

        // Deduplicate per anime and map to component shape
        const seen = new Set<string>();
        historyData = pagedGroups
          .map((g) => {
            const rec = records.find((r) => r.animeId === g.animeId);
            if (!rec || seen.has(rec.animeId)) return null;
            seen.add(rec.animeId);
            return {
              animeSlug: rec.animeId,
              title: rec.title,
              image: rec.image,
              type: rec.type,
              episodeId: rec.episodeId,
              episodeName: rec.episodeName,
            };
          })
          .filter(Boolean) as ContinueWatchingItem[];
      }
    }
  } catch {
    // Silent — don't break the homepage if history fetch fails
  }

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="w-full px-4 pb-16 sm:px-6 lg:px-10">
        {/* Error */}
        {fetchError && (
          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <h3 className="text-lg font-bold text-hn-text">API Unavailable</h3>
            <p className="mt-1 text-sm text-hn-text-muted">
              The anime API server is currently unreachable.
            </p>
            <p className="mt-2 break-all text-xs text-hn-text-muted/40">{fetchError}</p>
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
          <section className="mb-14">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-hn-primary" />
                <h2 className="text-xl font-bold text-hn-primary">Ongoing Anime</h2>
              </div>
              <Link
                href="/?tab=ongoing"
                className="flex items-center gap-1 text-xs font-semibold text-hn-text-muted/60 transition-colors hover:text-hn-primary"
              >
                View more
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-8">
              {ongoingList.slice(0, 8).map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* ── Completed Anime section ───────────────────────────── */}
        {completedList.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-hn-secondary" />
                <h2 className="text-xl font-bold text-hn-secondary">Completed Anime</h2>
              </div>
              <Link
                href="/?tab=completed"
                className="flex items-center gap-1 text-xs font-semibold text-hn-text-muted/60 transition-colors hover:text-hn-primary"
              >
                View more
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-8">
              {completedList.slice(0, 8).map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* ── Continue Watching section (Moved to bottom) ─────── */}
        {historyData.length > 0 && (
          <div className="mt-14">
            <ContinueWatching history={historyData} />
          </div>
        )}
      </div>
    </>
  );
}
