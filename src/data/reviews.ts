import type { Review } from '../types'

/**
 * Demo reviews from the first few months of hosting. Deliberately small in number —
 * JB Weekend is an early curated service, not a marketplace with thousands of trips.
 */
export const reviews: Review[] = [
  {
    id: 'rev-1',
    tourId: 'tour-kampung-table',
    firstName: 'Shermaine',
    ageRange: '25–34',
    month: 'August 2026',
    quote:
      'I have been to JB maybe thirty times and never eaten anywhere on this route. The market stop alone was worth the seat.',
    rating: 5,
  },
  {
    id: 'rev-2',
    tourId: 'tour-petrolhead-night',
    firstName: 'Arjun',
    ageRange: '25–34',
    month: 'August 2026',
    quote:
      'Came alone, left with two people I now have a group chat with. The leaderboard makes it competitive fast, and the massage after is genuinely necessary.',
    rating: 5,
  },
  {
    id: 'rev-3',
    tourId: 'tour-end-of-asia',
    firstName: 'Priya',
    ageRange: '35–44',
    month: 'July 2026',
    quote:
      'Nurul waited out a rain cell with us and reshuffled the whole afternoon so we still caught the light at dinner. That is the part you cannot plan yourself.',
    rating: 5,
  },
  {
    id: 'rev-4',
    tourId: 'tour-kampung-table',
    firstName: 'Marcus',
    ageRange: '35–44',
    month: 'July 2026',
    quote:
      'Booked two seats, the third filled three days later, and we got the meeting details straight away. No chasing anyone for answers.',
    rating: 4,
  },
]
