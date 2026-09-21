import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Booking, Departure, TravellerDetails, TravellerPreview } from '../types'
import { seedDepartures } from '../data/departures'
import { tourById } from '../data/tours'
import { TRAVELLER_CAPACITY, deriveStatus, quoteFor, remainingSeats } from '../lib/booking'
import { loadState, makeId, makeShareCode, saveState, clearState } from '../lib/storage'
import { parseDate } from '../lib/format'
import { AppContext } from './appContext'
import type { AppState, BookingRequest, RequestDateInput } from './appContext'

const VERSION = 2

type Persisted = AppState & { v: number }

function initialState(): AppState {
  return {
    departures: seedDepartures.map((d) => ({ ...d, travellers: [...d.travellers] })),
    bookings: [],
    profile: null,
  }
}

function hydrate(): AppState {
  const stored = loadState<Persisted>()
  if (!stored || stored.v !== VERSION || !Array.isArray(stored.departures)) return initialState()
  // Keep departures added to the seed data after a visitor's state was saved.
  const knownIds = new Set(stored.departures.map((d) => d.id))
  const missing = seedDepartures.filter((d) => !knownIds.has(d.id))
  return {
    departures: [...stored.departures, ...missing],
    bookings: stored.bookings ?? [],
    profile: stored.profile ?? null,
  }
}

