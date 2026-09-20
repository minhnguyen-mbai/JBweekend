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
  privatePrice: number
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

export type TravellerPreview = {
  id: string
  firstName: string
  ageRange: string
  languages: string[]
  vibes: string[]
  verified: boolean
  completedTrips: number
  avatar?: string
  /** True for the seat you hold yourself, so "You" can be labelled in the seat strip. */
  isYou?: boolean
}

export type Departure = {
  id: string
  tourId: string
  date: string
  startTime: string
  endTime: string
  capacity: 3
  seatsClaimed: number
  status: DepartureStatus
  confirmationDeadline: string
  travellers: TravellerPreview[]
  hostId: string
  /** Departure preferences chosen by whoever started the car. */
  preferences?: string[]
  /** True for departures created through the Start a Trip wizard in this demo session. */
  startedByYou?: boolean
  /** Up to two alternative dates the starter is flexible on. */
  flexibleDates?: string[]
  waitlistCount?: number
}

export type Host = {
  id: string
  name: string
  homeTown: string
  yearsHosting: number
  languages: string[]
  bio: string
  drives: string
  verifiedItems: string[]
  tripsHosted: number
  rating: number
  avatarSeed: string
}

export type BookingStatus = 'seat_held' | 'confirmed' | 'waitlisted' | 'cancelled'

export type Booking = {
  id: string
  departureId: string
  bookingType: 'shared' | 'private' | 'waitlist'
  seats: number
  depositPaid: number
  totalPrice: number
  status: BookingStatus
  createdAt: string
  traveller: TravellerDetails
  shareCode: string
  /** Seeded sample history so the My Trips page shows a complete picture. */
  isSample?: boolean
}

export type TravellerDetails = {
  firstName: string
  email: string
  phone: string
  ageRange: string
  language: string
  vibes: string[]
  dietary: string
  emergencyName: string
  emergencyPhone: string
}

export type Review = {
  id: string
  tourId: string
  firstName: string
  ageRange: string
  month: string
  quote: string
  rating: number
}
