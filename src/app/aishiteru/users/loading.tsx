export default function UsersLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-20 md:pb-0">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-7 w-48 rounded-md skeleton" />
                <div className="h-4 w-32 rounded skeleton" />
            </div>

            {/* Table skeleton */}
            <div className="overflow-hidden rounded-xl border border-hn-border/50 bg-hn-card">
                {/* Header row */}
                <div className="hidden md:flex items-center gap-6 border-b border-hn-border/50 px-6 py-4">
                    {["w-20", "w-16", "w-12", "w-20", "w-16"].map((w, i) => (
                        <div key={i} className={`h-3 ${w} rounded skeleton`} />
                    ))}
                </div>

                {/* Body rows */}
                <div className="divide-y divide-white/[0.04]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 px-6 py-3.5"
                        >
                            {/* Avatar */}
                            <div className="h-8 w-8 shrink-0 rounded-full skeleton" />
                            {/* Name + email */}
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="h-4 w-36 rounded skeleton" />
                                <div className="h-3 w-48 rounded skeleton" />
                            </div>
                            {/* Date */}
                            <div className="hidden md:block h-3 w-20 rounded skeleton" />
                            {/* Role */}
                            <div className="hidden md:block h-5 w-14 rounded-md skeleton" />
                            {/* Select */}
                            <div className="hidden md:block h-7 w-20 rounded-lg skeleton" />
                            {/* Delete */}
                            <div className="hidden md:block h-7 w-16 rounded-lg skeleton" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
