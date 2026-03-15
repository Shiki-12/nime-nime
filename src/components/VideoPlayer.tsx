"use client";

import { useState } from "react";
import type { StreamSource } from "@/types/anime";
import VideoPlayerWrapper from "./VideoPlayerWrapper";

interface VideoPlayerProps {
    streams: StreamSource[];
    title: string;
}

export default function VideoPlayer({ streams, title }: VideoPlayerProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const activeStream = streams[activeIdx];

    if (!streams.length || !activeStream) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-hn-card text-white/30">
                <p>No streaming source available.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Player with thumbnail overlay */}
            <VideoPlayerWrapper
                key={activeStream.url}
                iframeSrc={activeStream.url}
                title={title}
            />

            {/* Server / Quality selector */}
            {streams.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-white/40">Server:</span>
                    {streams.map((s, i) => (
                        <button
                            key={`${s.name}-${i}`}
                            onClick={() => setActiveIdx(i)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                i === activeIdx
                                    ? "bg-hn-primary text-hn-dark shadow-lg shadow-hn-primary/25"
                                    : "bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Title */}
            <h1 className="text-lg font-bold text-white sm:text-xl">{title}</h1>
        </div>
    );
}
