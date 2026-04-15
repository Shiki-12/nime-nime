import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 60; // ISR — revalidate every 60s

export async function GET() {
    try {
        const now = new Date();

        const broadcasts = await prisma.broadcast.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                message: true,
                type: true,
                createdAt: true,
            },
        });

        return NextResponse.json(broadcasts, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
            },
        });
    } catch {
        return NextResponse.json([], { status: 200 });
    }
}
