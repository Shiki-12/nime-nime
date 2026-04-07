import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchHentaiDetail } from "@/lib/hentaiApi";
import type { Metadata } from "next";

export const revalidate = 10800; // 3 hours ISR

// ─── Dynamic metadata ──────────────────────────────────────────────

interface HentaiDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: HentaiDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchHentaiDetail(slug);
  const title = data?.info?.[0]?.videoname ?? slug;

  return {
    title: `${title} — NimeNime`,
    description: data?.info?.[0]?.description?.slice(0, 160) ?? "",
    robots: { index: false, follow: false },
  };
}

// ─── Page component ────────────────────────────────────────────────

export default async function HentaiDetailPage({
  params,
}: HentaiDetailPageProps) {
  const { slug } = await params;
  const data = await fetchHentaiDetail(slug);

  if (!data || !data.info || data.info.length === 0) {
    return notFound();
  }

  const info = data.info[0];
  const genres = data.genres ?? [];

  const releaseDate = info.releasedate
    ? new Date(info.releasedate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const uploadDate = info.uploaddate
    ? new Date(info.uploaddate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Clean description: remove \r\n artifacts
  const description = info.description
    ?.replace(/\\r\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

  return (
    <div className="min-h-screen bg-hn-dark">
      {/* ─── Video Player ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pt-24 lg:px-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-hn-body shadow-lg shadow-hn-primary/10">
          <iframe
            src={`https://hentaiocean.com/embed/${slug}`}
            className="h-full w-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen"
            title={info.videoname}
          />
        </div>
      </div>

      {/* ─── Metadata Section ─────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-16 lg:px-6">
        {/* Title */}
        <h1 className="mt-6 text-2xl font-bold text-hn-text md:text-3xl">
          {info.videoname}
        </h1>

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* 18+ badge */}
          <span className="rounded bg-red-600 px-2.5 py-1 text-xs font-bold text-hn-text">
            18+
          </span>

          {/* Status badge */}
          <span className="rounded bg-hn-primary/15 px-2.5 py-1 text-xs font-semibold text-hn-primary">
            {info.status === 1 ? "Released" : "Upcoming"}
          </span>

          {/* Release date */}
          {releaseDate && (
            <span className="flex items-center gap-1.5 rounded bg-hn-border/20 px-2.5 py-1 text-xs text-hn-text-muted/70">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {releaseDate}
            </span>
          )}

          {/* Upload date */}
          {uploadDate && (
            <span className="flex items-center gap-1.5 rounded bg-hn-border/20 px-2.5 py-1 text-xs text-hn-text-muted/70">
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Uploaded {uploadDate}
            </span>
          )}

          {/* Series */}
          {info.series && (
            <span className="rounded bg-hn-secondary/15 px-2.5 py-1 text-xs font-medium text-hn-secondary">
              Series: {info.series}
            </span>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {genres.map((g) => (
              <span
                key={g.genre}
                className="rounded-full border border-hn-primary/20 bg-hn-primary/10 px-3 py-1 text-sm text-hn-primary"
              >
                {g.genre}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="my-6 h-px bg-hn-border/20" />

        {/* Synopsis */}
        {description && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-hn-text-muted/60">
              Synopsis
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-hn-text/70">
              {description}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="my-6 h-px bg-hn-border/20" />

        {/* Back navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/hentai"
            className="rounded-full bg-hn-card px-5 py-2.5 text-sm font-semibold text-hn-text transition-all hover:bg-hn-card-hover"
          >
            ← Back to Collection
          </Link>
          <a
            href={`https://hentaiocean.com/watch/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-hn-text-muted/70 transition-all hover:border-white/20 hover:text-hn-text-muted/90"
          >
            View on HentaiOcean ↗
          </a>
        </div>
      </div>
    </div>
  );
}
