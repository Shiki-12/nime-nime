import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SafeImage from "@/components/SafeImage";
import { notFound } from "next/navigation";
import Link from "next/link";

// ── Relative time helper (no external deps) ─────────────────────────
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

export default async function AdminDashboardPage() {
    // ── Double-Layer Guard ──────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    // ── Prisma Aggregates (parallel for speed) ──────────────────────
    const [totalUsers, totalMessages, totalComments, recentMembers, topAnime] =
        await Promise.all([
            prisma.user.count(),
            prisma.publicMessage.count(),
            prisma.comment.count(),
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    createdAt: true,
                },
            }),
            prisma.watchHistory.groupBy({
                by: ["animeId", "title"],
                _count: { animeId: true },
                orderBy: { _count: { animeId: "desc" } },
                take: 5,
            }),
        ]);

    const totalEngagement = totalMessages + totalComments;
    const firstName = session.user.name?.split(" ")[0] ?? "Commander";
    const serverStarted = new Date();

    return (
        <div className="mx-auto max-w-7xl space-y-8 pb-20 md:pb-0">
            {/* ── Welcome header ─────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border border-hn-border bg-hn-card p-6 md:p-8">
                {/* Decorative gradient blobs */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-hn-primary/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-hn-secondary/5 blur-2xl" />

                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-hn-text-muted">
                            Welcome back,
                        </p>
                        <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold tracking-tight text-hn-text md:text-3xl">
                            {firstName}
                            <span
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                                    role === "OWNER"
                                        ? "bg-amber-500/15 text-amber-400 ring-amber-500/30"
                                        : "bg-red-500/15 text-red-400 ring-red-500/30"
                                }`}
                            >
                                {role === "OWNER" ? "👑 Owner" : "🛡️ Admin"}
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-hn-text-muted">
                            Here&apos;s what&apos;s happening on the platform today.
                        </p>
                    </div>

                    {/* Live status */}
                    <div className="flex items-center gap-2 rounded-lg bg-hn-body/60 px-4 py-2 text-xs text-hn-text-muted ring-1 ring-hn-border">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        System Online
                    </div>
                </div>
            </div>

            {/* ── Stats Cards ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1 — Total Wibus */}
                <div className="group relative overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card p-6 backdrop-blur-sm transition-all duration-300 hover:border-hn-primary/20 hover:bg-hn-card-hover hover:shadow-lg hover:shadow-hn-primary/5">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-sky-500/8 blur-2xl transition-all duration-500 group-hover:bg-sky-500/15" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                Total Wibus
                            </p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-hn-text">
                                {totalUsers.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs text-hn-text-muted">
                                Registered users
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-xl ring-1 ring-sky-500/20">
                            👥
                        </div>
                    </div>
                </div>

                {/* Card 2 — Total Engagement */}
                <div className="group relative overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card p-6 backdrop-blur-sm transition-all duration-300 hover:border-hn-primary/20 hover:bg-hn-card-hover hover:shadow-lg hover:shadow-hn-primary/5">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-hn-green/8 blur-2xl transition-all duration-500 group-hover:bg-hn-green/15" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                Total Engagement
                            </p>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-hn-text">
                                {totalEngagement.toLocaleString()}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-hn-text-muted">
                                <span>{totalMessages.toLocaleString()} chats</span>
                                <span className="h-1 w-1 rounded-full bg-hn-text-muted/40" />
                                <span>{totalComments.toLocaleString()} comments</span>
                            </div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hn-green/10 text-xl ring-1 ring-hn-green/20">
                            💬
                        </div>
                    </div>
                </div>

                {/* Card 3 — Server Status */}
                <div className="group relative overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card p-6 backdrop-blur-sm transition-all duration-300 hover:border-hn-primary/20 hover:bg-hn-card-hover hover:shadow-lg hover:shadow-hn-primary/5">
                    <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/8 blur-2xl transition-all duration-500 group-hover:bg-emerald-500/15" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                Server Status
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-emerald-400">
                                Online
                                <span className="relative flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-hn-text-muted">
                                Since{" "}
                                {serverStarted.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-xl ring-1 ring-emerald-500/20">
                            🖥️
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recent Members ──────────────────────────────────────── */}
            <div className="rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                {/* Section header */}
                <div className="flex items-center justify-between border-b border-hn-border/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hn-primary/10 text-sm ring-1 ring-hn-primary/20">
                            ✨
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-hn-text">
                                New Members
                            </h2>
                            <p className="text-[11px] text-hn-text-muted">
                                5 most recently registered
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/aishiteru/users"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-hn-card px-3 py-1.5 text-xs font-medium text-hn-primary ring-1 ring-hn-border transition-all duration-200 hover:bg-hn-card-hover hover:ring-hn-primary/30"
                    >
                        View All
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-3 w-3"
                        >
                            <path
                                fillRule="evenodd"
                                d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Member list */}
                {recentMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-sm text-hn-text-muted">
                        <span className="mb-2 text-3xl">🏜️</span>
                        No registered users yet.
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {recentMembers.map((member) => (
                            <div
                                key={member.id}
                                className="group flex items-center gap-4 px-6 py-3.5 transition-colors duration-200 hover:bg-white/[0.02]"
                            >
                                {/* Avatar */}
                                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-hn-card ring-1 ring-white/[0.08]">
                                    <SafeImage
                                        src={member.image ?? undefined}
                                        alt={member.name}
                                        className="relative z-10 h-full w-full object-cover"
                                        fallback={
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-hn-text-muted">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                        }
                                    />
                                </div>

                                {/* Info */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-medium text-hn-text">
                                            {member.name}
                                        </p>
                                        {(member.role === "ADMIN" ||
                                            member.role === "OWNER") && (
                                            <span
                                                className={`inline-flex items-center rounded-sm px-1 py-[1px] text-[8px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                                                    member.role === "OWNER"
                                                        ? "bg-amber-500/20 text-amber-500 ring-amber-500/50"
                                                        : "bg-red-500/20 text-red-500 ring-red-500/50"
                                                }`}
                                            >
                                                {member.role === "OWNER"
                                                    ? "Owner"
                                                    : "Admin"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-hn-text-muted">
                                        {member.email}
                                    </p>
                                </div>

                                {/* Joined time */}
                                <p className="shrink-0 text-xs text-hn-text-muted">
                                    {timeAgo(member.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Top 5 Most Viewed Anime ────────────────────────────────── */}
            <div className="rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                {/* Section header */}
                <div className="flex items-center justify-between border-b border-hn-border/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-sm ring-1 ring-amber-500/20">
                            🔥
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-hn-text">
                                Top 5 Most Viewed Anime
                            </h2>
                            <p className="text-[11px] text-hn-text-muted">
                                Based on watch history
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/aishiteru/anime-statistic"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-hn-card px-3 py-1.5 text-xs font-medium text-hn-primary ring-1 ring-hn-border transition-all duration-200 hover:bg-hn-card-hover hover:ring-hn-primary/30"
                    >
                        View All
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-3 w-3"
                        >
                            <path
                                fillRule="evenodd"
                                d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>

                {/* Anime list */}
                {topAnime.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-sm text-hn-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-2 h-8 w-8 text-hn-text-muted/30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        No watch data available yet.
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {topAnime.map((anime, i) => {
                            const rank = i + 1;
                            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
                            return (
                                <div
                                    key={anime.animeId}
                                    className="group flex items-center gap-4 px-6 py-3.5 transition-colors duration-200 hover:bg-white/[0.02]"
                                >
                                    {/* Rank */}
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                                        {medal ? (
                                            <span className="text-base">{medal}</span>
                                        ) : (
                                            <span className="text-xs font-bold text-hn-text-muted">#{rank}</span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-hn-text">
                                            {anime.title}
                                        </p>
                                        <p className="truncate font-mono text-[10px] text-hn-text-muted/50">
                                            {anime.animeId}
                                        </p>
                                    </div>

                                    {/* View count */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-sm font-semibold text-hn-text">
                                            {anime._count.animeId.toLocaleString()}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-hn-text-muted/40">
                                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                                            <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
                                        </svg>
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
