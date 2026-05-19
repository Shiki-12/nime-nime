import { NextRequest, NextResponse } from "next/server";
import { authLimiter } from "@/lib/rate-limit";

const BYPASS_COOKIE = "maintenance_bypass";
const DEFAULT_MAINTENANCE_MESSAGE =
    "Admin belum bayar API, jadi NimeNime lagi istirahat sebentar.";

function isMaintenanceModeEnabled() {
    return process.env.MAINTENANCE_MODE === "true";
}

function getMaintenanceMessage() {
    return process.env.MAINTENANCE_MESSAGE || DEFAULT_MAINTENANCE_MESSAGE;
}

function isStaticAsset(pathname: string) {
    return (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.match(
            /\.(png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|mjs|map|txt|xml|json|woff|woff2|ttf|otf)$/i
        ) !== null
    );
}

function isMaintenancePage(pathname: string) {
    return pathname === "/maintenance" || pathname.startsWith("/maintenance/");
}

function hasMaintenanceBypass(req: NextRequest) {
    return req.cookies.get(BYPASS_COOKIE)?.value === "true";
}

function isBypassRequest(req: NextRequest) {
    const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;
    const requestedSecret = req.nextUrl.searchParams.get("maintenance_bypass");

    return Boolean(
        bypassSecret && requestedSecret && requestedSecret === bypassSecret
    );
}

function maintenanceJsonResponse() {
    return NextResponse.json(
        {
            status: "maintenance",
            message: getMaintenanceMessage(),
        },
        { status: 503 }
    );
}

function applyMaintenanceMode(req: NextRequest) {
    if (!isMaintenanceModeEnabled()) {
        return null;
    }

    const { pathname } = req.nextUrl;

    if (isStaticAsset(pathname) || isMaintenancePage(pathname)) {
        return NextResponse.next();
    }

    if (pathname === "/api/health") {
        return NextResponse.next();
    }

    if (isBypassRequest(req)) {
        const response = NextResponse.redirect(new URL("/aishiteru", req.url));

        response.cookies.set(BYPASS_COOKIE, "true", {
            httpOnly: true,
            maxAge: 60 * 60 * 24,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    }

    if (hasMaintenanceBypass(req)) {
        return null;
    }

    if (pathname.startsWith("/api")) {
        return maintenanceJsonResponse();
    }

    return NextResponse.redirect(new URL("/maintenance", req.url));
}

function applyCredentialsRateLimit(req: NextRequest) {
    if (
        req.method !== "POST" ||
        req.nextUrl.pathname !== "/api/auth/callback/credentials"
    ) {
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

export function proxy(req: NextRequest) {
    const maintenanceResponse = applyMaintenanceMode(req);

    if (maintenanceResponse) {
        return maintenanceResponse;
    }

    return applyCredentialsRateLimit(req);
}

export const config = {
    matcher: [
        "/((?!_next(?:/.*)?|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|mjs|map|txt|xml|json|woff|woff2|ttf|otf)$).*)",
    ],
};
