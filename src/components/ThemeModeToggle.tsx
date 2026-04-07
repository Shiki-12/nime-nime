"use client";

import { useTheme } from "@/hooks/useTheme";

export default function ThemeModeToggle() {
    const { mode, setMode, mounted } = useTheme();

    // Avoid hydration mismatch — render placeholder until client is ready
    if (!mounted) {
        return (
            <div className="h-9 w-9 animate-pulse rounded-lg bg-hn-border/20" />
        );
    }

    const isDark = mode === "dark";

    return (
        <button
            onClick={() => setMode(isDark ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-hn-text-muted transition-all duration-200 hover:bg-hn-border/20 hover:text-hn-text dark:hover:bg-hn-border/20"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                /* Sun icon — shown in dark mode, click to go light */
                <svg
                    className="h-[18px] w-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                    />
                </svg>
            ) : (
                /* Moon icon — shown in light mode, click to go dark */
                <svg
                    className="h-[18px] w-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                    />
                </svg>
            )}
        </button>
    );
}
