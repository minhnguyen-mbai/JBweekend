import type { Departure, DepartureStatus, Tour } from '../types'

/** One host drives; the remaining three seats are the ones we sell. */
export const TRAVELLER_CAPACITY = 3

/** Refundable hold per seat while a shared car is still filling. */
export const DEPOSIT_PER_SEAT = 30

export type BookingKind = 'shared' | 'private'

/* ------------------------------------------------------------------ *
 * Availability
 * ------------------------------------------------------------------ */

export function remainingSeats(departure: Departure): number {
  return Math.max(0, departure.travellerCapacity - departure.claimedSeats)
}

/** Status always follows the seat count, except for cars booked out privately. */
export function deriveStatus(departure: Departure): DepartureStatus {
  if (departure.status === 'private') return 'private'
  if (departure.claimedSeats >= departure.travellerCapacity) return 'confirmed'
  if (remainingSeats(departure) === 1) return 'almost_full'
  return 'open'
}

export function isSoldOut(departure: Departure): boolean {
  const status = deriveStatus(departure)
  return status === 'confirmed' || status === 'private'
}

/** The most seats a single booking may take, never more than are left. */
export function maxSelectableSeats(departure: Departure, kind: BookingKind = 'shared'): number {
  if (kind === 'private') return TRAVELLER_CAPACITY
  return remainingSeats(departure)
}

/* ------------------------------------------------------------------ *
 * Pricing — every amount shown anywhere in the app comes from here.
 * ------------------------------------------------------------------ */

export type Quote = {
  kind: BookingKind
  seats: number
  sharedSeatPrice: number
  privateCarPrice: number
  depositPerSeat: number
  /** True when this booking takes the last of the car's seats. */
  fillsCar: boolean
  /** What the customer owes at checkout. */
  dueToday: number
  /** Full fare for what was booked, whether or not it is due yet. */
  fareTotal: number
  /** Outstanding after today. Zero once the trip is confirmed. */
  balanceAfterConfirmation: number
  /** The booking status this quote would produce. */
  resultingStatus: 'awaiting_group' | 'confirmed'
}

/**
 * The single place booking amounts are calculated. Cards, the detail page,
 * checkout and My Trips all read from this so they can never disagree.
 *
 * Shared seats that do not fill the car pay the deposit only; seats that take
 * the last of the car confirm the trip, so the full fare falls due immediately.
 */
export function quoteFor(
  tour: Tour,
  departure: Departure,
  kind: BookingKind,
  requestedSeats: number,
): Quote {
  const left = remainingSeats(departure)
  const base = {
    sharedSeatPrice: tour.sharedSeatPrice,
    privateCarPrice: tour.privateCarPrice,
    depositPerSeat: DEPOSIT_PER_SEAT,
  }

  if (kind === 'private') {
    const seats = clamp(requestedSeats, 1, TRAVELLER_CAPACITY)
    return {
      ...base,
      kind,
      seats,
      fillsCar: true,
      dueToday: tour.privateCarPrice,
      fareTotal: tour.privateCarPrice,
      balanceAfterConfirmation: 0,
      resultingStatus: 'confirmed',
    }
  }

  const seats = clamp(requestedSeats, 1, Math.max(1, left))
  const fareTotal = seats * tour.sharedSeatPrice
  const fillsCar = left > 0 && seats >= left

  if (fillsCar) {
    return {
      ...base,
      kind,
      seats,
      fillsCar,
      dueToday: fareTotal,
      fareTotal,
      balanceAfterConfirmation: 0,
      resultingStatus: 'confirmed',
    }
  }

  const deposit = seats * DEPOSIT_PER_SEAT
  return {
    ...base,
    kind,
    seats,
    fillsCar,
    dueToday: deposit,
    fareTotal,
    balanceAfterConfirmation: fareTotal - deposit,
    resultingStatus: 'awaiting_group',
  }
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

/* ------------------------------------------------------------------ *
 * Labels
 * ------------------------------------------------------------------ */

export function statusLabel(status: DepartureStatus): string {
  switch (status) {
    case 'open':
      return 'Seats available'
    case 'almost_full':
      return 'One seat left'
    case 'confirmed':
      return 'Confirmed'
    case 'waitlist':
      return 'Waitlist'
    case 'private':
      return 'Private booking'
  }
}

/** "2 of 3 seats claimed · 1 left" */
export function seatLabel(departure: Departure): string {
  if (deriveStatus(departure) === 'private') return 'Whole car booked privately'
  const claimed = `${departure.claimedSeats} of ${departure.travellerCapacity} seats claimed`
  const left = remainingSeats(departure)
  if (left === 0) return `${claimed} · car full`
  return `${claimed} · ${left} left`
}

/** The single sentence that tells a traveller what happens next. */
export function seatHeadline(departure: Departure): string {
  const status = deriveStatus(departure)
  const left = remainingSeats(departure)
  switch (status) {
    case 'private':
      return 'This car is booked privately and departs as planned.'
    case 'confirmed':
      return 'All three seats are claimed, so this trip is going ahead.'
    case 'almost_full':
      return 'One more seat confirms this trip.'
    default:
      return left === TRAVELLER_CAPACITY
        ? 'No seats claimed yet. Book all three to confirm the trip straight away.'
        : `${left} more seats confirm this trip.`
  }
}

/** The label on the main call to action, which changes with the seat count. */
export function primaryCtaLabel(departure: Departure, kind: BookingKind = 'shared'): string {
  if (kind === 'private') return 'Book the whole car'
  const status = deriveStatus(departure)
  if (status === 'confirmed' || status === 'private') return 'Join waitlist'
  if (status === 'almost_full') return 'Claim the final seat'
  return 'Claim a seat'
}
