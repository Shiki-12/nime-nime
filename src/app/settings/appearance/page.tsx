"use client";

import { useTheme, DARK_THEMES, LIGHT_THEMES, type DarkTheme, type LightTheme } from "@/hooks/useTheme";

// ─── Dark Mode Theme Definitions (6 originals) ─────────────────────
const DARK_THEME_CARDS: {
    id: DarkTheme;
    label: string;
    description: string;
    swatch: string;
    swatchRing: string;
}[] = [
    {
        id: "purple",
        label: "Sakura",
        description: "HiAnime-inspired pink",
        swatch: "#ffbade",
        swatchRing: "ring-[#ffbade]",
    },
    {
        id: "blue",
        label: "Ocean",
        description: "Cinematic deep blue",
        swatch: "#3b82f6",
        swatchRing: "ring-[#3b82f6]",
    },
    {
        id: "green",
        label: "Emerald",
        description: "Cyberpunk neon green",
        swatch: "#00ff88",
        swatchRing: "ring-[#00ff88]",
    },
    {
        id: "orange",
        label: "Sunset",
        description: "Vibrant Crunchyroll orange",
        swatch: "#ff7300",
        swatchRing: "ring-[#ff7300]",
    },
    {
        id: "red",
        label: "Phantom",
        description: "Rebellious JRPG red",
        swatch: "#e60012",
        swatchRing: "ring-[#e60012]",
    },
    {
        id: "white",
        label: "Eclipse",
        description: "Minimalist manga white",
        swatch: "#f8fafc",
        swatchRing: "ring-[#f8fafc]",
    },
];

// ─── Light Mode Theme Definitions (4 new) ───────────────────────────
const LIGHT_THEME_CARDS: {
    id: LightTheme;
    label: string;
    description: string;
    swatch: string;
    swatchRing: string;
}[] = [
    {
        id: "amethyst",
        label: "Amethyst",
        description: "NimeNime Default Purple",
        swatch: "#a182ab",
        swatchRing: "ring-[#a182ab]",
    },
    {
        id: "maroon",
        label: "Maroon",
        description: "Deep Crimson Red",
        swatch: "#591d1d",
        swatchRing: "ring-[#591d1d]",
    },
    {
        id: "frost",
        label: "Frost",
        description: "Cool Greyish Blue",
        swatch: "#95a5b8",
        swatchRing: "ring-[#95a5b8]",
    },
    {
        id: "matcha",
        label: "Matcha",
        description: "Modern Teal Green",
        swatch: "#14b8a6",
        swatchRing: "ring-[#14b8a6]",
    },
];

// ─── Mode Definitions ───────────────────────────────────────────────
import type { ThemeMode } from "@/hooks/useTheme";

const MODES: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: React.ReactNode;
}[] = [
    {
        id: "dark",
        label: "Dark",
        description: "Easy on the eyes",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
        ),
    },
    {
        id: "light",
        label: "Light",
        description: "Classic bright look",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
        ),
    },
];

