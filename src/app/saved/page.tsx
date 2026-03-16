"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSavedAnime } from "@/hooks/useLocalStorage";

export default function SavedPage() {
  const { saved, toggleSave } = useSavedAnime();
  const { status } = useSession();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <section className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          <span className="text-hn-primary">Saved</span> Anime
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
          {status === "authenticated"
            ? "Your personal bookmarks — synced to your account."
            : "Your personal bookmarks — saved locally in your browser."}
        </p>
      </section>

      {saved.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-hn-card text-white/30">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white">No saved anime yet</p>
          <p className="mt-1 text-sm text-white/40">
            Browse anime and click Save to bookmark them.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-hn-primary px-5 py-2 text-xs font-bold text-hn-dark"
          >
            Browse Anime
          </Link>
        </div>
      )}

      {saved.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {saved
            .sort((a, b) => b.savedAt - a.savedAt)
            .map((anime) => (
              <div
                key={anime.slug}
                className="group relative overflow-hidden rounded-lg bg-hn-card"
              >
                <Link href={`/anime/${anime.slug}`}>
                  <div className="relative aspect-[3/4.2] w-full overflow-hidden">
                    <Image
                      src={anime.poster}
                      alt={anime.title}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/20 to-transparent opacity-80" />
                    <span className="absolute right-0 top-0 bg-hn-primary/90 px-2 py-1 text-[10px] font-bold text-hn-dark">
                      {anime.type}
                    </span>
                  </div>
                  <div className="px-2.5 py-2">
                    <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90 group-hover:text-hn-primary">
                      {anime.title}
                    </h3>
                  </div>
                </Link>
                <button
                  onClick={() => toggleSave(anime)}
                  className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-red-500/80 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  title="Remove"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
