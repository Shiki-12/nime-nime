import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const AddHistorySchema = z.object({
    animeId: z.string(),
    title: z.string().optional(),
    image: z.string().optional(),
    type: z.string().optional(),
    episodeId: z.string(),
    episodeName: z.string().optional(),
});

const DeleteHistorySchema = z.object({
    animeId: z.string().optional(),
    animeIds: z.array(z.string()).optional(),
    clearAll: z.boolean().optional(),
    episodeId: z.string().optional(),
});



// ─── GET: Fetch watch history grouped by anime with pagination ────────
export const GET = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    // Extract pagination params
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // Lightweight global state fetch
    if (type === "ids") {
        const historyRows = await prisma.watchHistory.findMany({
            where: { userId },
            select: { animeId: true, episodeId: true },
        });
        const historyMap: Record<string, string[]> = {};
        for (const row of historyRows) {
            if (!historyMap[row.animeId]) historyMap[row.animeId] = [];
            historyMap[row.animeId].push(row.episodeId);
        }
        return NextResponse.json(historyMap);
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (Math.max(1, page) - 1) * limit;

    // 1. Get total number of distinct anime watched by this user
    const totalGroups = await prisma.watchHistory.groupBy({
        by: ["animeId"],
        where: { userId },
    });
    const total = totalGroups.length;

    // 2. Get paginated unique anime IDs ordered by most recently watched (latest watched episode)
    const pagedGroups = await prisma.watchHistory.groupBy({
        by: ["animeId"],
        where: { userId },
        _max: { watchedAt: true },
        orderBy: { _max: { watchedAt: "desc" } },
        skip,
        take: limit,
    });

    if (pagedGroups.length === 0) {
        return NextResponse.json({
            data: [],
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }

    // 3. Fetch exact detailed records for these specific (animeId, maxWatchedAt) pairs
    const exactRecords = await prisma.watchHistory.findMany({
        where: {
            userId,
            OR: pagedGroups.map((g) => ({
                animeId: g.animeId,
                watchedAt: g._max.watchedAt!,
            })),
        },
    });

    // Deduplicate in case multiple episodes of same anime were watched at the exact same millisecond
    const uniqueRecords = exactRecords.reduce((acc, current) => {
        if (!acc.find((item) => item.animeId === current.animeId)) {
            acc.push(current);
        }
        return acc;
    }, [] as typeof exactRecords);

    // 4. Fetch all episode IDs watched for these anime to populate the watchedEpisodes array
    const allEpisodesForTheseAnime = await prisma.watchHistory.findMany({
        where: {
            userId,
            animeId: { in: pagedGroups.map((g) => g.animeId) },
        },
        select: { animeId: true, episodeId: true },
    });

    // 5. Structure the returning data
    const groupedData = pagedGroups.map((g) => {
        const record = uniqueRecords.find((r) => r.animeId === g.animeId)!;
        const episodes = allEpisodesForTheseAnime
            .filter((ep) => ep.animeId === g.animeId)
            .map((ep) => ep.episodeId);

        return {
            slug: record.animeId,
            title: record.title,
            poster: record.image,
            type: record.type,
            watchedEpisodes: Array.from(new Set(episodes)), // Ensure unique
            lastWatchedEpisode: record.episodeId,
            lastWatchedEpisodeName: record.episodeName,
            timestamp: record.watchedAt.getTime(),
        };
    });

    // Ensure sorted strictly by timestamp descending
    groupedData.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
        data: groupedData,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// ─── POST: Mark an episode as watched ───────────────────────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

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
                userId,
                animeId,
                episodeId,
            },
        },
        update: {
            watchedAt: new Date(),
            episodeName: episodeName ?? "",
        },
        create: {
            userId,
            animeId,
            title: title ?? "",
            image: image ?? "",
            type: type ?? "",
            episodeId,
            episodeName: episodeName ?? "",
        },
    });

    return NextResponse.json(entry, { status: 201 });
}, AddHistorySchema);

// ─── DELETE: Remove history (Single, Bulk, or Clear All) ────────────
export const DELETE = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    // We might not have a body if it's a legacy clearAll call without schema
    let body: { animeId?: string; animeIds?: string[]; clearAll?: boolean; episodeId?: string } = {};
    if (req.body) {
        try {
            body = await req.json();
        } catch {
            // Ignore if body is empty
        }
    }

    const { animeId, animeIds, clearAll, episodeId } = body;

    // If explicitly asked to clear all, or no specific targets provided
    if (clearAll || (!animeId && !animeIds)) {
        await prisma.watchHistory.deleteMany({
            where: { userId },
        });
        return NextResponse.json({ success: true, action: "cleared_all" });
    }

    // Single episode delete
    if (animeId && episodeId) {
        await prisma.watchHistory.delete({
            where: {
                userId_animeId_episodeId: {
                    userId,
                    animeId,
                    episodeId,
                },
            },
        });
        return NextResponse.json({ success: true, action: "deleted_episode" });
    }

    // Single or bulk delete (Full anime history)
    const idsToDelete = animeIds ? animeIds : animeId ? [animeId] : [];

    await prisma.watchHistory.deleteMany({
        where: {
            userId,
            animeId: { in: idsToDelete },
        },
    });

    return NextResponse.json({ success: true, count: idsToDelete.length });
}, DeleteHistorySchema);
