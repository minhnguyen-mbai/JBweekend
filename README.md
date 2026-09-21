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

## Weather

Trips are weather-aware: the detail page explains what is expected on the selected
date, which stops could be affected, and what the route's published weather plan
says will happen.

```
browser → /api/weather?tripId=<slug>&date=YYYY-MM-DD → api.data.gov.my
```

### Providers

| Source | Role | Key needed |
| --- | --- | --- |
| **MET Malaysia** via `api.data.gov.my` | Official 7-day outlook, day parts, min/max temperature, warnings | No |
| Open-Meteo (optional) | Hourly precipitation probability, temperature, wind | No key, but see licensing |

The official source is always primary and is labelled **"Official outlook"**. Hourly
values are labelled **"Hourly estimate"** and are never presented as official.

**Licensing:** Open-Meteo's free tier is non-commercial. It stays disabled unless
`WEATHER_HOURLY_PROVIDER=open-meteo` is set explicitly, which is a decision for the
operator. With it unset, the feature works fully on official data alone. The adapter
in `api/_lib/weather/hourly.ts` is isolated so a commercial provider can replace it.

### Forecast horizon

| Days ahead | Label |
| --- | --- |
| 0–3 | Latest forecast |
| 4–7 | Early outlook |
| Beyond 7, or past | "Detailed weather will be available closer to your trip." |

Nothing is ever fabricated outside the horizon, and climate averages are never shown
as a live forecast.

### Impact rules

`api/_lib/weather/impact.ts` is deterministic and explainable — there is no opaque
score. Every level carries the reasons that produced it, and all thresholds live in
`api/_lib/weather/thresholds.ts`.

1. A relevant active official warning → `review-required`, overriding the forecast.
2. Wet weather over a high-sensitivity outdoor stop → `high`.
3. Wet weather over a partly exposed stop, or rain outside the main window → `moderate`.
4. Otherwise → `low`.

The recommendation always comes from the route's own `weatherPlan` in
`src/data/tours.ts`. No backup destinations, refunds or guarantees are invented.

**Warning filtering:** the official warning feed is national and largely marine. A
Sarawak shipping warning must not alarm a traveller on a Johor road trip, so warnings
are surfaced only when the text names a relevant region and the validity window
covers the trip date (`isWarningRelevant`).

### Caching

| Data | TTL | Notes |
| --- | --- | --- |
| Official daily outlook | 4 hours | Last good copy kept and served marked `stale` if the provider later fails |
| Official warnings | 30 minutes | Shorter, since warnings change faster |
| Hourly | 45 minutes | Only when enabled |

`lastUpdated` is always returned. CDN headers accompany the in-memory cache.

**The in-memory `TtlCache` is best-effort, per serverless instance.** It is a plain
`Map` inside the function module, so:

- Each warm Vercel instance keeps its own copy; there is no sharing between them.
- A cold start begins with an empty cache and calls the provider again.
- An instance being recycled discards the cache, including the last-good copy used
  for the `stale` fallback.
- Hit rate therefore depends on traffic and instance reuse, and TTLs are an upper
  bound on staleness within one instance, not a guarantee across the fleet.

This is **not** persistent or distributed caching. The CDN headers
(`s-maxage` / `stale-while-revalidate`) are what actually absorb load across
instances; the in-memory layer only avoids repeat calls within a single warm one.
If provider call volume ever needs a hard ceiling, that requires a shared store
(Vercel KV, Redis or similar), which this feature deliberately does not add.

### Adding weather for a new trip

Add an entry to `tripWeatherConfigs` in `api/_lib/weather/trips.ts`:

```ts
'new-route': {
  tripId: 'new-route',
  location: {
    officialLocationId: 'Ds090',       // verify at api.data.gov.my/weather/forecast/
    officialLocationName: 'Johor Bahru',
    latitude: 1.4927,
    longitude: 103.7414,
  },
  stops: [
    { stopId: 'outdoor-walk', label: 'Matches the itinerary exactly',
      startTime: '14:30', endTime: '16:15', weatherSensitivity: 'high' },
  ],
}
```

Stops must mirror the published itinerary in `src/data/tours.ts`. Sensitivity is
`high` for open-air stops, `moderate` for partly covered, `low` for indoor or
in-vehicle.

### Known limitations

- MET Malaysia publishes district-level day parts, not hourly data. Without the
  optional provider, impact is assessed against morning/afternoon/night bands.
- Warning relevance is matched on region keywords because the feed carries no
  structured location field. It is deliberately conservative: an unmatched warning
  is not shown rather than shown wrongly.
- Forecast phrases are translated through a fixed dictionary built from the live
  API's distinct values. An unrecognised phrase is passed through verbatim and
  classified `unknown` rather than guessed.

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
