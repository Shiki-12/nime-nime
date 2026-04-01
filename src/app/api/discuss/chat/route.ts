import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-wrapper";

const SendMessageSchema = z.object({
    message: z.string().min(1).max(500),
});

// ─── GET: Fetch the 50 most recent chat messages (oldest first) ─────
export const GET = withAuthAndValidation(async () => {
    const messages = await prisma.publicMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    // Reverse so the client receives them in ascending (chronological) order
    messages.reverse();

    return NextResponse.json(messages);
});

// ─── POST: Send a new chat message ──────────────────────────────────
export const POST = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    const body = await req.json();
    const { message } = body;

    const created = await prisma.publicMessage.create({
        data: {
            userId,
            message,
        },
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    return NextResponse.json(created, { status: 201 });
}, SendMessageSchema);
