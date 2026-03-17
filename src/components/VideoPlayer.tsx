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
    const [isLightsOff, setIsLightsOff] = useState(false);
    const activeStream = streams[activeIdx];

    if (!streams.length || !activeStream) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-hn-card text-white/30">
                <p>No streaming source available.</p>
            </div>
        );
    }

    return (
        <>
            {/* Overlay */}
            {isLightsOff && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 transition-opacity duration-300 pointer-events-auto"
                    onClick={() => setIsLightsOff(false)}
                />
            )}

            {/* Player Container with Dynamic Z-Index */}
            <div className={`space-y-3 ${isLightsOff ? "relative z-[70]" : ""}`}>
                {/* Player with thumbnail overlay */}
                <VideoPlayerWrapper
                    key={activeStream.url}
                    iframeSrc={activeStream.url}
                    title={title}
                />

                {/* Navigation Row: Server Selector + Lights Off */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Server / Quality selector */}
                    {streams.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-white/40">Server:</span>
                            {streams.map((s, i) => (
                                <button
                                    key={`${s.name}-${i}`}
                                    onClick={() => setActiveIdx(i)}
                                    className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
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

                    {/* Lights Off Toggle Button */}
                    <button
                        onClick={() => setIsLightsOff(!isLightsOff)}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            isLightsOff
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-hn-card text-white/70 hover:bg-hn-card-hover hover:text-white"
                        } ${streams.length <= 1 ? "ml-auto" : ""}`}
                    >
                        <span className={`h-2 w-2 rounded-full ${isLightsOff ? "bg-hn-primary animate-pulse" : "bg-white/20"}`} />
                        {isLightsOff ? "Lights On" : "Lights Off"}
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-lg font-bold text-white sm:text-xl">{title}</h1>
            </div>
        </>
    );
}
