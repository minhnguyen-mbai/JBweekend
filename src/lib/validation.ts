import type { TravellerDetails } from '../types'

export type FormErrors = Partial<Record<keyof TravellerDetails | 'consent', string>>

export function validateTraveller(details: TravellerDetails, consent: boolean): FormErrors {
  const errors: FormErrors = {}
  if (details.firstName.trim().length < 2)
    errors.firstName = 'Tell us the first name on your passport.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim()))
    errors.email = 'Enter an email we can send the confirmation to.'
  if (details.phone.replace(/\D/g, '').length < 8)
    errors.phone = 'Enter a mobile number with at least 8 digits.'
  if (!details.ageRange) errors.ageRange = 'Choose an age range.'
  if (!details.language) errors.language = 'Choose the language you are most comfortable in.'
  if (details.emergencyName.trim().length < 2)
    errors.emergencyName = 'Add someone we can call if something goes wrong.'
  if (details.emergencyPhone.replace(/\D/g, '').length < 8)
    errors.emergencyPhone = 'Add a contactable number for your emergency contact.'
  if (!consent) errors.consent = 'You need to agree to the traveller code of conduct to book.'
  return errors
}
