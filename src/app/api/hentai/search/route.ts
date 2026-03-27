import { NextResponse } from "next/server";
import {
  fetchHentaiRssFeed,
  groupHentaiBySeries,
  fetchHentaiDetail,
} from "@/lib/hentaiApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const rssItems = await fetchHentaiRssFeed();
    const allSeries = groupHentaiBySeries(rssItems);
    const lowerQ = q.toLowerCase();

    const filtered = allSeries
      .filter((s) => s.seriesTitle.toLowerCase().includes(lowerQ))
      .slice(0, 5);

    // Parallel scrape hi-res covers for the 5 results
    const results = await Promise.all(
      filtered.map(async (s) => {
        let cover = s.coverImage;
        try {
          const detail = await fetchHentaiDetail(s.episodes[0].slug);
          const coverimg = detail?.info?.[0]?.coverimg;
          if (coverimg) {
            cover = `https://hentaiocean.com/assets/cover/${coverimg}`;
          }
        } catch {
          // Fallback to RSS thumbnail
        }
        return {
          baseSlug: s.baseSlug,
          title: s.seriesTitle,
          cover,
          episodeCount: s.episodeCount,
        };
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
