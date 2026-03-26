import { NextResponse } from "next/server";
import { fetchHentaiRssFeed, groupHentaiBySeries } from "@/lib/hentaiApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const rssItems = await fetchHentaiRssFeed();
    const allSeries = groupHentaiBySeries(rssItems);
    const lowerQ = q.toLowerCase();

    const results = allSeries
      .filter((s) => s.seriesTitle.toLowerCase().includes(lowerQ))
      .slice(0, 5)
      .map((s) => ({
        baseSlug: s.baseSlug,
        title: s.seriesTitle,
        cover: s.coverImage,
        episodeCount: s.episodeCount,
      }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
