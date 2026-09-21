import type { TravellerDetails } from '../types'

export type FormErrors = Partial<Record<keyof TravellerDetails, string>>

/**
 * Checkout asks for the three things we genuinely need to hold a seat and reach
 * you. Everything else lives under an optional "Trip preferences" section.
 */
export function validateTraveller(details: TravellerDetails): FormErrors {
  const errors: FormErrors = {}
  if (details.firstName.trim().length < 2)
    errors.firstName = 'Enter the first name we should use on the booking.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim()))
    errors.email = 'Enter an email we can send the confirmation to.'
  if (details.phone.replace(/\D/g, '').length < 8)
    errors.phone = 'Enter a mobile number with at least 8 digits.'
  return errors
}
