import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Types matching localStorage shapes ─────────────────────────────

interface LocalSavedItem {
    slug: string;
    title: string;
    poster: string;
    type: string;
    savedAt: number;
}

interface LocalWatchedEntry {
    slug: string;
    title: string;
    poster: string;
    type: string;
    watchedEpisodes: string[];
    lastWatchedEpisode: string;
    lastWatchedEpisodeName: string;
    timestamp: number;
}

// ─── POST: Sync localStorage data into the database ─────────────────
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const saved: LocalSavedItem[] = body.saved ?? [];
    const history: Record<string, LocalWatchedEntry> = body.history ?? {};

    // ── Sync Saved Anime ────────────────────────────────────────
    if (saved.length > 0) {
        // Use createMany with skipDuplicates for efficient batch insert
        await prisma.savedAnime.createMany({
            data: saved.map((item) => ({
                userId,
                animeId: item.slug,
                title: item.title,
                image: item.poster,
                type: item.type ?? "",
                createdAt: new Date(item.savedAt),
            })),
            skipDuplicates: true,
        });
    }

    // ── Sync Watch History ──────────────────────────────────────
    const historyEntries = Object.values(history);

    for (const entry of historyEntries) {
        // Each entry has a list of watched episode slugs.
        // We only have the per-episode timestamp for the most recent one.
        // For the "lastWatchedEpisode", use the entry.timestamp.
        // For all other episodes, use a slightly older timestamp.

        for (const episodeSlug of entry.watchedEpisodes) {
            const isLastWatched = episodeSlug === entry.lastWatchedEpisode;
            const localWatchedAt = new Date(
                isLastWatched ? entry.timestamp : entry.timestamp - 1000
            );

            // Check if the record already exists
            const existing = await prisma.watchHistory.findUnique({
                where: {
                    userId_animeId_episodeId: {
                        userId,
                        animeId: entry.slug,
                        episodeId: episodeSlug,
                    },
                },
                select: { watchedAt: true },
            });

            if (!existing) {
                // Create new record
                await prisma.watchHistory.create({
                    data: {
                        userId,
                        animeId: entry.slug,
                        title: entry.title,
                        image: entry.poster,
                        type: entry.type ?? "",
                        episodeId: episodeSlug,
                        episodeName: isLastWatched
                            ? entry.lastWatchedEpisodeName
                            : "",
                        watchedAt: localWatchedAt,
                    },
                });
            } else if (localWatchedAt > existing.watchedAt) {
                // Update only if local timestamp is newer
                await prisma.watchHistory.update({
                    where: {
                        userId_animeId_episodeId: {
                            userId,
                            animeId: entry.slug,
                            episodeId: episodeSlug,
                        },
                    },
                    data: {
                        watchedAt: localWatchedAt,
                        ...(isLastWatched && entry.lastWatchedEpisodeName
                            ? { episodeName: entry.lastWatchedEpisodeName }
                            : {}),
                    },
                });
            }
            // If existing and local timestamp is NOT newer, skip (keep DB data)
        }
    }

    return NextResponse.json({ success: true });
}
