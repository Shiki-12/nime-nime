"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { swalToast } from "@/lib/swal";

// ─── Types ──────────────────────────────────────────────────────────

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
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

function typeBadge(type: string) {
    switch (type) {
        case "REPLY":
            return {
                label: "Reply",
                className: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
                icon: (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                ),
            };
        case "NEW_EPISODE":
            return {
                label: "New Episode",
                className: "bg-hn-primary/15 text-hn-primary ring-hn-primary/30",
                icon: (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                ),
            };
        default:
            return {
                label: "System",
                className: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
                icon: (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                ),
            };
    }
}

// ─── Skeleton ───────────────────────────────────────────────────────

function InboxSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-white/[0.04] bg-hn-card p-4"
                >
                    <div className="skeleton h-9 w-9 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-32 rounded" />
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function InboxPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    // Auth guard
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/inbox");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetchNotifications();
    }, [status, fetchNotifications]);

    // ── Mark single notification as read ────────────────────────────
    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        try {
            await fetch(`/api/inbox/read?id=${id}`, { method: "PATCH" });
        } catch {
            // Revert on failure
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
            );
        }
    };

    // ── Mark all as read ────────────────────────────────────────────
    const markAllAsRead = async () => {
        setMarkingAll(true);

        // Optimistic
        const previousState = [...notifications];
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
        );

        try {
            const res = await fetch("/api/inbox/read", { method: "PATCH" });
            if (res.ok) {
                swalToast({
                    title: "All notifications marked as read",
                    icon: "success",
                });
            } else {
                setNotifications(previousState);
                swalToast({
                    title: "Failed to mark notifications",
                    icon: "error",
                });
            }
        } catch {
            setNotifications(previousState);
            swalToast({ title: "Network error", icon: "error" });
        } finally {
            setMarkingAll(false);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

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
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-24">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        <span className="text-hn-primary">🔔</span> Inbox
                    </h1>
                    <p className="mt-1 text-sm text-white/40">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                            : "You're all caught up!"}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        disabled={markingAll}
                        className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        {markingAll ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                        ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        )}
                        Mark all as read
                    </button>
                )}
            </div>

            {/* ── Notification List ──────────────────────────────── */}
            {loading ? (
                <InboxSkeleton />
            ) : notifications.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.06] bg-hn-card/60 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
                        <svg className="h-8 w-8 text-white/10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white/40">
                            No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-white/20">
                            We&apos;ll notify you about replies and new episodes here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {notifications.map((notif) => {
                        const badge = typeBadge(notif.type);

                        const cardContent = (
                            <div
                                className={`group flex items-start gap-3.5 rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                                    notif.isRead
                                        ? "border-white/[0.04] bg-hn-card/40 hover:bg-hn-card/70"
                                        : "border-hn-primary/10 bg-hn-primary/[0.04] hover:bg-hn-primary/[0.07]"
                                }`}
                            >
                                {/* Type Icon */}
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${badge.className}`}
                                >
                                    {badge.icon}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3
                                            className={`text-sm font-semibold leading-tight ${
                                                notif.isRead
                                                    ? "text-white/60"
                                                    : "text-white"
                                            }`}
                                        >
                                            {notif.title}
                                        </h3>
                                        {!notif.isRead && (
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-hn-primary shadow-sm shadow-hn-primary/40" />
                                        )}
                                    </div>
                                    <p
                                        className={`mt-0.5 line-clamp-2 text-[13px] leading-relaxed ${
                                            notif.isRead
                                                ? "text-white/30"
                                                : "text-white/50"
                                        }`}
                                    >
                                        {notif.message}
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <span
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${badge.className}`}
                                        >
                                            {badge.label}
                                        </span>
                                        <span className="text-[10px] text-white/20">
                                            {timeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow indicator for linked notifications */}
                                {notif.link && (
                                    <svg
                                        className="mt-1 h-4 w-4 shrink-0 text-white/10 transition-all group-hover:translate-x-0.5 group-hover:text-white/30"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                )}
                            </div>
                        );

                        if (notif.link) {
                            return (
                                <Link
                                    key={notif.id}
                                    href={notif.link}
                                    onClick={() => {
                                        if (!notif.isRead) markAsRead(notif.id);
                                    }}
                                >
                                    {cardContent}
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    if (!notif.isRead) markAsRead(notif.id);
                                }}
                                className="cursor-default"
                            >
                                {cardContent}
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
