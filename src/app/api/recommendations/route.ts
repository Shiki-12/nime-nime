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

// ─── POST: Create a new recommendation (max 5 per user) ─────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    const body = await req.json();
    const { animeSlug, animeTitle, coverImage } = body;

    // Enforce the 5-recommendation hard limit
    const existingCount = await prisma.recommendation.count({
        where: { userId },
    });

    if (existingCount >= 5) {
        return NextResponse.json(
            { error: "You can only recommend up to 5 anime." },
            { status: 400 }
        );
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
