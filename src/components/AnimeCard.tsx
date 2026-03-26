import Image from "next/image";
import Link from "next/link";
import type { OngoingAnime } from "@/types/anime";

interface AnimeCardProps {
    anime: OngoingAnime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
    const href = `/anime/${anime.slug}`;

    return (
        <Link
            href={href}
            className="group relative block overflow-hidden rounded-lg bg-hn-card transition-all duration-300 hover:ring-1 hover:ring-hn-primary/30"
        >
            {/* Cover image */}
            <div className="relative aspect-[3/4.2] w-full overflow-hidden">
                <Image
                    src={anime.poster}
                    alt={anime.title}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="card-hover-overlay absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/40 to-transparent">
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-12">
                        <span className="flex items-center gap-1.5 rounded-full bg-hn-primary px-4 py-1.5 text-xs font-bold text-hn-dark shadow-lg shadow-hn-primary/30">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                            Watch Now
                        </span>
                    </div>
                </div>

                {/* Episode badge (top-left) */}
                <div className="absolute left-0 top-0 flex items-center gap-1 bg-hn-dark/80 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm">
                    <span className="text-hn-primary">{anime.episode}</span>
                </div>

                {/* Type badge (top-right) */}
                <span className="absolute right-0 top-0 bg-hn-primary/90 px-2 py-1 text-[10px] font-bold uppercase text-hn-dark">
                    {anime.type}
                </span>

                {/* Status tag (bottom-right) */}
                {anime.status_or_day && (
                    <span className="absolute bottom-1 right-1 rounded bg-hn-dark/80 px-1.5 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
                        {anime.status_or_day}
                    </span>
                )}
            </div>

            {/* Title */}
            <div className="px-3 py-3">
                <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90 transition-colors group-hover:text-hn-primary">
                    {anime.title}
                </h3>
            </div>
        </Link>
    );
}
