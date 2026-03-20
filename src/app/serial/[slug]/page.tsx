import * as cheerio from "cheerio";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Cache ─────────────────────────────────────────────────────────
// Serial relationships rarely change
export const revalidate = 86400; // 24 hours

// ─── Types ─────────────────────────────────────────────────────────
interface SerialAnime {
    title: string;
    slug: string;
    poster: string;
    type: string;
    status: string;
}

interface SerialData {
    title: string;
    animes: SerialAnime[];
}

// ─── Scraper ───────────────────────────────────────────────────────
async function scrapeSerialPage(url: string): Promise<{
    title: string;
    animes: SerialAnime[];
    nextPageUrl: string | null;
}> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
        signal: controller.signal,
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
        cache: "no-store",
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract franchise title
    const rawTitle =
        $(".releases h1").first().text().trim() ||
        $("h1").first().text().trim();
    const title = rawTitle || "";

    // Extract anime items
    const animes: SerialAnime[] = [];

    $(".bs .bsx").each((_i, el) => {
        const anchor = $(el).find("a").first();
        const href = anchor.attr("href") || "";
        const itemTitle =
            anchor.attr("title") ||
            $(el).find(".tt, h2, h3").first().text().trim() ||
            "";

        // Extract slug from href like https://v1.animasu.app/anime/some-slug/
        const slugMatch = href.match(/\/anime\/([^/]+)/);
        if (!slugMatch) return; // skip non-anime links

        const img = $(el).find("img").first();
        const poster =
            img.attr("data-src") || img.attr("src") || "";

        const type = $(el).find(".typez").text().trim() || "TV";
        const status = $(el).find(".epx").text().trim() || "";

        animes.push({
            title: itemTitle.replace(/^Nonton Anime\s*/i, "").trim(),
            slug: slugMatch[1],
            poster,
            type,
            status,
        });
    });

    // Check for next page
    const nextHref =
        $(".hpage a.r").attr("href") ||
        $('a.next.page-numbers').attr("href") ||
        null;

    return { title, animes, nextPageUrl: nextHref };
}

async function getSerialData(slug: string): Promise<SerialData | null> {
    try {
        const baseUrl = `https://v1.animasu.app/serial/${slug}/`;
        const allAnimes: SerialAnime[] = [];
        let currentUrl: string | null = baseUrl;
        let franchiseTitle = "";

        // Scrape all pages (with a safety cap of 10 pages)
        let page = 0;
        while (currentUrl && page < 10) {
            const result = await scrapeSerialPage(currentUrl);

            if (!franchiseTitle && result.title) {
                franchiseTitle = result.title;
            }

            allAnimes.push(...result.animes);
            currentUrl = result.nextPageUrl;
            page++;
        }

        if (allAnimes.length === 0) return null;

        // Fallback title: capitalize the slug
        if (!franchiseTitle) {
            franchiseTitle = `Kumpulan Anime ${slug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}`;
        }

        return { title: franchiseTitle, animes: allAnimes };
    } catch {
        return null;
    }
}

// ─── Pagination ────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

// ─── Page Component ────────────────────────────────────────────────
interface SerialPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SerialPage({ params, searchParams }: SerialPageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const data = await getSerialData(slug);

    if (!data) return notFound();

    // Pagination logic
    const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);
    const totalPages = Math.ceil(data.animes.length / ITEMS_PER_PAGE);
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedAnime = data.animes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-hn-dark">
            {/* Header */}
            <div className="relative overflow-hidden">
                {/* Decorative gradient bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-hn-primary/[0.07] via-transparent to-transparent" />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(var(--color-hn-primary-rgb, 99,102,241), 0.08) 0%, transparent 60%)",
                    }}
                />

                <div className="relative mx-auto max-w-[1440px] px-4 pb-6 pt-24 lg:px-6">
                    {/* Breadcrumb */}
                    <div className="mb-4 flex items-center gap-2 text-[13px] text-white/30">
                        <Link
                            href="/"
                            className="transition-colors hover:text-hn-primary"
                        >
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-white/50">Serial</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
                        {data.title}
                    </h1>
                    <p className="mt-2 text-sm text-white/40">
                        {data.animes.length} anime dalam franchise ini
                        {totalPages > 1 && (
                            <span className="ml-1">
                                — Halaman {safePage} dari {totalPages}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-4 lg:px-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {paginatedAnime.map((anime, index) => (
                        <Link
                            key={anime.slug}
                            href={`/anime/${anime.slug}`}
                            className="group relative block overflow-hidden rounded-lg bg-hn-card transition-all duration-300 hover:ring-1 hover:ring-hn-primary/30"
                        >
                            {/* Poster */}
                            <div className="relative aspect-[3/4.2] w-full overflow-hidden">
                                <Image
                                    src={anime.poster}
                                    alt={anime.title}
                                    fill
                                    unoptimized
                                    sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 20vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Hover overlay */}
                                <div className="card-hover-overlay absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/40 to-transparent">
                                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-12">
                                        <span className="flex items-center gap-1.5 rounded-full bg-hn-primary px-4 py-1.5 text-xs font-bold text-hn-dark shadow-lg shadow-hn-primary/30">
                                            <svg
                                                className="h-3.5 w-3.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                            </svg>
                                            Watch Now
                                        </span>
                                    </div>
                                </div>

                                {/* Order badge (top-left) — global index across all pages */}
                                <div className="absolute left-0 top-0 flex items-center gap-1 bg-hn-dark/80 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm">
                                    <span className="text-hn-primary">
                                        #{startIndex + index + 1}
                                    </span>
                                </div>

                                {/* Type badge (top-right) */}
                                <span className="absolute right-0 top-0 bg-hn-primary/90 px-2 py-1 text-[10px] font-bold uppercase text-hn-dark">
                                    {anime.type}
                                </span>

                                {/* Status tag (bottom-right) */}
                                {anime.status && (
                                    <span className="absolute bottom-1 right-1 rounded bg-hn-dark/80 px-1.5 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
                                        {anime.status}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <div className="px-2.5 py-2">
                                <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90 transition-colors group-hover:text-hn-primary">
                                    {anime.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Pagination ─────────────────────────────────────── */}
                {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-2">
                        {/* Previous */}
                        {safePage > 1 ? (
                            <Link
                                href={`?page=${safePage - 1}`}
                                className="rounded-lg bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white/60 backdrop-blur-sm transition-colors hover:bg-white/[0.12] hover:text-white"
                            >
                                « Sebelumnya
                            </Link>
                        ) : (
                            <span className="rounded-lg bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/20 cursor-not-allowed">
                                « Sebelumnya
                            </span>
                        )}

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (page) => (
                                <Link
                                    key={page}
                                    href={`?page=${page}`}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                                        page === safePage
                                            ? "bg-hn-primary text-hn-dark shadow-lg shadow-hn-primary/30"
                                            : "bg-white/[0.06] text-white/60 hover:bg-white/[0.12] hover:text-white"
                                    }`}
                                >
                                    {page}
                                </Link>
                            )
                        )}

                        {/* Next */}
                        {safePage < totalPages ? (
                            <Link
                                href={`?page=${safePage + 1}`}
                                className="rounded-lg bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white/60 backdrop-blur-sm transition-colors hover:bg-white/[0.12] hover:text-white"
                            >
                                Berikutnya »
                            </Link>
                        ) : (
                            <span className="rounded-lg bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/20 cursor-not-allowed">
                                Berikutnya »
                            </span>
                        )}
                    </nav>
                )}
            </div>
        </div>
    );
}
