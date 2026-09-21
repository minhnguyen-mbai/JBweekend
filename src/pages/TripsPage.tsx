import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarPlus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../state/appContext'
import {
  filterOptions,
  matchesFilters,
  searchTrips,
  sortOptions,
  sortTrips,
  upcomingTrips,
} from '../lib/trips'
import type { FilterKey, SortKey } from '../lib/trips'
import { useSimulatedLoad } from '../lib/useSimulatedLoad'
import { TripCard } from '../components/TripCard'
import { TripGridSkeleton } from '../components/Skeleton'
import { Chip, ChipRow } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'

export function TripsPage() {
  const { state } = useApp()
  const [params, setParams] = useSearchParams()
  const loading = useSimulatedLoad('trips-grid')

  // Serialised so the memo below can depend on a plain string.
  const filterKey = params
    .getAll('f')
    .filter((f): f is FilterKey => filterOptions.some((o) => o.key === f))
    .join('|')
  const filters = useMemo(
    () => (filterKey ? (filterKey.split('|') as FilterKey[]) : []),
    [filterKey],
  )
  const sort = (params.get('sort') as SortKey) ?? 'soonest'
  const query = params.get('q') ?? ''

  const all = useMemo(() => upcomingTrips(state.departures), [state.departures])

  const results = useMemo(() => {
    const filtered = all.filter((trip) => matchesFilters(trip, filters))
    return sortTrips(searchTrips(filtered, query), sort)
  }, [all, filters, query, sort])

  function update(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params)
    mutate(next)
    setParams(next, { replace: true })
  }

  function toggleFilter(key: FilterKey) {
    update((next) => {
      const current = next.getAll('f')
      next.delete('f')
      const updated = current.includes(key)
        ? current.filter((f) => f !== key)
        : [...current, key]
      updated.forEach((f) => next.append('f', f))
    })
  }

  const hasActiveControls = filters.length > 0 || query.trim().length > 0

  return (
    <div className="wrap py-10 sm:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Upcoming departures</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Explore trips</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">
          Every car has three traveller seats and one local host. Filter by the weekend you are free,
          then claim a seat — or request a date if none of these fit.
        </p>
      </header>

      {/* ---------------- Search, filters, sort ---------------- */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sage"
              aria-hidden="true"
            />
            <label htmlFor="trip-search" className="sr-only">
              Search trips by name, tag or date
            </label>
            <input
              id="trip-search"
              type="search"
              value={query}
              placeholder="Search trips, tags or dates"
              onChange={(e) =>
                update((next) => {
                  const value = e.target.value
                  if (value) next.set('q', value)
                  else next.delete('q')
                })
              }
              className="field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-sage" aria-hidden="true" />
            <label htmlFor="trip-sort" className="sr-only">
              Sort departures
            </label>
            <select
              id="trip-sort"
              value={sort}
              onChange={(e) => update((next) => next.set('sort', e.target.value))}
              className="field sm:w-52"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ChipRow label="Filter departures">
          {filterOptions.map((option) => (
            <Chip
              key={option.key}
              active={filters.includes(option.key)}
              onClick={() => toggleFilter(option.key)}
            >
              {option.label}
            </Chip>
          ))}
          {hasActiveControls && (
            <button
              type="button"
              onClick={() => setParams(sort !== 'soonest' ? { sort } : {}, { replace: true })}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-coral-dark underline-offset-4 transition hover:underline"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          )}
        </ChipRow>

        <p className="text-sm text-sage" role="status" aria-live="polite">
          {loading
            ? 'Loading departures…'
            : `${results.length} departure${results.length === 1 ? '' : 's'}${
                hasActiveControls
                  ? results.length === 1
                    ? ' matches your filters'
                    : ' match your filters'
                  : ' scheduled'
              }`}
        </p>
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="mt-6">
        {loading ? (
          <TripGridSkeleton count={6} />
        ) : results.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(({ departure, tour }) => (
              <TripCard key={departure.id} departure={departure} tour={tour} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No cars match those filters yet"
            description="We run a deliberately small calendar, so some weekends are empty. Clear the filters to see everything, or start a new car on the date you want and let others join you."
            action={
              <>
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => setParams({}, { replace: true })}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset filters
                </button>
                <Link to="/start-trip" className="btn btn-primary">
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Request a date
                </Link>
              </>
            }
          />
        )}
      </div>

      {!loading && results.length > 0 && (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-[1.25rem] border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg">None of these dates work?</h2>
            <p className="mt-1 text-sm leading-relaxed text-charcoal/75">
              Request your own date. Other travellers can see it and claim the remaining seats, and you
              only pay the deposit until it fills.
            </p>
          </div>
          <Link to="/start-trip" className="btn btn-forest shrink-0">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Request a date
          </Link>
        </div>
      )}
    </div>
  )
}
