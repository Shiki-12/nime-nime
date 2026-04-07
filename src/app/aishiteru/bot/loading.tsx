export default function BotLoading() {
    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20 md:pb-0">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-7 w-36 rounded-md skeleton" />
                <div className="h-4 w-64 rounded skeleton" />
            </div>

            {/* Status card skeleton */}
            <div className="rounded-2xl border border-hn-border/50 bg-hn-card p-6 md:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl skeleton" />
                        <div className="space-y-2">
                            <div className="h-5 w-32 rounded skeleton" />
                            <div className="h-3 w-48 rounded skeleton" />
                            <div className="h-3 w-16 rounded skeleton" />
                        </div>
                    </div>
                    <div className="h-11 w-44 rounded-xl skeleton" />
                </div>
            </div>

            {/* Info cards skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-hn-border/50 bg-hn-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg skeleton" />
                            <div className="space-y-1.5">
                                <div className="h-2.5 w-20 rounded skeleton" />
                                <div className="h-4 w-16 rounded skeleton" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Terminal skeleton */}
            <div className="rounded-xl border border-hn-border/50 bg-black/40">
                <div className="flex items-center gap-2 border-b border-hn-border/50 px-4 py-2.5">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full skeleton" />
                        <div className="h-2.5 w-2.5 rounded-full skeleton" />
                        <div className="h-2.5 w-2.5 rounded-full skeleton" />
                    </div>
                </div>
                <div className="space-y-2 p-4">
                    <div className="h-3 w-40 rounded skeleton" />
                    <div className="h-3 w-64 rounded skeleton" />
                    <div className="h-3 w-56 rounded skeleton" />
                    <div className="h-3 w-48 rounded skeleton" />
                </div>
            </div>
        </div>
    );
}
