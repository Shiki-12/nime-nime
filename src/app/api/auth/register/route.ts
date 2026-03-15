import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
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
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        // ── Create user ────────────────────────────────────────
        await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                verifyToken,
                verifyTokenExpiry,
            },
        });

        // ── Send verification email ────────────────────────────
        await sendVerificationEmail(email.toLowerCase(), name, verifyToken);

        return NextResponse.json(
            { message: "Account created successfully. Please check your email to verify your account." },
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
