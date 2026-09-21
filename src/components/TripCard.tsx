import { Link } from 'react-router-dom'
import { CalendarClock, Clock } from 'lucide-react'
import type { Departure, Tour } from '../types'
import { PexelsTripImage } from './PexelsTripImage'
import { useTripImages } from '../lib/useTripImages'
import { StatusBadge } from './StatusBadge'
import { deriveStatus, remainingSeats, shortCtaLabel } from '../lib/booking'
import { formatDateShort, formatDeadline, formatPrice } from '../lib/format'

const categoryLabel: Record<Tour['category'], string> = {
  food: 'Food & local culture',
  adventure: 'Adventure',
  nature: 'Nature & photography',
  wellness: 'Wellness',
}

/**
 * Scan order is deliberate: status, when, what, seats, deadline, price, action.
 */
export function TripCard({
  departure,
  tour,
  priority = 'lazy',
}: {
  departure: Departure
  tour: Tour
  /** The first card in a grid may load eagerly; the rest stay lazy. */
  priority?: 'eager' | 'lazy'
}) {
  const status = deriveStatus(departure)
  const left = remainingSeats(departure)
  const soldOut = left === 0
  const href = `/trips/${tour.slug}?d=${departure.id}`

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      {/* Not a link: the credit line carries its own anchors, and the title and
          CTA below already navigate. */}
      <div className="relative">
        <PexelsTripImage
          route={tour.slug}
          illustration={tour.heroImage}
          title={`${tour.title} in Johor`}
          aspect="aspect-[16/9]"
          priority={priority}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 46vw, 100vw"
          attribution="none"
          imageClassName="transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3">
          <StatusBadge status={status} size="sm" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <TripPhotoCredit route={tour.slug} />

        {/* 2 — date and time */}
        <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-forest">
          {formatDateShort(departure.date)}
          <span className="inline-flex items-center gap-1 font-normal text-sage">
            <Clock className="size-3.5" aria-hidden="true" />
            {departure.startTime}–{departure.endTime}
          </span>
        </p>

        {/* 3 — route name and category */}
        <h3 className="mt-1 text-card">
          <Link to={href} className="transition hover:text-forest-light">
            {tour.title}
          </Link>
        </h3>
        <p className="copy-sm mt-0.5 text-sage">{categoryLabel[tour.category]}</p>

        {/* 4 — seats claimed and remaining */}
        <p className="mt-3 flex items-center gap-2 text-sm">
          <span className="flex gap-1" aria-hidden="true">
            {Array.from({ length: departure.travellerCapacity }, (_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full ${
                  i < departure.claimedSeats ? 'bg-forest' : 'border border-dashed border-sage/60'
                }`}
              />
            ))}
          </span>
          <span className={`font-semibold ${left === 1 ? 'text-coral-dark' : 'text-forest'}`}>
            {departure.claimedSeats} of {departure.travellerCapacity} seats claimed
            {soldOut ? '' : ` · ${left} left`}
          </span>
        </p>

        {/* 5 — confirmation deadline */}
        <p className="copy-sm mt-1.5 flex items-start gap-1.5 text-sage">
          <CalendarClock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {soldOut ? 'Confirmed — this car is going' : `Confirms by ${formatDeadline(departure.confirmationDeadline)}`}
        </p>

        {/* 6 — price, then 7 — action. Never side by side: a long CTA and a
            price do not fit one row at 320px. */}
        <div className="mt-auto pt-4">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-display text-xl font-semibold text-forest">
              {formatPrice(tour.sharedSeatPrice)}
            </span>
            <span className="copy-sm text-sage">per seat</span>
            <span className="copy-sm w-full text-sage">
              Whole car {formatPrice(tour.privateCarPrice)}
            </span>
          </p>
          <Link
            to={href}
            className={`btn mt-3 w-full ${status === 'almost_full' ? 'btn-primary' : 'btn-forest'}`}
          >
            {shortCtaLabel(departure)}
            <span className="sr-only">
              {' '}
              — {tour.title}, {formatDateShort(departure.date)}
            </span>
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Small credit line under the card image; never competes with the booking CTA. */
function TripPhotoCredit({ route }: { route: string }) {
  const state = useTripImages(route)
  if (state.status !== 'ready' || !state.payload.primary) return null
  const photo = state.payload.primary
  return (
    <p className="mb-1.5 text-xs text-sage">
      Photo by{' '}
      <a
        href={photo.photographerUrl || photo.photoUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2"
      >
        {photo.photographer}
      </a>{' '}
      on{' '}
      <a
        href={photo.photoUrl || 'https://www.pexels.com'}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2"
      >
        Pexels
      </a>{' '}
      · representative
    </p>
  )
}
