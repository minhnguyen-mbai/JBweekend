# JB Weekend

**Three seats. One local host. A different side of Johor.**

Front-end for a Singapore-based group-booking product. Each trip is one car: a local host
drives and guides, and exactly three traveller seats are sold. A shared departure confirms
the moment the third seat is claimed.

Payment is arranged manually — there is no gateway and no card details are collected.
Bookings are held in the browser via `localStorage`.

## Getting started

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint over the whole project |
| `npm run typecheck` | `tsc -b` only |

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage — upcoming departures first |
| `/trips` | Explore departures: search, filter chips, sorting, empty state |
| `/trips/:slug` | Route detail: key facts above the fold, sticky booking panel, itinerary |
| `/book/:departureId` | Two-step checkout: your details → review and confirm |
| `/start-trip` | Request a date, which creates a new open departure |
| `/my-trips` | Awaiting group · Confirmed · Past or cancelled |
| `/safety` | What we do today, and what is still being built |

## Booking state

`src/lib/booking.ts` is the single source of truth for availability and every amount shown
anywhere in the app. Nothing else computes a price.

`quoteFor(tour, departure, kind, seats)` returns `dueToday`, `fareTotal`,
`balanceAfterConfirmation`, `fillsCar` and `resultingStatus`:

| Case | Due today | Booking status |
| --- | --- | --- |
| Shared, seats remain after booking | `seats × S$30` deposit | `awaiting_group` |
| Shared, booking takes the last seats | `seats × sharedSeatPrice` | `confirmed` |
| Private | `privateCarPrice` | `confirmed` |
| Waitlist | nothing | `waitlisted` |

Filling a car also flips every existing `awaiting_group` booking on it to `confirmed`; their
outstanding balance is then settled through the manual payment process. `paymentStatus`
stays `pending` until a payment is actually recorded, so the UI says "Amount due today"
rather than "Paid".

A private booking creates its own car, so it never consumes shared seats, and private cars
are excluded from public browsing.

## What the price covers

Included: the car and transport within Johor, the local host who drives and guides, pick-up
and drop-off at JB CIQ, the curated itinerary, and trip coordination.

Not included: food and drinks, attraction and activity tickets, massage, shopping and any
optional activities. These are paid as you go. Customers cross the Singapore–Johor border
independently; JB Weekend does not pick up in Singapore.

## Project structure

```
src/
  components/   Reusable UI — SeatProgress, TripCard, BookingPanel, Modal, …
  data/         Typed mock data: tours, departures, hosts, FAQs, form options
  lib/          booking.ts (availability + pricing), formatting, filtering, validation
  pages/        One file per route
  state/        AppProvider (bookings + departures, localStorage) and ToastProvider
  types.ts      Tour, Departure, TravellerPreview, Booking, Host
```

## Notes

- Imagery is hand-drawn inline SVG (`src/components/TourArt.tsx`). No stock photography.
- Traveller privacy: a first name, plus only what the traveller optionally chose to share.
- Host profiles carry no ratings, trip counts or screening badges — there is no verified
  data behind those claims yet, and `/safety` says so explicitly.
- There is no automated test suite. Booking-state changes should be re-verified against the
  scenarios in `src/lib/booking.ts`.
