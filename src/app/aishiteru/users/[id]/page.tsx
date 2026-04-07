import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";

// ── Helpers ─────────────────────────────────────────────────────────
function formatDateTime(date: Date): string {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function roleBadgeClass(role: string): string {
    switch (role) {
        case "OWNER":
            return "bg-amber-500/15 text-amber-400 ring-amber-500/30";
        case "ADMIN":
            return "bg-red-500/15 text-red-400 ring-red-500/30";
        default:
            return "bg-white/5 text-hn-text-muted ring-white/10";
    }
}

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // ── Auth Guard ──────────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    const { id } = await params;

    // ── Fetch user with activity ────────────────────────────────────
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            isVerified: true,
            createdAt: true,
            watchHistory: {
                orderBy: { watchedAt: "desc" },
                take: 50,
                select: {
                    id: true,
                    animeId: true,
                    title: true,
                    episodeId: true,
                    episodeName: true,
                    watchedAt: true,
                    progress: true,
                },
            },
            savedAnime: {
                orderBy: { createdAt: "desc" },
                take: 50,
                select: {
                    id: true,
                    animeId: true,
                    title: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* ── Back link ──────────────────────────────────────────── */}
            <Link
                href="/aishiteru/users"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-hn-text-muted transition-colors hover:text-hn-text"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.22 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
                Back to Users
            </Link>

            {/* ── User Profile Card ──────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border border-hn-border/50 bg-hn-card p-6 backdrop-blur-sm md:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hn-primary/5 blur-3xl" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Avatar */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-hn-card ring-2 ring-white/[0.08]">
                        <SafeImage
                            src={user.image ?? undefined}
                            alt={user.name}
                            className="h-full w-full object-cover"
                            fallback={
                                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-hn-text-muted">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            }
                        />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-hn-text">{user.name}</h1>
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${roleBadgeClass(user.role)}`}>
                                {user.role}
                            </span>
                            {user.isVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                                        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-hn-text-muted">{user.email}</p>
                        <p className="mt-1 text-xs text-hn-text-muted/60">
                            Member since {formatDateTime(user.createdAt)}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 sm:gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-hn-text">{user.watchHistory.length}</p>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-hn-text-muted">Watches</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-hn-text">{user.savedAnime.length}</p>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-hn-text-muted">Saved</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Activity Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Watch History */}
                <div className="rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                    <div className="flex items-center gap-3 border-b border-hn-border/50 px-5 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4 text-sky-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-hn-text">Watch History</h2>
                            <p className="text-[10px] text-hn-text-muted">Recent 50 entries</p>
                        </div>
                    </div>

                    {user.watchHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-sm text-hn-text-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-2 h-8 w-8 text-hn-text-muted/30">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            No watch history
                        </div>
                    ) : (
                        <div className="max-h-[400px] divide-y divide-white/[0.04] overflow-y-auto scrollbar-thin">
                            {user.watchHistory.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-hn-text">
                                            {entry.title}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-hn-text-muted">
                                            <span className="rounded bg-white/[0.04] px-1 py-px font-mono ring-1 ring-white/[0.06]">
                                                {entry.episodeName || entry.episodeId}
                                            </span>
                                            {entry.progress > 0 && (
                                                <>
                                                    <span className="text-hn-text-muted/40">•</span>
                                                    <span>{Math.round(entry.progress * 100)}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-[10px] text-hn-text-muted/60 whitespace-nowrap">
                                        {formatDateTime(entry.watchedAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Saved Anime */}
                <div className="rounded-xl border border-hn-border/50 bg-hn-card backdrop-blur-sm">
                    <div className="flex items-center gap-3 border-b border-hn-border/50 px-5 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hn-primary/10 ring-1 ring-hn-primary/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4 text-hn-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-hn-text">Saved Anime</h2>
                            <p className="text-[10px] text-hn-text-muted">Bookmarked titles</p>
                        </div>
                    </div>

                    {user.savedAnime.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-sm text-hn-text-muted">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-2 h-8 w-8 text-hn-text-muted/30">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                            </svg>
                            No saved anime
                        </div>
                    ) : (
                        <div className="max-h-[400px] divide-y divide-white/[0.04] overflow-y-auto scrollbar-thin">
                            {user.savedAnime.map((anime) => (
                                <div key={anime.id} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]">
                                    <p className="min-w-0 truncate text-sm font-medium text-hn-text">
                                        {anime.title}
                                    </p>
                                    <span className="shrink-0 text-[10px] text-hn-text-muted/60 whitespace-nowrap">
                                        {formatDateTime(anime.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
