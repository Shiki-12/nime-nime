"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface VideoPlayerWrapperProps {
    iframeSrc: string;
    title: string;
}

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
                <p className="text-sm font-medium text-hn-text-muted/70">Loading video…</p>
            </div>
        </div>
    );
}

export default function VideoPlayerWrapper({
    iframeSrc,
    title,
}: VideoPlayerWrapperProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFsControls, setShowFsControls] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const strictSandbox = "allow-scripts allow-same-origin";
    const isProblematicHost =
        iframeSrc.includes("vidhide") || iframeSrc.includes("callistanise");
    const sandboxRules = isProblematicHost ? undefined : strictSandbox;

    const clearControlsTimer = useCallback(() => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = null;
        }
    }, []);

    const scheduleHideControls = useCallback(() => {
        clearControlsTimer();
        controlsTimeoutRef.current = setTimeout(() => {
            setShowFsControls(false);
        }, 2200);
    }, [clearControlsTimer]);

    const showFullscreenControls = useCallback(() => {
        if (!document.fullscreenElement) return;
        setShowFsControls(true);
        scheduleHideControls();
    }, [scheduleHideControls]);

    const tryLockLandscape = useCallback(async () => {
        try {
            const orientation = screen.orientation as ScreenOrientation & {
                lock?: (orientation: "landscape") => Promise<void>;
            };

            if (orientation?.lock) {
                await orientation.lock("landscape");
            }
        } catch {
            // Banyak browser mobile / iOS akan ignore ini
        }
    }, []);

    const tryUnlockOrientation = useCallback(() => {
        try {
            const orientation = screen.orientation as ScreenOrientation & {
                unlock?: () => void;
            };
            orientation?.unlock?.();
        } catch {
            // ignore
        }
    }, []);

    const handlePlay = useCallback(() => {
        setHasStarted(true);
        setIsLoading(true);
        setHasError(false);

        timeoutRef.current = setTimeout(() => {
            setIsLoading((prev) => {
                if (prev) setHasError(true);
                return false;
            });
        }, 20_000);
    }, []);

    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const handleRetry = useCallback(() => {
        setHasStarted(false);
        setIsLoading(false);
        setHasError(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const enterFullscreen = useCallback(async () => {
        try {
            if (!wrapperRef.current) return;

            await wrapperRef.current.requestFullscreen();
            setShowFsControls(true);

            const isTouchDevice =
                typeof window !== "undefined" &&
                (window.matchMedia("(pointer: coarse)").matches ||
                    window.matchMedia("(max-width: 1024px)").matches);

            if (isTouchDevice) {
                await tryLockLandscape();
            }

            scheduleHideControls();
        } catch {
            // ignore
        }
    }, [scheduleHideControls, tryLockLandscape]);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch {
            // ignore
        }
    }, []);

    const toggleFullscreen = useCallback(async () => {
        if (document.fullscreenElement) {
            await exitFullscreen();
        } else {
            await enterFullscreen();
        }
    }, [enterFullscreen, exitFullscreen]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const active = !!document.fullscreenElement;
            setIsFullscreen(active);

            if (active) {
                setShowFsControls(true);
                scheduleHideControls();
            } else {
                setShowFsControls(false);
                clearControlsTimer();
                tryUnlockOrientation();
            }
        };

        const externalToggle = () => {
            toggleFullscreen();
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        window.addEventListener(
            "video-player-toggle-fullscreen",
            externalToggle as EventListener
        );

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            window.removeEventListener(
                "video-player-toggle-fullscreen",
                externalToggle as EventListener
            );
        };
    }, [toggleFullscreen, scheduleHideControls, clearControlsTimer, tryUnlockOrientation]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            clearControlsTimer();
        };
    }, [clearControlsTimer]);

    return (
        <div
            ref={wrapperRef}
            className={[
                "group/wrapper relative overflow-hidden bg-hn-card transition-all duration-300",
                isFullscreen
                    ? "h-[100dvh] w-screen rounded-none bg-hn-body"
                    : "aspect-video w-full rounded-2xl",
            ].join(" ")}
            onMouseMove={showFullscreenControls}
            onMouseDown={showFullscreenControls}
            onClick={showFullscreenControls}
            onTouchStart={showFullscreenControls}
            onTouchMove={showFullscreenControls}
            onPointerMove={showFullscreenControls}
            onPointerDown={showFullscreenControls}
        >
            {!hasStarted && !hasError && (
                <>
                    <Image
                        src="/images/banner_episode.png"
                        alt={title}
                        fill
                        unoptimized
                        className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/50" />

                    <button
                        type="button"
                        onClick={handlePlay}
                        aria-label={`Play ${title}`}
                        className="group absolute inset-0 z-10 flex items-center justify-center"
                    >
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-hn-primary shadow-2xl shadow-hn-primary/30 transition-transform duration-200 group-hover:scale-110">
                            <span className="absolute h-20 w-20 animate-ping rounded-full bg-hn-primary/20" />
                            <svg
                                className="relative ml-1 h-8 w-8 text-hn-dark"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                        </div>
                    </button>
                </>
            )}

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
                        className={[
                            "border-0 bg-hn-body",
                            isFullscreen ? "h-[100dvh] w-screen" : "h-full w-full",
                        ].join(" ")}
                        allowFullScreen
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        sandbox={sandboxRules}
                        {...({
                            webkitallowfullscreen: "true",
                            mozallowfullscreen: "true",
                        } as any)}
                    />

                    {isFullscreen && (
                        <button
                            type="button"
                            onClick={exitFullscreen}
                            className={[
                                "absolute right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-xl",
                                "bg-black/60 text-hn-text backdrop-blur-md transition-all duration-300",
                                "hover:bg-black/90 hover:text-hn-primary active:scale-95",
                                showFsControls
                                    ? "opacity-100 pointer-events-auto"
                                    : "opacity-0 pointer-events-none",
                            ].join(" ")}
                            title="Exit fullscreen"
                            aria-label="Exit fullscreen"
                        >
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
                        </button>
                    )}

                    {isLoading && <LoadingSpinner />}
                </>
            )}

            {hasError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-hn-dark/90">
                    <svg
                        className="h-12 w-12 text-hn-text-muted/40"
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

                    <p className="text-sm font-semibold text-hn-text-muted/80">
                        Failed to load video.
                    </p>
                    <p className="text-xs text-hn-text-muted/50">
                        The server may be down or the link could be broken.
                    </p>

                    <button
                        type="button"
                        onClick={handleRetry}
                        className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-hn-text transition-colors hover:bg-white/20"
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