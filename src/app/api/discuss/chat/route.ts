import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const SendMessageSchema = z.object({
    message: z.string().min(1).max(500),
    parentId: z.string().optional(),
});

// ─── Anti-Spam Rate Limiter (in-memory) ─────────────────────────────
const RATE_LIMIT_WINDOW = 5_000;        // 5 seconds
const RATE_LIMIT_MAX_MSGS = 5;          // max messages per window
const RATE_LIMIT_LOCKOUT = 5 * 60_000;  // 5 minutes

interface RateLimitEntry {
    count: number;
    windowStart: number;
    lockedUntil: number | null;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(userId: string): { blocked: boolean; retryAfterMs?: number } {
    const now = Date.now();
    let entry = rateLimitMap.get(userId);

    if (!entry) {
        entry = { count: 0, windowStart: now, lockedUntil: null };
        rateLimitMap.set(userId, entry);
    }

    // Check if currently locked out
    if (entry.lockedUntil && entry.lockedUntil > now) {
        return { blocked: true, retryAfterMs: entry.lockedUntil - now };
    } else if (entry.lockedUntil && entry.lockedUntil <= now) {
        // Lockout expired, reset
        entry.lockedUntil = null;
        entry.count = 0;
        entry.windowStart = now;
    }

    // Check if window has expired
    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
        entry.count = 0;
        entry.windowStart = now;
    }

    // Increment
    entry.count++;

    // Check if exceeded limit
    if (entry.count > RATE_LIMIT_MAX_MSGS) {
        entry.lockedUntil = now + RATE_LIMIT_LOCKOUT;
        return { blocked: true, retryAfterMs: RATE_LIMIT_LOCKOUT };
    }

    return { blocked: false };
}

// ─── GET: Fetch the 50 most recent chat messages (oldest first) ─────
export const GET = withAuthAndValidation(async () => {
    const messages = await prisma.publicMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            user: {
                select: { name: true, image: true, email: true, role: true },
            },
            parent: {
                select: {
                    id: true,
                    message: true,
                    user: { select: { name: true } },
                },
            },
        },
    });

    // Reverse so the client receives them in ascending (chronological) order
    messages.reverse();

    return NextResponse.json(messages);
});

// ─── POST: Send a new chat message (with rate limiting) ─────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const userRole = session!.user!.role;

    // Admin/Owner is exempt from rate limiting
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
        const rateCheck = checkRateLimit(userId);
        if (rateCheck.blocked) {
            const minutesLeft = Math.ceil((rateCheck.retryAfterMs || 0) / 60_000);
            return NextResponse.json(
                {
                    error: `You are sending messages too fast. Please wait ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
                },
                { status: 429 }
            );
        }
    }

    const body = await req.json();
    const { message, parentId } = body;
    const userName = session!.user!.name ?? "Someone";

    const created = await prisma.publicMessage.create({
        data: {
            userId,
            message,
            parentId,
        },
        include: {
            user: {
                select: { name: true, image: true, email: true, role: true },
            },
            parent: {
                select: {
                    id: true,
                    message: true,
                    user: { select: { name: true } },
                },
            },
        },
    });

    // ── Create notification for the parent message's author ─────────
    if (parentId) {
        try {
            const parentMessage = await prisma.publicMessage.findUnique({
                where: { id: parentId },
                select: { userId: true },
            });

            // Only notify if the parent author is NOT the current user
            if (parentMessage && parentMessage.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        userId: parentMessage.userId,
                        type: "REPLY",
                        title: "Pesan Baru di Live Chat",
                        message: `${userName} membalas pesan kamu di Live Chat.`,
                        link: `/discuss#message-${created.id}`,
                    },
                });
            }
        } catch {
            // Notification failure should not block message creation
            console.error("[NOTIFICATION_CREATE_ERROR] Failed to create live chat reply notification");
        }
    }

    return NextResponse.json(created, { status: 201 });
}, SendMessageSchema);

// ─── DELETE: Remove a chat message (Admin or Owner) ─────────────────
export const DELETE = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const userRole = session!.user!.role;

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
        return NextResponse.json(
            { error: "Message ID is required." },
            { status: 400 }
        );
    }

    const message = await prisma.publicMessage.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        return NextResponse.json(
            { error: "Message not found." },
            { status: 404 }
        );
    }

    const isAdmin = userRole === "ADMIN" || userRole === "OWNER";
    const isOwner = message.userId === userId;

    if (!isAdmin && !isOwner) {
        return NextResponse.json(
            { error: "You do not have permission to delete this message." },
            { status: 403 }
        );
    }

    await prisma.publicMessage.delete({
        where: { id: messageId },
    });

    return NextResponse.json({ success: true });
});
