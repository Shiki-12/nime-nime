import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/cleanup-unverified
 *
 * Deletes credential-based users who registered more than 24 hours ago
 * but never verified their email. OAuth users (password === null) are
 * never touched.
 *
 * Security: Requires `Authorization: Bearer <CRON_SECRET>` header
 * or `?secret=<CRON_SECRET>` query parameter.
 *
 * Usage (Linux crontab, hourly):
 *   0 * * * * curl -s -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/cron/cleanup-unverified
 */
export async function GET(request: Request) {
    // ── Auth check ──────────────────────────────────────────────────
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        return NextResponse.json(
            { error: "CRON_SECRET is not configured on the server." },
            { status: 500 }
        );
    }

    // Accept secret from Authorization header OR query parameter
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");

    const providedSecret =
        authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7)
            : querySecret;

    if (providedSecret !== cronSecret) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // ── Cleanup logic ───────────────────────────────────────────────
    try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Only target credential-based users (password is NOT null)
        // who haven't verified their email within 24 hours.
        // OAuth users (Google, etc.) have password === null and are excluded.
        const result = await prisma.user.deleteMany({
            where: {
                isVerified: false,
                password: { not: null },    // strictly credential users
                createdAt: { lt: yesterday },
            },
        });

        return NextResponse.json({
            success: true,
            deleted: result.count,
            message: `Cleaned up ${result.count} unverified ghost account${result.count !== 1 ? "s" : ""}.`,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
