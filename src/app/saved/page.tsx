"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSavedAnime } from "@/hooks/useLocalStorage";
import { swalConfirm } from "@/lib/swal";

export default function SavedPage() {
    const { saved, removeSavedItem, bulkRemoveSaved } = useSavedAnime();
    const { status } = useSession();

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
        if (selectedIds.length === saved.length) {
            setSelectedIds([]); // Unselect all
        } else {
            setSelectedIds(saved.map((e) => e.slug)); // Select all
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        const result = await swalConfirm.fire({
            title: "Remove Selected?",
            html: `<span style="color:rgba(255,255,255,0.5)">This will remove <strong style="color:#ffbade">${selectedIds.length}</strong> anime from your saved list.</span>`,
            confirmButtonText: "Yes, remove",
        });
        if (result.isConfirmed) {
            bulkRemoveSaved(selectedIds);
            setIsSelecting(false);
            setSelectedIds([]);
        }
    };

    const handleIndividualDelete = async (slug: string) => {
        const result = await swalConfirm.fire({
            title: "Remove from Saved?",
            html: `<span style="color:rgba(255,255,255,0.5)">This anime will be removed from your saved list.</span>`,
            confirmButtonText: "Yes, remove",
        });
        if (result.isConfirmed) {
            removeSavedItem(slug);
            setOpenMenuId(null);
        }
    };

    return (
        <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                        <span className="text-hn-primary">Saved</span> Anime
                    </h1>
                    <p className="mt-1 text-sm text-white/40">
                        {status === "authenticated"
                            ? "Your personal bookmarks — synced to your account."
                            : "Your personal bookmarks — saved locally in your browser."}
                    </p>
                </div>

                {saved.length > 0 && !isSelecting && (
                    <div className="flex items-center gap-3 self-start">
                        <button
                            onClick={toggleSelectionMode}
                            className="flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Select
                        </button>
                    </div>
                )}
            </div>

            {/* Selection Action Bar (Sticky) */}
            {isSelecting && saved.length > 0 && (
                <div className="sticky top-[70px] z-30 mb-8 flex animate-in fade-in slide-in-from-top-4 items-center justify-between rounded-2xl border border-hn-primary/20 bg-hn-dark/80 p-4 shadow-lg shadow-black/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-hn-primary"
                        >
                            <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedIds.length === saved.length ? "border-hn-primary bg-hn-primary text-black" : "border-white/30"}`}>
                                {selectedIds.length === saved.length && (
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                )}
                            </div>
                            <span className="hidden sm:inline">
                                {selectedIds.length === saved.length ? "Unselect All" : "Select All"}
                            </span>
                        </button>
                        <span className="text-xs font-medium text-white/50">
                            {selectedIds.length} selected
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25"
                            >
                                Delete ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={toggleSelectionMode}
                            className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {saved.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-hn-card/50 py-20">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-white/30">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white/40">No saved anime yet</h2>
                    <p className="mt-1 text-sm text-white/20">Browse anime and click Save to bookmark them.</p>
                    <Link
                        href="/"
                        className="mt-5 rounded-full bg-hn-primary px-5 py-2 text-sm font-semibold text-hn-dark transition-all hover:shadow-lg hover:shadow-hn-primary/25"
                    >
                        Browse Anime
                    </Link>
                </div>
            )}

            {/* Saved Grid */}
            {saved.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {[...saved].sort((a, b) => b.savedAt - a.savedAt).map((anime) => {
                        const isSelected = selectedIds.includes(anime.slug);

                        return (
                            <div
                                key={anime.slug}
                                onClick={() => {
                                    if (isSelecting) toggleSelect(anime.slug);
                                }}
                                className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
                                    isSelecting 
                                        ? "cursor-pointer" 
                                        : "hover:ring-1 hover:ring-hn-primary/20"
                                } ${isSelected ? "bg-hn-primary/10 ring-1 ring-hn-primary" : "bg-hn-card"}`}
                            >
                                {/* Selection Overlay */}
                                {isSelecting && (
                                    <div className="absolute inset-0 z-20 flex pt-2 pr-2 justify-end items-start pointer-events-none">
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border shadow-sm transition-colors ${isSelected ? "border-hn-primary bg-hn-primary text-black" : "border-white/30 bg-black/40"}`}>
                                            {isSelected && (
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="relative aspect-[3/4.2] w-full overflow-hidden">
                                        {isSelecting ? (
                                            <Image
                                                src={anime.poster}
                                                alt={anime.title}
                                                fill
                                                sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
                                                className={`object-cover transition-transform duration-500 ${isSelected ? "scale-105 opacity-80" : "group-hover:scale-105"}`}
                                            />
                                        ) : (
                                            <Link href={`/anime/${anime.slug}`}>
                                                <Image
                                                    src={anime.poster}
                                                    alt={anime.title}
                                                    fill
                                                    sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 16vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </Link>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-hn-dark via-hn-dark/20 to-transparent opacity-80 pointer-events-none" />
                                        
                                        <span className="absolute right-0 top-0 bg-hn-primary/90 px-2 py-1 text-[10px] font-bold text-hn-dark pointer-events-none">
                                            {anime.type}
                                        </span>

                                        {/* Kebab Menu (Only when NOT selecting) */}
                                        {!isSelecting && (
                                            <div className="absolute left-1 top-1 z-10">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === anime.slug ? null : anime.slug);
                                                    }}
                                                    className={`flex h-7 w-7 items-center justify-center rounded-md backdrop-blur-sm transition-all ${openMenuId === anime.slug ? "bg-white/20 text-white" : "bg-black/50 text-white/70 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100"}`}
                                                >
                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM12 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
                                                    </svg>
                                                </button>
                                                
                                                {/* Dropdown Menu */}
                                                {openMenuId === anime.slug && (
                                                    <div 
                                                        ref={menuRef}
                                                        className="absolute left-0 top-8 w-28 animate-in fade-in zoom-in-95 rounded-lg border border-white/10 bg-hn-dark p-1 shadow-xl"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleIndividualDelete(anime.slug);
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
                                    </div>
                                    <div className="px-2.5 py-2">
                                        {isSelecting ? (
                                            <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90">
                                                {anime.title}
                                            </h3>
                                        ) : (
                                            <Link href={`/anime/${anime.slug}`}>
                                                <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-white/90 group-hover:text-hn-primary transition-colors">
                                                    {anime.title}
                                                </h3>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
