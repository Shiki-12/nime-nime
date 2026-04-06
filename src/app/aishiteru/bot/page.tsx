import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import BotControls from "./BotControls";

export default async function BotEnginePage() {
    // ── Auth Guard ──────────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20 md:pb-0">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-hn-text">
                    Bot Engine
                </h1>
                <p className="mt-1 text-sm text-hn-text-muted">
                    Telegram broadcast bot — control and monitoring panel
                </p>
            </div>

            {/* ── Status Card ────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
                {/* Decorative glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-hn-primary/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    {/* Bot info */}
                    <div className="flex items-start gap-4">
                        {/* Robot icon */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-hn-primary/10 ring-1 ring-hn-primary/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 text-hn-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-hn-text">
                                NimeNime Bot
                            </h2>
                            <p className="mt-0.5 text-xs text-hn-text-muted">
                                PM2 Process: <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-hn-text/70">nimenime-bot</code>
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                <span className="text-xs font-medium text-emerald-400">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Restart button */}
                    <BotControls />
                </div>
            </div>

            {/* ── Info Cards Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Process Manager */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4 text-sky-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                Process Manager
                            </p>
                            <p className="text-sm font-semibold text-hn-text">PM2</p>
                        </div>
                    </div>
                </div>

                {/* Runtime */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4 text-violet-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                Runtime
                            </p>
                            <p className="text-sm font-semibold text-hn-text">Node.js</p>
                        </div>
                    </div>
                </div>

                {/* API */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4 text-amber-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25H9" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                Integration
                            </p>
                            <p className="text-sm font-semibold text-hn-text">Telegram API</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Terminal-like Log Section ────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/40 backdrop-blur-sm">
                {/* Terminal header */}
                <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="ml-2 text-[10px] font-medium tracking-wider text-white/30 uppercase">
                        Terminal — nimenime-bot
                    </span>
                </div>

                {/* Terminal body */}
                <div className="p-4 font-mono text-xs leading-6 text-white/50">
                    <p><span className="text-emerald-400">$</span> pm2 status nimenime-bot</p>
                    <p className="text-white/30">┌──────────────┬────┬──────┬────────┬─────────┐</p>
                    <p className="text-white/30">│ name         │ id │ mode │ status │ cpu     │</p>
                    <p className="text-white/30">├──────────────┼────┼──────┼────────┼─────────┤</p>
                    <p>│ <span className="text-hn-primary">nimenime-bot</span> │ <span className="text-white/60">0</span>  │ <span className="text-white/60">fork</span> │ <span className="text-emerald-400">online</span> │ <span className="text-white/60">0.1%</span>    │</p>
                    <p className="text-white/30">└──────────────┴────┴──────┴────────┴─────────┘</p>
                    <p className="mt-2"><span className="text-emerald-400">$</span> <span className="animate-pulse">█</span></p>
                </div>
            </div>
        </div>
    );
}
