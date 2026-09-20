import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Booking, Departure, TravellerDetails, TravellerPreview } from '../types'
import { seedDepartures } from '../data/departures'
import { tourById } from '../data/tours'
import { CAPACITY, DEPOSIT_PER_SEAT, deriveStatus } from '../lib/seats'
import { loadState, makeId, makeShareCode, saveState, clearState } from '../lib/storage'
import { parseDate } from '../lib/format'
import { AppContext } from './appContext'
import type { AppState, ClaimInput, StartTripInput } from './appContext'

const VERSION = 1

type Persisted = AppState & { v: number }

const sampleBooking: Booking = {
  id: 'bkg-sample',
  departureId: 'dep-past',
  bookingType: 'shared',
  seats: 1,
  depositPaid: 30,
  totalPrice: 119,
  status: 'confirmed',
  createdAt: '2026-08-10T10:15:00+08:00',
  shareCode: 'SAMPLE',
  isSample: true,
  traveller: {
    firstName: 'You',
    email: 'you@example.com',
    phone: '+65 8000 0000',
    ageRange: '25–34',
    language: 'English',
    vibes: ['Nature'],
    dietary: '',
    emergencyName: '',
    emergencyPhone: '',
  },
}

function initialState(): AppState {
  return {
    departures: seedDepartures.map((d) => ({ ...d, travellers: [...d.travellers] })),
    bookings: [sampleBooking],
    profile: null,
  }
}

