import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    /** Base path without query params, e.g. "/aishiteru/users" */
    basePath: string;
}

export default function AdminPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    basePath,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            {/* Info */}
            <p className="text-xs text-hn-text-muted">
                Showing{" "}
                <span className="font-medium text-hn-text">{start}</span>
                –
                <span className="font-medium text-hn-text">{end}</span>
                {" "}of{" "}
                <span className="font-medium text-hn-text">{totalItems}</span>
            </p>

            {/* Controls */}
            <div className="flex items-center gap-2">
                {/* Previous */}
                {hasPrev ? (
                    <Link
                        href={`${basePath}?page=${currentPage - 1}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-hn-card px-3 py-1.5 text-xs font-medium text-hn-text transition-all duration-200 hover:border-hn-primary/30 hover:bg-hn-card-hover"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </Link>
                ) : (
                    <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-hn-text-muted/40">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </span>
                )}

                {/* Page indicator */}
                <span className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-hn-text-muted ring-1 ring-white/[0.06]">
                    {currentPage} / {totalPages}
                </span>

                {/* Next */}
                {hasNext ? (
                    <Link
                        href={`${basePath}?page=${currentPage + 1}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-hn-card px-3 py-1.5 text-xs font-medium text-hn-text transition-all duration-200 hover:border-hn-primary/30 hover:bg-hn-card-hover"
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </Link>
                ) : (
                    <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-hn-text-muted/40">
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                    </span>
                )}
            </div>
        </div>
    );
}
