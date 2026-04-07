import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "404 — Not Found",
    robots: { index: false, follow: false },
};

// ── Sidebar navigation items ────────────────────────────────────────
const NAV_ITEMS: { href: string; icon: React.ReactNode; label: string }[] = [
    { 
        href: "/aishiteru", 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
        ), 
        label: "Overview" 
    },
    { 
        href: "/aishiteru/users", 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ), 
        label: "Users" 
    },
    { 
        href: "/aishiteru/comments", 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
        ), 
        label: "Comments" 
    },
    { 
        href: "/aishiteru/anime-statistic", 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ), 
        label: "Analytics" 
    },
    { 
        href: "/aishiteru/bot", 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008z" />
            </svg>
        ), 
        label: "Bot Engine" 
    },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ── Zero-Trust Gate ─────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    return (
        <>
            {/* 
                Full-viewport overlay at z-9999 so the root layout's
                Navbar & Footer are completely hidden behind this layer.
            */}
            <div className="fixed inset-0 z-[9999] flex bg-hn-dark">
                {/* ── Sidebar (desktop) ──────────────────────────────── */}
                <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-hn-border bg-hn-dark">
                    {/* Brand */}
                    <div className="flex h-16 items-center gap-3 px-6 border-b border-hn-border">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-hn-primary/15 text-hn-primary text-sm font-bold ring-1 ring-hn-primary/25">
                            N
                        </span>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-hn-text tracking-tight">
                                NimeNime
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-hn-text-muted">
                                Headquarters
                            </span>
                        </div>
                    </div>

                    {/* Nav links */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-hn-text-muted transition-all duration-200 hover:bg-hn-card hover:text-hn-text"
                            >
                                <span className="flex items-center text-white/50 transition-colors duration-200 group-hover:text-hn-primary group-hover:scale-110">
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom: back to site */}
                    <div className="border-t border-hn-border px-3 py-4">
                        <Link
                            href="/"
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-hn-text-muted transition-all duration-200 hover:bg-hn-card hover:text-hn-text"
                        >
                            <span className="flex items-center text-white/50 transition-colors duration-200 group-hover:-translate-x-0.5 group-hover:text-red-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                            </span>
                            Back to Public Site
                        </Link>
                    </div>
                </aside>

                {/* ── Main content area ──────────────────────────────── */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Top bar (mobile nav + header) */}
                    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hn-border bg-hn-dark px-4 md:px-8">
                        <div className="flex items-center gap-3 md:hidden">
                            <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-hn-primary/15 text-hn-primary text-xs font-bold ring-1 ring-hn-primary/25">
                                N
                            </span>
                            <span className="text-xs font-medium uppercase tracking-widest text-hn-text-muted">
                                HQ
                            </span>
                        </div>

                        <div className="hidden md:block text-sm text-hn-text-muted">
                            Admin Dashboard
                        </div>

                        {/* User pill */}
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                                role === "OWNER"
                                    ? "bg-amber-500/15 text-amber-400 ring-amber-500/30"
                                    : "bg-red-500/15 text-red-400 ring-red-500/30"
                            }`}>
                                {role}
                            </span>
                            {/* Avatar with fallback */}
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-hn-card ring-1 ring-hn-border">
                                <SafeImage
                                    src={session.user.image ?? undefined}
                                    alt=""
                                    className="relative z-10 h-full w-full object-cover"
                                    fallback={
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-hn-text">
                                            {session.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </header>

                    {/* Scrollable page content */}
                    <main className="flex-1 overflow-y-auto bg-hn-body p-4 md:p-8">
                        {children}
                    </main>
                </div>

                {/* ── Mobile bottom nav ──────────────────────────────── */}
                <nav className="fixed inset-x-0 bottom-0 z-[10000] flex md:hidden items-center justify-around border-t border-hn-border bg-hn-dark/95 backdrop-blur-md py-2">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group flex flex-col items-center gap-0.5 px-3 py-1 text-hn-text-muted transition-colors hover:text-hn-text"
                        >
                            <span className="flex items-center text-white/50 transition-colors duration-200 group-hover:text-hn-primary">
                                {item.icon}
                            </span>
                            <span className="text-[9px] font-medium tracking-wide">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                    <Link
                        href="/"
                        className="group flex flex-col items-center gap-0.5 px-3 py-1 text-hn-text-muted transition-colors hover:text-hn-text hover:text-red-400"
                    >
                        <span className="flex items-center text-white/50 transition-colors duration-200 group-hover:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </span>
                        <span className="text-[9px] font-medium tracking-wide">
                            Exit
                        </span>
                    </Link>
                </nav>
            </div>
        </>
    );
}
