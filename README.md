# JB Weekend

**Three seats. One local host. A different side of Johor.**

A working front-end prototype for a Singapore-based group-booking product. Each trip is one
four-seat car: your local host drives, and exactly three traveller seats are for sale. A shared
departure is confirmed the moment the third seat is claimed.

This is a **prototype**. There is no backend and no payment gateway — checkout is simulated and
booking state is persisted to `localStorage` in your browser.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint over the whole project |

## Routes

| Route | Page |
| --- | --- |
| `/` | Homepage — upcoming departures first, then how shared trips work |
| `/trips` | Explore trips — search, filter chips, sorting, empty state |
| `/trips/:slug` | Trip detail — departure picker, seat progress, itinerary, sticky booking panel |
| `/book/:departureId` | Four-step booking flow with simulated deposit checkout |
| `/start-trip` | Four-step wizard that creates a new open departure |
| `/my-trips` | Awaiting group, Confirmed, Waitlist, Past trips |
| `/safety` | Trust, verification, code of conduct, reporting |

## The three-seat mechanic

`src/lib/seats.ts` holds the rules. A departure's status always follows its seat count:

| Seats claimed | Status | Primary CTA |
| --- | --- | --- |
| 0–1 of 3 | `open` | Claim a seat |
| 2 of 3 | `almost_full` | Claim the final seat |
| 3 of 3 | `confirmed` | Join waitlist |
| Whole car | `private` | Book the whole car |

Shared bookings hold a refundable **S$30 deposit per seat**; the balance falls due once the car
fills. Confirmation closes two days before departure at 8:00 PM. If the car does not fill, the
traveller chooses a refund, another date, or a private upgrade.

A **private booking is its own car**, so it never consumes seats from a shared departure.

## Project structure

```
src/
  components/   Reusable UI — SeatProgress, TripCard, BookingPanel, Modal, …
  data/         Typed mock data: tours, departures, hosts, reviews, FAQs
  lib/          Seat rules, date/money formatting, filtering, validation, clipboard, ICS
  pages/        One file per route
  state/        AppProvider (bookings + departures, localStorage) and ToastProvider
  types.ts      Tour, Departure, TravellerPreview, Booking, Host
```

## Notes

- Imagery is hand-drawn inline SVG (`src/components/TourArt.tsx`) — nothing to load, nothing to break.
- Traveller privacy: only first name, age range, languages, one vibe tag, verification badge and
  completed-trip count are ever shown. Never contact details, surnames or social links.
- Insurance and licensing copy on `/safety` is explicitly labelled as a placeholder pending
  verification, and should stay that way until it is real.
- Reset the demo from **My trips → Demo controls → Reset demo data**.
