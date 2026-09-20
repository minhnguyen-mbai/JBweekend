import type { Departure, DepartureStatus } from '../types'

export const DEPOSIT_PER_SEAT = 30
export const CAPACITY = 3

export function seatsLeft(departure: Departure): number {
  return Math.max(0, departure.capacity - departure.seatsClaimed)
}

/** Status always follows the seat count, except for cars booked out privately. */
export function deriveStatus(departure: Departure): DepartureStatus {
  if (departure.status === 'private') return 'private'
  if (departure.seatsClaimed >= departure.capacity) return 'confirmed'
  if (departure.seatsClaimed === departure.capacity - 1) return 'almost_full'
  return 'open'
}

export function isConfirmed(departure: Departure): boolean {
  const status = deriveStatus(departure)
  return status === 'confirmed' || status === 'private'
}

/** "2 of 3 claimed · One seat left" */
export function seatLabel(departure: Departure): string {
  const status = deriveStatus(departure)
  if (status === 'private') return 'Whole car booked · Guaranteed departure'
  const claimed = `${departure.seatsClaimed} of ${departure.capacity} claimed`
  if (status === 'confirmed') return `${claimed} · Confirmed`
  if (status === 'almost_full') return `${claimed} · One seat left`
  if (departure.seatsClaimed === 0) return `${claimed} · Be the first`
  return `${claimed} · ${seatsLeft(departure)} seats left`
}

/** The single sentence that tells a traveller what happens next. */
export function seatHeadline(departure: Departure): string {
  const status = deriveStatus(departure)
  const left = seatsLeft(departure)
  switch (status) {
    case 'private':
      return 'This car is booked privately and departs as planned.'
    case 'confirmed':
      return 'This trip is confirmed. Join the waitlist in case a seat opens.'
    case 'almost_full':
      return 'One more traveller needed. Confirmed when the final seat is claimed.'
    default:
      return departure.seatsClaimed === 0
        ? 'Nobody has started this car yet. Claim a seat and two more travellers can join you.'
        : `${left === 2 ? 'Two seats left' : `${left} seats left`}. Confirmed when all three are claimed.`
  }
}

export function statusLabel(status: DepartureStatus): string {
  switch (status) {
    case 'open':
      return 'Open'
    case 'almost_full':
      return 'Almost full'
    case 'confirmed':
      return 'Confirmed'
    case 'waitlist':
      return 'Waitlist'
    case 'private':
      return 'Private'
  }
}

/** The label on the main call to action, which changes with the seat count. */
export function primaryCtaLabel(departure: Departure, privateMode = false): string {
  if (privateMode) return 'Book the whole car'
  const status = deriveStatus(departure)
  if (status === 'confirmed' || status === 'private') return 'Join waitlist'
  if (status === 'almost_full') return 'Claim the final seat'
  return 'Claim a seat'
}

export function maxSelectableSeats(departure: Departure): number {
  return Math.min(2, seatsLeft(departure))
}

export function depositFor(seats: number): number {
  return seats * DEPOSIT_PER_SEAT
}
