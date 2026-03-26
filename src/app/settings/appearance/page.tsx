"use client";

import { useTheme, type ThemeColor } from "@/hooks/useTheme";

// ─── Theme Definitions ──────────────────────────────────────────────
const THEMES: {
    id: ThemeColor;
    label: string;
    description: string;
    swatch: string;        // primary accent hex
    swatchRing: string;    // Tailwind ring color class
    bgPreview: string;     // small card bg preview
}[] = [
    {
        id: "purple",
        label: "Sakura",
        description: "HiAnime-inspired pink",
        swatch: "#ffbade",
        swatchRing: "ring-[#ffbade]",
        bgPreview: "#27263a",
    },
    {
        id: "blue",
        label: "Ocean",
        description: "Cinematic deep blue",
        swatch: "#3b82f6",
        swatchRing: "ring-[#3b82f6]",
        bgPreview: "#151e32",
    },
    {
        id: "green",
        label: "Emerald",
        description: "Cyberpunk neon green",
        swatch: "#00ff88",
        swatchRing: "ring-[#00ff88]",
        bgPreview: "#0f1a14",
    },
    {
        id: "orange",
        label: "Sunset",
        description: "Vibrant Crunchyroll orange",
        swatch: "#ff7300",
        swatchRing: "ring-[#ff7300]",
        bgPreview: "#241a17",
    },
    {
        id: "red",
        label: "Phantom",
        description: "Rebellious JRPG red",
        swatch: "#e60012",
        swatchRing: "ring-[#e60012]",
        bgPreview: "#1a1010",
    },
    {
        id: "white",
        label: "Eclipse",
        description: "Minimalist manga white",
        swatch: "#f8fafc",
        swatchRing: "ring-[#f8fafc]",
        bgPreview: "#181818",
    },
];

// ─── Page Component ─────────────────────────────────────────────────
export default function AppearancePage() {
    const { theme, setTheme, mounted } = useTheme();

    // Avoid hydration mismatch — render skeleton until client is ready
    if (!mounted) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-12">
                <div className="mb-8">
                    <div className="h-8 w-40 animate-pulse rounded bg-white/[0.06]" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 animate-pulse rounded-xl bg-white/[0.06]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold text-white">Appearance</h1>
                <p className="mt-1 text-sm text-hn-text-muted">
                    Customize the look and feel of NimeNime. Changes apply instantly.
                </p>
            </div>

            {/* ── Theme Selector ─────────────────────────────────────── */}
            <section className="mb-12">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                    <div className="h-4 w-1 rounded-full bg-hn-primary" />
                    Color Theme
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {THEMES.map((t) => {
                        const isActive = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all duration-300 ${
                                    isActive
                                        ? `border-hn-primary bg-hn-primary/[0.06] shadow-lg shadow-hn-primary/10`
                                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
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
                                    <p className="text-sm font-semibold text-white">{t.label}</p>
                                    <p className="mt-0.5 text-[11px] text-white/40">{t.description}</p>
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
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                    <div className="h-4 w-1 rounded-full bg-hn-primary" />
                    Live Preview
                </h2>

                <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                    {/* Mock navbar */}
                    <div className="mb-6 flex items-center gap-4 rounded-xl bg-hn-dark/60 px-4 py-3">
                        <span className="text-base font-extrabold text-white">
                            Nime<span className="text-hn-primary">Nime</span>
                        </span>
                        <div className="flex gap-3 text-xs">
                            <span className="font-medium text-hn-primary">Home</span>
                            <span className="text-white/40">Filter</span>
                            <span className="text-white/40">Genres</span>
                            <span className="text-white/40">Popular</span>
                        </div>
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-hn-primary/15 text-[10px] font-bold text-hn-primary">
                            U
                        </div>
                    </div>

                    {/* Mock content grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* Fake anime card */}
                        <div className="overflow-hidden rounded-xl bg-hn-card">
                            <div className="relative h-36 w-full bg-gradient-to-br from-hn-primary/20 to-hn-secondary/20">
                                <div className="absolute bottom-2 left-2 rounded-md bg-hn-primary px-2 py-0.5 text-[10px] font-bold text-hn-body">
                                    ★ 8.7
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="truncate text-sm font-semibold text-white">
                                    Solo Leveling Season 2
                                </p>
                                <p className="mt-0.5 text-[11px] text-hn-text-muted">
                                    Episode 12 • Sub Indo
                                </p>
                            </div>
                        </div>

                        {/* Fake detail panel */}
                        <div className="flex flex-col gap-3 rounded-xl bg-hn-card p-4">
                            <p className="text-sm font-semibold text-white">
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
                                <button className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-white/70 transition-all hover:bg-white/5">
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
                                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-white/50">
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
