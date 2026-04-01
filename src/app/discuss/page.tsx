"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import { swalToast, swalConfirm } from "@/lib/swal";
import type { OngoingAnime } from "@/types/anime";

// ─── Types ──────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    userId: string;
    message: string;
    createdAt: string;
    user: { name: string; image: string | null; email: string | null };
}

interface Comment {
    id: string;
    userId: string;
    text: string;
    episodeSlug: string;
    createdAt: string;
    user: { name: string; image: string | null; email: string | null };
}

interface Recommendation {
    id: string;
    userId: string;
    animeSlug: string;
    animeTitle: string;
    coverImage: string;
    createdAt: string;
    user: { name: string; image: string | null; email: string | null };
}

const ADMIN_EMAIL = "uknowndonp@gmail.com";

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

// ─── Skeleton Loaders ───────────────────────────────────────────────

function ChatSkeleton() {
    return (
        <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
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

function CommentSkeleton() {
    return (
        <div className="flex flex-col gap-2.5 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl bg-white/[0.02] p-3"
                >
                    <div className="skeleton h-7 w-7 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3 w-20 rounded" />
                        <div className="skeleton h-3 w-full rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function RecommendationSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-3 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="skeleton aspect-[3/4] w-full rounded-lg" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function DiscussPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Auth guard
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    // ── Chat State ──────────────────────────────────────────────────
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [sending, setSending] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // ── Comments State ──────────────────────────────────────────────
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);

    // ── Recommendations State ───────────────────────────────────────
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        []
    );
    const [recsLoading, setRecsLoading] = useState(true);

    // ── Recommendation Modal State ──────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<OngoingAnime[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [submittingSlug, setSubmittingSlug] = useState<string | null>(null);
    const debouncedSearch = useDebounce(searchQuery.trim(), 400);
    const modalRef = useRef<HTMLDivElement>(null);

    // ── Fetchers ────────────────────────────────────────────────────
    const fetchChat = useCallback(async () => {
        try {
            const res = await fetch("/api/discuss/chat");
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch {
            /* silent */
        } finally {
            setChatLoading(false);
        }
    }, []);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch("/api/discuss/comments");
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch {
            /* silent */
        } finally {
            setCommentsLoading(false);
        }
    }, []);

    const fetchRecommendations = useCallback(async () => {
        try {
            const res = await fetch("/api/recommendations");
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data);
            }
        } catch {
            /* silent */
        } finally {
            setRecsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        if (status !== "authenticated") return;
        fetchChat();
        fetchComments();
        fetchRecommendations();
    }, [status, fetchChat, fetchComments, fetchRecommendations]);

    // Poll chat every 4s
    useEffect(() => {
        if (status !== "authenticated") return;
        const interval = setInterval(fetchChat, 4000);
        return () => clearInterval(interval);
    }, [status, fetchChat]);

    // Auto-scroll chat to bottom
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ── Send message ────────────────────────────────────────────────
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = chatInput.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setChatInput("");

        try {
            const res = await fetch("/api/discuss/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed }),
            });
            if (res.ok) {
                await fetchChat();
            } else if (res.status === 429) {
                const data = await res.json();
                swalToast({
                    title: data.error || "You are sending messages too fast.",
                    icon: "warning",
                    timer: 5000,
                });
            }
        } catch {
            /* silent */
        } finally {
            setSending(false);
        }
    };

    // ── Delete message ──────────────────────────────────────────────
    const handleDelete = async (messageId: string) => {
        const result = await swalConfirm.fire({
            title: "Delete message?",
            text: "This action cannot be undone.",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return;

        setDeletingId(messageId);
        try {
            const res = await fetch(
                `/api/discuss/chat?messageId=${messageId}`,
                {
                    method: "DELETE",
                }
            );
            if (res.ok) {
                setMessages((prev) =>
                    prev.filter((m) => m.id !== messageId)
                );
                swalToast({ title: "Message deleted", icon: "success" });
            } else {
                const data = await res.json();
                swalToast({
                    title: data.error || "Failed to delete message",
                    icon: "error",
                });
            }
        } catch {
            swalToast({ title: "Network error", icon: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    // ── Modal: Search anime for recommendation ──────────────────────
    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }
        const controller = new AbortController();
        async function search() {
            setIsSearching(true);
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedSearch)}&page=1`,
                    { signal: controller.signal }
                );
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.animes ?? []);
                }
            } catch (err: unknown) {
                if (
                    err instanceof DOMException &&
                    err.name === "AbortError"
                )
                    return;
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }
        search();
        return () => controller.abort();
    }, [debouncedSearch]);

    // Close modal on Escape
    useEffect(() => {
        if (!isModalOpen) return;
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setIsModalOpen(false);
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isModalOpen]);

    // Reset modal state when closing
    useEffect(() => {
        if (!isModalOpen) {
            setSearchQuery("");
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [isModalOpen]);

    // ── Submit Recommendation ───────────────────────────────────────
    const handleRecommend = async (anime: OngoingAnime) => {
        if (submittingSlug) return;
        setSubmittingSlug(anime.slug);

        try {
            const res = await fetch("/api/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    animeSlug: anime.slug,
                    animeTitle: anime.title,
                    coverImage: anime.poster,
                }),
            });

            if (res.ok) {
                setIsModalOpen(false);
                swalToast({
                    title: "Recommendation added!",
                    icon: "success",
                });
                fetchRecommendations();
            } else if (res.status === 400) {
                const data = await res.json();
                swalToast({
                    title:
                        data.error ||
                        "You can only recommend up to 2 anime.",
                    icon: "warning",
                    timer: 4000,
                });
            } else {
                swalToast({
                    title: "Something went wrong.",
                    icon: "error",
                });
            }
        } catch {
            swalToast({
                title: "Network error. Please try again.",
                icon: "error",
            });
        } finally {
            setSubmittingSlug(null);
        }
    };

    // ── Loading / Auth Gate ─────────────────────────────────────────
    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-hn-primary border-t-transparent" />
                    <p className="text-sm text-white/40">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 lg:px-6">
            {/* ── Page Header ─────────────────────────────────────── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    <span className="text-hn-primary">💬</span> Public
                    Discuss
                </h1>
                <p className="mt-1 text-sm text-white/40">
                    Chat with the community, see the latest comments, and
                    discover recommended anime.
                </p>
            </div>

            {/* ── Grid Layout ─────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-5">
                {/* ════════════════════════════════════════════════════
                    LEFT COLUMN — Live Chat (lg:col-span-3)
                    ════════════════════════════════════════════════════ */}
                <section className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-hn-card/60 lg:col-span-3">
                    {/* Chat header */}
                    <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                        <h2 className="text-sm font-semibold tracking-wide uppercase text-white/70">
                            Live Chat
                        </h2>
                        <span className="ml-auto text-[11px] text-white/25">
                            Auto-refreshes every 4s
                        </span>
                    </div>

                    {/* Chat messages */}
                    <div
                        ref={chatContainerRef}
                        className="scrollbar-thin overflow-y-auto h-[600px]"
                    >
                        {chatLoading ? (
                            <ChatSkeleton />
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                                <svg
                                    className="h-12 w-12 text-white/10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-white/30">
                                    No messages yet. Be the first to say
                                    something!
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-0.5 p-4">
                                {messages.map((msg) => {
                                    const isOwn =
                                        msg.userId === session?.user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`group/msg flex items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.03] ${
                                                isOwn
                                                    ? "bg-hn-primary/[0.04]"
                                                    : ""
                                            }`}
                                        >
                                            <UserAvatar
                                                src={msg.user.image}
                                                name={msg.user.name}
                                                size={32}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span
                                                        className={`text-[13px] font-semibold flex items-center gap-1.5 ${
                                                            isOwn
                                                                ? "text-hn-primary"
                                                                : "text-white/80"
                                                        }`}
                                                    >
                                                        {msg.user.name}
                                                        {msg.user.email ===
                                                            ADMIN_EMAIL && (
                                                            <span className="flex items-center rounded-sm bg-red-500/20 px-1 py-[1px] text-[8px] font-bold uppercase tracking-wider text-red-500 ring-1 ring-inset ring-red-500/50">
                                                                Admin
                                                            </span>
                                                        )}
                                                        {isOwn && (
                                                            <span className="text-[10px] font-normal text-hn-primary/50">
                                                                (you)
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-white/20">
                                                        {timeAgo(
                                                            msg.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 break-words break-all whitespace-pre-wrap text-[13px] leading-relaxed text-white/60">
                                                    {msg.message}
                                                </p>
                                            </div>

                                            {/* Delete Button (Owner or Admin) */}
                                            {(isOwn ||
                                                session?.user?.email ===
                                                    ADMIN_EMAIL) && (
                                                <button
                                                    onClick={() =>
                                                        handleDelete(msg.id)
                                                    }
                                                    disabled={
                                                        deletingId === msg.id
                                                    }
                                                    className="shrink-0 rounded-lg p-1.5 text-red-500/0 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover/msg:text-red-500/40 group-hover/msg:opacity-100 disabled:opacity-50"
                                                    aria-label="Delete message"
                                                >
                                                    {deletingId ===
                                                    msg.id ? (
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
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Chat input */}
                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-3"
                    >
                        <UserAvatar
                            src={session?.user?.image ?? null}
                            name={session?.user?.name ?? ""}
                            size={28}
                        />
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type a message..."
                            maxLength={500}
                            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-hn-primary/40 focus:bg-white/[0.06]"
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || sending}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hn-primary text-hn-dark transition-all hover:shadow-lg hover:shadow-hn-primary/20 disabled:opacity-30 disabled:hover:shadow-none"
                        >
                            {sending ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-hn-dark border-t-transparent" />
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
                                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                    />
                                </svg>
                            )}
                        </button>
                    </form>
                </section>

                {/* ════════════════════════════════════════════════════
                    RIGHT COLUMN — Comments + Recommendations (lg:col-span-2)
                    ════════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* ── Global Comments Feed ─────────────────────── */}
                    <section className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-hn-card/60">
                        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
                            <svg
                                className="h-4 w-4 text-hn-orange"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                />
                            </svg>
                            <h2 className="text-sm font-semibold tracking-wide uppercase text-white/70">
                                Recent Comments
                            </h2>
                        </div>

                        <div
                            className="scrollbar-thin overflow-y-auto"
                            style={{ maxHeight: 380 }}
                        >
                            {commentsLoading ? (
                                <CommentSkeleton />
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
                                        No comments yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 p-3">
                                    {comments.map((comment) => (
                                        <Link
                                            key={comment.id}
                                            href={`/anime/watch/${comment.episodeSlug}`}
                                            className="group/comment flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                                        >
                                            <UserAvatar
                                                src={comment.user.image}
                                                name={comment.user.name}
                                                size={28}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70 group-hover/comment:text-hn-primary">
                                                        {comment.user.name}
                                                        {comment.user
                                                            .email ===
                                                            ADMIN_EMAIL && (
                                                            <span className="flex items-center rounded-sm bg-red-500/20 px-1 py-[1px] text-[8px] font-bold uppercase tracking-wider text-red-500 ring-1 ring-inset ring-red-500/50">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-white/20">
                                                        {timeAgo(
                                                            comment.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/40">
                                                    &ldquo;{comment.text}
                                                    &rdquo;
                                                </p>
                                                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-hn-primary/50 group-hover/comment:text-hn-primary/80">
                                                    <svg
                                                        className="h-3 w-3"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                                                        />
                                                    </svg>
                                                    Go to episode
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ── Recommendations Grid ─────────────────────── */}
                    <section className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-hn-card/60">
                        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
                            <svg
                                className="h-4 w-4 text-hn-secondary"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                                />
                            </svg>
                            <h2 className="text-sm font-semibold tracking-wide uppercase text-white/70">
                                Top Picks
                            </h2>
                            <div className="ml-auto flex items-center gap-2">
                                <Link
                                    href="/recommendations"
                                    className="text-[11px] font-medium text-white/30 transition-colors hover:text-hn-primary"
                                >
                                    See All →
                                </Link>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-1 rounded-lg bg-hn-primary/10 px-2.5 py-1 text-[11px] font-semibold text-hn-primary transition-all hover:bg-hn-primary/20 hover:shadow-sm hover:shadow-hn-primary/10"
                                >
                                    <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2.5}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4.5v15m7.5-7.5h-15"
                                        />
                                    </svg>
                                    Recommend
                                </button>
                            </div>
                        </div>

                        <div
                            className="scrollbar-thin overflow-y-auto"
                            style={{ maxHeight: 420 }}
                        >
                            {recsLoading ? (
                                <RecommendationSkeleton />
                            ) : recommendations.length === 0 ? (
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
                                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                                        />
                                    </svg>
                                    <p className="text-xs text-white/25">
                                        No recommendations yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 p-4">
                                    {recommendations
                                        .slice(0, 2)
                                        .map((rec) => (
                                            <Link
                                                key={rec.id}
                                                href={`/anime/${rec.animeSlug}`}
                                                className="group/rec flex flex-col overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.02] transition-all hover:border-hn-primary/20 hover:bg-white/[0.05]"
                                            >
                                                {/* Cover */}
                                                <div className="relative aspect-[3/4] w-full overflow-hidden">
                                                    <Image
                                                        src={rec.coverImage}
                                                        alt={rec.animeTitle}
                                                        fill
                                                        sizes="(max-width: 1024px) 50vw, 180px"
                                                        className="object-cover transition-transform duration-300 group-hover/rec:scale-105"
                                                    />
                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                                    {/* Recommender badge */}
                                                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                                                        <UserAvatar
                                                            src={
                                                                rec.user.image
                                                            }
                                                            name={
                                                                rec.user.name
                                                            }
                                                            size={16}
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <span className="max-w-[70px] truncate text-[10px] font-medium text-white/70">
                                                                {
                                                                    rec.user
                                                                        .name
                                                                }
                                                            </span>
                                                            {rec.user
                                                                .email ===
                                                                ADMIN_EMAIL && (
                                                                <span className="flex items-center rounded-sm bg-red-500/20 px-0.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-red-500 ring-1 ring-inset ring-red-500/50">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Title */}
                                                <div className="px-2.5 py-2">
                                                    <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-white/80 group-hover/rec:text-hn-primary">
                                                        {rec.animeTitle}
                                                    </h3>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                RECOMMENDATION SEARCH MODAL
                ════════════════════════════════════════════════════════ */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={(e) => {
                        if (
                            modalRef.current &&
                            !modalRef.current.contains(
                                e.target as Node
                            )
                        ) {
                            setIsModalOpen(false);
                        }
                    }}
                >
                    <div
                        ref={modalRef}
                        className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-hn-card shadow-2xl shadow-black/60"
                        style={{ maxHeight: "min(80vh, 600px)" }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Add Recommendation
                                </h3>
                                <p className="mt-0.5 text-xs text-white/30">
                                    Search and pick an anime to recommend
                                    (max 2)
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="border-b border-white/[0.06] px-5 py-3">
                            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 transition-colors focus-within:border-hn-primary/40 focus-within:bg-white/[0.06]">
                                {isSearching ? (
                                    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-hn-primary border-t-transparent" />
                                ) : (
                                    <svg
                                        className="h-4 w-4 shrink-0 text-white/40"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                        />
                                    </svg>
                                )}
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search anime title..."
                                    autoFocus
                                    className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSearchResults([]);
                                        }}
                                        className="shrink-0 text-white/30 transition-colors hover:text-white"
                                    >
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
                                                d="M6 18 18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="scrollbar-thin flex-1 overflow-y-auto">
                            {/* Empty state — no query */}
                            {!debouncedSearch &&
                                searchResults.length === 0 &&
                                !isSearching && (
                                    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
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
                                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                            />
                                        </svg>
                                        <p className="text-xs text-white/25">
                                            Type a title to search...
                                        </p>
                                    </div>
                                )}

                            {/* No results */}
                            {debouncedSearch &&
                                !isSearching &&
                                searchResults.length === 0 && (
                                    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
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
                                                d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                                            />
                                        </svg>
                                        <p className="text-xs text-white/25">
                                            No results for &ldquo;
                                            {debouncedSearch}&rdquo;
                                        </p>
                                    </div>
                                )}

                            {/* Loading skeleton */}
                            {isSearching && (
                                <div className="flex flex-col gap-1 p-2">
                                    {Array.from({ length: 4 }).map(
                                        (_, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                                            >
                                                <div className="skeleton h-14 w-10 shrink-0 rounded-md" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="skeleton h-3.5 w-3/4 rounded" />
                                                    <div className="skeleton h-3 w-1/3 rounded" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            {/* Results list */}
                            {searchResults.length > 0 &&
                                !isSearching && (
                                    <ul className="flex flex-col gap-0.5 p-2">
                                        {searchResults
                                            .slice(0, 10)
                                            .map((anime) => {
                                                const isSubmitting =
                                                    submittingSlug ===
                                                    anime.slug;
                                                return (
                                                    <li key={anime.slug}>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !!submittingSlug
                                                            }
                                                            onClick={() =>
                                                                handleRecommend(
                                                                    anime
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-50"
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/5">
                                                                <Image
                                                                    src={
                                                                        anime.poster
                                                                    }
                                                                    alt={
                                                                        anime.title
                                                                    }
                                                                    fill
                                                                    sizes="40px"
                                                                    unoptimized
                                                                    className="object-cover"
                                                                />
                                                            </div>

                                                            {/* Info */}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-[13px] font-semibold text-white">
                                                                    {
                                                                        anime.title
                                                                    }
                                                                </p>
                                                                <div className="mt-0.5 flex items-center gap-2">
                                                                    {anime.type && (
                                                                        <span className="rounded bg-hn-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-hn-primary">
                                                                            {
                                                                                anime.type
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {anime.status_or_day && (
                                                                        <span className="text-[11px] text-white/40">
                                                                            {
                                                                                anime.status_or_day
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action indicator */}
                                                            <div className="shrink-0">
                                                                {isSubmitting ? (
                                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-hn-primary border-t-transparent" />
                                                                ) : (
                                                                    <svg
                                                                        className="h-4 w-4 text-hn-primary/40"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
