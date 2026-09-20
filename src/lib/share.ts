import type { Departure, Tour } from '../types'

/** Deep link to one specific car, with an optional referral code attached. */
export function buildShareLink(tour: Tour, departure: Departure, shareCode?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jbweekend.co'
  const ref = shareCode ? `&ref=${shareCode}` : ''
  return `${origin}/trips/${tour.slug}?d=${departure.id}${ref}`
}
