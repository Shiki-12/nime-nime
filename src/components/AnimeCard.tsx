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
      className="group relative block"
      aria-label={`${anime.title} — ${anime.episode}`}
    >
      {/* ── Poster image container ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1280px) 20vw, 14vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        {/* ── Single cohesive hover overlay ── */}
        <div
          className="absolute inset-0 z-[5] flex items-center justify-center bg-black/0 transition-[background-color] duration-300 ease-in-out group-hover:bg-black/45"
          aria-hidden="true"
        >
          {/* Play button — fades + scales in on hover */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm opacity-60 scale-100 md:opacity-0 md:scale-50 transition-all duration-300 ease-out md:group-hover:opacity-100 md:group-hover:scale-100">
            <svg
              className="h-5 w-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
            </svg>
          </div>
        </div>

        {/* ── Badge overlays (z-10 to stay above hover overlay) ── */}

        {/* Episode badge — bottom left */}
        {anime.episode && (
          <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-[4px] bg-hn-dark/85 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            <svg className="h-3 w-3 text-hn-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z" />
            </svg>
            {anime.episode}
          </span>
        )}

        {/* Type badge — top right */}
        {anime.type && (
          <span className="absolute right-2 top-2 z-10 rounded-[4px] bg-hn-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-hn-dark shadow-sm">
            {anime.type}
          </span>
        )}
      </div>

      {/* ── Title & metadata below image (no shift on hover) ── */}
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white/90 transition-colors duration-200 group-hover:text-hn-primary">
          {anime.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/35">
          {anime.type && <span>{anime.type}</span>}
          {anime.status_or_day && (
            <>
              <span className="inline-block h-[3px] w-[3px] rounded-full bg-white/25" />
              <span>{anime.status_or_day}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

