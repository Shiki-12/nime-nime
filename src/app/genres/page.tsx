import Link from "next/link";
import { getGenres } from "@/lib/api";

// Tier 1: Highly Static — genre list rarely changes
export const revalidate = 86400; // 24 hours

export default async function GenresPage() {
    const { genres } = await getGenres();

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
            <section className="mb-8 text-center">
                <h1 className="text-2xl font-extrabold text-hn-text sm:text-3xl">
                    Browse by <span className="text-hn-primary">Genre</span>
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm text-hn-text-muted/60">
                    Explore anime across {genres.length} genres — from action-packed
                    adventures to heartfelt romances.
                </p>
            </section>

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
        </div>
    );
}
