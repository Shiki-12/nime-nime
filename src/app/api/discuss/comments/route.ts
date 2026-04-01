import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuthAndValidation } from "@/lib/api-wrapper";

// ─── GET: Fetch the 20 most recent global comments ─────────────────
export const GET = withAuthAndValidation(async () => {
    const comments = await prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            user: {
                select: { name: true, image: true, email: true },
            },
        },
    });

    return NextResponse.json(comments);
});
