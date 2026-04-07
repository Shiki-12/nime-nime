import { getAnimeDetail } from "@/lib/api";
import { fetchSerialSlug } from "@/lib/fetchSerialSlug";
import AnimeCharacters from "@/components/AnimeCharacters";
import AnimeDetailHeader from "@/components/AnimeDetailHeader";
import DetailEpisodeList from "@/components/DetailEpisodeList";
import MalRatingCard from "@/components/MalRatingCard";

// Tier 2: Moderately Static — anime metadata updates occasionally
export const revalidate = 10800; // 3 hours

interface AnimeDetailPageProps {
    params: Promise<{ slug: string }>;
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
    const { slug } = await params;

    // Dual-fetch: run API calls and scraper concurrently
    const [{ detail: anime }, serialSlug] = await Promise.all([
        getAnimeDetail(slug),
        fetchSerialSlug(slug),
    ]);


    return (
        <div className="relative w-full overflow-x-hidden">
            {/* Tambahin w-full sama overflow-x-hidden biar gak meleber */}
            {/* Immersive Hero Header */}
            <AnimeDetailHeader
                title={anime.title}
                posterUrl={anime.poster}
                genres={anime.genres}
                synopsis={anime.synopsis}
                status={anime.status}
                type={anime.type}
                duration={anime.duration}
                slug={slug}
                episodes={anime.episodes}
                serialSlug={serialSlug}
            />

            {/* Body */}
            <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-8 lg:px-6">
                {/* Meta cards */}
                <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Client-side MAL Rating — fetched from user's IP */}
                    <MalRatingCard fallbackTitle={anime.title} />

                    {[
                        { label: "Studio", value: anime.studio },
                        { label: "Season", value: anime.season },
                        { label: "Aired", value: anime.aired },
                        { label: "Author", value: anime.author },
                    ]
                        .filter((item) => item.value)
                        .map((item) => (
                            <div
                                key={item.label}
                                className="rounded-lg bg-hn-card p-5"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-hn-text-muted/50">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-hn-text">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                </div>

                {/* Synopsis */}
                <section className="mb-10">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-hn-text">
                        <div className="h-4 w-1 rounded-full bg-hn-primary" />
                        Synopsis
                    </h2>
                    <p className="max-w-3xl text-sm leading-relaxed text-hn-text-muted/70">
                        {anime.synopsis}
                    </p>
                </section>

                {/* Trailer */}
                {anime.trailer && (
                    <section className="mb-10 ">
                        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-hn-text">
                            <div className="h-4 w-1 rounded-full bg-hn-primary" />
                            Trailer
                        </h2>
                        <div className="overflow-hidden">
                            <iframe
                                src={anime.trailer}
                                className="aspect-video w-full max-w-2xl mx-auto"
                                allowFullScreen
                                allow="autoplay; fullscreen"
                            />
                        </div>
                    </section>
                )}

                {/* Characters & Voice Actors */}
                <AnimeCharacters animeTitle={anime.title} />

                {/* Episode List */}
                <DetailEpisodeList
                    episodes={anime.episodes}
                    animeSlug={slug}
                    animeTitle={anime.title}
                    animePoster={anime.poster}
                    animeType={anime.type}
                />
            </div>
        </div>
    );
}
