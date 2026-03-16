import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET: List saved anime (or check a specific one) ────────────────
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const animeId = searchParams.get("animeId");

    // If animeId is provided, just check if it's saved
    if (animeId) {
        const exists = await prisma.savedAnime.findUnique({
            where: {
                userId_animeId: {
                    userId: session.user.id,
                    animeId,
                },
            },
        });
        return NextResponse.json({ isSaved: !!exists });
    }

    // Otherwise, return all saved anime sorted by newest first
    const saved = await prisma.savedAnime.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(saved);
}

// ─── POST: Save an anime ────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { animeId, title, image, type } = body;

    if (!animeId || !title) {
        return NextResponse.json(
            { error: "animeId and title are required" },
            { status: 400 }
        );
    }

    // Upsert to gracefully handle duplicates
    const saved = await prisma.savedAnime.upsert({
        where: {
            userId_animeId: {
                userId: session.user.id,
                animeId,
            },
        },
        update: {}, // Already saved, do nothing
        create: {
            userId: session.user.id,
            animeId,
            title,
            image: image ?? "",
            type: type ?? "",
        },
    });

    return NextResponse.json(saved, { status: 201 });
}

// ─── DELETE: Remove saved anime (Single or Bulk) ────────────────────
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { animeId, animeIds } = body;

        if (!animeId && (!Array.isArray(animeIds) || animeIds.length === 0)) {
            return NextResponse.json(
                { error: "animeId or animeIds array is required" },
                { status: 400 }
            );
        }

        const idsToDelete = animeIds ? animeIds : [animeId];

        await prisma.savedAnime.deleteMany({
            where: {
                userId: session.user.id,
                animeId: { in: idsToDelete },
            },
        });

        return NextResponse.json({ success: true, count: idsToDelete.length });
    } catch (error) {
        console.warn("Delete saved anime failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
