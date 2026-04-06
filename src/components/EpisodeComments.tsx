"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { swalToast, swalConfirm } from "@/lib/swal";

// ─── Types ──────────────────────────────────────────────────────────

interface ParentRef {
    id: string;
    text: string;
    user: { name: string };
}

interface EpisodeComment {
    id: string;
    userId: string;
    text: string;
    parentId: string | null;
    parent: ParentRef | null;
    episodeSlug: string;
    createdAt: string;
    user: { name: string; image: string | null; email: string | null; role?: string };
}

// ─── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function UserAvatar({
    src,
    name,
    size = 32,
}: {
    src: string | null;
    name: string;
    size?: number;
}) {
    if (src) {
        return (
            <Image
                src={src}
                alt={name}
                width={size}
                height={size}
                className="shrink-0 rounded-full object-cover ring-1 ring-white/10"
                unoptimized={true}
            />
        );
    }
    return (
        <div
            className="flex shrink-0 items-center justify-center rounded-full bg-hn-primary/20 font-bold text-hn-primary ring-1 ring-white/10"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
    );
}



// ─── Skeleton ───────────────────────────────────────────────────────

function CommentsSkeleton() {
    return (
        <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                    <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 w-24 rounded" />
                        <div
                            className="skeleton h-4 rounded"
                            style={{ width: `${40 + Math.random() * 50}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────

interface EpisodeCommentsProps {
    episodeSlug: string;
    animeSlug?: string;
}

export default function EpisodeComments({ episodeSlug, animeSlug }: EpisodeCommentsProps) {
    const { data: session, status } = useSession();
    const [comments, setComments] = useState<EpisodeComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // ── Reply state ─────────────────────────────────────────────────
    const [replyingTo, setReplyingTo] = useState<{
        id: string;
        userName: string;
    } | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/comments?episodeSlug=${encodeURIComponent(episodeSlug)}`
            );
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [episodeSlug]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // ── Start reply ─────────────────────────────────────────────────
    const handleReply = (commentId: string, userName: string) => {
        setReplyingTo({ id: commentId, userName });
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    // ── Submit comment / reply ──────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    episodeSlug,
                    animeSlug,
                    parentId: replyingTo?.id,
                    text: trimmed,
                }),
            });

            if (res.ok) {
                setCommentText("");
                setReplyingTo(null);
                swalToast({ title: replyingTo ? "Reply posted!" : "Comment posted!", icon: "success" });
                fetchComments();
            } else if (res.status === 401) {
                swalToast({
                    title: "Please sign in to comment.",
                    icon: "warning",
                });
            } else {
                const data = await res.json();
                swalToast({
                    title: data.error || "Failed to post comment.",
                    icon: "error",
                });
            }
        } catch {
            swalToast({ title: "Network error.", icon: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        const result = await swalConfirm.fire({
            title: "Delete comment?",
            text: "This action cannot be undone.",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return;

        setDeletingId(commentId);
        try {
            const res = await fetch(
                `/api/comments?commentId=${commentId}`,
                { method: "DELETE" }
            );
            if (res.ok) {
                setComments((prev) =>
                    prev.filter((c) => c.id !== commentId)
                );
                swalToast({ title: "Comment deleted", icon: "success" });
            } else {
                const data = await res.json();
                swalToast({
                    title: data.error || "Failed to delete comment",
                    icon: "error",
                });
            }
        } catch {
            swalToast({ title: "Network error", icon: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    // ── Scroll to parent comment ────────────────────────────────────
    const scrollToComment = (commentId: string) => {
        const el = document.getElementById(`comment-${commentId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("ring-1", "ring-hn-primary/40");
            setTimeout(() => {
                el.classList.remove("ring-1", "ring-hn-primary/40");
            }, 2000);
        }
    };

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "OWNER";

    return (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-hn-card/60">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
                <svg
                    className="h-4 w-4 text-hn-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                </svg>
                <h3 className="text-sm font-semibold tracking-wide uppercase text-white/70">
                    Comments
                </h3>
                <span className="ml-auto text-[11px] text-white/25">
                    {!loading &&
                        `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
                </span>
            </div>

            {/* Comment Form */}
            {status === "authenticated" ? (
                <form
                    onSubmit={handleSubmit}
                    className="border-b border-white/[0.06] px-5 py-4"
                >
                    {/* Replying-to indicator */}
                    {replyingTo && (
                        <div className="mb-2 flex items-center gap-2 rounded-lg bg-sky-500/[0.08] px-3 py-2">
                            <svg className="h-3.5 w-3.5 shrink-0 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                            </svg>
                            <span className="flex-1 truncate text-xs text-sky-300">
                                Replying to <span className="font-semibold">@{replyingTo.userName}</span>
                            </span>
                            <button
                                type="button"
                                onClick={cancelReply}
                                className="shrink-0 rounded p-0.5 text-sky-400/60 transition-colors hover:bg-sky-500/20 hover:text-sky-300"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <UserAvatar
                            src={session?.user?.image ?? null}
                            name={session?.user?.name ?? ""}
                            size={32}
                        />
                        <div className="min-w-0 flex-1">
                            <textarea
                                ref={textareaRef}
                                value={commentText}
                                onChange={(e) =>
                                    setCommentText(e.target.value)
                                }
                                placeholder={replyingTo ? `Reply to @${replyingTo.userName}...` : "Write a comment..."}
                                maxLength={1000}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm leading-relaxed text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40 focus:bg-white/[0.06]"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-white/20">
                                    {commentText.length}/1000
                                </span>
                                <button
                                    type="submit"
                                    disabled={
                                        !commentText.trim() || submitting
                                    }
                                    className="flex items-center gap-1.5 rounded-lg bg-hn-primary px-3.5 py-1.5 text-xs font-semibold text-hn-dark transition-all hover:shadow-lg hover:shadow-hn-primary/20 disabled:opacity-30 disabled:hover:shadow-none"
                                >
                                    {submitting ? (
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-hn-dark border-t-transparent" />
                                    ) : (
                                        <svg
                                            className="h-3.5 w-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                            />
                                        </svg>
                                    )}
                                    {replyingTo ? "Reply" : "Post Comment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="border-b border-white/[0.06] px-5 py-4">
                    <p className="text-center text-xs text-white/30">
                        Please{" "}
                        <a
                            href="/login"
                            className="font-semibold text-hn-primary transition-colors hover:text-hn-primary/80"
                        >
                            sign in
                        </a>{" "}
                        to leave a comment.
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div
                className="scrollbar-thin overflow-y-auto max-h-[500px] pr-2"
            >
                {loading ? (
                    <CommentsSkeleton />
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                        <svg
                            className="h-10 w-10 text-white/10"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                            />
                        </svg>
                        <p className="text-xs text-white/25">
                            No comments yet. Be the first!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5 p-4">
                        {[...comments].reverse().map((comment) => {
                            const isOwn =
                                comment.userId === session?.user?.id;
                            const canDelete = isAdmin || isOwn;

                            return (
                                <div
                                    key={comment.id}
                                    id={`comment-${comment.id}`}
                                    className="group/comment rounded-xl px-3 py-2.5 transition-all hover:bg-white/[0.03]"
                                >
                                    {/* Discord-style parent reference */}
                                    {comment.parent && (
                                        <button
                                            type="button"
                                            onClick={() => scrollToComment(comment.parent!.id)}
                                            className="mb-1.5 flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.04]"
                                        >
                                            {/* Curved reply connector ╭ */}
                                            <svg className="h-3.5 w-3.5 shrink-0 text-white/20" viewBox="0 0 20 20" fill="none">
                                                <path d="M4 16V8c0-2.21 1.79-4 4-4h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span className="truncate text-[11px] text-white/30">
                                                <span className="font-semibold text-white/40">@{comment.parent.user.name}</span>
                                                {" "}
                                                {comment.parent.text}
                                            </span>
                                        </button>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <UserAvatar
                                            src={comment.user.image}
                                            name={comment.user.name}
                                            size={32}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">
                                                    {comment.user.name}
                                                    {(comment.user.role === "ADMIN" || comment.user.role === "OWNER") && (
                                                        <span className={`flex items-center rounded-sm px-1 py-[1px] text-[8px] font-bold uppercase tracking-wider ring-1 ring-inset ${comment.user.role === "OWNER" ? "bg-amber-500/20 text-amber-500 ring-amber-500/50" : "bg-red-500/20 text-red-500 ring-red-500/50"}`}>
                                                            {comment.user.role === "OWNER" ? "Owner" : "Admin"}
                                                        </span>
                                                    )}
                                                    {isOwn && (
                                                        <span className="text-[10px] font-normal text-hn-primary/50">
                                                            (you)
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-[10px] text-white/20">
                                                    {timeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 break-words whitespace-pre-wrap text-[13px] leading-relaxed text-white/60">
                                                {comment.text}
                                            </p>

                                            {/* Reply button */}
                                            {status === "authenticated" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleReply(comment.id, comment.user.name)}
                                                    className="mt-1 flex items-center gap-1 text-[11px] font-medium text-white/30 md:text-white/20 transition-colors active:text-hn-primary md:hover:text-hn-primary opacity-100 md:opacity-0 md:group-hover/comment:opacity-100"
                                                >
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                                    </svg>
                                                    Reply
                                                </button>
                                            )}
                                        </div>

                                        {/* Delete Button (Owner or Admin) */}
                                        {canDelete && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(comment.id)
                                                }
                                                disabled={
                                                    deletingId === comment.id
                                                }
                                                className="shrink-0 rounded-lg p-1.5 text-red-500/40 md:text-red-500/0 opacity-100 md:opacity-0 transition-all active:bg-red-500/10 active:text-red-400 md:hover:bg-red-500/10 md:hover:text-red-400 md:group-hover/comment:text-red-500/40 md:group-hover/comment:opacity-100 disabled:opacity-50"
                                                aria-label="Delete comment"
                                            >
                                                {deletingId === comment.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                                ) : (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
