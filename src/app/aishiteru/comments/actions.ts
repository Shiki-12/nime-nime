"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Helper: require ADMIN or OWNER ──────────────────────────────────
async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "OWNER") throw new Error("Forbidden");

    return { userId: session.user.id, role };
}

// ── Action: Delete a comment by ID ──────────────────────────────────
export async function deleteAdminComment(
    commentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAdmin();

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true },
        });

        if (!comment) {
            return { success: false, error: "Comment not found." };
        }

        await prisma.comment.delete({ where: { id: commentId } });

        revalidatePath("/aishiteru/comments");
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}
