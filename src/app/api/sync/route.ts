import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncLimiter } from "@/lib/rate-limit";

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
    // ── Rate Limiting ───────────────────────────────────────────
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "anonymous";

    const rl = syncLimiter.check(5, `sync:${ip}`);
    if (!rl.success) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
                },
            }
        );
    }

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

    // ── Sync Watch History (N+1 FIXED) ──────────────────────────
    const historyEntries = Object.values(history);

    // Step 1: Flatten ALL episodes into a single list
    interface FlatEpisode {
        animeId: string;
        title: string;
        image: string;
        type: string;
        episodeId: string;
        episodeName: string;
        watchedAt: Date;
    }

    const allEpisodes: FlatEpisode[] = [];

    for (const entry of historyEntries) {
        for (const episodeSlug of entry.watchedEpisodes) {
            const isLastWatched = episodeSlug === entry.lastWatchedEpisode;
            allEpisodes.push({
                animeId: entry.slug,
                title: entry.title,
                image: entry.poster,
                type: entry.type ?? "",
                episodeId: episodeSlug,
                episodeName: isLastWatched ? entry.lastWatchedEpisodeName : "",
                watchedAt: new Date(
                    isLastWatched ? entry.timestamp : entry.timestamp - 1000
                ),
            });
        }
    }

    if (allEpisodes.length > 0) {
        // Step 2: Single batch fetch of ALL existing records for this user
        const existingRecords = await prisma.watchHistory.findMany({
            where: {
                userId,
                OR: allEpisodes.map((ep) => ({
                    animeId: ep.animeId,
                    episodeId: ep.episodeId,
                })),
            },
            select: {
                animeId: true,
                episodeId: true,
                watchedAt: true,
            },
        });

        // Build a lookup set for O(1) access
        const existingMap = new Map<string, Date>();
        for (const rec of existingRecords) {
            existingMap.set(`${rec.animeId}::${rec.episodeId}`, rec.watchedAt);
        }

        // Step 3: Separate into toCreate and toUpdate
        const toCreate: typeof allEpisodes = [];
        const toUpdate: typeof allEpisodes = [];

        for (const ep of allEpisodes) {
            const key = `${ep.animeId}::${ep.episodeId}`;
            const existingDate = existingMap.get(key);

            if (!existingDate) {
                toCreate.push(ep);
            } else if (ep.watchedAt > existingDate) {
                toUpdate.push(ep);
            }
            // else: DB record is newer or equal — skip
        }

        // Step 4: Batch insert new records
        if (toCreate.length > 0) {
            await prisma.watchHistory.createMany({
                data: toCreate.map((ep) => ({
                    userId,
                    animeId: ep.animeId,
                    title: ep.title,
                    image: ep.image,
                    type: ep.type,
                    episodeId: ep.episodeId,
                    episodeName: ep.episodeName,
                    watchedAt: ep.watchedAt,
                })),
                skipDuplicates: true,
            });
        }

        // Step 5: Batch update existing records in a single transaction
        if (toUpdate.length > 0) {
            await prisma.$transaction(
                toUpdate.map((ep) =>
                    prisma.watchHistory.update({
                        where: {
                            userId_animeId_episodeId: {
                                userId,
                                animeId: ep.animeId,
                                episodeId: ep.episodeId,
                            },
                        },
                        data: {
                            watchedAt: ep.watchedAt,
                            ...(ep.episodeName ? { episodeName: ep.episodeName } : {}),
                        },
                    })
                )
            );
        }
    }

    return NextResponse.json({ success: true });
}
