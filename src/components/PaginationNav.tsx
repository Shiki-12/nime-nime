import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────

interface PaginationNavProps {
    /** Current active page (1-indexed) */
    currentPage: number;
    /** Total number of pages (from scraper) */
    totalPages: number;
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
    buildHref,
}: PaginationNavProps) {
    // Don't render if only one page
    if (totalPages <= 1) return null;

    const safePage = Math.max(1, Math.min(currentPage, totalPages));
    const pages = getPageNumbers(safePage, totalPages);

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
            {safePage < totalPages ? (
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
