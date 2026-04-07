"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePaginatedHistory } from "@/hooks/useWatchHistory";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { swalConfirm, swalDestructive } from "@/lib/swal";

export default function HistoryPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const page = parseInt(searchParams.get("page") || "1", 10);

    const { history: entries, meta, isLoading, clearHistory, removeHistoryItem, bulkRemoveHistory } = usePaginatedHistory(page);

    // ── Selection State ──────────────────────────────────────────────
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // ── Kebab Menu State ─────────────────────────────────────────────
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close kebab menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────
    const toggleSelectionMode = () => {
        setIsSelecting(!isSelecting);
        setSelectedIds([]);
        setOpenMenuId(null);
    };

    const toggleSelect = (slug: string) => {
        setSelectedIds((prev) =>
            prev.includes(slug) ? prev.filter((id) => id !== slug) : [...prev, slug]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === entries.length) {
            setSelectedIds([]); // Unselect all
        } else {
            setSelectedIds(entries.map((e) => e.slug)); // Select all
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const result = await swalConfirm.fire({
            title: "Remove Selected?",
            html: `<span style="color:rgba(255,255,255,0.5)">This will remove <strong style="color:${getComputedStyle(document.documentElement).getPropertyValue('--hn-primary').trim()}">${selectedIds.length}</strong> anime from your history.</span>`,
            confirmButtonText: "Yes, remove",
        });
        if (result.isConfirmed) {
            bulkRemoveHistory(selectedIds);
            setIsSelecting(false);
            setSelectedIds([]);
        }
    };

    const handleClearAll = async () => {
        const result = await swalDestructive.fire({
            title: "Clear All History?",
            html: `<span style="color:rgba(255,255,255,0.5)">This will permanently delete your entire watch history. This action cannot be undone.</span>`,
            confirmButtonText: "Yes, clear all",
        });
        if (result.isConfirmed) {
            clearHistory();
            setIsSelecting(false);
            setSelectedIds([]);
        }
    };

    const handleIndividualDelete = async (slug: string) => {
        const result = await swalConfirm.fire({
            title: "Remove from History?",
            html: `<span style="color:rgba(255,255,255,0.5)">This anime will be removed from your watch history.</span>`,
            confirmButtonText: "Yes, remove",
        });
        if (result.isConfirmed) {
            removeHistoryItem(slug);
            setOpenMenuId(null);
        }
    };

    return (
        <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-hn-text sm:text-3xl">
                        <span className="text-hn-primary">🕘</span> My Watch History
                    </h1>
                    <p className="mt-1 text-sm text-hn-text-muted/60">
                        {entries.length > 0
                            ? `${entries.length} anime watched`
                            : "Your history will appear here."}
                    </p>
                </div>

                {entries.length > 0 && !isSelecting && (
                    <div className="flex items-center gap-3 self-start">
                        <button
                            onClick={toggleSelectionMode}
                            className="flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-hn-text transition-colors hover:bg-white/10"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Select
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Selection Action Bar (Sticky) */}
            {isSelecting && entries.length > 0 && (
                <div className="sticky top-[70px] z-30 mb-8 flex animate-in fade-in slide-in-from-top-4 items-center justify-between rounded-2xl border border-hn-primary/20 bg-hn-dark/80 p-4 shadow-lg shadow-black/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm font-semibold text-hn-text transition-colors hover:text-hn-primary"
                        >
                            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedIds.length === entries.length ? "border-hn-primary bg-hn-primary text-black" : "border-white/30"}`}>
                                {selectedIds.length === entries.length && (
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                )}
                            </div>
                            <span className="hidden sm:inline">
                                {selectedIds.length === entries.length ? "Unselect All" : "Select All"}
                            </span>
                        </button>
                        <span className="text-xs font-medium text-hn-text-muted/70">
                            {selectedIds.length} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-hn-text transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25"
                            >
                                Delete ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={toggleSelectionMode}
                            className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-hn-text transition-colors hover:bg-white/20"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-hn-card/50 py-20">
                    <svg className="mb-4 h-16 w-16 text-hn-text-muted/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-hn-text-muted/60">
                        No watch history yet
                    </h2>
                    <p className="mt-1 text-sm text-hn-text-muted/40">
                        Start watching anime and your history will appear here.
                    </p>
                    <Link
                        href="/"
                        className="mt-5 rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark transition-all hover:shadow-lg hover:shadow-hn-primary/25"
                    >
                        Browse Anime
                    </Link>
                </div>
            )}

            {/* History grid */}
            {entries.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {entries.map((entry) => {
                        const watchedCount = entry.watchedEpisodes.length;
                        const continueHref = `/anime/watch/${entry.lastWatchedEpisode}?anime=${entry.slug}`;
                        const timeAgo = getRelativeTime(entry.timestamp);
                        const isSelected = selectedIds.includes(entry.slug);

                        return (
                            <div
                                key={entry.slug}
                                onClick={() => {
                                    if (isSelecting) toggleSelect(entry.slug);
                                }}
                                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                                    isSelecting 
                                        ? "cursor-pointer" 
                                        : "hover:ring-1 hover:ring-hn-primary/20"
                                } ${isSelected ? "bg-hn-primary/10 ring-1 ring-hn-primary" : "bg-hn-card"}`}
                            >
                                {/* Selection Overlay */}
                                {isSelecting && (
                                    <div className="absolute inset-0 z-20 flex pt-3 pr-3 justify-end items-start pointer-events-none">
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border shadow-sm transition-colors ${isSelected ? "border-hn-primary bg-hn-primary text-black" : "border-white/30 bg-black/40"}`}>
                                            {isSelected && (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 p-3 h-full">
                                    {/* Poster */}
                                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg">
                                        {/* If selecting, disable link navigation */}
                                        {isSelecting ? (
                                            <Image
                                                src={entry.poster}
                                                alt={entry.title}
                                                fill
                                                sizes="80px"
                                                className={`object-cover transition-transform duration-300 ${isSelected ? "scale-105 opacity-80" : "group-hover:scale-105"}`}
                                            />
                                        ) : (
                                            <Link href={`/anime/${entry.slug}`}>
                                                <Image
                                                    src={entry.poster}
                                                    alt={entry.title}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </Link>
                                        )}
                                        
                                        {/* Type badge */}
                                        {entry.type && (
                                            <span className="absolute right-0 top-0 rounded-bl bg-hn-primary/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-hn-dark">
                                                {entry.type}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                                        <div className="relative">
                                            {/* Title */}
                                            {isSelecting ? (
                                                <h3 className="line-clamp-2 pr-6 text-sm font-semibold text-hn-text">
                                                    {entry.title}
                                                </h3>
                                            ) : (
                                                <Link href={`/anime/${entry.slug}`}>
                                                    <h3 className="line-clamp-2 pr-6 text-sm font-semibold text-hn-text transition-colors group-hover:text-hn-primary">
                                                        {entry.title}
                                                    </h3>
                                                </Link>
                                            )}

                                            {/* Kebab Menu (Only when NOT selecting) */}
                                            {!isSelecting && (
                                                <div className="absolute right-[-4px] top-[-4px]">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === entry.slug ? null : entry.slug);
                                                        }}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full text-hn-text-muted/70 transition-colors hover:bg-white/10 hover:text-hn-text"
                                                    >
                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM12 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {/* Dropdown Menu */}
                                                    {openMenuId === entry.slug && (
                                                        <div 
                                                            ref={menuRef}
                                                            className="absolute right-0 top-6 z-30 w-32 animate-in fade-in zoom-in-95 rounded-lg border border-white/10 bg-hn-dark p-1 shadow-xl"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleIndividualDelete(entry.slug);
                                                                }}
                                                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-white/5"
                                                            >
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                </svg>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[11px] text-hn-text-muted/50">
                                                    {watchedCount}{entry.totalEpisodes > 0 ? `/${entry.totalEpisodes}` : ""} episode{watchedCount !== 1 ? "s" : ""} watched · {timeAgo}
                                                </p>
                                                {entry.totalEpisodes > 0 && watchedCount >= entry.totalEpisodes && (
                                                    <span className="rounded bg-hn-green/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-hn-green">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-1.5">
                                            <p className="truncate text-[11px] font-medium text-hn-primary/70">
                                                Last: {entry.lastWatchedEpisodeName}
                                            </p>
                                            
                                            {/* Action Button */}
                                            {isSelecting ? (
                                                <div className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-hn-text-muted/40">
                                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                                    </svg>
                                                    Continue Watching
                                                </div>
                                            ) : (
                                                <Link
                                                    href={continueHref}
                                                    className="inline-flex items-center gap-1 rounded-full bg-hn-primary/15 px-3 py-1 text-[11px] font-semibold text-hn-primary transition-all hover:bg-hn-primary/25 relative z-10"
                                                >
                                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                                                    </svg>
                                                    Continue Watching
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* Pagination UI */}
            {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        disabled={meta.page <= 1 || isLoading}
                        onClick={() => router.push(`${pathname}?page=${meta.page - 1}`)}
                        className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-hn-text transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-hn-text-muted/70">
                        Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                        disabled={meta.page >= meta.totalPages || isLoading}
                        onClick={() => router.push(`${pathname}?page=${meta.page + 1}`)}
                        className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-hn-text transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    );
}

// ─── Helper ────────────────────────────────────────────────────────

function getRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return new Date(timestamp).toLocaleDateString();
}
