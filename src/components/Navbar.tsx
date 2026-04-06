"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import SearchBar from "@/components/SearchBar";

const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Filter", href: "/filter" },
    { label: "Genres", href: "/genres" },
    { label: "Movies", href: "/movies" },
    { label: "Popular", href: "/popular" },
    { label: "Schedule", href: "/schedule" },
    { label: "Saved", href: "/saved" },
    { label: "History", href: "/history" },
    { label: "Discuss", href: "/discuss" },
];

// ─── User Avatar Dropdown ──────────────────────────────────────────
function UserMenu() {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // ── Loading state ────────────────────────────────────────────
    if (status === "loading") {
        return (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/5" />
        );
    }

    // ── Unauthenticated: link to /login ──────────────────────────
    if (!session?.user) {
        return (
            <Link
                href="/login"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/40 transition-all duration-200 hover:bg-hn-primary/15 hover:text-hn-primary hover:shadow-[0_0_12px_rgba(255,186,222,0.15)]"
                aria-label="Sign in"
            >
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
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                </svg>
            </Link>
        );
    }

    // ── Authenticated: avatar + dropdown ─────────────────────────
    const initials = (session.user.name ?? session.user.email ?? "U")
        .charAt(0)
        .toUpperCase();

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-hn-primary/15 text-sm font-bold text-hn-primary transition-all duration-200 hover:bg-hn-primary/25 hover:shadow-[0_0_12px_rgba(255,186,222,0.2)] overflow-hidden"
                aria-label="User menu"
            >
                {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={session.user.image}
                        alt={session.user.name ?? "Avatar"}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    initials
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-white/[0.06] bg-hn-card shadow-2xl shadow-black/40">
                    {/* User info */}
                    <div className="border-b border-white/[0.06] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">
                            {session.user.name ?? "User"}
                        </p>
                        {session.user.email && (
                            <p className="truncate text-xs text-white/40">
                                {session.user.email}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-1.5">
                        {/* HQ Dashboard — only visible to ADMIN / OWNER */}
                        {(session.user.role === "ADMIN" ||
                            session.user.role === "OWNER") && (
                            <>
                                <Link
                                    href="/aishiteru"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-400/80 transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-400"
                                >
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
                                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                        />
                                    </svg>
                                    Aishiteru
                                </Link>
                                <div className="mx-3 my-1 border-t border-white/[0.06]" />
                            </>
                        )}
                        <Link
                            href="/settings"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
                        >
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
                                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                            Account Settings
                        </Link>
                        <Link
                            href="/settings/appearance"
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
                        >
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
                                    d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
                                />
                            </svg>
                            Appearance
                        </Link>
                        {session.user.nsfwEnabled && (
                            <>
                                <div className="mx-3 my-1 border-t border-white/[0.06]" />
                                <Link
                                    href="/hentai"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400/80 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                                >
                                    <span className="flex h-4 w-4 items-center justify-center rounded bg-red-600 text-[8px] font-bold text-white">
                                        18
                                    </span>
                                    18+ Section
                                </Link>
                            </>
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10"
                        >
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
                                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                                />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Notification Bell Dropdown ────────────────────────────────────
interface InboxNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}

function notifTimeAgo(dateStr: string): string {
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) return "just now";
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    return new Date(dateStr).toLocaleDateString();
}

function NotificationBell() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<InboxNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const bellRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (
                bellRef.current &&
                !bellRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Fetch notifications
    useEffect(() => {
        if (!session?.user) return;

        async function fetchNotifications() {
            try {
                const res = await fetch("/api/inbox");
                if (res.ok) {
                    const data: InboxNotification[] = await res.json();
                    setNotifications(data);
                    setUnreadCount(data.filter((n) => !n.isRead).length);
                }
            } catch {
                /* silent */
            }
        }

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [session?.user]);

    // Mark single as read
    const markAsRead = async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        try {
            await fetch(`/api/inbox/read?id=${id}`, { method: "PATCH" });
        } catch {
            /* silent */
        }
    };

    if (!session?.user) return null;

    const displayNotifs = notifications.slice(0, 12);

    return (
        <div ref={bellRef} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
                aria-label="Notifications"
            >
                <svg
                    className="h-[18px] w-[18px]"
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
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-lg shadow-red-500/30">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-xl border border-white/[0.06] bg-hn-card shadow-2xl shadow-black/40">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                        <h3 className="text-sm font-semibold text-white">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {displayNotifs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                <svg
                                    className="h-8 w-8 text-white/10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                    />
                                </svg>
                                <p className="text-xs text-white/25">
                                    No notifications
                                </p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {displayNotifs.map((notif) => {
                                    const typeColor =
                                        notif.type === "REPLY"
                                            ? "bg-sky-500/20 text-sky-400"
                                            : notif.type === "NEW_EPISODE"
                                              ? "bg-hn-primary/20 text-hn-primary"
                                              : "bg-amber-500/20 text-amber-400";

                                    const inner = (
                                        <div
                                            className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                                                notif.isRead
                                                    ? "hover:bg-white/[0.03]"
                                                    : "bg-hn-primary/[0.03] hover:bg-hn-primary/[0.06]"
                                            }`}
                                        >
                                            {/* Type icon dot */}
                                            <div
                                                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${typeColor}`}
                                            >
                                                {notif.type === "REPLY" ? (
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
                                                            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                                                        />
                                                    </svg>
                                                ) : notif.type ===
                                                  "NEW_EPISODE" ? (
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
                                                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                                                        />
                                                    </svg>
                                                ) : (
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
                                                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                                        />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p
                                                        className={`truncate text-[13px] font-semibold leading-tight ${notif.isRead ? "text-white/50" : "text-white/90"}`}
                                                    >
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-hn-primary" />
                                                    )}
                                                </div>
                                                <p
                                                    className={`mt-0.5 line-clamp-1 text-[12px] ${notif.isRead ? "text-white/25" : "text-white/40"}`}
                                                >
                                                    {notif.message}
                                                </p>
                                                <span className="mt-0.5 text-[10px] text-white/20">
                                                    {notifTimeAgo(
                                                        notif.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );

                                    if (notif.link) {
                                        return (
                                            <Link
                                                key={notif.id}
                                                href={notif.link}
                                                onClick={() => {
                                                    if (!notif.isRead)
                                                        markAsRead(notif.id);
                                                    setOpen(false);
                                                }}
                                            >
                                                {inner}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => {
                                                if (!notif.isRead)
                                                    markAsRead(notif.id);
                                            }}
                                            className="cursor-default"
                                        >
                                            {inner}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <Link
                        href="/inbox"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 border-t border-white/[0.06] px-4 py-2.5 text-xs font-semibold text-hn-primary transition-colors hover:bg-white/[0.03]"
                    >
                        View all in Inbox
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
                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}

// ─── Main Navbar ───────────────────────────────────────────────────
export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Hide main navbar on the isolated /hentai section (it has its own)
    if (pathname.startsWith("/hentai")) return null;

    return (
        <header className="navbar-glass fixed left-0 right-0 top-0 z-50 w-full">
            <div className="flex h-14 md:h-[60px] w-full items-center gap-3 px-4 sm:px-6 lg:px-10">
                {/* ── Left zone: Hamburger + Logo ── */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Hamburger — visible on all sizes for aniwatch style, functional on mobile */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white lg:hidden"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            {mobileOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18 18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            )}
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex items-center gap-1.5 shrink-0"
                    >
                        <span className="text-xl font-extrabold tracking-tight text-white">
                            Nime<span className="text-hn-primary">Nime</span>
                        </span>
                    </Link>
                </div>

                {/* ── Center zone: Desktop Nav Links ── */}
                <nav
                    className="hidden items-center gap-0.5 lg:flex"
                    aria-label="Main navigation"
                >
                    {NAV_LINKS.map((link) => {
                        const isActive =
                            link.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                                    isActive
                                        ? "text-hn-primary"
                                        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                                }`}
                            >
                                {link.label}
                                {/* Active indicator underline */}
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-hn-primary" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Right zone: Search + Actions ── */}
                <div className="flex items-center gap-2">
                    {/* Desktop search */}
                    <div className="hidden w-full max-w-[320px] md:block">
                        <SearchBar />
                    </div>

                    {/* Mobile search toggle */}
                    <button
                        onClick={() => {
                            setMobileOpen(true);
                            setTimeout(() => {
                                const searchInput = document.querySelector(
                                    ".md\\:hidden input",
                                ) as HTMLInputElement;
                                if (searchInput) searchInput.focus();
                            }, 100);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-white md:hidden"
                        aria-label="Search"
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
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            />
                        </svg>
                    </button>

                    {/* Random button */}
                    <a
                        href="/api/random"
                        className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.04] hover:text-white sm:flex"
                        aria-label="Random anime"
                    >
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
                                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                            />
                        </svg>
                        Random
                    </a>

                    {/* Notification bell */}
                    <NotificationBell />

                    {/* User menu (auth-aware) */}
                    <UserMenu />
                </div>
            </div>

            {/* ── Mobile drawer ── */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
                    mobileOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div className="border-t border-white/[0.06] bg-hn-dark/95 backdrop-blur-xl px-5 pb-6 pt-4">
                    <div className="mb-4 md:hidden">
                        <SearchBar />
                    </div>
                    <nav
                        className="flex flex-col gap-0.5"
                        aria-label="Mobile navigation"
                    >
                        {NAV_LINKS.map((link) => {
                            const isActive =
                                link.href === "/"
                                    ? pathname === "/"
                                    : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-hn-primary/10 text-hn-primary"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </header>
    );
}
