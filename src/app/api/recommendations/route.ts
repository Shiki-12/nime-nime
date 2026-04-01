import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const CreateRecommendationSchema = z.object({
    animeSlug: z.string().min(1),
    animeTitle: z.string().min(1),
    coverImage: z.string().min(1),
});

// ─── GET: Fetch recent recommendations ──────────────────────────────
export const GET = withAuthAndValidation(async () => {
    const recommendations = await prisma.recommendation.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    return NextResponse.json(recommendations);
});

// ─── POST: Create a new recommendation (max 2 per user, admin unlimited) ────
const ADMIN_EMAIL = "uknowndonp@gmail.com";

export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const userEmail = session!.user!.email;

    const body = await req.json();
    const { animeSlug, animeTitle, coverImage } = body;

    // Admin bypasses the 2-recommendation limit
    if (userEmail !== ADMIN_EMAIL) {
        const existingCount = await prisma.recommendation.count({
            where: { userId },
        });

        if (existingCount >= 2) {
            return NextResponse.json(
                { error: "You can only recommend up to 2 anime." },
                { status: 400 }
            );
        }
    }

    const created = await prisma.recommendation.create({
        data: {
            userId,
            animeSlug,
            animeTitle,
            coverImage,
        },
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    return NextResponse.json(created, { status: 201 });
}, CreateRecommendationSchema);

// ─── DELETE: Remove a recommendation (Admin or Owner) ───────────────
export const DELETE = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const userEmail = session!.user!.email;

    const { searchParams } = new URL(req.url);
    const recommendationId = searchParams.get("id");

    if (!recommendationId) {
        return NextResponse.json(
            { error: "Recommendation ID is required." },
            { status: 400 }
        );
    }

    const recommendation = await prisma.recommendation.findUnique({
        where: { id: recommendationId },
    });

    if (!recommendation) {
        return NextResponse.json(
            { error: "Recommendation not found." },
            { status: 404 }
        );
    }

    const isAdmin = userEmail === ADMIN_EMAIL;
    const isOwner = recommendation.userId === userId;

    if (!isAdmin && !isOwner) {
        return NextResponse.json(
            { error: "You do not have permission to delete this recommendation." },
            { status: 403 }
        );
    }

    await prisma.recommendation.delete({
        where: { id: recommendationId },
    });

    return NextResponse.json({ success: true });
});
