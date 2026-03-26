import Image from "next/image";
import Link from "next/link";
import AnimeActions from "@/components/AnimeActions";
import WatchNowButton from "@/components/WatchNowButton";
import type { EpisodeItem } from "@/types/anime";

// ─── Types ─────────────────────────────────────────────────────────
interface Genre {
    name: string;
    slug: string;
}

interface AnimeDetailHeaderProps {
    title: string;
    posterUrl: string;
    genres: Genre[];
    synopsis: string;
    status: string;
    type: string;
    duration?: string;
    slug: string;
    episodes: EpisodeItem[];
    serialSlug?: string | null;
}

// ─── Skeleton Loader ───────────────────────────────────────────────
// Mimics the full responsive layout for smooth perceived performance
export function AnimeDetailHeaderSkeleton() {
    return (
        <div className="relative w-full overflow-hidden">
            {/* Background placeholder */}
            <div className="h-[60vh] w-full bg-hn-dark md:h-[50vh]" />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/70 to-transparent" />

            {/* Content skeleton */}
            <div className="absolute inset-0 flex items-end">
                <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 pb-10 lg:px-6">
                    {/* Poster skeleton (desktop) */}
                    <div className="hidden shrink-0 md:block">
                        <div className="h-[300px] w-[210px] animate-pulse rounded-xl bg-hn-card" />
                    </div>

                    {/* Text skeleton */}
                    <div className="flex flex-1 flex-col gap-3">
                        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-hn-card" />
                        <div className="flex gap-2">
                            <div className="h-5 w-16 animate-pulse rounded bg-hn-card" />
                            <div className="h-5 w-20 animate-pulse rounded bg-hn-card" />
                            <div className="h-5 w-14 animate-pulse rounded bg-hn-card" />
                        </div>
                        <div className="flex gap-1.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-6 w-16 animate-pulse rounded bg-hn-card" />
                            ))}
                        </div>
                        <div className="h-12 w-full max-w-lg animate-pulse rounded-lg bg-hn-card" />
                        <div className="flex gap-2">
                            <div className="h-8 w-20 animate-pulse rounded-full bg-hn-card" />
                            <div className="h-8 w-8 animate-pulse rounded-full bg-hn-card" />
                            <div className="h-8 w-8 animate-pulse rounded-full bg-hn-card" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AnimeDetailHeader({
    title,
    posterUrl,
    genres,
    synopsis,
    status,
    type,
    duration,
    slug,
    episodes,
    serialSlug,
}: AnimeDetailHeaderProps) {
    return (
        <div className="relative w-full overflow-hidden">
            {/* ── Immersive Blurred Background ──────────────────────── */}
            {/* Full-viewport-width hero with heavy blur + saturation   */}
            <div className="relative h-[60vh] w-full md:h-[50vh]">
                <Image
                    src={posterUrl}
                    alt=""
                    fill
                    priority
                    unoptimized
                    className="object-cover scale-110 blur-3xl brightness-[0.35] saturate-[1.8]"
                />

                {/* Gradient overlay 1: bottom fade into page bg */}
                <div className="absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/60 to-transparent" />

                {/* Gradient overlay 2: left-side readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-hn-dark/80 via-transparent to-transparent" />

                {/* Gradient overlay 3: subtle radial vignette */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 30% 80%, transparent 40%, rgba(32,32,42,0.6) 100%)",
                    }}
                />
            </div>

            {/* ── Content Layer ─────────────────────────────────────── */}
            <div className="absolute inset-x-0 bottom-0 flex">
                <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-4 pb-12 lg:px-8">

                    {/* ── Sharp Poster (desktop only) ───────────────── */}
                    <div className="hidden shrink-0 md:block">
                        <div className="relative h-[300px] w-[210px] overflow-hidden rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
                            <Image
                                src={posterUrl}
                                alt={title}
                                fill
                                priority
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* ── Text & Actions ────────────────────────────── */}
                    <div className="flex flex-1 flex-col justify-end gap-4">
                        {/* Title */}
                        <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                            {title}
                        </h1>

                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">
                            <span className="rounded bg-hn-primary/20 px-2 py-0.5 font-semibold text-hn-primary">
                                {type}
                            </span>
                            <span className="rounded bg-white/[0.06] px-2 py-0.5 font-medium text-white/60 backdrop-blur-sm">
                                {status}
                            </span>
                            {duration && (
                                <span className="rounded bg-white/[0.06] px-2 py-0.5 font-medium text-white/60 backdrop-blur-sm">
                                    {duration}
                                </span>
                            )}
                        </div>

                        {/* Genre tags */}
                        <div className="flex flex-wrap gap-2.5">
                            {genres.map((g) => (
                                <Link
                                    key={g.slug}
                                    href={`/genres/${g.slug}`}
                                    className="rounded bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/50 backdrop-blur-sm transition-colors hover:bg-hn-primary/15 hover:text-hn-primary"
                                >
                                    {g.name}
                                </Link>
                            ))}
                        </div>

                        {/* Synopsis excerpt */}
                        <p className="line-clamp-3 max-w-2xl text-[13px] leading-relaxed text-white/40">
                            {synopsis}
                        </p>

                        {/* Actions row: Watch Now CTA + Save/Like/Dislike */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Primary CTA: Watch Now / Continue Watching */}
                            <WatchNowButton animeSlug={slug} episodes={episodes} />

                            {/* Secondary actions (Save / Like / Dislike) */}
                            <AnimeActions
                                anime={{
                                    slug,
                                    title,
                                    poster: posterUrl,
                                    type,
                                }}
                            />

                            {/* Franchise / Serial link */}
                            {serialSlug && (
                                <Link
                                    href={`/serial/${serialSlug}`}
                                    className="group relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold text-hn-primary transition-all duration-300 hover:shadow-[0_0_16px_rgba(var(--color-hn-primary-rgb,99,102,241),0.25)]"
                                >
                                    {/* Gradient border ring */}
                                    <span className="absolute inset-0 rounded-full border border-hn-primary/40 bg-hn-primary/[0.06] backdrop-blur-sm transition-colors group-hover:border-hn-primary/70 group-hover:bg-hn-primary/10" />
                                    <svg
                                        className="relative h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0-4-4m4 4-4 4" />
                                    </svg>
                                    <span className="relative">Cek Urutan Series / OVA</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
