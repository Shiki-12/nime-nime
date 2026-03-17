import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const name = formData.get("name") as string | null;
        const currentPassword = formData.get("currentPassword") as
            | string
            | null;
        const newPassword = formData.get("newPassword") as string | null;
        const avatarFile = formData.get("avatar") as File | null;

        // Fetch current user from DB
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true, image: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // ── Build update payload ─────────────────────────────────
        const updateData: Record<string, unknown> = {};

        // Name
        if (name && name.trim().length > 0) {
            updateData.name = name.trim();
        }

        // Password
        if (newPassword && newPassword.trim().length > 0) {
            if (newPassword.length < 8) {
                return NextResponse.json(
                    { error: "New password must be at least 8 characters." },
                    { status: 400 }
                );
            }

            // User already has a password → verify current one
            if (user.password) {
                if (!currentPassword || currentPassword.trim().length === 0) {
                    return NextResponse.json(
                        { error: "Current password is required to set a new password." },
                        { status: 400 }
                    );
                }

                const isValid = await bcryptjs.compare(
                    currentPassword,
                    user.password
                );
                if (!isValid) {
                    return NextResponse.json(
                        { error: "Current password is incorrect." },
                        { status: 400 }
                    );
                }
            }
            // else: OAuth user (password is null) → allow setting directly

            updateData.password = await bcryptjs.hash(newPassword, 12);
        }

        // Avatar
        if (avatarFile && avatarFile.size > 0) {
            if (!ALLOWED_TYPES.includes(avatarFile.type)) {
                return NextResponse.json(
                    {
                        error: "Invalid file type. Allowed: JPG, PNG, WebP, GIF.",
                    },
                    { status: 400 }
                );
            }

            if (avatarFile.size > MAX_SIZE) {
                return NextResponse.json(
                    { error: "File size must be under 5 MB." },
                    { status: 400 }
                );
            }

            const ext = avatarFile.name.split(".").pop() ?? "jpg";
            const fileName = `${session.user.id}-${Date.now()}.${ext}`;
            const uploadDir = path.join(
                process.cwd(),
                "public",
                "uploads",
                "avatars"
            );

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            await writeFile(path.join(uploadDir, fileName), buffer);

            updateData.image = `/uploads/avatars/${fileName}`;
        }

        // ── Apply updates ────────────────────────────────────────
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No changes provided." },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { id: true, name: true, email: true, image: true },
        });

        return NextResponse.json({
            message: "Settings updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("[SETTINGS_ERROR]", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