function hydrate(): AppState {
  const stored = loadState<Persisted>()
  if (!stored || stored.v !== VERSION || !Array.isArray(stored.departures)) return initialState()
  // Keep demo departures added to the seed data after a visitor's state was saved.
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

function previewsFor(traveller: TravellerDetails, seats: number): TravellerPreview[] {
  const you: TravellerPreview = {
    id: makeId('trv'),
    firstName: traveller.firstName || 'You',
    ageRange: traveller.ageRange,
    languages: [traveller.language],
    vibes: traveller.vibes.slice(0, 1),
    verified: true,
    completedTrips: 0,
    isYou: true,
  }
  if (seats < 2) return [you]
  return [
    you,
    {
      id: makeId('trv'),
      firstName: 'Your +1',
      ageRange: traveller.ageRange,
      languages: [traveller.language],
      vibes: traveller.vibes.slice(0, 1),
      verified: true,
      completedTrips: 0,
      isYou: true,
    },
  ]
}

function hostForTour(tourId: string): string {
  const seeded = seedDepartures.find((d) => d.tourId === tourId)
  return seeded?.hostId ?? 'host-amirul'
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
      state.bookings.find((b) => b.departureId === departureId && b.status !== 'cancelled'),
    [state.bookings],
  )

  const book = useCallback((input: ClaimInput): Booking => {
    const { departureId, seats, traveller, bookingType } = input
    const source = state.departures.find((d) => d.id === departureId)
    if (!source) throw new Error(`Unknown departure: ${departureId}`)
    const tour = tourById(source.tourId)
    if (!tour) throw new Error(`Unknown tour: ${source.tourId}`)

    const bookingId = makeId('bkg')
    const shareCode = makeShareCode()

    if (bookingType === 'private') {
      // A private booking is its own car, so it never takes seats from a shared departure.
      const privateDeparture: Departure = {
        ...source,
        id: makeId('dep'),
        capacity: CAPACITY,
        seatsClaimed: CAPACITY,
        status: 'private',
        travellers: previewsFor(traveller, 1),
        waitlistCount: 0,
        startedByYou: true,
      }
      const booking: Booking = {
        id: bookingId,
        departureId: privateDeparture.id,
        bookingType: 'private',
        seats,
        depositPaid: tour.privatePrice,
        totalPrice: tour.privatePrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        traveller,
        shareCode,
      }
      setState((prev) => ({
        ...prev,
        departures: [...prev.departures, privateDeparture],
        bookings: [booking, ...prev.bookings],
        profile: traveller,
      }))
      return booking
    }

    if (bookingType === 'waitlist') {
      const booking: Booking = {
        id: bookingId,
        departureId,
        bookingType: 'waitlist',
        seats: 1,
        depositPaid: 0,
        totalPrice: tour.sharedSeatPrice,
        status: 'waitlisted',
        createdAt: new Date().toISOString(),
        traveller,
        shareCode,
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

    const seatsClaimed = Math.min(CAPACITY, source.seatsClaimed + seats)
    const nextDeparture: Departure = {
      ...source,
      seatsClaimed,
      travellers: [...source.travellers, ...previewsFor(traveller, seats)],
    }
    nextDeparture.status = deriveStatus(nextDeparture)
    const nowConfirmed = nextDeparture.status === 'confirmed'

    const booking: Booking = {
      id: bookingId,
      departureId,
      bookingType: 'shared',
      seats,
      depositPaid: seats * DEPOSIT_PER_SEAT,
      totalPrice: seats * tour.sharedSeatPrice,
      status: nowConfirmed ? 'confirmed' : 'seat_held',
      createdAt: new Date().toISOString(),
      traveller,
      shareCode,
    }

    setState((prev) => ({
      ...prev,
      departures: prev.departures.map((d) => (d.id === departureId ? nextDeparture : d)),
      bookings: [
        booking,
        // Everyone already holding a seat on this car is confirmed the moment it fills.
        ...prev.bookings.map((b) =>
          nowConfirmed && b.departureId === departureId && b.status === 'seat_held'
            ? { ...b, status: 'confirmed' as const }
            : b,
        ),
      ],
      profile: traveller,
    }))
    return booking
  }, [state.departures])

  const startTrip = useCallback((input: StartTripInput) => {
    const tour = tourById(input.tourId)
    if (!tour) throw new Error(`Unknown tour: ${input.tourId}`)
    const departure: Departure = {
      id: makeId('dep'),
      tourId: input.tourId,
      date: input.date,
      startTime: tour.defaultStartTime,
      endTime: tour.defaultEndTime,
      capacity: CAPACITY,
      seatsClaimed: input.seats,
      status: input.seats >= CAPACITY - 1 ? 'almost_full' : 'open',
      confirmationDeadline: deadlineFor(input.date),
      travellers: previewsFor(input.traveller, input.seats),
      hostId: hostForTour(input.tourId),
      preferences: input.preferences,
      flexibleDates: input.flexibleDates,
      startedByYou: true,
    }
    const booking: Booking = {
      id: makeId('bkg'),
      departureId: departure.id,
      bookingType: 'shared',
      seats: input.seats,
      depositPaid: input.seats * DEPOSIT_PER_SEAT,
      totalPrice: input.seats * tour.sharedSeatPrice,
      status: 'seat_held',
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
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b,
      )

      // A private car is never a public listing, so cancelling leaves the record alone
      // and the booking itself carries the cancelled status.
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
            seatsClaimed: Math.max(0, d.seatsClaimed - booking.seats),
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

      const moved: Departure = {
        ...target,
        seatsClaimed: Math.min(CAPACITY, target.seatsClaimed + booking.seats),
        travellers: [...target.travellers, ...previewsFor(booking.traveller, booking.seats)],
      }
      moved.status = deriveStatus(moved)

      return {
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                departureId: toDepartureId,
                status: moved.status === 'confirmed' ? ('confirmed' as const) : ('seat_held' as const),
              }
            : b,
        ),
        departures: prev.departures.map((d) => {
          if (d.id === toDepartureId) return moved
          if (d.id !== booking.departureId) return d
          const released: Departure = {
            ...d,
            seatsClaimed: Math.max(0, d.seatsClaimed - booking.seats),
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
      startTrip,
      cancelBooking,
      moveBooking,
      resetDemo,
      getDeparture,
      bookingForDeparture,
    }),
    [state, book, startTrip, cancelBooking, moveBooking, resetDemo, getDeparture, bookingForDeparture],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
