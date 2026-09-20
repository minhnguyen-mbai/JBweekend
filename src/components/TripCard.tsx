import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, Clock } from 'lucide-react'
import type { Departure, Tour } from '../types'
import { TourArt } from './TourArt'
import { SeatProgress } from './SeatProgress'
import { StatusBadge } from './StatusBadge'
import { TravellerAvatars } from './TravellerAvatars'
import { deriveStatus, primaryCtaLabel, seatHeadline } from '../lib/seats'
import { formatDateShort, formatDeadline, formatPrice, relativeDay } from '../lib/format'

const categoryLabel: Record<Tour['category'], string> = {
  food: 'Food & local culture',
  adventure: 'Adventure',
  nature: 'Nature & photography',
  wellness: 'Wellness',
}

export function TripCard({ departure, tour }: { departure: Departure; tour: Tour }) {
  const status = deriveStatus(departure)
  const href = `/trips/${tour.slug}?d=${departure.id}`
  const isEmptyCar = departure.seatsClaimed === 0 && status !== 'private'

  return (
    <article className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden="true">
        <TourArt
          image={tour.heroImage}
          title={`${tour.title} in Johor`}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3">
          <StatusBadge status={status} size="sm" />
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-forest">
          {relativeDay(departure.date)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-sage">
          <span className="text-forest">{formatDateShort(departure.date)}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {departure.startTime}–{departure.endTime}
          </span>
          <span aria-hidden="true">·</span>
          <span>{categoryLabel[tour.category]}</span>
        </p>

        <h3 className="mt-1.5 text-xl">
          <Link to={href} className="transition hover:text-forest-light">
            {tour.title}
          </Link>
        </h3>

        {/* Availability sits above the description on purpose. */}
        <div className="mt-3 rounded-xl border border-line bg-sand/50 p-3">
          <SeatProgress departure={departure} size="sm" />
          <p className="mt-1.5 text-xs leading-relaxed text-charcoal/75">{seatHeadline(departure)}</p>
          {status !== 'private' && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] font-medium text-sage">
              <CalendarClock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {status === 'confirmed' ? 'Confirmed on ' : 'Confirms by '}
                {formatDeadline(departure.confirmationDeadline)}
              </span>
            </p>
          )}
        </div>

        {departure.preferences && departure.preferences.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {departure.preferences.map((pref) => (
              <li
                key={pref}
                className="rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal"
              >
                {pref}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <TravellerAvatars travellers={departure.travellers} capacity={departure.capacity} />
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm">
              <span className="font-display text-xl font-semibold text-forest">
                {formatPrice(tour.sharedSeatPrice)}
              </span>
              <span className="text-sage"> / seat</span>
              <span className="mt-0.5 block text-xs text-sage">
                Whole car {formatPrice(tour.privatePrice)}
              </span>
            </p>
            <Link
              to={href}
              className={`btn ${status === 'almost_full' ? 'btn-primary' : 'btn-forest'} px-4 py-2.5 text-sm`}
            >
              {isEmptyCar ? 'Start this car' : primaryCtaLabel(departure)}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
