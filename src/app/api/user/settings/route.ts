import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { settingsLimiter } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Magic number signatures for image validation ───────────────────
// Checking raw bytes prevents MIME-type spoofing (e.g. shell.php.jpg)
const IMAGE_SIGNATURES: { mime: string; bytes: number[]; offset?: number }[] = [
    { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
    { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
    { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF87a or GIF89a
    // WebP: RIFF....WEBP  (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
    { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
];

const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50]; // "WEBP" at offset 8

function isValidImageBuffer(buffer: Uint8Array): boolean {
    if (buffer.length < 12) return false;

    for (const sig of IMAGE_SIGNATURES) {
        const offset = sig.offset ?? 0;
        const match = sig.bytes.every(
            (byte, i) => buffer[offset + i] === byte
        );

        if (match) {
            // Special case: RIFF header could be non-WebP — verify WEBP marker
            if (sig.mime === "image/webp") {
                const webpMatch = WEBP_MARKER.every(
                    (byte, i) => buffer[8 + i] === byte
                );
                if (!webpMatch) continue; // RIFF but not WEBP — skip
            }
            return true;
        }
    }

    return false;
}

export async function PUT(req: NextRequest) {
    try {
        // ── Rate Limiting ─────────────────────────────────────────
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "anonymous";

        const rl = settingsLimiter.check(10, `settings:${ip}`);
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
            // Check 1: Declared MIME type (basic first-pass filter)
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

            // Check 2: Magic number validation (prevents MIME-type spoofing)
            // Read raw bytes and verify the file signature matches a real image
            const arrayBuffer = await avatarFile.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            if (!isValidImageBuffer(buffer)) {
                return NextResponse.json(
                    {
                        error:
                            "File content does not match a valid image format. " +
                            "The file may be corrupted or spoofed.",
                    },
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

            await writeFile(
                path.join(uploadDir, fileName),
                Buffer.from(arrayBuffer)
            );

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
