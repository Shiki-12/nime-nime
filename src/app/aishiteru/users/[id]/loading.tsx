export default function UserDetailLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            <div className="h-3 w-24 rounded skeleton" />

            {/* Profile card */}
            <div className="rounded-2xl border border-hn-border/50 bg-hn-card p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-16 w-16 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                        <div className="h-6 w-40 rounded skeleton" />
                        <div className="h-4 w-56 rounded skeleton" />
                        <div className="h-3 w-36 rounded skeleton" />
                    </div>
                </div>
            </div>

            {/* Activity grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-hn-border/50 bg-hn-card">
                        <div className="flex items-center gap-3 border-b border-hn-border/50 px-5 py-4">
                            <div className="h-8 w-8 rounded-lg skeleton" />
                            <div className="space-y-1">
                                <div className="h-4 w-24 rounded skeleton" />
                                <div className="h-2.5 w-16 rounded skeleton" />
                            </div>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                            {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} className="flex items-center justify-between px-5 py-3">
                                    <div className="space-y-1">
                                        <div className="h-4 w-40 rounded skeleton" />
                                        <div className="h-3 w-24 rounded skeleton" />
                                    </div>
                                    <div className="h-3 w-20 rounded skeleton" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
