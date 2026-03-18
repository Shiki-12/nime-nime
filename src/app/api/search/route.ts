import { NextResponse } from "next/server";
import { BROWSER_HEADERS } from "@/lib/fetcher";

const BASE_URL = "https://www.sankavollerei.com/anime/animasu";

/**
 * Server-side proxy for the client SearchBar.
 * Forwards search queries to the external API with browser-spoofing headers
 * so it doesn't get 403'd on GCP datacenter IPs.
 *
 * GET /api/search?q=naruto&page=1
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const page = searchParams.get("page") ?? "1";

    if (!query.trim()) {
        return NextResponse.json({ animes: [] });
    }

    try {
        const res = await fetch(
            `${BASE_URL}/search/${encodeURIComponent(query)}?page=${page}`,
            {
                headers: BROWSER_HEADERS,
                next: { revalidate: 300 }, // Tier 4: 5 minutes
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream API error: ${res.status}` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Search proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch search results" },
            { status: 502 }
        );
    }
}
