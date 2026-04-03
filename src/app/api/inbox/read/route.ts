import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withAuthAndValidation } from "@/lib/api-wrapper";

// ─── PATCH: Mark notification(s) as read ────────────────────────────
// ?id=<notificationId>  → mark single notification as read
// (no id)               → mark ALL notifications for user as read
export const PATCH = withAuthAndValidation(async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");

    if (notificationId) {
        // Mark a single notification as read (only if it belongs to this user)
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            return NextResponse.json(
                { error: "Notification not found." },
                { status: 404 }
            );
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    }

    // Mark all as read
    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });

    return NextResponse.json({ success: true });
});
