"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/client";

// ── Helper: get & validate the admin session ────────────────────────
async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "OWNER") throw new Error("Forbidden");

    return { userId: session.user.id, role: role as "ADMIN" | "OWNER" };
}

// ── Action: Update a user's role ────────────────────────────────────
export async function updateUserRole(
    targetUserId: string,
    newRole: Role
): Promise<{ success: boolean; error?: string }> {
    try {
        const requester = await requireAdmin();

        // Prevent self-demotion/promotion
        if (requester.userId === targetUserId) {
            return { success: false, error: "You cannot change your own role." };
        }

        // Fetch the target user to check their current role
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { role: true },
        });

        if (!targetUser) {
            return { success: false, error: "User not found." };
        }

        // ── Strict RBAC rules ───────────────────────────────────────
        // ADMIN cannot promote to OWNER
        if (requester.role === "ADMIN" && newRole === "OWNER") {
            return { success: false, error: "Only an Owner can promote to Owner." };
        }

        // ADMIN cannot modify another ADMIN or OWNER
        if (
            requester.role === "ADMIN" &&
            (targetUser.role === "ADMIN" || targetUser.role === "OWNER")
        ) {
            return {
                success: false,
                error: "Admins cannot modify other Admins or Owners.",
            };
        }

        // Only OWNER can demote another OWNER
        if (targetUser.role === "OWNER" && requester.role !== "OWNER") {
            return { success: false, error: "Only an Owner can demote an Owner." };
        }

        await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
        });

        revalidatePath("/aishiteru/users");
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}

// ── Action: Delete a user ───────────────────────────────────────────
export async function deleteUser(
    targetUserId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const requester = await requireAdmin();

        // Prevent self-deletion
        if (requester.userId === targetUserId) {
            return { success: false, error: "You cannot delete yourself." };
        }

        // Fetch the target user to enforce RBAC
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { role: true },
        });

        if (!targetUser) {
            return { success: false, error: "User not found." };
        }

        // ADMIN cannot delete another ADMIN or OWNER
        if (
            requester.role === "ADMIN" &&
            (targetUser.role === "ADMIN" || targetUser.role === "OWNER")
        ) {
            return {
                success: false,
                error: "Admins cannot delete other Admins or Owners.",
            };
        }

        // Only OWNER can delete another OWNER
        if (targetUser.role === "OWNER" && requester.role !== "OWNER") {
            return { success: false, error: "Only an Owner can delete an Owner." };
        }

        await prisma.user.delete({ where: { id: targetUserId } });

        revalidatePath("/aishiteru/users");
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}
