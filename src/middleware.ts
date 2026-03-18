import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "@/lib/rate-limit";

// ─── Middleware: Rate-limit the NextAuth credentials login endpoint ──
// This catches POST requests to /api/auth/callback/credentials (the
// actual endpoint NextAuth hits when `signIn("credentials")` is called).

export async function middleware(req: NextRequest) {
    // Only rate-limit POST (the actual sign-in attempt)
    if (req.method !== "POST") {
        return NextResponse.next();
    }

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "anonymous";

    const result = authLimiter.check(5, `login:${ip}`);

    if (!result.success) {
        return NextResponse.json(
            { error: "Too many login attempts. Please try again later." },
            {
                status: 429,
                headers: {
                    "Retry-After": String(
                        Math.ceil((result.reset - Date.now()) / 1000)
                    ),
                    "X-RateLimit-Limit": String(result.limit),
                    "X-RateLimit-Remaining": "0",
                },
            }
        );
    }

    return NextResponse.next();
}

// Only match the NextAuth credentials callback endpoint
export const config = {
    matcher: "/api/auth/callback/credentials",
};
