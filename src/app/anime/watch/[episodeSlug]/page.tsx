import Link from "next/link";
import { getEpisodeData, getAnimeDetail } from "@/lib/api";
import WatchHistoryTracker from "@/components/WatchHistoryTracker";
import EpisodeList from "@/components/EpisodeList";
import SidebarEpisodeList from "@/components/SidebarEpisodeList";
import DisqusWrapper from "@/components/DisqusWrapper";
import type { EpisodeItem } from "@/types/anime";
import VideoPlayer from "@/components/VideoPlayer";

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

  const episode = await getEpisodeData(episodeSlug);

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
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2.5 py-1 text-xs text-white/30">
        <Link href="/" className="transition-colors hover:text-hn-primary">
          Home
        </Link>
        {animeTitle && (
          <>
            <span className="text-white/15">/</span>
            <Link
              href={`/anime/${animeSlug}`}
              className="transition-colors hover:text-hn-primary"
            >
              {animeTitle}
            </Link>
          </>
        )}
        <span className="text-white/15">/</span>
        <span className="max-w-xs truncate text-white/50">{episode.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: Player + Navigation */}
        <div>
          {/* Compact reload notice */}
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/5 bg-hn-card/40 px-3 py-2 text-xs text-white/40">
            <svg className="h-3.5 w-3.5 shrink-0 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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

          {/* Video Player with resolution/server selector */}
          <VideoPlayer streams={episode.streams} title={episode.title} />

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
                className="rounded-full bg-hn-card px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-hn-card-hover"
              >
                ← Back to Anime
              </Link>
            )}
            <Link
              href="/"
              className="rounded-full bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/40 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              Home
            </Link>
          </div>

          {/* Disqus Comments - Episode-Specific Thread */}
          {animeSlug && (
            <div>
              <DisqusWrapper
                animeSlug={animeSlug}
                episodeSlug={episodeSlug}
                episodeTitle={episode.title}
              />
            </div>
          )}
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