// ─── Page Component ─────────────────────────────────────────────────
export default function AppearancePage() {
    const { theme, setTheme, mode, setMode, mounted } = useTheme();

    // Determine which theme cards to show based on current mode
    const isDark = mode === "dark";
    const themeCards = isDark ? DARK_THEME_CARDS : LIGHT_THEME_CARDS;
    const validThemeIds = isDark ? (DARK_THEMES as readonly string[]) : (LIGHT_THEMES as readonly string[]);

    // Avoid hydration mismatch — render skeleton until client is ready
    if (!mounted) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-12">
                <div className="mb-8">
                    <div className="h-8 w-40 animate-pulse rounded bg-hn-border/20" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-hn-border/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-hn-border/20" />
                    ))}
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 animate-pulse rounded-xl bg-hn-border/20" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-hn-text">Appearance</h1>
                <p className="mt-1 text-sm text-hn-text-muted">
                    Customize the look and feel of NimeNime. Changes apply instantly.
                </p>
            </div>

            {/* ── Mode Selector (Light / Dark) ─────────────────────────── */}
            <section className="mb-12">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-hn-text">
                    <div className="h-4 w-1 rounded-full bg-hn-primary" />
                    Display Mode
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {MODES.map((m) => {
                        const isActive = mode === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-300 ${
                                    isActive
                                        ? "border-hn-primary bg-hn-primary/[0.06] shadow-lg shadow-hn-primary/10"
                                        : "border-hn-border bg-hn-card hover:border-hn-text-muted/20 hover:bg-hn-card-hover"
                                }`}
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-hn-primary/15 text-hn-primary"
                                            : "bg-hn-body text-hn-text-muted"
                                    }`}
                                >
                                    {m.icon}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-hn-text">{m.label}</p>
                                    <p className="mt-0.5 text-[11px] text-hn-text-muted">{m.description}</p>
                                </div>
                                {isActive && (
                                    <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-hn-primary">
                                        <svg className="h-3 w-3 text-hn-body" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Color Theme Selector (conditional) ───────────────────── */}
            <section className="mb-12">
                <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-hn-text">
                    <div className="h-4 w-1 rounded-full bg-hn-primary" />
                    Color Theme
                </h2>
                <p className="mb-4 text-xs text-hn-text-muted">
                    {isDark
                        ? "6 themes available for Dark Mode"
                        : "4 themes available for Light Mode"}
                </p>

                <div className={`grid gap-4 ${isDark ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                    {themeCards.map((t) => {
                        const isActive = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all duration-300 ${
                                    isActive
                                        ? `border-hn-primary bg-hn-primary/[0.06] shadow-lg shadow-hn-primary/10`
                                        : "border-hn-border bg-hn-card hover:border-hn-text-muted/20 hover:bg-hn-card-hover"
                                }`}
                            >
                                {/* Color swatch */}
                                <div
                                    className={`h-12 w-12 rounded-full ring-2 ring-offset-2 ring-offset-hn-body transition-all duration-300 ${
                                        isActive ? t.swatchRing : "ring-transparent"
                                    }`}
                                    style={{ backgroundColor: t.swatch }}
                                />

                                {/* Label */}
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-hn-text">{t.label}</p>
                                    <p className="mt-0.5 text-[11px] text-hn-text-muted">{t.description}</p>
                                </div>

                                {/* Active check */}
                                {isActive && (
                                    <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-hn-primary">
                                        <svg className="h-3 w-3 text-hn-body" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── Live Preview ───────────────────────────────────────── */}
            <section>
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-hn-text">
                    <div className="h-4 w-1 rounded-full bg-hn-primary" />
                    Live Preview
                </h2>

                <div className="overflow-hidden rounded-2xl border border-hn-border bg-hn-card p-6">
                    {/* Mock navbar */}
                    <div className="mb-6 flex items-center gap-4 rounded-xl bg-hn-dark/60 px-4 py-3">
                        <span className="text-base font-extrabold text-hn-text">
                            Nime<span className="text-hn-primary">Nime</span>
                        </span>
                        <div className="flex gap-3 text-xs">
                            <span className="font-medium text-hn-primary">Home</span>
                            <span className="text-hn-text-muted">Filter</span>
                            <span className="text-hn-text-muted">Genres</span>
                            <span className="text-hn-text-muted">Popular</span>
                        </div>
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-hn-primary/15 text-[10px] font-bold text-hn-primary">
                            U
                        </div>
                    </div>

                    {/* Mock content grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* Fake anime card */}
                        <div className="overflow-hidden rounded-xl bg-hn-body">
                            <div className="relative h-36 w-full bg-gradient-to-br from-hn-primary/20 to-hn-secondary/20">
                                <div className="absolute bottom-2 left-2 rounded-md bg-hn-primary px-2 py-0.5 text-[10px] font-bold text-hn-body">
                                    ★ 8.7
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="truncate text-sm font-semibold text-hn-text">
                                    Solo Leveling Season 2
                                </p>
                                <p className="mt-0.5 text-[11px] text-hn-text-muted">
                                    Episode 12 • Sub Indo
                                </p>
                            </div>
                        </div>

                        {/* Fake detail panel */}
                        <div className="flex flex-col gap-3 rounded-xl bg-hn-body p-4">
                            <p className="text-sm font-semibold text-hn-text">
                                Highlighted with{" "}
                                <span className="text-hn-primary">primary color</span>
                            </p>
                            <p className="text-xs leading-relaxed text-hn-text-muted">
                                This preview shows how your chosen theme
                                affects cards, buttons, and accent colors across
                                the entire application.
                            </p>

                            {/* Fake buttons */}
                            <div className="mt-auto flex gap-2">
                                <button className="rounded-lg bg-hn-primary px-4 py-2 text-xs font-bold text-hn-body transition-all hover:opacity-90">
                                    Watch Now
                                </button>
                                <button className="rounded-lg border border-hn-border px-4 py-2 text-xs font-medium text-hn-text-muted transition-all hover:bg-hn-card-hover">
                                    + Watchlist
                                </button>
                            </div>

                            {/* Fake meta pills */}
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-hn-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-hn-primary">
                                    Action
                                </span>
                                <span className="rounded-full bg-hn-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-hn-primary">
                                    Fantasy
                                </span>
                                <span className="rounded-full bg-hn-body px-2.5 py-0.5 text-[10px] font-medium text-hn-text-muted">
                                    Ongoing
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
