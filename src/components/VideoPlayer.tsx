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
                    {/* Server / Quality dropdown */}
                    {streams.length > 1 && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-white/40">Server:</span>
                            <div className="relative">
                                <select
                                    value={activeIdx}
                                    onChange={(e) => setActiveIdx(Number(e.target.value))}
                                    className="appearance-none rounded-lg bg-white/[0.06] py-1.5 pl-3 pr-8 text-xs font-semibold text-white/80 outline-none ring-1 ring-white/10 transition-all hover:bg-white/10 focus:ring-hn-primary/40 cursor-pointer"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                                >
                                    {streams.map((s, i) => (
                                        <option key={`${s.name}-${i}`} value={i} className="bg-hn-dark text-white">
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <svg className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
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
                <h1 className="mt-2 text-lg font-bold text-white sm:text-xl">{title}</h1>
            </div>
        </>
    );
}
