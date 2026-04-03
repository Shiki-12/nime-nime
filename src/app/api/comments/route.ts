import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const CreateCommentSchema = z.object({
    episodeSlug: z.string().min(1),
    animeSlug: z.string().optional(),
    parentId: z.string().optional(),
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
            parent: {
                select: {
                    id: true,
                    text: true,
                    user: { select: { name: true } },
                },
            },
        },
    });

    return NextResponse.json(comments);
});

// ─── POST: Submit a new comment on an episode ───────────────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const userName = session!.user!.name ?? "Someone";

    const body = await req.json();
    const { episodeSlug, animeSlug, parentId, text } = body;

    const created = await prisma.comment.create({
        data: {
            userId,
            episodeSlug,
            animeSlug,
            parentId,
            text,
        },
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
            parent: {
                select: {
                    id: true,
                    text: true,
                    user: { select: { name: true } },
                },
            },
        },
    });

    // ── Create notification for the parent comment's author ─────────
    if (parentId) {
        try {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                select: { userId: true, episodeSlug: true },
            });

            // Only notify if the parent author is NOT the current user
            if (parentComment && parentComment.userId !== userId) {
                const watchLink = animeSlug
                    ? `/anime/watch/${episodeSlug}?anime=${animeSlug}#comment-${created.id}`
                    : `/anime/watch/${episodeSlug}#comment-${created.id}`;

                await prisma.notification.create({
                    data: {
                        userId: parentComment.userId,
                        type: "REPLY",
                        title: "New Reply",
                        message: `${userName} replied to your comment.`,
                        link: watchLink,
                    },
                });
            }
        } catch {
            // Notification failure should not block comment creation
            console.error("[NOTIFICATION_CREATE_ERROR] Failed to create reply notification");
        }
    }

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
