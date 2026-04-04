"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

// ─── Props ─────────────────────────────────────────────────────────
interface VideoPlayerWrapperProps {
    /** The URL of the video iframe */
    iframeSrc: string;
    /** Anime/episode title for alt text */
    title: string;
}

// ─── Inline Spinner ────────────────────────────────────────────────
function LoadingSpinner() {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-hn-dark/60">
            <div className="flex flex-col items-center gap-3">
                <svg
                    className="h-10 w-10 animate-spin text-hn-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
                    />
                </svg>
                <p className="text-sm font-medium text-white/50">
                    Loading video…
                </p>
            </div>
        </div>
    );
}


// ─── Main Component ────────────────────────────────────────────────
export default function VideoPlayerWrapper({
    iframeSrc,
    title,
}: VideoPlayerWrapperProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Refs
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Play handler ───────────────────────────────────────────────
    const handlePlay = useCallback(() => {
        setHasStarted(true);
        setIsLoading(true);
        setHasError(false);

        // Timeout fallback: if iframe doesn't load within 20s, show error
        timeoutRef.current = setTimeout(() => {
            setIsLoading((prev) => {
                if (prev) setHasError(true);
                return false;
            });
        }, 20_000);
    }, []);
    // ── Iframe loaded successfully ─────────────────────────────────
    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    // ── Retry from error state ─────────────────────────────────────
    const handleRetry = useCallback(() => {
        setHasStarted(false);
        setIsLoading(false);
        setHasError(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    // ── Fullscreen Logic ───────────────────────────────────────────
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            wrapperRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // ─── Sandbox Logic ──────────────────────────────────────────────
    const strictSandbox = "allow-scripts allow-same-origin";

    const isProblematicHost =
        iframeSrc.includes("vidhide") || iframeSrc.includes("callistanise");
        
    // KUNCINYA DI SINI: Kalau host bandel, kita kasih undefined biar atribut sandbox-nya MENGHILANG dari DOM
    const sandboxRules = isProblematicHost ? undefined : strictSandbox;

    return (
        <div ref={wrapperRef} className="group/wrapper relative aspect-video w-full overflow-hidden rounded-2xl bg-hn-card">
            {/* ── State 1: Thumbnail Overlay (Idle) ─────────────── */}
            {!hasStarted && !hasError && (
                <>
                    {/* Background thumbnail */}
                    <Image
                        src="/images/banner_episode.png"
                        alt={title}
                        fill
                        unoptimized
                        className="object-cover"
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Play button */}
                    <button
                        type="button"
                        onClick={handlePlay}
                        aria-label={`Play ${title}`}
                        className="group absolute inset-0 z-10 flex items-center justify-center"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-hn-primary shadow-2xl shadow-hn-primary/30 transition-transform duration-200 group-hover:scale-110">
                            {/* Pulse ring */}
                            <span className="absolute h-20 w-20 animate-ping rounded-full bg-hn-primary/20" />
                            {/* Play icon */}
                            <svg
                                className="relative ml-1 h-8 w-8 text-hn-dark"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                        </div>
                    </button>
                    
                    {/* Bagian overlay title yang bikin dobel udah dihapus dari sini */}
                </>
            )}

            {/* ── State 2: Iframe Loading & Playing ─────────────── */}
            {hasStarted && !hasError && (
                <>
                    <iframe
                        src={iframeSrc}
                        title={title}
                        onLoad={handleIframeLoad}
                        onError={() => {
                            setHasError(true);
                            setIsLoading(false);
                        }}
                        className="h-full w-full border-0 bg-black"
                        allowFullScreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        {...({
                            webkitallowfullscreen: "true",
                            mozallowfullscreen: "true"
                        } as any)}
                    />

                    {/* Custom Fullscreen Button */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:text-white opacity-0 group-hover/wrapper:opacity-100"
                    >
                        {isFullscreen ? (
                            /* Exit Fullscreen Icon */
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
                                />
                            </svg>
                        ) : (
                            /* Enter Fullscreen Icon */
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                                />
                            </svg>
                        )}
                    </button>

                    {/* Loading spinner overlay */}
                    {isLoading && <LoadingSpinner />}
                </>
            )}

            {/* ── State 3: Error & Reload ───────────────────────── */}
            {hasError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-hn-dark/90">
                    {/* Error icon */}
                    <svg
                        className="h-12 w-12 text-white/20"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                    </svg>

                    <p className="text-sm font-semibold text-white/60">
                        Failed to load video.
                    </p>
                    <p className="text-xs text-white/30">
                        The server may be down or the link could be broken.
                    </p>

                    {/* Retry button */}
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                            />
                        </svg>
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}