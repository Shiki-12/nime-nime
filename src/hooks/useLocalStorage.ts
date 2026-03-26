"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";

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

// ─── Dual-mode useSavedAnime (Lightweight Global State) ──────────────

export function useSavedAnime() {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    // ── localStorage mode state ──
    const [localSaved, setLocalSaved] = useLocalStorage<SavedAnimeItem[]>(
        "nimenime-saved",
        []
    );

    // ── API mode state (IDs only) ──
    const [dbSavedIds, setDbSavedIds] = useState<string[]>([]);
    const [dbLoaded, setDbLoaded] = useState(false);

    // Fetch from API when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setDbLoaded(false);
            return;
        }

        const fetchSavedIds = async () => {
            try {
                const res = await fetch("/api/user/saved?type=ids");
                if (res.ok) {
                    const data: string[] = await res.json();
                    setDbSavedIds(data);
                }
            } catch (error) {
                console.warn("Failed to fetch saved anime IDs:", error);
            } finally {
                setDbLoaded(true);
            }
        };

        fetchSavedIds();
    }, [isAuthenticated]);

    const isSaved = useCallback(
        (slug: string) => {
            if (isAuthenticated && dbLoaded) return dbSavedIds.includes(slug);
            return localSaved.some((s) => s.slug === slug);
        },
        [isAuthenticated, dbLoaded, dbSavedIds, localSaved]
    );

    const toggleSave = useCallback(
        (anime: Omit<SavedAnimeItem, "savedAt">) => {
            if (isAuthenticated) {
                // ── API mode ──
                const alreadySaved = dbSavedIds.includes(anime.slug);

                if (alreadySaved) {
                    // Optimistic remove
                    setDbSavedIds((prev) => prev.filter((id) => id !== anime.slug));
                    fetch("/api/user/saved", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ animeId: anime.slug }),
                    }).catch(() => {
                        // Revert on failure
                        setDbSavedIds((prev) => [...prev, anime.slug]);
                    });
                } else {
                    // Optimistic add
                    setDbSavedIds((prev) => [...prev, anime.slug]);
                    fetch("/api/user/saved", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            animeId: anime.slug,
                            title: anime.title,
                            image: anime.poster,
                            type: anime.type,
                        }),
                    })
                        .then(async (res) => {
                            if (!res.ok) {
                                const data = await res.json().catch(() => ({}));
                                // Revert optimistic add
                                setDbSavedIds((prev) => prev.filter((id) => id !== anime.slug));
                                
                                if (data.message) {
                                    Swal.fire({
                                        icon: "error",
                                        title: "Save Failed",
                                        text: data.message,
                                        toast: true,
                                        position: "bottom-end",
                                        showConfirmButton: false,
                                        timer: 3000,
                                    });
                                    if (data.message.toLowerCase().includes("log in") || data.message.toLowerCase().includes("log out")) {
                                        signOut();
                                    }
                                }
                            }
                        })
                        .catch(() => {
                            // Revert on network failure
                            setDbSavedIds((prev) => prev.filter((id) => id !== anime.slug));
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
        [isAuthenticated, dbSavedIds, setLocalSaved]
    );

    return { isSaved, toggleSave };
}

// ─── usePaginatedSaved (For the /saved page) ──────────────────────────

export function usePaginatedSaved(page: number = 1, limit: number = 20) {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    const [localSaved, setLocalSaved] = useLocalStorage<SavedAnimeItem[]>("nimenime-saved", []);
    const [dbSaved, setDbSaved] = useState<SavedAnimeItem[]>([]);
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const fetchSaved = async () => {
            try {
                const res = await fetch(`/api/user/saved?page=${page}&limit=${limit}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && json.meta) {
                        setDbSaved(
                            json.data.map((item: DbSavedAnime) => ({
                                slug: item.animeId,
                                title: item.title,
                                poster: item.image,
                                type: item.type,
                                savedAt: new Date(item.createdAt).getTime(),
                            }))
                        );
                        setMeta(json.meta);
                    } else {
                        setDbSaved([]);
                    }
                }
            } catch (error) {
                console.warn("Failed to fetch paginated saved anime:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaved();
    }, [isAuthenticated, page, limit]);

    const saved = isAuthenticated ? dbSaved : localSaved.slice((page - 1) * limit, page * limit);
    const localMeta = {
        total: localSaved.length,
        page,
        limit,
        totalPages: Math.ceil(localSaved.length / limit) || 1,
    };
    const currentMeta = isAuthenticated && meta ? meta : localMeta;

    const removeSavedItem = useCallback(
        (slug: string) => {
            if (isAuthenticated) {
                setDbSaved((prev) => prev.filter((s) => s.slug !== slug));
                fetch("/api/user/saved", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeId: slug }),
                });
            } else {
                setLocalSaved((prev) => prev.filter((s) => s.slug !== slug));
            }
        },
        [isAuthenticated, setLocalSaved]
    );

    const bulkRemoveSaved = useCallback(
        (slugs: string[]) => {
            if (slugs.length === 0) return;
            if (isAuthenticated) {
                setDbSaved((prev) => prev.filter((s) => !slugs.includes(s.slug)));
                fetch("/api/user/saved", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ animeIds: slugs }),
                });
            } else {
                setLocalSaved((prev) => prev.filter((s) => !slugs.includes(s.slug)));
            }
        },
        [isAuthenticated, setLocalSaved]
    );

    return { saved, meta: currentMeta, isLoading, removeSavedItem, bulkRemoveSaved };
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
