import { getAnimeDetail, getMalRating } from "@/lib/api";
import AnimeCharacters from "@/components/AnimeCharacters";
import AnimeDetailHeader from "@/components/AnimeDetailHeader";
import DetailEpisodeList from "@/components/DetailEpisodeList";

// Tier 2: Moderately Static — anime metadata updates occasionally
export const revalidate = 10800; // 3 hours

interface AnimeDetailPageProps {
    params: Promise<{ slug: string }>;
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
    const { slug } = await params;
    const { detail: anime } = await getAnimeDetail(slug);
    const malScore = await getMalRating(anime.title);

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
            />

            {/* Body */}
            <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
                {/* Meta cards */}
                <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        { label: "Rating MAL", value: malScore },
                        { label: "Studio", value: anime.studio },
                        { label: "Season", value: anime.season },
                        { label: "Aired", value: anime.aired },
                        { label: "Author", value: anime.author },
                    ]
                        .filter((item) => item.value)
                        .map((item) => (
                            <div
                                key={item.label}
                                className="rounded-lg bg-hn-card p-4"
                            >
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                                    {item.label}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                </div>

                {/* Synopsis */}
                <section className="mb-8">
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
                        <div className="h-4 w-1 rounded-full bg-hn-primary" />
                        Synopsis
                    </h2>
                    <p className="max-w-3xl text-sm leading-relaxed text-white/50">
                        {anime.synopsis}
                    </p>
                </section>

                {/* Trailer */}
                {anime.trailer && (
                    <section className="mb-8 ">
                        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
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
