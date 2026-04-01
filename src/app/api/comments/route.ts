import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const CreateCommentSchema = z.object({
    episodeSlug: z.string().min(1),
    text: z.string().min(1).max(1000),
});

// ─── GET: Fetch comments for a specific episode ─────────────────────
export const GET = withAuthAndValidation(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const episodeSlug = searchParams.get("episodeSlug");

    if (!episodeSlug) {
        return NextResponse.json(
            { error: "episodeSlug is required." },
            { status: 400 }
        );
    }

    const comments = await prisma.comment.findMany({
        where: { episodeSlug },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    return NextResponse.json(comments);
});

// ─── POST: Submit a new comment on an episode ───────────────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    const body = await req.json();
    const { episodeSlug, text } = body;

    const created = await prisma.comment.create({
        data: {
            userId,
            episodeSlug,
            text,
        },
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    return NextResponse.json(created, { status: 201 });
}, CreateCommentSchema);

// ─── DELETE: Remove a comment (Admin or Owner) ──────────────────────
const ADMIN_EMAIL = "uknowndonp@gmail.com";

export const DELETE = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const userEmail = session!.user!.email;

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
        return NextResponse.json(
            { error: "Comment ID is required." },
            { status: 400 }
        );
    }

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
    });

    if (!comment) {
        return NextResponse.json(
            { error: "Comment not found." },
            { status: 404 }
        );
    }

    const isAdmin = userEmail === ADMIN_EMAIL;
    const isOwner = comment.userId === userId;

    if (!isAdmin && !isOwner) {
        return NextResponse.json(
            { error: "You do not have permission to delete this comment." },
            { status: 403 }
        );
    }

    await prisma.comment.delete({
        where: { id: commentId },
    });

    return NextResponse.json({ success: true });
});
