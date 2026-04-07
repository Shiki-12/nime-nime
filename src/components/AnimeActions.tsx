"use client";

import {
    useSavedAnime,
    useAnimeRating,
    type SavedAnimeItem,
} from "@/hooks/useLocalStorage";

interface AnimeActionsProps {
    anime: Omit<SavedAnimeItem, "savedAt">;
}

export default function AnimeActions({ anime }: AnimeActionsProps) {
    const { isSaved, toggleSave } = useSavedAnime();
    const { currentRating, setRating } = useAnimeRating(anime.slug);

    const saved = isSaved(anime.slug);

    return (
        <div className="flex items-center gap-2">
            {/* Save / Bookmark */}
            <button
                onClick={() => toggleSave(anime)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${saved
                        ? "bg-hn-primary text-hn-dark shadow-lg shadow-hn-primary/25"
                        : "bg-hn-border/20 text-hn-text/70 hover:bg-white/10 hover:text-hn-text"
                    }`}
            >
                <svg
                    className="h-3.5 w-3.5"
                    fill={saved ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                    />
                </svg>
                {saved ? "Saved" : "Save"}
            </button>

            {/* Like */}
            <button
                onClick={() => setRating("like")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${currentRating === "like"
                        ? "bg-hn-green/20 text-hn-green"
                        : "bg-hn-border/20 text-hn-text-muted/60 hover:bg-white/10 hover:text-hn-green"
                    }`}
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m7.594-9.75H15M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                    />
                </svg>
            </button>

            {/* Dislike */}
            <button
                onClick={() => setRating("dislike")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${currentRating === "dislike"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-hn-border/20 text-hn-text-muted/60 hover:bg-white/10 hover:text-red-400"
                    }`}
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 2.25 12c0-2.848.992-5.464 2.649-7.521C5.287 3.997 5.886 3.75 6.504 3.75h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.5a2.25 2.25 0 0 0 2.25 2.25.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                    />
                </svg>
            </button>
        </div>
    );
}
