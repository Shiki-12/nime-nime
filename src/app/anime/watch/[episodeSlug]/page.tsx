import Link from "next/link";
import { getEpisodeData, getAnimeDetail } from "@/lib/api";
import { getAggregatedVideoServers } from "@/lib/otakudesu";
import WatchHistoryTracker from "@/components/WatchHistoryTracker";
import EpisodeList from "@/components/EpisodeList";
import SidebarEpisodeList from "@/components/SidebarEpisodeList";
import EpisodeComments from "@/components/EpisodeComments";
import type { EpisodeItem } from "@/types/anime";
import VideoPlayer from "@/components/VideoPlayer";

/**
 * Extract episode number from an episode title or slug.
 * Tries patterns like "Episode 5", "Ep 12", or trailing numbers in slugs.
 * Returns the matched number as a string, or "1" as fallback.
 */
function extractEpisodeNumber(title: string, slug: string): string {
  // Try to match "Episode X" or "Ep X" pattern in the title (case-insensitive)
  const titleMatch = title.match(/(?:episode|ep)\s*(\d+)/i);
  if (titleMatch) return titleMatch[1];

  // Try to match trailing number in the slug (e.g., "naruto-episode-5" → "5")
  const slugMatch = slug.match(/(?:episode-|ep-)(\d+)/i);
  if (slugMatch) return slugMatch[1];

  // Fallback: last number in the slug
  const lastNum = slug.match(/(\d+)(?!.*\d)/);
  if (lastNum) return lastNum[1];

  return "1";
}

// Tier 2: Moderately Static — episode/stream data updates occasionally
export const revalidate = 10800; // 3 hours

interface StreamingPageProps {
  params: Promise<{ episodeSlug: string }>;
  searchParams: Promise<{ anime?: string }>;
}

export default async function StreamingPage({
  params,
  searchParams,
}: StreamingPageProps) {
  const { episodeSlug } = await params;
  const sp = await searchParams;
  const animeSlug = sp.anime;

  let episode: Awaited<ReturnType<typeof getEpisodeData>> | null = null;

  try {
    episode = await getEpisodeData(episodeSlug);
  } catch (error) {
    console.error("[StreamingPage] Failed to fetch episode data:", error);
  }

  if (!episode) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <h1 className="text-xl font-bold text-hn-text">Episode unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-hn-text-muted/70">
            The episode API is currently unreachable. Please try again later.
          </p>
          <Link
            href={`/anime/watch/${episodeSlug}${animeSlug ? `?anime=${animeSlug}` : ""}`}
            className="mt-5 inline-flex rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark transition-opacity hover:opacity-90"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  let episodes: EpisodeItem[] = [];
  let animeTitle: string | null = null;
  let animePoster = "";
  let animeType = "";
  if (animeSlug) {
    try {
      const { detail } = await getAnimeDetail(animeSlug);
      episodes = detail.episodes;
      animeTitle = detail.title;
      animePoster = detail.poster;
      animeType = detail.type;
    } catch (error) {
      console.error("[StreamingPage] Failed to fetch anime detail sidebar:", error);
    }
  }

  // Extract episode number and aggregate video servers from multiple providers
  const episodeNumber = extractEpisodeNumber(episode.title, episodeSlug);
  const aggregatedStreams = await getAggregatedVideoServers(
    animeTitle || episode.title,
    episodeNumber,
    episodeSlug
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2.5 py-1 text-xs text-hn-text-muted/50">
        <Link href="/" className="transition-colors hover:text-hn-primary">
          Home
        </Link>
        {animeTitle && (
          <>
            <span className="text-hn-text/15">/</span>
            <Link
              href={`/anime/${animeSlug}`}
              className="transition-colors hover:text-hn-primary"
            >
              {animeTitle}
            </Link>
          </>
        )}
        <span className="text-hn-text/15">/</span>
        <span className="max-w-xs truncate text-hn-text-muted/70">{episode.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: Player + Navigation */}
        <div>
          {/* Compact reload & fullscreen notices */}
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-hn-card/40 px-3 py-2 text-xs text-hn-text-muted/60">
              <svg className="h-3.5 w-3.5 shrink-0 text-hn-text-muted/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              <span>Video not loading?</span>
              <a
                href={`/anime/watch/${episodeSlug}${animeSlug ? `?anime=${animeSlug}` : ""}`}
                className="font-semibold text-hn-primary transition-colors hover:text-hn-primary/80"
              >
                Reload
              </a>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-hn-card/40 px-3 py-2 text-xs text-hn-text-muted/60">
              <svg className="h-3.5 w-3.5 shrink-0 text-hn-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              <span>Video tidak bisa Fullscreen? Gunakan tombol Expand di pojok kanan atas video.</span>
            </div>
          </div>

          {/* Video Player with resolution/server selector */}
          <VideoPlayer streams={aggregatedStreams} title={episode.title} />

          {/* Track this episode in watch history */}
          {animeSlug && animeTitle && (
            <WatchHistoryTracker
              animeSlug={animeSlug}
              animeTitle={animeTitle}
              animePoster={animePoster}
              animeType={animeType}
              episodeSlug={episodeSlug}
              episodeName={episode.title}
              totalEpisodes={episodes.length}
            />
          )}

          {/* Episode Navigation */}
          {episodes.length > 0 && animeSlug && animeTitle && (
            <div className="mb-6">
              <EpisodeList
                episodes={episodes}
                currentEpisodeSlug={episodeSlug}
                animeSlug={animeSlug}
                animeTitle={animeTitle}
                animePoster={animePoster}
                animeType={animeType}
              />
            </div>
          )}

          {/* Back buttons - Dipindah ke sini (Di atas Disqus) */}
          <div className="mb-6 border-t border-white/10 pt-6 flex items-center gap-2">
            {animeSlug && (
              <Link
                href={`/anime/${animeSlug}`}
                className="rounded-full bg-hn-card px-4 py-2 text-xs font-semibold text-hn-text transition-all hover:bg-hn-card-hover"
              >
                ← Back to Anime
              </Link>
            )}
            <Link
              href="/"
              className="rounded-full bg-white/[0.04] px-4 py-2 text-xs font-medium text-hn-text-muted/60 transition-all hover:bg-white/[0.08] hover:text-hn-text"
            >
              Home
            </Link>
          </div>

          {/* Episode Comments */}
          <EpisodeComments episodeSlug={episodeSlug} animeSlug={animeSlug} />
        </div>

        {/* Right Sidebar: Episode List (desktop) */}
        {episodes.length > 0 && animeSlug && animeTitle && (
          <SidebarEpisodeList
            episodes={episodes}
            currentEpisodeSlug={episodeSlug}
            animeSlug={animeSlug}
            animeTitle={animeTitle}
            animePoster={animePoster}
            animeType={animeType}
          />
        )}
      </div>
    </div>
  );
}
