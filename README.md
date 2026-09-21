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
| `npm test` | Vitest, once |
| `npm run test:watch` | Vitest, watching |

## Photography (Pexels)

Route photography comes from Pexels through a same-origin API, so the key never
reaches the browser:

```
browser → /api/trip-images?route=<slug> → api.pexels.com
```

`/api` is served by Vercel Functions in production and by a small Vite dev
middleware locally (`vite-plugins/api-dev-server.ts`), both calling the same
handler in `api/_lib/handler.ts`.

**The site works without a key.** Every failure path — missing key, timeout,
rate limit, provider error, empty result, broken image — falls back to the
existing brand illustrations, and a dev-only notice explains why.

### Setup

1. Create a free API key at <https://www.pexels.com/api/>.
2. Locally, copy `.env.example` to `.env` and set the value:

   ```bash
   cp .env.example .env
   ```

   ```env
   PEXELS_API_KEY=your-key-here
   ```

   Restart `npm run dev` afterwards. Never prefix it with `VITE_` — that would
   ship the key to the browser. `.env` is gitignored; do not commit it.
3. In Vercel: **Project → Settings → Environment Variables**, add
   `PEXELS_API_KEY` for Production (and Preview if you want images there).
4. Redeploy. Environment variables are read at request time by the function, but
   a redeploy guarantees the new value is picked up.
5. Verify without printing the key:

   ```bash
   curl -s http://localhost:5173/api/health
   ```

   ```json
   { "status": "ok", "pexelsConfigured": true }
   ```

   Then check a route returns photos:

   ```bash
   curl -s "http://localhost:5173/api/trip-images?route=end-of-asia" | head -c 400
   ```

### Choosing the photograph for a route

Route image config lives in `api/_lib/routes.ts` — the single source of truth,
deliberately server-side so the browser can only ask for a known slug:

```ts
'end-of-asia': {
  slug: 'end-of-asia',
  source: 'pexels',
  query: 'mangrove boardwalk sunset southeast asia',
  preferredPhotoId: 1234567,   // optional: pins the route to one photo
  representative: true,
}
```

Without `preferredPhotoId` the API takes the lowest photo id from the query, so
the same picture appears every time rather than shuffling per request. To pin a
specific photo, run the dev server with a key and open **`/dev/photos`** — it
lists the candidates for every route with ids, photographers and Pexels links,
and a copy button. That page is development-only and is not in production builds.

### Truthfulness

These are **representative photographs**, not documentation of a JB Weekend
departure, and the UI says so. Pexels images are never used for the host, the
vehicle, JB CIQ meeting instructions, traveller profiles or safety verification.

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
- Tests run with Vitest (`npm test`) and never call the live Pexels API; the provider is
  mocked in `tests/fixtures.ts`.
- Booking-state changes should be re-verified against the scenarios in `src/lib/booking.ts`.
