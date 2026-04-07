export default function CommentsLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-7 w-56 rounded-md skeleton" />
                <div className="h-4 w-40 rounded skeleton" />
            </div>

            {/* Comments list skeleton */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card">
                <div className="divide-y divide-white/[0.04]">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex gap-3 px-6 py-4">
                            {/* Avatar */}
                            <div className="h-9 w-9 shrink-0 rounded-full skeleton" />
                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-3.5 w-24 rounded skeleton" />
                                    <div className="h-3 w-32 rounded skeleton" />
                                    <div className="h-3 w-16 rounded skeleton" />
                                </div>
                                <div className="h-4 w-full max-w-md rounded skeleton" />
                                <div className="h-4 w-3/4 max-w-xs rounded skeleton" />
                                <div className="h-6 w-16 rounded-lg skeleton" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
