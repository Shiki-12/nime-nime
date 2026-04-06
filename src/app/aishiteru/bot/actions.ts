"use server";

import { auth } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ── Helper: require ADMIN or OWNER ──────────────────────────────────
async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const role = session.user.role;
    if (role !== "ADMIN" && role !== "OWNER") throw new Error("Forbidden");

    return { userId: session.user.id, role };
}

// ── Action: Restart the Telegram bot via PM2 ────────────────────────
export async function restartTelegramBot(): Promise<{
    success: boolean;
    error?: string;
    output?: string;
}> {
    try {
        await requireAdmin();

        const { stdout, stderr } = await execAsync(
            "pm2 restart nimenime-bot",
            { timeout: 15000 }
        );

        if (stderr && !stderr.includes("Applying action")) {
            return { success: false, error: stderr.trim() };
        }

        return { success: true, output: stdout.trim() };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}
