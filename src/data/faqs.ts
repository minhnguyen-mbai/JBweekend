import type { FaqItem } from '../types'

/** Questions that apply to every JB Weekend departure, appended after tour-specific ones. */
export const sharedFaqs: FaqItem[] = [
  {
    question: 'How do I get to the meeting point at JB CIQ?',
    answer:
      'You cross the border yourself — Causeway Link bus, a taxi, or on foot from Woodlands or Tuas. Once you clear Malaysian immigration you are in the CIQ arrival hall, which is where your host meets you. We send the exact pin, the pick-up bay and your host’s number once the car is confirmed.',
  },
  {
    question: 'What happens if only two seats are claimed?',
    answer:
      'Confirmation closes two days before departure at 8:00 PM. If the third seat is still open at that point we contact you with three options: a full refund of your deposit, moving the deposit to another departure, or upgrading to a private car at the private rate. You decide, and nothing happens automatically.',
  },
  {
    question: 'Who will I be travelling with?',
    answer:
      'Two other travellers who chose the same trip and the same date, plus your host. You can see their first name, age range, languages and travel vibe before you book. Matching is by trip and date, not by profile browsing.',
  },
  {
    question: 'Can I book more than one seat?',
    answer:
      'Yes, up to however many are left. If your booking takes the last of the seats the trip confirms straight away and the full fare for those seats is due at checkout rather than a deposit. If seats remain after you book, you pay the deposit and wait for the car to fill. If you want the car to yourselves, book privately instead.',
  },
  {
    question: 'Do I need cash in Johor?',
    answer:
      'Yes, bring ringgit or an e-wallet. Your seat covers the car, your host and the itinerary; food, drinks, entry tickets and any activities are paid as you go. Most stops on these routes take cash more readily than cards. A Malaysian SIM is not needed.',
  },
]
