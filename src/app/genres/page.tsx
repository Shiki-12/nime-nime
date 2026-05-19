import Link from "next/link";
import { getGenres } from "@/lib/api";
import type { Genre } from "@/types/anime";

// Tier 1: Highly Static — genre list rarely changes
export const revalidate = 86400; // 24 hours

export default async function GenresPage() {
    let genres: Genre[] = [];
    let fetchError: string | null = null;

    try {
        const data = await getGenres();
        genres = data.genres;
    } catch (error) {
        console.error("[GenresPage] Failed to fetch genres:", error);
        fetchError =
            "The genre API is currently unreachable. Please try again later.";
    }

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
            <section className="mb-8 text-center">
                <h1 className="text-2xl font-extrabold text-hn-text sm:text-3xl">
                    Browse by <span className="text-hn-primary">Genre</span>
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-hn-text-muted/60">
                    {fetchError
                        ? "The genre list is temporarily unavailable."
                        : `Explore anime across ${genres.length} genres — from action-packed adventures to heartfelt romances.`}
                </p>
            </section>

            {fetchError ? (
                <div className="mx-auto max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                    <h2 className="text-xl font-bold text-hn-text">
                        Genres unavailable
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-hn-text-muted/70">
                        {fetchError}
                    </p>
                    <Link
                        href="/genres"
                        className="mt-5 inline-flex rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark transition-opacity hover:opacity-90"
                    >
                        Try again
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {genres.map((genre) => (
                        <Link
                            key={genre.slug}
                            href={`/genres/${genre.slug}`}
                            className="group rounded-lg bg-hn-card px-4 py-3 text-center text-sm font-medium text-hn-text-muted/80 transition-all hover:bg-hn-primary/15 hover:text-hn-primary hover:ring-1 hover:ring-hn-primary/30"
                        >
                            {genre.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
