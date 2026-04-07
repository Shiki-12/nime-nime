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
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-hn-card text-hn-text-muted/50">
                <p>No streaming source available.</p>
            </div>
        );
    }

    return (
        <>
            {isLightsOff && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 transition-opacity duration-300 pointer-events-auto"
                    onClick={() => setIsLightsOff(false)}
                />
            )}

            <div
                className={`space-y-3 ${isLightsOff ? "relative z-[70]" : ""}`}
            >
                <VideoPlayerWrapper
                    key={activeStream.url}
                    iframeSrc={activeStream.url}
                    title={title}
                />

                <div className="flex flex-wrap items-center justify-between">
                    {streams.length > 1 ? (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-hn-text-muted/60">
                                Server:
                            </span>
                            <div className="relative">
                                <select
                                    value={activeIdx}
                                    onChange={(e) =>
                                        setActiveIdx(Number(e.target.value))
                                    }
                                    className="appearance-none rounded-lg bg-hn-border/20 py-1.5 pl-3 pr-8 text-xs font-semibold text-hn-text-muted/90 outline-none ring-1 ring-white/10 transition-all hover:bg-white/10 focus:ring-hn-primary/40 cursor-pointer"
                                    style={{
                                        backgroundColor:
                                            "rgba(255,255,255,0.06)",
                                    }}
                                >
                                    {streams.map((s, i) => (
                                        <option
                                            key={`${s.name}-${i}`}
                                            value={i}
                                            className="bg-hn-dark text-hn-text"
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <svg
                                    className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-hn-text-muted/60"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Fullscreen Alt Button */}
                        <button
                            type="button"
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent(
                                        "video-player-toggle-fullscreen",
                                    ),
                                )
                            }
                            className="group flex items-center gap-2 rounded-lg bg-hn-card px-3 py-1.5 text-xs font-semibold text-hn-text/70 transition-all hover:bg-hn-card-hover hover:text-hn-text"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-3.5 sm:w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 3.75h4.5m-4.5 0v4.5m0-4.5L9 9m11.25-5.25h-4.5m4.5 0v4.5m0-4.5L15 9M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15m11.25 5.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                                />
                            </svg>
                            <span className="hidden md:block">Fullscreen</span>
                        </button>

                        <button
                            onClick={() => setIsLightsOff(!isLightsOff)}
                            className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                isLightsOff
                                    ? "bg-white/10 text-hn-text hover:bg-white/20"
                                    : "bg-hn-card text-hn-text/70 hover:bg-hn-card-hover hover:text-hn-text"
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    isLightsOff
                                        ? "bg-hn-primary animate-pulse"
                                        : "bg-white/20"
                                }`}
                            />
                            {isLightsOff ? "Lights On" : "Lights Off"}
                        </button>
                    </div>
                </div>

                <h1 className="mt-2 text-lg font-bold text-hn-text sm:text-xl">
                    {title}
                </h1>
            </div>
        </>
    );
}
