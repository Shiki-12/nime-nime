export default function AnimeStatisticLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            <div className="space-y-2">
                <div className="h-7 w-44 rounded-md skeleton" />
                <div className="h-4 w-64 rounded skeleton" />
            </div>

            {/* Quick stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
                        <div className="h-2.5 w-20 rounded skeleton" />
                        <div className="mt-2 h-7 w-16 rounded skeleton" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03]">
                <div className="divide-y divide-white/[0.04]">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                            <div className="h-6 w-6 rounded skeleton" />
                            <div className="flex-1 space-y-1">
                                <div className="h-4 w-48 rounded skeleton" />
                                <div className="h-3 w-32 rounded skeleton" />
                            </div>
                            <div className="h-4 w-12 rounded skeleton" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
