"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { swalToast, swalConfirm } from "@/lib/swal";

// ─── Types ──────────────────────────────────────────────────────────

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

function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="skeleton aspect-[3/4] w-full rounded-xl" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function RecommendationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Auth guard
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

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
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetchRecommendations();
    }, [status, fetchRecommendations]);

    const handleDelete = async (
        e: React.MouseEvent,
        recId: string
    ) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        const result = await swalConfirm.fire({
            title: "Delete recommendation?",
            text: "This action cannot be undone.",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return;

        setDeletingId(recId);
        try {
            const res = await fetch(
                `/api/recommendations?id=${recId}`,
                { method: "DELETE" }
            );
            if (res.ok) {
                setRecommendations((prev) =>
                    prev.filter((r) => r.id !== recId)
                );
                swalToast({
                    title: "Recommendation deleted",
                    icon: "success",
                });
            } else {
                const data = await res.json();
                swalToast({
                    title:
                        data.error ||
                        "Failed to delete recommendation",
                    icon: "error",
                });
            }
        } catch {
            swalToast({ title: "Network error", icon: "error" });
        } finally {
            setDeletingId(null);
        }
    };

    const isAdmin = session?.user?.email === ADMIN_EMAIL;

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
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <Link
                        href="/discuss"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/40 transition-colors hover:border-hn-primary/30 hover:text-hn-primary"
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
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            <span className="text-hn-secondary">⭐</span>{" "}
                            All Recommendations
                        </h1>
                        <p className="mt-1 text-sm text-white/40">
                            Anime recommended by the community. Each user
                            can recommend up to 2 titles.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <GridSkeleton />
            ) : recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                    <svg
                        className="h-16 w-16 text-white/10"
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
                    <p className="text-sm text-white/30">
                        No recommendations yet. Head to{" "}
                        <Link
                            href="/discuss"
                            className="font-semibold text-hn-primary transition-colors hover:text-hn-primary/80"
                        >
                            Discuss
                        </Link>{" "}
                        to add yours!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {recommendations.map((rec) => {
                        const isOwn =
                            rec.userId === session?.user?.id;
                        const canDelete = isAdmin || isOwn;

                        return (
                            <Link
                                key={rec.id}
                                href={`/anime/${rec.animeSlug}`}
                                className="group/rec relative flex flex-col overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.02] transition-all hover:border-hn-primary/20 hover:bg-white/[0.05]"
                            >
                                {/* Cover */}
                                <div className="relative aspect-[3/4] w-full overflow-hidden">
                                    <Image
                                        src={rec.coverImage}
                                        alt={rec.animeTitle}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                        className="object-cover transition-transform duration-300 group-hover/rec:scale-105"
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                    {/* Recommender badge */}
                                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                                        <UserAvatar
                                            src={rec.user.image}
                                            name={rec.user.name}
                                            size={16}
                                        />
                                        <div className="flex items-center gap-1">
                                            <span className="max-w-[70px] truncate text-[10px] font-medium text-white/70">
                                                {rec.user.name}
                                            </span>
                                            {rec.user.email ===
                                                ADMIN_EMAIL && (
                                                <span className="flex items-center rounded-sm bg-red-500/20 px-0.5 py-[1px] text-[8px] font-bold uppercase tracking-wider text-red-500 ring-1 ring-inset ring-red-500/50">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Time badge */}
                                    <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-medium text-white/50 backdrop-blur-sm">
                                        {timeAgo(rec.createdAt)}
                                    </div>

                                    {/* Delete button (Admin or Owner) */}
                                    {canDelete && (
                                        <button
                                            onClick={(e) =>
                                                handleDelete(e, rec.id)
                                            }
                                            disabled={
                                                deletingId === rec.id
                                            }
                                            className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/0 text-red-500/0 opacity-0 backdrop-blur-sm transition-all hover:bg-red-500/20 hover:text-red-400 group-hover/rec:bg-black/50 group-hover/rec:text-red-500/70 group-hover/rec:opacity-100 disabled:opacity-50"
                                            aria-label="Delete recommendation"
                                        >
                                            {deletingId === rec.id ? (
                                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
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
                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </div>
                                {/* Title */}
                                <div className="px-3 py-2.5">
                                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white/80 group-hover/rec:text-hn-primary">
                                        {rec.animeTitle}
                                    </h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
