"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useLocalStorage } from "./useLocalStorage";

// ─── Types ─────────────────────────────────────────────────────────

export interface WatchedAnimeEntry {
    /** Anime slug (used as the record key) */
    slug: string;
    title: string;
    poster: string;
    type: string;
    /** Episode slugs the user has watched */
    watchedEpisodes: string[];
    /** Total episodes available for this anime */
    totalEpisodes: number;
    /** The most recently watched episode slug (by watchedAt timestamp) */
    lastWatchedEpisode: string;
    /** Human-readable name of the last watched episode */
    lastWatchedEpisodeName: string;
    /** Timestamp of the most recent watch (for sorting) */
    timestamp: number;
}

/** The full history is a slug→entry record */
type WatchHistoryMap = Record<string, WatchedAnimeEntry>;

// ─── Hook ──────────────────────────────────────────────────────────

export function useWatchHistory() {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    // ── localStorage mode ──
    const [localHistory, setLocalHistory] = useLocalStorage<WatchHistoryMap>(
        "nimenime-watch-history",
        {}
    );

    // ── API mode ──
    const [dbHistory, setDbHistory] = useState<WatchHistoryMap>({});
    const [dbLoaded, setDbLoaded] = useState(false);

    // Fetch from API when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setDbLoaded(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/user/history");
                if (res.ok) {
                    const data: WatchedAnimeEntry[] = await res.json();
                    const map: WatchHistoryMap = {};
                    for (const entry of data) {
                        map[entry.slug] = entry;
                    }
                    setDbHistory(map);
                }
            } catch (error) {
                console.warn("Failed to fetch watch history:", error);
            } finally {
                setDbLoaded(true);
            }
        };

        fetchHistory();
    }, [isAuthenticated]);

    // Pick the correct data source
    const history = isAuthenticated && dbLoaded ? dbHistory : localHistory;

    /**
     * Mark an episode as watched. 
     * In API mode: POST to /api/user/history + optimistic update.
     * In localStorage mode: same as before.
     */
    const markEpisodeAsWatched = useCallback(
        (
            anime: { slug: string; title: string; poster: string; type: string; totalEpisodes?: number },
            episodeSlug: string,
            episodeName: string
        ) => {
            if (isAuthenticated) {
                // Optimistic update
                setDbHistory((prev) => {
                    const existing = prev[anime.slug];
                    const watchedSet = new Set(existing?.watchedEpisodes ?? []);
                    watchedSet.add(episodeSlug);

                    return {
                        ...prev,
                        [anime.slug]: {
                            slug: anime.slug,
                            title: anime.title,
                            poster: anime.poster,
                            type: anime.type,
                            watchedEpisodes: Array.from(watchedSet),
                            totalEpisodes: anime.totalEpisodes ?? (existing?.totalEpisodes || 0),
                            lastWatchedEpisode: episodeSlug,
                            lastWatchedEpisodeName: episodeName,
                            timestamp: Date.now(),
                        },
                    };
                });

                // Fire-and-forget API call
                fetch("/api/user/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        animeId: anime.slug,
                        title: anime.title,
                        image: anime.poster,
                        type: anime.type,
                        episodeId: episodeSlug,
                        episodeName,
                    }),
                }).catch((err) => console.warn("Failed to save watch history:", err));
            } else {
                // localStorage mode
                setLocalHistory((prev) => {
                    const existing = prev[anime.slug];
                    const watchedSet = new Set(existing?.watchedEpisodes ?? []);
                    watchedSet.add(episodeSlug);

                    return {
                        ...prev,
                        [anime.slug]: {
                            slug: anime.slug,
                            title: anime.title,
                            poster: anime.poster,
                            type: anime.type,
                            watchedEpisodes: Array.from(watchedSet),
                            totalEpisodes: anime.totalEpisodes ?? (existing?.totalEpisodes || 0),
                            lastWatchedEpisode: episodeSlug,
                            lastWatchedEpisodeName: episodeName,
                            timestamp: Date.now(),
                        },
                    };
                });
            }
        },
        [isAuthenticated, setLocalHistory]
    );

    /**
     * Get the set of watched episode slugs for a given anime.
     */
    const getWatchedEpisodes = useCallback(
        (animeSlug: string): Set<string> => {
            return new Set(history[animeSlug]?.watchedEpisodes ?? []);
        },
        [history]
    );

    /**
     * Check if a specific episode has been watched.
     */
    const isEpisodeWatched = useCallback(
        (animeSlug: string, episodeSlug: string): boolean => {
            return history[animeSlug]?.watchedEpisodes?.includes(episodeSlug) ?? false;
        },
        [history]
    );

    /**
     * Get all history entries sorted by most recent first (by timestamp/watchedAt).
     */
    const getHistorySorted = useCallback((): WatchedAnimeEntry[] => {
        return Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    /**
     * Remove a single episode from watch history.
     */
    const unmarkEpisodeAsWatched = useCallback(
        async (animeSlug: string, episodeSlug: string) => {
            if (isAuthenticated) {
                // Optimistic update
                const existing = dbHistory[animeSlug];
                if (!existing) return;

                setDbHistory((prev) => {
                    const item = prev[animeSlug];
                    if (!item) return prev;
                    const nextEpisodes = item.watchedEpisodes.filter(e => e !== episodeSlug);
                    
                    if (nextEpisodes.length === 0) {
                        const next = { ...prev };
                        delete next[animeSlug];
                        return next;
                    }

                    return {
                        ...prev,
                        [animeSlug]: { ...item, watchedEpisodes: nextEpisodes }
                    };
                });

                try {
                    await fetch("/api/user/history", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ animeId: animeSlug, episodeId: episodeSlug }),
                    });
                } catch (err) {
                    console.warn("Failed to unmark episode:", err);
                    // Revert is complex here as we'd need previous state, 
                    // ideally we should fetch fresh from API on error
                }
            } else {
                setLocalHistory((prev) => {
                    const item = prev[animeSlug];
                    if (!item) return prev;
                    const nextEpisodes = item.watchedEpisodes.filter(e => e !== episodeSlug);

                    if (nextEpisodes.length === 0) {
                        const next = { ...prev };
                        delete next[animeSlug];
                        return next;
                    }

                    return {
                        ...prev,
                        [animeSlug]: { ...item, watchedEpisodes: nextEpisodes }
                    };
                });
            }
        },
        [isAuthenticated, dbHistory, setLocalHistory]
    );

    /**
     * Toggle watched status for an episode.
     */
    const toggleEpisodeWatched = useCallback(
        (
            anime: { slug: string; title: string; poster: string; type: string; totalEpisodes?: number },
            episode: { slug: string; name: string }
        ) => {
            const watched = isEpisodeWatched(anime.slug, episode.slug);
            if (watched) {
                unmarkEpisodeAsWatched(anime.slug, episode.slug);
            } else {
                markEpisodeAsWatched(anime, episode.slug, episode.name);
            }
        },
        [isEpisodeWatched, unmarkEpisodeAsWatched, markEpisodeAsWatched]
    );

    /**
     * Clear all watch history.
     */
    const clearHistory = useCallback(() => {
        if (isAuthenticated) {
            setDbHistory({});
            fetch("/api/user/history", { method: "DELETE" }).catch((err) =>
                console.warn("Failed to clear history:", err)
            );
        } else {
            setLocalHistory({});
        }
    }, [isAuthenticated, setLocalHistory]);

    /**
     * Remove a single anime from history.
     */
    const removeHistoryItem = useCallback(
        (animeSlug: string) => {
            if (isAuthenticated) {
                // Optimistic update
                const removedItem = dbHistory[animeSlug];
                if (!removedItem) return;

                setDbHistory((prev) => {
                    const next = { ...prev };
                    delete next[animeSlug];
                    return next;
                });

                fetch("/api/user/history", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeId: animeSlug }),
                }).catch((err) => {
                    console.warn("Failed to remove history item:", err);
                    // Revert on failure
                    setDbHistory((prev) => ({ ...prev, [animeSlug]: removedItem }));
                });
            } else {
                setLocalHistory((prev) => {
                    const next = { ...prev };
                    delete next[animeSlug];
                    return next;
                });
            }
        },
        [isAuthenticated, dbHistory, setLocalHistory]
    );

    /**
     * Remove multiple anime from history.
     */
    const bulkRemoveHistory = useCallback(
        (animeSlugs: string[]) => {
            if (animeSlugs.length === 0) return;

            if (isAuthenticated) {
                // Optimistic update
                const removedItems: WatchHistoryMap = {};
                for (const slug of animeSlugs) {
                    if (dbHistory[slug]) removedItems[slug] = dbHistory[slug];
                }

                setDbHistory((prev) => {
                    const next = { ...prev };
                    for (const slug of animeSlugs) {
                        delete next[slug];
                    }
                    return next;
                });

                fetch("/api/user/history", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeIds: animeSlugs }),
                }).catch((err) => {
                    console.warn("Failed to bulk remove history:", err);
                    // Revert on failure
                    setDbHistory((prev) => ({ ...prev, ...removedItems }));
                });
            } else {
                setLocalHistory((prev) => {
                    const next = { ...prev };
                    for (const slug of animeSlugs) {
                        delete next[slug];
                    }
                    return next;
                });
            }
        },
        [isAuthenticated, dbHistory, setLocalHistory]
    );

    return {
        history,
        markEpisodeAsWatched,
        unmarkEpisodeAsWatched,
        toggleEpisodeWatched,
        getWatchedEpisodes,
        isEpisodeWatched,
        getHistorySorted,
        clearHistory,
        removeHistoryItem,
        bulkRemoveHistory,
    };
}
