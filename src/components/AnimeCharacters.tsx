"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// ─── Types ─────────────────────────────────────────────────────────
interface VoiceActor {
    person: { mal_id: number; name: string; images: { jpg: { image_url: string } } };
    language: string;
}

interface CharacterEntry {
    character: {
        mal_id: number;
        name: string;
        images: { jpg: { image_url: string } };
    };
    role: string;
    favorites: number;
    voice_actors: VoiceActor[];
}

interface DisplayCharacter {
    id: number;
    name: string;
    image: string;
    role: string;
    vaName: string | null;
    vaImage: string | null;
}

// ─── Props ─────────────────────────────────────────────────────────
interface AnimeCharactersProps {
    /** The anime title — used to look up the MAL ID via Jikan search */
    animeTitle: string;
}

// ─── Skeleton Card ─────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex min-w-[280px] snap-start overflow-hidden rounded-xl bg-hn-card md:min-w-0">
            {/* Left skeleton */}
            <div className="flex w-1/2 flex-col items-center gap-2 p-3">
                <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-2.5 w-12 animate-pulse rounded bg-white/[0.06]" />
            </div>
            {/* Right skeleton */}
            <div className="flex w-1/2 flex-col items-center gap-2 border-l border-white/[0.04] p-3">
                <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-2.5 w-12 animate-pulse rounded bg-white/[0.06]" />
            </div>
        </div>
    );
}

// ─── Character Card ────────────────────────────────────────────────
function CharacterCard({ char }: { char: DisplayCharacter }) {
    return (
        <div className="flex min-w-[280px] snap-start overflow-hidden rounded-xl bg-hn-card transition-shadow hover:shadow-lg hover:shadow-black/20 md:min-w-0">
            {/* Left: Character */}
            <div className="flex w-1/2 flex-col items-center gap-1.5 p-3">
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-hn-primary/20">
                    <Image
                        src={char.image}
                        alt={char.name}
                        fill
                        sizes="72px"
                        unoptimized
                        className="object-cover"
                    />
                </div>
                <p className="w-full truncate text-center text-[12px] font-semibold text-white">
                    {char.name}
                </p>
                <span className="rounded-full bg-hn-primary/10 px-2 py-0.5 text-[10px] font-bold text-hn-primary">
                    {char.role}
                </span>
            </div>

            {/* Right: Voice Actor */}
            <div className="flex w-1/2 flex-col items-center gap-1.5 border-l border-white/[0.04] p-3">
                {char.vaImage ? (
                    <>
                        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/[0.06]">
                            <Image
                                src={char.vaImage}
                                alt={char.vaName ?? ""}
                                fill
                                sizes="72px"
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                        <p className="w-full truncate text-center text-[12px] font-semibold text-white">
                            {char.vaName}
                        </p>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-hn-text">
                            Seiyuu
                        </span>
                    </>
                ) : (
                    <>
                        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/[0.04]">
                            <svg className="h-6 w-6 text-white/10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                            </svg>
                        </div>
                        <p className="text-[11px] text-hn-text">No VA data</p>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AnimeCharacters({ animeTitle }: AnimeCharactersProps) {
    const [characters, setCharacters] = useState<DisplayCharacter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEmpty, setIsEmpty] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchCharacters() {
            setIsLoading(true);
            setIsEmpty(false);

            try {
                // Step 1: Resolve MAL anime ID from the title via Jikan search
                const searchRes = await fetch(
                    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeTitle)}&limit=1`,
                    { signal: controller.signal }
                );
                if (!searchRes.ok) throw new Error("Jikan search failed");
                const searchData = await searchRes.json();
                const malId = searchData?.data?.[0]?.mal_id;

                if (!malId) {
                    setIsEmpty(true);
                    return;
                }

                // Step 2: Fetch characters for this anime
                // Jikan rate limit: ~3 req/s — one extra call is fine here
                const charRes = await fetch(
                    `https://api.jikan.moe/v4/anime/${malId}/characters`,
                    { signal: controller.signal }
                );
                if (!charRes.ok) throw new Error("Jikan characters failed");
                const charData = await charRes.json();
                const entries: CharacterEntry[] = charData?.data ?? [];

                if (entries.length === 0) {
                    setIsEmpty(true);
                    return;
                }

                // Step 3: Sort by favorites (desc) and take top 12
                // Prioritize "Main" roles, then sort by popularity
                const sorted = [...entries].sort((a, b) => {
                    if (a.role === "Main" && b.role !== "Main") return -1;
                    if (a.role !== "Main" && b.role === "Main") return 1;
                    return (b.favorites ?? 0) - (a.favorites ?? 0);
                });

                const top = sorted.slice(0, 12);

                // Step 4: Map to display format, picking the Japanese VA
                const mapped: DisplayCharacter[] = top.map((entry) => {
                    const japaneseVa = entry.voice_actors.find(
                        (va) => va.language === "Japanese"
                    );

                    return {
                        id: entry.character.mal_id,
                        name: entry.character.name,
                        image: entry.character.images.jpg.image_url,
                        role: entry.role,
                        vaName: japaneseVa?.person.name ?? null,
                        vaImage: japaneseVa?.person.images.jpg.image_url ?? null,
                    };
                });

                setCharacters(mapped);
                setIsEmpty(mapped.length === 0);
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setIsEmpty(true);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCharacters();
        return () => controller.abort();
    }, [animeTitle]);

    // ── Empty state ────────────────────────────────────────────────
    if (!isLoading && isEmpty) return null; // silently hide if no data

    return (
        <section className="mb-8">
            {/* Section heading */}
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                <div className="h-4 w-1 rounded-full bg-hn-primary" />
                Characters &amp; Voice Actors
            </h2>

            {/* ── Loading Skeletons ──────────────────────────────────── */}
            {isLoading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}

            {/* ── Results ───────────────────────────────────────────── */}
            {!isLoading && characters.length > 0 && (
                <>
                    {/* Mobile: horizontal scroll */}
                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide md:hidden">
                        {characters.map((char) => (
                            <CharacterCard key={char.id} char={char} />
                        ))}
                    </div>

                    {/* Desktop: grid layout */}
                    <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                        {characters.map((char) => (
                            <CharacterCard key={char.id} char={char} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
