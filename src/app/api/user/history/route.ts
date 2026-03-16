import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Types for grouped response ─────────────────────────────────────
interface GroupedHistoryEntry {
    slug: string;
    title: string;
    poster: string;
    type: string;
    watchedEpisodes: string[];
    lastWatchedEpisode: string;
    lastWatchedEpisodeName: string;
    timestamp: number;
}

// ─── GET: Fetch watch history grouped by anime ──────────────────────
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all history rows ordered by watchedAt DESC
    const rows = await prisma.watchHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { watchedAt: "desc" },
    });

    // Group by animeId to reconstruct the WatchedAnimeEntry shape
    const grouped = new Map<string, GroupedHistoryEntry>();

    for (const row of rows) {
        const existing = grouped.get(row.animeId);

        if (existing) {
            // Add episode to watchedEpisodes list
            if (!existing.watchedEpisodes.includes(row.episodeId)) {
                existing.watchedEpisodes.push(row.episodeId);
            }
        } else {
            // First row for this anime is the most recent (since sorted DESC)
            grouped.set(row.animeId, {
                slug: row.animeId,
                title: row.title,
                poster: row.image,
                type: row.type,
                watchedEpisodes: [row.episodeId],
                lastWatchedEpisode: row.episodeId,
                lastWatchedEpisodeName: row.episodeName,
                timestamp: row.watchedAt.getTime(),
            });
        }
    }

    return NextResponse.json(Array.from(grouped.values()));
}

// ─── POST: Mark an episode as watched ───────────────────────────────
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { animeId, title, image, type, episodeId, episodeName } = body;

    if (!animeId || !episodeId) {
        return NextResponse.json(
            { error: "animeId and episodeId are required" },
            { status: 400 }
        );
    }

    const entry = await prisma.watchHistory.upsert({
        where: {
            userId_animeId_episodeId: {
                userId: session.user.id,
                animeId,
                episodeId,
            },
        },
        update: {
            watchedAt: new Date(),
            episodeName: episodeName ?? "",
        },
        create: {
            userId: session.user.id,
            animeId,
            title: title ?? "",
            image: image ?? "",
            type: type ?? "",
            episodeId,
            episodeName: episodeName ?? "",
        },
    });

    return NextResponse.json(entry, { status: 201 });
}

// ─── DELETE: Remove history (Single, Bulk, or Clear All) ────────────
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // We might not have a body if it's a legacy clearAll call
        let body;
        try {
            body = await req.json();
        } catch {
            body = {};
        }

        const { animeId, animeIds, clearAll } = body;

        // If explicitly asked to clear all, or no specific targets provided
        if (clearAll || (!animeId && !animeIds)) {
            await prisma.watchHistory.deleteMany({
                where: { userId: session.user.id },
            });
            return NextResponse.json({ success: true, action: "cleared_all" });
        }

        // Single or bulk delete
        const idsToDelete = animeIds ? animeIds : [animeId];

        await prisma.watchHistory.deleteMany({
            where: {
                userId: session.user.id,
                animeId: { in: idsToDelete },
            },
        });

        return NextResponse.json({ success: true, count: idsToDelete.length });
    } catch (error) {
        console.warn("Delete watch history failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
