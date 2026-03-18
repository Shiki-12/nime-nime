import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { authLimiter } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    try {
        // ── Rate Limiting ─────────────────────────────────────────
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "anonymous";

        const rl = authLimiter.check(10, `verify:${ip}`);
        if (!rl.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(
                            Math.ceil((rl.reset - Date.now()) / 1000)
                        ),
                    },
                }
            );
        }

        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Verification token is required." },
                { status: 400 }
            );
        }

        // ── Hash the incoming token to compare with the DB ─────
        // The DB stores the SHA-256 hash; the user received the raw token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // ── Find user with valid, non-expired hashed token ─────
        const user = await prisma.user.findFirst({
            where: {
                verifyToken: hashedToken,
                verifyTokenExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired verification token." },
                { status: 400 }
            );
        }

        // ── Activate the account ──────────────────────────────
        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verifyToken: null,
                verifyTokenExpiry: null,
            },
        });

        return NextResponse.json(
            { message: "Email verified successfully! You can now log in." },
            { status: 200 }
        );
    } catch (error) {
        console.error("[VERIFY_ERROR]", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}
