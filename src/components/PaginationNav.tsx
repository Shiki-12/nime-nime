import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────

interface PaginationNavProps {
    /** Current active page (1-indexed) */
    currentPage: number;
    /** Total number of pages (from scraper). May be undefined/0/1 if scrape failed. */
    totalPages: number;
    /** Whether there is a next page (from the main API response) */
    hasNext: boolean;
    /** Whether there is a previous page (from the main API response) */
    hasPrev: boolean;
    /**
     * Function that returns the href for a given page number.
     * Example: (page) => `/search/naruto?page=${page}`
     */
    buildHref: (page: number) => string;
}

// ─── Page-number window builder ────────────────────────────────────────

function getPageNumbers(
    current: number,
    total: number
): (number | "...")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");

    pages.push(total);

    return pages;
}

// ─── Component ─────────────────────────────────────────────────────────

export default function PaginationNav({
    currentPage,
    totalPages,
    hasNext,
    hasPrev,
    buildHref,
}: PaginationNavProps) {
    const validTotalPages = typeof totalPages === "number" && totalPages > 1 ? totalPages : 0;

    // ── Full numbered pagination (when totalPages is known) ──────────
    if (validTotalPages > 1) {
        const safePage = Math.max(1, Math.min(currentPage, validTotalPages));
        const pages = getPageNumbers(safePage, validTotalPages);

        return (
            <nav
                aria-label="Pagination"
                className="mt-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
            >
                {/* ← Previous */}
                {safePage > 1 ? (
                    <Link
                        href={buildHref(safePage - 1)}
                        className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/60 backdrop-blur-sm transition-all hover:bg-white/[0.12] hover:text-white sm:px-4 sm:text-[13px]"
                    >
                        ← Prev
                    </Link>
                ) : (
                    <span className="cursor-not-allowed rounded-lg bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/20 sm:px-4 sm:text-[13px]">
                        ← Prev
                    </span>
                )}

                {/* Page numbers */}
                {pages.map((page, idx) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="px-0.5 text-xs text-white/30 sm:px-1 sm:text-[13px]"
                        >
                            …
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={buildHref(page)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 sm:h-9 sm:w-9 sm:text-[13px] ${
                                page === safePage
                                    ? "bg-hn-primary text-hn-dark shadow-lg shadow-hn-primary/30"
                                    : "bg-white/[0.06] text-white/60 hover:bg-white/[0.12] hover:text-white"
                            }`}
                        >
                            {page}
                        </Link>
                    )
                )}

                {/* Next → */}
                {safePage < validTotalPages ? (
                    <Link
                        href={buildHref(safePage + 1)}
                        className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/60 backdrop-blur-sm transition-all hover:bg-white/[0.12] hover:text-white sm:px-4 sm:text-[13px]"
                    >
                        Next →
                    </Link>
                ) : (
                    <span className="cursor-not-allowed rounded-lg bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/20 sm:px-4 sm:text-[13px]">
                        Next →
                    </span>
                )}
            </nav>
        );
    }

    // ── Fallback: Prev / Page N / Next (when totalPages is unknown) ──
    // This MUST render if hasNext or hasPrev is true, so we never get a blank gap.
    if (!hasNext && !hasPrev) return null;

    return (
        <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-2"
        >
            {hasPrev ? (
                <Link
                    href={buildHref(currentPage - 1)}
                    className="rounded-full bg-white/[0.06] px-5 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                    ← Previous
                </Link>
            ) : (
                <span className="cursor-not-allowed rounded-full bg-white/[0.03] px-5 py-2 text-sm font-semibold text-white/20">
                    ← Previous
                </span>
            )}

            <span className="rounded-full bg-hn-primary/15 px-4 py-2 text-sm font-bold text-hn-primary">
                {currentPage}
            </span>

            {hasNext ? (
                <Link
                    href={buildHref(currentPage + 1)}
                    className="rounded-full bg-white/[0.06] px-5 py-2 text-sm font-semibold text-white/70 transition-all hover:bg-white/[0.12] hover:text-white"
                >
                    Next →
                </Link>
            ) : (
                <span className="cursor-not-allowed rounded-full bg-white/[0.03] px-5 py-2 text-sm font-semibold text-white/20">
                    Next →
                </span>
            )}
        </nav>
    );
}
