"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// ─── Base useLocalStorage (unchanged) ──────────────────────────────

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                // eslint-disable-next-line
                setStoredValue(JSON.parse(item) as T);
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    // Setter that also persists to localStorage
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const newValue =
                    value instanceof Function ? value(prev) : value;
                try {
                    window.localStorage.setItem(key, JSON.stringify(newValue));
                } catch (error) {
                    console.warn(`Error writing localStorage key "${key}":`, error);
                }
                return newValue;
            });
        },
        [key]
    );

    return [storedValue, setValue];
}

// ─── Saved Anime Types ─────────────────────────────────────────────

export interface SavedAnimeItem {
    slug: string;
    title: string;
    poster: string;
    type: string;
    savedAt: number;
}

export interface AnimeRating {
    slug: string;
    rating: "like" | "dislike" | null;
}

// ─── API SavedAnime shape (from DB) ────────────────────────────────

interface DbSavedAnime {
    id: string;
    animeId: string;
    title: string;
    image: string;
    type: string;
    createdAt: string;
}

// ─── Dual-mode useSavedAnime ────────────────────────────────────────

export function useSavedAnime() {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    // ── localStorage mode state ──
    const [localSaved, setLocalSaved] = useLocalStorage<SavedAnimeItem[]>(
        "nimenime-saved",
        []
    );

    // ── API mode state ──
    const [dbSaved, setDbSaved] = useState<SavedAnimeItem[]>([]);
    const [dbLoaded, setDbLoaded] = useState(false);

    // Fetch from API when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setDbLoaded(false);
            return;
        }

        const fetchSaved = async () => {
            try {
                const res = await fetch("/api/user/saved");
                if (res.ok) {
                    const data: DbSavedAnime[] = await res.json();
                    setDbSaved(
                        data.map((item) => ({
                            slug: item.animeId,
                            title: item.title,
                            poster: item.image,
                            type: item.type,
                            savedAt: new Date(item.createdAt).getTime(),
                        }))
                    );
                }
            } catch (error) {
                console.warn("Failed to fetch saved anime:", error);
            } finally {
                setDbLoaded(true);
            }
        };

        fetchSaved();
    }, [isAuthenticated]);

    // Pick the correct data source
    const saved = isAuthenticated && dbLoaded ? dbSaved : localSaved;

    const isSaved = useCallback(
        (slug: string) => saved.some((s) => s.slug === slug),
        [saved]
    );

    const toggleSave = useCallback(
        (anime: Omit<SavedAnimeItem, "savedAt">) => {
            if (isAuthenticated) {
                // ── API mode ──
                const alreadySaved = dbSaved.some((s) => s.slug === anime.slug);

                if (alreadySaved) {
                    // Optimistic remove
                    setDbSaved((prev) => prev.filter((s) => s.slug !== anime.slug));
                    fetch("/api/user/saved", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ animeId: anime.slug }),
                    }).catch(() => {
                        // Revert on failure
                        setDbSaved((prev) => [
                            ...prev,
                            { ...anime, savedAt: Date.now() },
                        ]);
                    });
                } else {
                    // Optimistic add
                    const newItem = { ...anime, savedAt: Date.now() };
                    setDbSaved((prev) => [...prev, newItem]);
                    fetch("/api/user/saved", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            animeId: anime.slug,
                            title: anime.title,
                            image: anime.poster,
                            type: anime.type,
                        }),
                    }).catch(() => {
                        // Revert on failure
                        setDbSaved((prev) =>
                            prev.filter((s) => s.slug !== anime.slug)
                        );
                    });
                }
            } else {
                // ── localStorage mode ──
                setLocalSaved((prev) => {
                    if (prev.some((s) => s.slug === anime.slug)) {
                        return prev.filter((s) => s.slug !== anime.slug);
                    }
                    return [...prev, { ...anime, savedAt: Date.now() }];
                });
            }
        },
        [isAuthenticated, dbSaved, setLocalSaved]
    );

    const removeSavedItem = useCallback(
        (slug: string) => {
            if (isAuthenticated) {
                // ── API mode ──
                const removedItem = dbSaved.find((s) => s.slug === slug);
                if (!removedItem) return;

                // Optimistic remove
                setDbSaved((prev) => prev.filter((s) => s.slug !== slug));
                
                fetch("/api/user/saved", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeId: slug }),
                }).catch(() => {
                    // Revert on failure
                    setDbSaved((prev) => [...prev, removedItem]);
                });
            } else {
                // ── localStorage mode ──
                setLocalSaved((prev) => prev.filter((s) => s.slug !== slug));
            }
        },
        [isAuthenticated, dbSaved, setLocalSaved]
    );

    const bulkRemoveSaved = useCallback(
        (slugs: string[]) => {
            if (slugs.length === 0) return;

            if (isAuthenticated) {
                // ── API mode ──
                const removedItems = dbSaved.filter((s) => slugs.includes(s.slug));
                
                // Optimistic remove
                setDbSaved((prev) => prev.filter((s) => !slugs.includes(s.slug)));
                
                fetch("/api/user/saved", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeIds: slugs }),
                }).catch(() => {
                    // Revert on failure
                    setDbSaved((prev) => [...prev, ...removedItems]);
                });
            } else {
                // ── localStorage mode ──
                setLocalSaved((prev) => prev.filter((s) => !slugs.includes(s.slug)));
            }
        },
        [isAuthenticated, dbSaved, setLocalSaved]
    );

    return { saved, isSaved, toggleSave, removeSavedItem, bulkRemoveSaved };
}

// ─── useAnimeRating (unchanged, localStorage-only) ──────────────────

export function useAnimeRating(slug: string) {
    const [ratings, setRatings] = useLocalStorage<Record<string, "like" | "dislike">>(
        "nimenime-ratings",
        {}
    );

    const currentRating = ratings[slug] || null;

    const setRating = (rating: "like" | "dislike") => {
        setRatings((prev) => {
            if (prev[slug] === rating) {
                // Toggle off
                const next = { ...prev };
                delete next[slug];
                return next;
            }
            return { ...prev, [slug]: rating };
        });
    };

    return { currentRating, setRating };
}