/** Confirmation closes two days before departure, at 8:00 PM Malaysia time. */
function deadlineFor(dateStr: string): string {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() - 2)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T20:00:00+08:00`
}

/** Only what the traveller actually gave us ever reaches their companions. */
function previewsFor(traveller: TravellerDetails, seats: number): TravellerPreview[] {
  const base = (label: string): TravellerPreview => ({
    id: makeId('trv'),
    firstName: label,
    ...(traveller.ageRange ? { ageRange: traveller.ageRange } : {}),
    ...(traveller.language ? { languages: [traveller.language] } : {}),
    ...(traveller.preferences?.length ? { preferences: traveller.preferences.slice(0, 2) } : {}),
    isYou: true,
  })
  const you = base(traveller.firstName || 'You')
  if (seats < 2) return [you]
  return [you, ...Array.from({ length: seats - 1 }, () => base('Guest'))]
}

function hostForTour(tourId: string): string {
  return seedDepartures.find((d) => d.tourId === tourId)?.hostId ?? 'host-amirul'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(hydrate)

  useEffect(() => {
    saveState<Persisted>({ v: VERSION, ...state })
  }, [state])

  const getDeparture = useCallback(
    (id: string) => state.departures.find((d) => d.id === id),
    [state.departures],
  )

  const bookingForDeparture = useCallback(
    (departureId: string) =>
      state.bookings.find((b) => b.departureId === departureId && b.bookingStatus !== 'cancelled'),
    [state.bookings],
  )

  const book = useCallback(
    (input: BookingRequest): Booking => {
      const { departureId, seats, traveller, bookingType } = input
      const source = state.departures.find((d) => d.id === departureId)
      if (!source) throw new Error(`Unknown departure: ${departureId}`)
      const tour = tourById(source.tourId)
      if (!tour) throw new Error(`Unknown tour: ${source.tourId}`)

      const id = makeId('bkg')
      const shareCode = makeShareCode()
      const createdAt = new Date().toISOString()
      // Payment is arranged manually, so a new booking is never marked paid.
      const common = { id, createdAt, traveller, shareCode, paymentStatus: 'pending' as const }

      if (bookingType === 'waitlist') {
        const booking: Booking = {
          ...common,
          departureId,
          bookingType: 'waitlist',
          seats: 1,
          amountDueToday: 0,
          fareTotal: tour.sharedSeatPrice,
          balanceAfterConfirmation: 0,
          bookingStatus: 'waitlisted',
        }
        setState((prev) => ({
          ...prev,
          departures: prev.departures.map((d) =>
            d.id === departureId ? { ...d, waitlistCount: (d.waitlistCount ?? 0) + 1 } : d,
          ),
          bookings: [booking, ...prev.bookings],
          profile: traveller,
        }))
        return booking
      }

      if (bookingType === 'private') {
        const q = quoteFor(tour, source, 'private', seats)
        // A private booking is its own car, so it never takes shared seats.
        const privateDeparture: Departure = {
          ...source,
          id: makeId('dep'),
          travellerCapacity: TRAVELLER_CAPACITY,
          claimedSeats: TRAVELLER_CAPACITY,
          status: 'private',
          travellers: previewsFor(traveller, 1),
          waitlistCount: 0,
          startedByYou: true,
        }
        const booking: Booking = {
          ...common,
          departureId: privateDeparture.id,
          bookingType: 'private',
          seats: q.seats,
          amountDueToday: q.dueToday,
          fareTotal: q.fareTotal,
          balanceAfterConfirmation: q.balanceAfterConfirmation,
          bookingStatus: 'confirmed',
        }
        setState((prev) => ({
          ...prev,
          departures: [...prev.departures, privateDeparture],
          bookings: [booking, ...prev.bookings],
          profile: traveller,
        }))
        return booking
      }

      const q = quoteFor(tour, source, 'shared', seats)
      const nextDeparture: Departure = {
        ...source,
        claimedSeats: Math.min(TRAVELLER_CAPACITY, source.claimedSeats + q.seats),
        travellers: [...source.travellers, ...previewsFor(traveller, q.seats)],
      }
      nextDeparture.status = deriveStatus(nextDeparture)
      const nowConfirmed = q.resultingStatus === 'confirmed'

      const booking: Booking = {
        ...common,
        departureId,
        bookingType: 'shared',
        seats: q.seats,
        amountDueToday: q.dueToday,
        fareTotal: q.fareTotal,
        balanceAfterConfirmation: q.balanceAfterConfirmation,
        bookingStatus: q.resultingStatus,
      }

      setState((prev) => ({
        ...prev,
        departures: prev.departures.map((d) => (d.id === departureId ? nextDeparture : d)),
        bookings: [
          booking,
          // Filling the car confirms everyone already holding a seat; their
          // outstanding balance becomes due through the manual payment process.
          ...prev.bookings.map((b) =>
            nowConfirmed && b.departureId === departureId && b.bookingStatus === 'awaiting_group'
              ? { ...b, bookingStatus: 'confirmed' as const }
              : b,
          ),
        ],
        profile: traveller,
      }))
      return booking
    },
    [state.departures],
  )

  const requestDate = useCallback((input: RequestDateInput) => {
    const tour = tourById(input.tourId)
    if (!tour) throw new Error(`Unknown tour: ${input.tourId}`)

    const draft: Departure = {
      id: makeId('dep'),
      tourId: input.tourId,
      date: input.date,
      startTime: tour.defaultStartTime,
      endTime: tour.defaultEndTime,
      travellerCapacity: TRAVELLER_CAPACITY,
      claimedSeats: 0,
      status: 'open',
      confirmationDeadline: deadlineFor(input.date),
      travellers: [],
      hostId: hostForTour(input.tourId),
      preferences: input.preferences,
      flexibleDates: input.flexibleDates,
      startedByYou: true,
    }
    const q = quoteFor(tour, draft, 'shared', input.seats)

    const departure: Departure = {
      ...draft,
      claimedSeats: q.seats,
      travellers: previewsFor(input.traveller, q.seats),
    }
    departure.status = deriveStatus(departure)

    const booking: Booking = {
      id: makeId('bkg'),
      departureId: departure.id,
      bookingType: 'shared',
      seats: q.seats,
      amountDueToday: q.dueToday,
      fareTotal: q.fareTotal,
      balanceAfterConfirmation: q.balanceAfterConfirmation,
      bookingStatus: q.resultingStatus,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      traveller: input.traveller,
      shareCode: makeShareCode(),
    }

    setState((prev) => ({
      ...prev,
      departures: [...prev.departures, departure],
      bookings: [booking, ...prev.bookings],
      profile: input.traveller,
    }))
    return { departure, booking }
  }, [])

  const cancelBooking = useCallback((bookingId: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((b) => b.id === bookingId)
      if (!booking) return prev
      const bookings = prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, bookingStatus: 'cancelled' as const } : b,
      )

      // A private car is never a public listing, so its record simply closes.
      if (booking.bookingType === 'private') return { ...prev, bookings }

      return {
        ...prev,
        bookings,
        departures: prev.departures.map((d) => {
          if (d.id !== booking.departureId) return d
          if (booking.bookingType === 'waitlist') {
            return { ...d, waitlistCount: Math.max(0, (d.waitlistCount ?? 1) - 1) }
          }
          const next: Departure = {
            ...d,
            claimedSeats: Math.max(0, d.claimedSeats - booking.seats),
            travellers: d.travellers.filter((t) => !t.isYou),
          }
          next.status = deriveStatus(next)
          return next
        }),
      }
    })
  }, [])

  const moveBooking = useCallback((bookingId: string, toDepartureId: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((b) => b.id === bookingId)
      const target = prev.departures.find((d) => d.id === toDepartureId)
      if (!booking || !target) return prev
      const tour = tourById(target.tourId)
      if (!tour || remainingSeats(target) < booking.seats) return prev

      const q = quoteFor(tour, target, 'shared', booking.seats)
      const moved: Departure = {
        ...target,
        claimedSeats: Math.min(TRAVELLER_CAPACITY, target.claimedSeats + q.seats),
        travellers: [...target.travellers, ...previewsFor(booking.traveller, q.seats)],
      }
      moved.status = deriveStatus(moved)

      return {
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                departureId: toDepartureId,
                bookingStatus: q.resultingStatus,
                // The deposit already placed carries over; only the balance shifts.
                balanceAfterConfirmation: Math.max(0, q.fareTotal - b.amountDueToday),
                fareTotal: q.fareTotal,
              }
            : b,
        ),
        departures: prev.departures.map((d) => {
          if (d.id === toDepartureId) return moved
          if (d.id !== booking.departureId) return d
          const released: Departure = {
            ...d,
            claimedSeats: Math.max(0, d.claimedSeats - booking.seats),
            travellers: d.travellers.filter((t) => !t.isYou),
          }
          released.status = deriveStatus(released)
          return released
        }),
      }
    })
  }, [])

  const resetDemo = useCallback(() => {
    clearState()
    setState(initialState())
  }, [])

  const value = useMemo(
    () => ({
      state,
      book,
      requestDate,
      cancelBooking,
      moveBooking,
      resetDemo,
      getDeparture,
      bookingForDeparture,
    }),
    [state, book, requestDate, cancelBooking, moveBooking, resetDemo, getDeparture, bookingForDeparture],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
