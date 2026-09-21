import { Link } from 'react-router-dom'
import { CalendarClock, Clock } from 'lucide-react'
import type { Departure, Tour } from '../types'
import { TourArt } from './TourArt'
import { StatusBadge } from './StatusBadge'
import { deriveStatus, primaryCtaLabel, remainingSeats } from '../lib/booking'
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
export function TripCard({ departure, tour }: { departure: Departure; tour: Tour }) {
  const status = deriveStatus(departure)
  const left = remainingSeats(departure)
  const soldOut = left === 0
  const href = `/trips/${tour.slug}?d=${departure.id}`

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={href} className="relative block aspect-[16/9] overflow-hidden" tabIndex={-1} aria-hidden="true">
        <TourArt
          image={tour.heroImage}
          title={`${tour.title} in Johor`}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3">
          <StatusBadge status={status} size="sm" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {/* 2 — date and time */}
        <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-forest">
          {formatDateShort(departure.date)}
          <span className="inline-flex items-center gap-1 font-normal text-sage">
            <Clock className="size-3.5" aria-hidden="true" />
            {departure.startTime}–{departure.endTime}
          </span>
        </p>

        {/* 3 — route name and category */}
        <h3 className="mt-1 text-xl leading-snug">
          <Link to={href} className="transition hover:text-forest-light">
            {tour.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-sage">{categoryLabel[tour.category]}</p>

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
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-sage">
          <CalendarClock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {soldOut ? 'Confirmed — this car is going' : `Confirms by ${formatDeadline(departure.confirmationDeadline)}`}
        </p>

        {/* 6 and 7 — price and action */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="text-sm">
            <span className="font-display text-xl font-semibold text-forest">
              {formatPrice(tour.sharedSeatPrice)}
            </span>
            <span className="text-sage"> / seat</span>
            <span className="mt-0.5 block text-xs text-sage">
              Whole car {formatPrice(tour.privateCarPrice)}
            </span>
          </p>
          <Link
            to={href}
            className={`btn ${status === 'almost_full' ? 'btn-primary' : 'btn-forest'} min-h-11 px-4 py-2.5 text-sm`}
          >
            {primaryCtaLabel(departure)}
            <span className="sr-only"> — {tour.title}, {formatDateShort(departure.date)}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
