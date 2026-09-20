import type { Departure, Tour, TourCategory } from '../types'
import { tourById } from '../data/tours'
import { deriveStatus, seatsLeft } from './seats'
import { isInWeekend, isPastDate, parseDate } from './format'

export type TripView = { departure: Departure; tour: Tour }

export type SortKey = 'soonest' | 'fewest_seats' | 'lowest_price'

export type FilterKey =
  | 'this_weekend'
  | 'next_weekend'
  | 'food'
  | 'adventure'
  | 'nature'
  | 'almost_full'
  | 'confirmed'

export const filterOptions: { key: FilterKey; label: string }[] = [
  { key: 'this_weekend', label: 'This weekend' },
  { key: 'next_weekend', label: 'Next weekend' },
  { key: 'food', label: 'Food' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nature', label: 'Nature' },
  { key: 'almost_full', label: 'Almost full' },
  { key: 'confirmed', label: 'Confirmed' },
]

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'soonest', label: 'Soonest' },
  { key: 'fewest_seats', label: 'Fewest seats left' },
  { key: 'lowest_price', label: 'Lowest price' },
]

const categoryFilters: Partial<Record<FilterKey, TourCategory>> = {
  food: 'food',
  adventure: 'adventure',
  nature: 'nature',
}

/**
 * Joins each departure to its tour and drops anything already departed. Privately
 * booked cars are left out: they belong to one booking and nobody can join them.
 */
export function upcomingTrips(departures: Departure[], now = new Date()): TripView[] {
  return departures
    .map((departure) => ({ departure, tour: tourById(departure.tourId) }))
    .filter((v): v is TripView => Boolean(v.tour))
    .filter(({ departure }) => departure.status !== 'private')
    .filter(({ departure }) => !isPastDate(departure.date, now))
    .sort((a, b) => parseDate(a.departure.date).getTime() - parseDate(b.departure.date).getTime())
}

export function matchesFilters(trip: TripView, filters: FilterKey[], now = new Date()): boolean {
  if (filters.length === 0) return true

  const categories = filters.map((f) => categoryFilters[f]).filter(Boolean) as TourCategory[]
  const dateFilters = filters.filter((f) => f === 'this_weekend' || f === 'next_weekend')
  const statusFilters = filters.filter((f) => f === 'almost_full' || f === 'confirmed')
  const status = deriveStatus(trip.departure)

  if (categories.length > 0 && !categories.includes(trip.tour.category)) return false

  if (dateFilters.length > 0) {
    const ok = dateFilters.some((f) =>
      isInWeekend(trip.departure.date, f === 'this_weekend' ? 0 : 1, now),
    )
    if (!ok) return false
  }

  if (statusFilters.length > 0) {
    const ok = statusFilters.some((f) =>
      f === 'almost_full'
        ? status === 'almost_full'
        : status === 'confirmed' || status === 'private',
    )
    if (!ok) return false
  }

  return true
}

export function sortTrips(trips: TripView[], sort: SortKey): TripView[] {
  const copy = [...trips]
  switch (sort) {
    case 'fewest_seats':
      return copy.sort((a, b) => {
        const left = seatsLeft(a.departure) - seatsLeft(b.departure)
        if (left !== 0) return left
        return parseDate(a.departure.date).getTime() - parseDate(b.departure.date).getTime()
      })
    case 'lowest_price':
      return copy.sort((a, b) => {
        const price = a.tour.sharedSeatPrice - b.tour.sharedSeatPrice
        if (price !== 0) return price
        return parseDate(a.departure.date).getTime() - parseDate(b.departure.date).getTime()
      })
    default:
      return copy.sort(
        (a, b) => parseDate(a.departure.date).getTime() - parseDate(b.departure.date).getTime(),
      )
  }
}

export function searchTrips(trips: TripView[], query: string): TripView[] {
  const q = query.trim().toLowerCase()
  if (!q) return trips
  return trips.filter(({ tour, departure }) =>
    [tour.title, tour.shortDescription, tour.hook, ...tour.tags, ...tour.bestFor, departure.date]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
}
