import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const AddSavedSchema = z.object({
    animeId: z.string(),
    title: z.string(),
    image: z.string().optional(),
    type: z.string().optional(),
});

const DeleteSavedSchema = z.object({
    animeId: z.string().optional(),
    animeIds: z.array(z.string()).optional(),
});

// ─── GET: List saved anime (or check a specific one) ────────────────
export const GET = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    const { searchParams } = new URL(req.url);
    const animeId = searchParams.get("animeId");
    const type = searchParams.get("type");
    
    // Lightweight global state fetch
    if (type === "ids") {
        const savedIds = await prisma.savedAnime.findMany({
            where: { userId },
            select: { animeId: true },
        });
        return NextResponse.json(savedIds.map(s => s.animeId));
    }

    // If animeId is provided, just check if it's saved
    if (animeId) {
        const exists = await prisma.savedAnime.findUnique({
            where: {
                userId_animeId: {
                    userId,
                    animeId,
                },
            },
        });
        return NextResponse.json({ isSaved: !!exists });
    }

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (Math.max(1, page) - 1) * limit;

    const total = await prisma.savedAnime.count({ where: { userId } });

    // Otherwise, return all saved anime sorted by newest first
    const saved = await prisma.savedAnime.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
    });

    return NextResponse.json({
        data: saved,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
});

// ─── POST: Save an anime ────────────────────────────────────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    const body = await req.json();
    const { animeId, title, image, type } = body;

    // Upsert to gracefully handle duplicates
    const saved = await prisma.savedAnime.upsert({
        where: {
            userId_animeId: {
                userId,
                animeId,
            },
        },
        update: {}, // Already saved, do nothing
        create: {
            userId,
            animeId,
            title,
            image: image ?? "",
            type: type ?? "",
        },
    });

    return NextResponse.json(saved, { status: 201 });
}, AddSavedSchema);

// ─── DELETE: Remove saved anime (Single or Bulk) ────────────────────
export const DELETE = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    let body: { animeId?: string; animeIds?: string[] } = {};
    if (req.body) {
        try {
            body = await req.json();
        } catch {
            // Ignore format error in DELETE since it may not send body sometimes
        }
    }
    
    const { animeId, animeIds } = body;

    if (!animeId && (!Array.isArray(animeIds) || animeIds.length === 0)) {
        return NextResponse.json(
            { error: "animeId or animeIds array is required" },
            { status: 400 }
        );
    }

    const idsToDelete = animeIds ? animeIds : animeId ? [animeId] : [];

    await prisma.savedAnime.deleteMany({
        where: {
            userId,
            animeId: { in: idsToDelete },
        },
    });

    return NextResponse.json({ success: true, count: idsToDelete.length });
}, DeleteSavedSchema);
