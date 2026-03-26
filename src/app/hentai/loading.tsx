export default function HentaiLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 lg:px-6">
      {/* Banner skeleton */}
      <div className="mb-8 skeleton h-14 rounded-xl" />

      {/* Header skeleton */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="h-6 w-1 rounded-full bg-hn-primary/30" />
        <div className="skeleton h-7 w-52 rounded" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-hn-card">
            <div className="skeleton aspect-[3/4.2] w-full" />
            <div className="px-3 py-3 space-y-2">
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
