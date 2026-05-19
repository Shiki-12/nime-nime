import { getAnimeDetail } from "@/lib/api";
import { fetchSerialSlug } from "@/lib/fetchSerialSlug";
import AnimeCharacters from "@/components/AnimeCharacters";
import AnimeDetailHeader from "@/components/AnimeDetailHeader";
import DetailEpisodeList from "@/components/DetailEpisodeList";
import MalRatingCard from "@/components/MalRatingCard";
import type { Metadata } from "next";
import Link from "next/link";
import type { AnimeDetail } from "@/types/anime";

// Tier 2: Moderately Static — anime metadata updates occasionally
export const revalidate = 10800; // 3 hours

interface AnimeDetailPageProps {
    params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nime-nime.web.id";

export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const { detail: anime } = await getAnimeDetail(slug);

        const ogUrl = new URL("/api/og", BASE_URL);
        ogUrl.searchParams.set("title", anime.title);
        ogUrl.searchParams.set("poster", anime.poster);
        if (anime.rating) ogUrl.searchParams.set("rating", anime.rating);

        const ogImage = ogUrl.toString();

        return {
            title: `${anime.title} — NimeNime`,
            description: anime.synopsis
                ? anime.synopsis.slice(0, 160) + (anime.synopsis.length > 160 ? "…" : "")
                : `Nonton ${anime.title} subtitle Indonesia gratis di NimeNime.`,
            openGraph: {
                title: anime.title,
                description: anime.synopsis
                    ? anime.synopsis.slice(0, 160)
                    : `Nonton ${anime.title} sub Indo gratis.`,
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: anime.title,
                    },
                ],
                type: "website",
                siteName: "NimeNime",
                url: `${BASE_URL}/anime/${slug}`,
            },
            twitter: {
                card: "summary_large_image",
                title: anime.title,
                description: anime.synopsis
                    ? anime.synopsis.slice(0, 160)
                    : `Nonton ${anime.title} sub Indo gratis.`,
                images: [ogImage],
            },
        };
    } catch {
        return {
            title: "Anime — NimeNime",
            description: "Nonton anime subtitle Indonesia gratis di NimeNime.",
        };
    }
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
    const { slug } = await params;
    let anime: AnimeDetail | null = null;
    let serialSlug: string | null = null;

    try {
        // Dual-fetch: run API calls and scraper concurrently
        const [detailResponse, fetchedSerialSlug] = await Promise.all([
            getAnimeDetail(slug),
            fetchSerialSlug(slug).catch((error) => {
                console.error("[AnimeDetailPage] Failed to fetch serial slug:", error);
                return null;
            }),
        ]);
        anime = detailResponse.detail;
        serialSlug = fetchedSerialSlug;
    } catch (error) {
        console.error("[AnimeDetailPage] Failed to fetch anime detail:", error);
    }

    if (!anime) {
        return (
            <div className="mx-auto max-w-[1440px] px-4 py-16 lg:px-6">
                <div className="mx-auto max-w-xl rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                    <h1 className="text-xl font-bold text-hn-text">
                        Anime unavailable
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-hn-text-muted/70">
                        The anime detail API is currently unreachable. Please try again later.
                    </p>
                    <Link
                        href={`/anime/${slug}`}
                        className="mt-5 inline-flex rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark transition-opacity hover:opacity-90"
                    >
                        Try again
                    </Link>
                </div>
            </div>
        );
    }

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
