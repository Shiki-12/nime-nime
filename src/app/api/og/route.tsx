import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title") || "Anime";
    const poster = searchParams.get("poster") || "";
    const rating = searchParams.get("rating") || "";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "#0a0a0f",
                }}
            >
                {/* Background poster — blurred via overlay */}
                {poster && (
                    <img
                        src={poster}
                        alt=""
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.3,
                        }}
                    />
                )}

                {/* Dark overlay for contrast */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                            "linear-gradient(135deg, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.75) 50%, rgba(10,10,15,0.92) 100%)",
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 60,
                        padding: "60px 80px",
                        position: "relative",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {/* Poster card */}
                    {poster && (
                        <div
                            style={{
                                display: "flex",
                                flexShrink: 0,
                                width: 280,
                                height: 400,
                                borderRadius: 20,
                                overflow: "hidden",
                                boxShadow:
                                    "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(161,130,171,0.15)",
                                border: "2px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <img
                                src={poster}
                                alt={title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    )}

                    {/* Text content */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 20,
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {/* Title */}
                        <div
                            style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: "#ffffff",
                                lineHeight: 1.15,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            {title}
                        </div>

                        {/* Rating */}
                        {rating && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 30,
                                    fontWeight: 700,
                                    color: "#f59e0b",
                                    marginTop: 4,
                                }}
                            >
                                ⭐ Rating: {rating}
                            </div>
                        )}

                        {/* Brand badge */}
                        <div
                            style={{
                                display: "flex",
                                marginTop: 16,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    backgroundColor: "#a182ab",
                                    color: "#ffffff",
                                    fontSize: 24,
                                    fontWeight: 700,
                                    padding: "12px 32px",
                                    borderRadius: 999,
                                    boxShadow:
                                        "0 8px 30px rgba(161,130,171,0.3)",
                                }}
                            >
                                🍿 Tonton Gratis di NimeNime
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corner brand watermark */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 24,
                        right: 40,
                        fontSize: 18,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.2)",
                        letterSpacing: "0.05em",
                    }}
                >
                    nime-nime.web.id
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
