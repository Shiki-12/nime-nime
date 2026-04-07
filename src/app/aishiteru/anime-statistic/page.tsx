import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminPagination from "../AdminPagination";

const ITEMS_PER_PAGE = 20;

export default async function AnimeStatisticPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    // ── Auth Guard ──────────────────────────────────────────────────
    const session = await auth();
    const role = session?.user?.role;

    if (!session || (role !== "ADMIN" && role !== "OWNER")) {
        notFound();
    }

    // ── Pagination params ───────────────────────────────────────────
    const params = await searchParams;
    const rawPage = parseInt(params.page ?? "1", 10);
    const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

    // ── Fetch grouped watch statistics ──────────────────────────────
    const allStats = await prisma.watchHistory.groupBy({
        by: ["animeId", "title"],
        _count: { animeId: true },
        orderBy: { _count: { animeId: "desc" } },
    });

    const totalItems = allStats.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const stats = allStats.slice(skip, skip + ITEMS_PER_PAGE);

    // ── Total watch entries ─────────────────────────────────────────
    const totalWatches = allStats.reduce((sum, s) => sum + s._count.animeId, 0);

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* ── Page Header ────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-hn-text">
                        Anime Analytics
                    </h1>
                    <p className="mt-1 text-sm text-hn-text-muted">
                        {totalItems} unique anime · {totalWatches.toLocaleString()} total views
                    </p>
                </div>
            </div>

            {/* ── Quick Stats ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-hn-text-muted">Total Anime</p>
                    <p className="mt-1 text-2xl font-bold text-hn-text">{totalItems}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-hn-text-muted">Total Views</p>
                    <p className="mt-1 text-2xl font-bold text-hn-text">{totalWatches.toLocaleString()}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm sm:col-span-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-hn-text-muted">Avg per Anime</p>
                    <p className="mt-1 text-2xl font-bold text-hn-text">
                        {totalItems > 0 ? (totalWatches / totalItems).toFixed(1) : "0"}
                    </p>
                </div>
            </div>

            {/* ── Rankings Table ──────────────────────────────────────── */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                {stats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-sm text-hn-text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-3 h-10 w-10 text-white/10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        No watch data available yet.
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        <th className="w-16 px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                            Rank
                                        </th>
                                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                            Anime Title
                                        </th>
                                        <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                            Slug / ID
                                        </th>
                                        <th className="w-32 px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-hn-text-muted">
                                            Views
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {stats.map((stat, i) => {
                                        const rank = skip + i + 1;
                                        const isTop3 = rank <= 3;
                                        const medalColor = rank === 1 ? "text-amber-400" : rank === 2 ? "text-gray-300" : "text-amber-600";
                                        return (
                                            <tr key={stat.animeId} className="transition-colors duration-200 hover:bg-white/[0.02]">
                                                <td className="px-6 py-3.5 text-center">
                                                    {isTop3 ? (
                                                        <span className={`text-base font-bold ${medalColor}`}>
                                                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-hn-text-muted">
                                                            #{rank}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <p className="truncate text-sm font-medium text-hn-text">
                                                        {stat.title}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="truncate rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-hn-text-muted ring-1 ring-white/[0.06]">
                                                        {stat.animeId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-hn-text">
                                                        {stat._count.animeId.toLocaleString()}
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-hn-text-muted/40">
                                                            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                                                            <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="md:hidden divide-y divide-white/[0.04]">
                            {stats.map((stat, i) => {
                                const rank = skip + i + 1;
                                const isTop3 = rank <= 3;
                                const medalColor = rank === 1 ? "text-amber-400" : rank === 2 ? "text-gray-300" : "text-amber-600";
                                return (
                                    <div key={stat.animeId} className="flex items-center gap-3 px-4 py-3.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                                            {isTop3 ? (
                                                <span className={`text-lg font-bold ${medalColor}`}>
                                                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-hn-text-muted">
                                                    #{rank}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-hn-text">
                                                {stat.title}
                                            </p>
                                            <p className="mt-0.5 truncate font-mono text-[10px] text-hn-text-muted/60">
                                                {stat.animeId}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm font-bold text-hn-text">
                                            {stat._count.animeId.toLocaleString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* ── Pagination ─────────────────────────────────────────── */}
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                basePath="/aishiteru/anime-statistic"
            />
        </div>
    );
}
