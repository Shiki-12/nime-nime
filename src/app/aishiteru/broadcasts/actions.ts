"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { BroadcastType } from "@/generated/prisma/client";

// ── Helper: get & validate the admin session ────────────────────────
async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "OWNER") throw new Error("Forbidden");

    return { userId: session.user.id, role: role as "ADMIN" | "OWNER" };
}

const VALID_TYPES: BroadcastType[] = ["INFO", "WARNING", "DANGER", "SUCCESS"];

// ── Action: Create a broadcast ──────────────────────────────────────
export async function createBroadcast(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAdmin();

        const message = (formData.get("message") as string)?.trim();
        const type = formData.get("type") as BroadcastType;
        const startDateStr = formData.get("startDate") as string;
        const endDateStr = formData.get("endDate") as string;

        if (!message || message.length < 1) {
            return { success: false, error: "Message is required." };
        }

        if (message.length > 500) {
            return { success: false, error: "Message must be under 500 characters." };
        }

        if (!VALID_TYPES.includes(type)) {
            return { success: false, error: "Invalid broadcast type." };
        }

        if (!startDateStr || !endDateStr) {
            return { success: false, error: "Start and end dates are required." };
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return { success: false, error: "Invalid date format." };
        }

        if (endDate <= startDate) {
            return { success: false, error: "End date must be after start date." };
        }

        await prisma.broadcast.create({
            data: {
                message,
                type,
                startDate,
                endDate,
            },
        });

        revalidatePath("/aishiteru/broadcasts");
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: msg };
    }
}

// ── Action: Toggle isActive ─────────────────────────────────────────
export async function toggleBroadcast(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAdmin();

        const broadcast = await prisma.broadcast.findUnique({
            where: { id },
            select: { isActive: true },
        });

        if (!broadcast) {
            return { success: false, error: "Broadcast not found." };
        }

        await prisma.broadcast.update({
            where: { id },
            data: { isActive: !broadcast.isActive },
        });

        revalidatePath("/aishiteru/broadcasts");
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: msg };
    }
}

// ── Action: Delete a broadcast ──────────────────────────────────────
export async function deleteBroadcast(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAdmin();

        const broadcast = await prisma.broadcast.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!broadcast) {
            return { success: false, error: "Broadcast not found." };
        }

        await prisma.broadcast.delete({ where: { id } });

        revalidatePath("/aishiteru/broadcasts");
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: msg };
    }
}
