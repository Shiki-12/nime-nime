import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import DeleteCommentButton from "./DeleteCommentButton";
import AdminPagination from "../AdminPagination";

const ITEMS_PER_PAGE = 10;

// ── Relative time helper ────────────────────────────────────────────
function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
        [31536000, "year"],
        [2592000, "month"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
    ];
    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
    return "Just now";
}

export default async function CommentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    // ── Auth Guard ──────────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    // ── Pagination params ───────────────────────────────────────────
    const params = await searchParams;
    const rawPage = parseInt(params.page ?? "1", 10);
    const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    // ── Fetch paginated comments + total count ──────────────────────
    const [comments, totalCount] = await Promise.all([
        prisma.comment.findMany({
            take: ITEMS_PER_PAGE,
            skip,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
        }),
        prisma.comment.count(),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-hn-text">
                        Comments Moderation
                    </h1>
                    <p className="mt-1 text-sm text-hn-text-muted">
                        {totalCount} total comment{totalCount !== 1 ? "s" : ""} across all episodes
                    </p>
                </div>
            </div>

            {/* ── Comments List ───────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-sm text-hn-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10 text-hn-text-muted/30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        No comments yet.
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="group flex gap-3 px-4 py-4 transition-colors duration-200 hover:bg-white/[0.02] sm:px-6"
                            >
                                {/* Avatar */}
                                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-hn-card ring-1 ring-white/[0.08]">
                                    <SafeImage
                                        src={comment.user.image ?? undefined}
                                        alt={comment.user.name}
                                        className="h-full w-full object-cover"
                                        fallback={
                                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-hn-text-muted">
                                                {comment.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        }
                                    />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    {/* Top: name + target + time */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <span className="text-sm font-medium text-hn-text">
                                            {comment.user.name}
                                        </span>
                                        <span className="text-[10px] text-hn-text-muted/50">•</span>
                                        <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-hn-text-muted ring-1 ring-white/[0.06]">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5">
                                                <path fillRule="evenodd" d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                            {comment.episodeSlug}
                                        </span>
                                        <span className="text-[10px] text-hn-text-muted/50">•</span>
                                        <span className="text-[10px] text-hn-text-muted">
                                            {timeAgo(comment.createdAt)}
                                        </span>
                                    </div>

                                    {/* Comment text */}
                                    <p className="mt-1.5 text-sm leading-relaxed text-hn-text/80">
                                        {comment.text}
                                    </p>

                                    {/* Actions row */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <DeleteCommentButton
                                            commentId={comment.id}
                                            userName={comment.user.name}
                                        />
                                        {comment.parentId && (
                                            <span className="text-[10px] text-hn-text-muted/40 italic">
                                                reply
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ─────────────────────────────────────────── */}
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                basePath="/aishiteru/comments"
            />
        </div>
    );
}
