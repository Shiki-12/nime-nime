import { NextRequest, NextResponse } from "next/server";
import { nimeFetch } from "@/lib/fetcher";
import { OTAKUDESU_API_URL } from "@/lib/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: "Missing server ID" }, { status: 400 });
    }

    const encoded = encodeURIComponent(id.trim());
    const res = await nimeFetch(
      `${OTAKUDESU_API_URL}/server/${encoded}`,
      false
    );

    if (!res.ok) {
      console.error("[Otakudesu Server Route] Upstream error:", { status: res.status, id });
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const json = await res.json();
    const url = json.data?.url;

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      console.error("[Otakudesu Server Route] No URL in response:", { id });
      return NextResponse.json({ error: "No URL resolved" }, { status: 404 });
    }

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[Otakudesu Server Route] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
