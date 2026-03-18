import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { authLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    try {
        // ── Rate Limiting ─────────────────────────────────────────
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "anonymous";

        const rl = authLimiter.check(5, `register:${ip}`);
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

        const body = await req.json();
        const { name, email, password } = body as {
            name?: string;
            email?: string;
            password?: string;
        };

        // ── Validation ─────────────────────────────────────────
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters." },
                { status: 400 }
            );
        }

        // ── Check existing user ────────────────────────────────
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists." },
                { status: 409 }
            );
        }

        // ── Hash password & generate token ─────────────────────
        const hashedPassword = await bcryptjs.hash(password, 12);

        // Generate a raw token (this is what gets sent in the email)
        const rawToken = crypto.randomBytes(32).toString("hex");

        // Hash the token with SHA-256 before storing in the database
        // This way, even if the DB is compromised, tokens can't be reused
        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        // ── Create user (store HASHED token) ────────────────────
        await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                verifyToken: hashedToken,
                verifyTokenExpiry,
            },
        });

        // ── Send verification email (with RAW token) ───────────
        await sendVerificationEmail(email.toLowerCase(), name, rawToken);

        return NextResponse.json(
            {
                message:
                    "Account created successfully. Please check your email to verify your account.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[REGISTER_ERROR]", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}
