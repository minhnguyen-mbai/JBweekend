export function TripCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="aspect-[16/10] animate-shimmer bg-sand-deep" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-2/5 animate-shimmer rounded bg-sand-deep" />
        <div className="h-5 w-3/5 animate-shimmer rounded bg-sand-deep" />
        <div className="h-20 animate-shimmer rounded-xl bg-sand-deep" />
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 animate-shimmer rounded bg-sand-deep" />
          <div className="h-9 w-28 animate-shimmer rounded-lg bg-sand-deep" />
        </div>
      </div>
    </div>
  )
}

export function TripGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <TripCardSkeleton key={i} />
      ))}
      <span className="sr-only" role="status">
        Loading upcoming departures
      </span>
    </div>
  )
}
