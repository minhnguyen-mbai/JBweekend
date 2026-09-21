import { createContext, useContext } from 'react'
import type { Booking, Departure, TravellerDetails } from '../types'

export type RequestDateInput = {
  tourId: string
  date: string
  flexibleDates: string[]
  seats: number
  preferences: string[]
  traveller: TravellerDetails
}

export type BookingRequest = {
  departureId: string
  seats: number
  traveller: TravellerDetails
  bookingType: 'shared' | 'private' | 'waitlist'
}

export type AppState = {
  departures: Departure[]
  bookings: Booking[]
  profile: TravellerDetails | null
}

export type AppContextValue = {
  state: AppState
  /** Reserves seats (or the whole car) and returns the created booking. */
  book: (input: BookingRequest) => Booking
  /** Creates a new open departure, holds the requester's seats, returns both. */
  requestDate: (input: RequestDateInput) => { departure: Departure; booking: Booking }
  cancelBooking: (bookingId: string) => void
  moveBooking: (bookingId: string, toDepartureId: string) => void
  resetDemo: () => void
  getDeparture: (id: string) => Departure | undefined
  bookingForDeparture: (departureId: string) => Booking | undefined
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
