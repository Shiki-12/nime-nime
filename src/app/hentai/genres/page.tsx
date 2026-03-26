import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hentai Genres — NimeNime",
  robots: { index: false, follow: false },
};

const GENRES = [
  { name: "3D", slug: "3d" },
  { name: "Ahegao", slug: "ahegao" },
  { name: "Anal", slug: "anal" },
  { name: "BDSM", slug: "bdsm" },
  { name: "Big Boobs", slug: "big-boobs" },
  { name: "Blowjob", slug: "blowjob" },
  { name: "Bondage", slug: "bondage" },
  { name: "Busty", slug: "busty" },
  { name: "Comedy", slug: "comedy" },
  { name: "Cosplay", slug: "cosplay" },
  { name: "Creampie", slug: "creampie" },
  { name: "Dark Skin", slug: "dark-skin" },
  { name: "Demon", slug: "demon" },
  { name: "Drama", slug: "drama" },
  { name: "Ecchi", slug: "ecchi" },
  { name: "Elf", slug: "elf" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Femdom", slug: "femdom" },
  { name: "Futanari", slug: "futanari" },
  { name: "Gangbang", slug: "gangbang" },
  { name: "Gyaru", slug: "gyaru" },
  { name: "Harem", slug: "harem" },
  { name: "Horror", slug: "horror" },
  { name: "Housewife", slug: "housewife" },
  { name: "Imouto", slug: "imouto" },
  { name: "Incest", slug: "incest" },
  { name: "Loli", slug: "loli" },
  { name: "Maid", slug: "maid" },
  { name: "Milf", slug: "milf" },
  { name: "Monster", slug: "monster" },
  { name: "Netorase", slug: "netorase" },
  { name: "Netorare", slug: "netorare" },
  { name: "NTR", slug: "ntr" },
  { name: "Nurse", slug: "nurse" },
  { name: "Orgy", slug: "orgy" },
  { name: "Paizuri", slug: "paizuri" },
  { name: "Rape", slug: "rape" },
  { name: "Romance", slug: "romance" },
  { name: "School", slug: "school" },
  { name: "Sci-Fi", slug: "sci-fi" },
  { name: "Shota", slug: "shota" },
  { name: "Succubus", slug: "succubus" },
  { name: "Supernatural", slug: "supernatural" },
  { name: "Teacher", slug: "teacher" },
  { name: "Tentacle", slug: "tentacle" },
  { name: "Tsundere", slug: "tsundere" },
  { name: "Ugly Bastard", slug: "ugly-bastard" },
  { name: "Uncensored", slug: "uncensored" },
  { name: "Vanilla", slug: "vanilla" },
  { name: "Yandere", slug: "yandere" },
  { name: "Yaoi", slug: "yaoi" },
  { name: "Yuri", slug: "yuri" },
];

export default function HentaiGenresPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-20 lg:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          <span className="text-hn-primary">Browse by</span>{" "}
          <span className="text-hn-text">Genre</span>
        </h1>
        <p className="mt-2 text-sm text-hn-text-muted">
          Explore {GENRES.length} genres to find exactly what you&apos;re looking for.
        </p>
      </div>

      {/* Genre grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {GENRES.map((genre) => (
          <Link
            key={genre.slug}
            href={`/hentai/genres/${genre.slug}`}
            className="group relative overflow-hidden rounded-xl bg-hn-card px-4 py-5 text-center transition-all duration-200 hover:bg-hn-card-hover hover:ring-1 hover:ring-hn-primary/30 hover:shadow-lg hover:shadow-hn-primary/5"
          >
            <span className="text-sm font-semibold text-hn-text/80 transition-colors group-hover:text-hn-primary">
              {genre.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Back */}
      <div className="mt-10 text-center">
        <Link
          href="/hentai"
          className="text-xs font-semibold text-hn-primary/70 transition-colors hover:text-hn-primary"
        >
          ← Back to Collection
        </Link>
      </div>
    </div>
  );
}
