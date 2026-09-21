export type TourCategory = 'food' | 'adventure' | 'nature' | 'wellness'

export type DepartureStatus = 'open' | 'almost_full' | 'confirmed' | 'waitlist' | 'private'

export type ItineraryItem = {
  time: string
  title: string
  detail: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type Tour = {
  id: string
  slug: string
  title: string
  category: TourCategory
  shortDescription: string
  hook: string
  duration: string
  sharedSeatPrice: number
  privateCarPrice: number
  heroImage: string
  tags: string[]
  bestFor: string[]
  defaultStartTime: string
  defaultEndTime: string
  meetingPoint: string
  itinerary: ItineraryItem[]
  included: string[]
  excluded: string[]
  weatherPlan: string
  faqs: FaqItem[]
}

/**
 * What a traveller's future companions may see before a trip is confirmed.
 * Optional fields are rendered only when the traveller actually supplied them —
 * nothing here is invented on their behalf.
 */
export type TravellerPreview = {
  id: string
  firstName: string
  ageRange?: string
  languages?: string[]
  preferences?: string[]
  /** True for the seat you hold yourself, so "you" can be labelled in the seat strip. */
  isYou?: boolean
}

export type Departure = {
  id: string
  tourId: string
  date: string
  startTime: string
  endTime: string
  travellerCapacity: 3
  claimedSeats: number
  status: DepartureStatus
  confirmationDeadline: string
  travellers: TravellerPreview[]
  hostId: string
  /** Preferences chosen by whoever requested this date. */
  preferences?: string[]
  /** True for departures created through the Request a date flow. */
  startedByYou?: boolean
  /** Up to two alternative dates the requester is flexible on. */
  flexibleDates?: string[]
  waitlistCount?: number
}

/**
 * Descriptive host information only. Ratings, trip counts and screening claims
 * are deliberately absent: we do not have verified data behind them yet.
 */
export type Host = {
  id: string
  name: string
  homeTown: string
  languages: string[]
  bio: string
  vehicle: string
  avatarSeed: string
}

export type BookingStatus = 'awaiting_group' | 'confirmed' | 'waitlisted' | 'cancelled'

/** Payment is arranged manually, so nothing is marked paid until it truly is. */
export type PaymentStatus = 'pending' | 'paid'

export type Booking = {
  id: string
  departureId: string
  bookingType: 'shared' | 'private' | 'waitlist'
  seats: number
  /** Amount owed at the time of booking, from quoteFor(). */
  amountDueToday: number
  /** Full fare for the seats booked. */
  fareTotal: number
  /** Outstanding once the trip is confirmed. Zero when the fare was due upfront. */
  balanceAfterConfirmation: number
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
  createdAt: string
  traveller: TravellerDetails
  shareCode: string
}

export type TravellerDetails = {
  firstName: string
  email: string
  phone: string
  /** Everything below is optional — collected under "Trip preferences". */
  ageRange?: string
  language?: string
  preferences?: string[]
  dietary?: string
}
