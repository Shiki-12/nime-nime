"use client";

import { useEffect } from "react";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface WatchHistoryTrackerProps {
    animeSlug: string;
    animeTitle: string;
    animePoster: string;
    animeType: string;
    episodeSlug: string;
    episodeName: string;
    totalEpisodes: number;
}

/**
 * Invisible client component that marks an episode as watched
 * when mounted. Drop this into any Server Component streaming page.
 */
export default function WatchHistoryTracker({
    animeSlug,
    animeTitle,
    animePoster,
    animeType,
    episodeSlug,
    episodeName,
    totalEpisodes,
}: WatchHistoryTrackerProps) {
    const { markEpisodeAsWatched } = useWatchHistory();

    useEffect(() => {
        markEpisodeAsWatched(
            {
                slug: animeSlug,
                title: animeTitle,
                poster: animePoster,
                type: animeType,
                totalEpisodes,
            },
            episodeSlug,
            episodeName
        );
        // Only run once on mount (when the user opens this episode)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [episodeSlug]);

    // Renders nothing — purely a side-effect component
    return null;
}
