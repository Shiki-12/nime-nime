export default function BroadcastsLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-7 w-40 rounded-md skeleton" />
                <div className="h-4 w-32 rounded skeleton" />
            </div>

            {/* Form skeleton */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card">
                <div className="border-b border-hn-border/50 px-5 py-3.5 space-y-1.5">
                    <div className="h-4 w-44 rounded skeleton" />
                    <div className="h-3 w-64 rounded skeleton" />
                </div>
                <div className="space-y-4 p-5">
                    <div className="h-20 w-full rounded-lg skeleton" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="h-10 rounded-lg skeleton" />
                        <div className="h-10 rounded-lg skeleton" />
                        <div className="h-10 rounded-lg skeleton" />
                    </div>
                </div>
            </div>

            {/* List skeleton */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card">
                <div className="divide-y divide-white/[0.04]">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="h-5 w-16 rounded-md skeleton" />
                            <div className="flex-1 h-4 rounded skeleton" />
                            <div className="h-5 w-14 rounded-md skeleton" />
                            <div className="h-4 w-32 rounded skeleton" />
                            <div className="flex gap-2">
                                <div className="h-7 w-16 rounded-lg skeleton" />
                                <div className="h-7 w-16 rounded-lg skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
