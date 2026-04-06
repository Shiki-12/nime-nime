export default function AdminDashboardLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 pb-20 md:pb-0">
            {/* ── Welcome header skeleton ────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl border border-hn-border bg-hn-card p-6 md:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-3">
                        <div className="h-4 w-24 rounded skeleton" />
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-40 rounded-md skeleton" />
                            <div className="h-6 w-16 rounded-md skeleton" />
                        </div>
                        <div className="h-4 w-64 rounded skeleton" />
                    </div>
                    <div className="h-8 w-32 rounded-lg skeleton" />
                </div>
            </div>

            {/* ── Stats Cards skeleton ────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="h-3 w-28 rounded skeleton" />
                                <div className="h-9 w-20 rounded-md skeleton" />
                                <div className="h-3 w-32 rounded skeleton" />
                            </div>
                            <div className="h-12 w-12 rounded-xl skeleton" />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Recent members skeleton ─────────────────────────────── */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg skeleton" />
                        <div className="space-y-1.5">
                            <div className="h-4 w-24 rounded skeleton" />
                            <div className="h-3 w-40 rounded skeleton" />
                        </div>
                    </div>
                    <div className="h-7 w-20 rounded-lg skeleton" />
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.04]">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 px-6 py-3.5"
                        >
                            <div className="h-9 w-9 shrink-0 rounded-full skeleton" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="h-4 w-32 rounded skeleton" />
                                <div className="h-3 w-48 rounded skeleton" />
                            </div>
                            <div className="h-3 w-20 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
