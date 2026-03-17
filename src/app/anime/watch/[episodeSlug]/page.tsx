import Link from "next/link";
import { getEpisodeData, getAnimeDetail } from "@/lib/api";
import WatchHistoryTracker from "@/components/WatchHistoryTracker";
import EpisodeList from "@/components/EpisodeList";
import SidebarEpisodeList from "@/components/SidebarEpisodeList";
import DisqusWrapper from "@/components/DisqusWrapper";
import type { EpisodeItem } from "@/types/anime";
import VideoPlayer from "@/components/VideoPlayer";

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
    <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-white/30">
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Player + Navigation */}
        <div>
          {/* Alert Text: Reload/Error Info */}
          <div className="mb-3 rounded-lg border border-white/5 bg-hn-card/50 px-4 py-2 text-sm text-white/50">
            Reload the page if the video not working{" "}
            <a
              href={`/anime/watch/${episodeSlug}${animeSlug ? `?anime=${animeSlug}` : ""}`}
              className="font-bold text-cyan-400 hover:underline cursor-pointer"
            >
             Reload ↻
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
            />
          )}

          {/* Episode Navigation */}
          {episodes.length > 0 && animeSlug && animeTitle && (
            <EpisodeList
              episodes={episodes}
              currentEpisodeSlug={episodeSlug}
              animeSlug={animeSlug}
              animeTitle={animeTitle}
              animePoster={animePoster}
              animeType={animeType}
            />
          )}

          {/* Disqus Comments - Episode-Specific Thread */}
          {animeSlug && (
            <DisqusWrapper
              animeSlug={animeSlug}
              episodeSlug={episodeSlug}
              episodeTitle={episode.title}
            />
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

      {/* Back buttons */}
      <div className="mt-6 flex items-center gap-2">
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
    </div>
  );
}
