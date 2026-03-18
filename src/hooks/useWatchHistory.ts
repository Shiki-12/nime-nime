"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

// ─── Dual-mode useWatchHistory (Lightweight Global State) ──────────

export function useWatchHistory() {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    // ── localStorage mode state ──
    const [localHistory, setLocalHistory] = useLocalStorage<WatchHistoryMap>(
        "nimenime-watch-history",
        {}
    );

    // ── API mode state (IDs map only) ──
    const [dbHistoryMap, setDbHistoryMap] = useState<Record<string, string[]>>({});
    const [dbLoaded, setDbLoaded] = useState(false);

    // Fetch from API when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setDbLoaded(false);
            return;
        }

        const fetchHistoryIds = async () => {
            try {
                const res = await fetch("/api/user/history?type=ids");
                if (res.ok) {
                    const data: Record<string, string[]> = await res.json();
                    setDbHistoryMap(data);
                }
            } catch (error) {
                console.warn("Failed to fetch watch history IDs:", error);
            } finally {
                setDbLoaded(true);
            }
        };

        fetchHistoryIds();
    }, [isAuthenticated]);

    const markEpisodeAsWatched = useCallback(
        (
            anime: { slug: string; title: string; poster: string; type: string; totalEpisodes?: number },
            episodeSlug: string,
            episodeName: string
        ) => {
            if (isAuthenticated) {
                // Optimistic update
                setDbHistoryMap((prev) => {
                    const next = { ...prev };
                    if (!next[anime.slug]) next[anime.slug] = [];
                    if (!next[anime.slug].includes(episodeSlug)) {
                        next[anime.slug].push(episodeSlug);
                    }
                    return next;
                });

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

    const getWatchedEpisodes = useCallback(
        (animeSlug: string): Set<string> => {
            if (isAuthenticated && dbLoaded) return new Set(dbHistoryMap[animeSlug] || []);
            return new Set(localHistory[animeSlug]?.watchedEpisodes || []);
        },
        [isAuthenticated, dbLoaded, dbHistoryMap, localHistory]
    );

    const isEpisodeWatched = useCallback(
        (animeSlug: string, episodeSlug: string): boolean => {
            if (isAuthenticated && dbLoaded) {
                return dbHistoryMap[animeSlug]?.includes(episodeSlug) || false;
            }
            return localHistory[animeSlug]?.watchedEpisodes?.includes(episodeSlug) || false;
        },
        [isAuthenticated, dbLoaded, dbHistoryMap, localHistory]
    );

    const unmarkEpisodeAsWatched = useCallback(
        async (animeSlug: string, episodeSlug: string) => {
            if (isAuthenticated) {
                // Optimistic update
                setDbHistoryMap((prev) => {
                    if (!prev[animeSlug]) return prev;
                    const nextEpisodes = prev[animeSlug].filter(e => e !== episodeSlug);
                    const next = { ...prev };
                    if (nextEpisodes.length === 0) delete next[animeSlug];
                    else next[animeSlug] = nextEpisodes;
                    return next;
                });

                try {
                    await fetch("/api/user/history", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ animeId: animeSlug, episodeId: episodeSlug }),
                    });
                } catch (err) {
                    console.warn("Failed to unmark episode:", err);
                }
            } else {
                setLocalHistory((prev) => {
                    const item = prev[animeSlug];
                    if (!item) return prev;
                    const nextEpisodes = item.watchedEpisodes.filter(e => e !== episodeSlug);

                    const next = { ...prev };
                    if (nextEpisodes.length === 0) delete next[animeSlug];
                    else next[animeSlug] = { ...item, watchedEpisodes: nextEpisodes };
                    return next;
                });
            }
        },
        [isAuthenticated, setLocalHistory]
    );

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

    return {
        markEpisodeAsWatched,
        unmarkEpisodeAsWatched,
        toggleEpisodeWatched,
        getWatchedEpisodes,
        isEpisodeWatched,
    };
}

// ─── usePaginatedHistory (For the /history page) ───────────────────

export function usePaginatedHistory(page: number = 1, limit: number = 20) {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    const [localHistory, setLocalHistory] = useLocalStorage<WatchHistoryMap>("nimenime-watch-history", {});
    const [dbHistory, setDbHistory] = useState<WatchedAnimeEntry[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/user/history?page=${page}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && json.meta) {
                        setDbHistory(json.data);
                        setMeta(json.meta);
                    } else {
                        // Fallback
                        setDbHistory(Array.isArray(json) ? json : []);
                    }
                }
            } catch (error) {
                console.warn("Failed to fetch paginated watch history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [isAuthenticated, page, limit]);

    // Local sorted array
    const localSorted = useMemo(() => {
        return Object.values(localHistory).sort((a, b) => b.timestamp - a.timestamp);
    }, [localHistory]);

    const history = isAuthenticated ? dbHistory : localSorted.slice((page - 1) * limit, page * limit);
    const localMeta = {
        total: localSorted.length,
        page,
        limit,
        totalPages: Math.ceil(localSorted.length / limit) || 1,
    };
    const currentMeta = isAuthenticated && meta ? meta : localMeta;

    const clearHistory = useCallback(() => {
        if (isAuthenticated) {
            setDbHistory([]);
            fetch("/api/user/history", { method: "DELETE" }).catch((err) =>
                console.warn("Failed to clear history:", err)
            );
        } else {
            setLocalHistory({});
        }
    }, [isAuthenticated, setLocalHistory]);

    const removeHistoryItem = useCallback(
        (animeSlug: string) => {
            if (isAuthenticated) {
                setDbHistory((prev) => prev.filter((item) => item.slug !== animeSlug));
                fetch("/api/user/history", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeId: animeSlug }),
                });
            } else {
                setLocalHistory((prev) => {
                    const next = { ...prev };
                    delete next[animeSlug];
                    return next;
                });
            }
        },
        [isAuthenticated, setLocalHistory]
    );

    const bulkRemoveHistory = useCallback(
        (animeSlugs: string[]) => {
            if (animeSlugs.length === 0) return;

            if (isAuthenticated) {
                setDbHistory((prev) => prev.filter((item) => !animeSlugs.includes(item.slug)));
                fetch("/api/user/history", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeIds: animeSlugs }),
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
        [isAuthenticated, setLocalHistory]
    );

    return { history, meta: currentMeta, isLoading, clearHistory, removeHistoryItem, bulkRemoveHistory };
}
