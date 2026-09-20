import { Link } from 'react-router-dom'
import { Car, Info, ShieldCheck, Users } from 'lucide-react'
import type { Departure, Tour } from '../types'
import { SeatProgress } from './SeatProgress'
import { DEPOSIT_PER_SEAT, deriveStatus, maxSelectableSeats, primaryCtaLabel, seatHeadline } from '../lib/seats'
import { formatDateLong, formatDeadline, formatPrice } from '../lib/format'

export type BookingMode = 'shared' | 'private'

export function BookingPanel({
  tour,
  departure,
  mode,
  onModeChange,
  seats,
  onSeatsChange,
  className = '',
  alreadyBooked = false,
}: {
  tour: Tour
  departure: Departure
  mode: BookingMode
  onModeChange: (mode: BookingMode) => void
  seats: number
  onSeatsChange: (seats: number) => void
  className?: string
  alreadyBooked?: boolean
}) {
  const status = deriveStatus(departure)
  const isFull = status === 'confirmed' || status === 'private'
  const maxSeats = maxSelectableSeats(departure)
  const waitlistMode = isFull && mode === 'shared'

  const deposit = seats * DEPOSIT_PER_SEAT
  const sharedTotal = seats * tour.sharedSeatPrice
  const bookingHref = `/book/${departure.id}?type=${waitlistMode ? 'waitlist' : mode}&seats=${
    mode === 'private' ? seats : Math.min(seats, Math.max(1, maxSeats))
  }`

  return (
    <section className={`card overflow-hidden ${className}`} aria-label="Book this departure">
      <div className="border-b border-line bg-sand/50 px-5 py-4">
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold text-forest">
            {formatPrice(mode === 'private' ? tour.privatePrice : tour.sharedSeatPrice)}
          </span>
          <span className="text-sm text-sage">{mode === 'private' ? 'whole car' : 'per seat'}</span>
        </p>
        <p className="mt-1 text-xs text-sage">
          {mode === 'private'
            ? `Up to 3 travellers · ${formatPrice(tour.sharedSeatPrice)} per seat if you share instead`
            : `Whole car ${formatPrice(tour.privatePrice)} · all-inclusive either way`}
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="label">How do you want to travel?</p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Booking type">
            <ModeButton
              active={mode === 'shared'}
              onClick={() => onModeChange('shared')}
              Icon={Users}
              title={isFull ? 'Waitlist' : 'Join shared'}
              subtitle={isFull ? 'If a seat opens' : 'From S$' + tour.sharedSeatPrice}
            />
            <ModeButton
              active={mode === 'private'}
              onClick={() => onModeChange('private')}
              Icon={Car}
              title="Book private"
              subtitle="Confirmed now"
            />
          </div>
        </div>

        {mode === 'shared' ? (
          <>
            <div className="rounded-xl border border-line bg-sand/40 p-3.5">
              <SeatProgress departure={departure} size="sm" />
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal/75">{seatHeadline(departure)}</p>
            </div>

            {!isFull && (
              <div>
                <p className="label">How many seats?</p>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Number of seats">
                  {[1, 2].map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={n > maxSeats}
                      aria-pressed={seats === n}
                      onClick={() => onSeatsChange(n)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        seats === n
                          ? 'border-forest bg-forest text-sand'
                          : 'border-line bg-white text-charcoal/80 hover:border-forest/40'
                      }`}
                    >
                      {n === 1 ? 'One seat' : 'Two seats'}
                    </button>
                  ))}
                </div>
                {maxSeats === 1 && (
                  <p className="mt-2 text-xs text-coral-dark">
                    Only one seat is left in this car, so two seats are not available here.
                  </p>
                )}
              </div>
            )}

            {!isFull ? (
              <dl className="space-y-2 rounded-xl bg-forest-soft/70 p-3.5 text-sm">
                <Row label={`${seats} × seat`} value={formatPrice(sharedTotal)} />
                <Row label="Refundable deposit today" value={formatPrice(deposit)} strong />
                <Row label="Balance once the car fills" value={formatPrice(sharedTotal - deposit)} />
                <p className="pt-1 text-xs leading-relaxed text-charcoal/70">
                  Confirms by {formatDeadline(departure.confirmationDeadline)}. If the third seat is
                  not claimed by then, choose a full refund, move your deposit to another date, or
                  upgrade to a private car.
                </p>
              </dl>
            ) : (
              <p className="rounded-xl bg-gold-soft p-3.5 text-sm leading-relaxed text-charcoal/80">
                This car is full. Join the waitlist and we will message you first if a seat opens —
                nothing is charged to join.
              </p>
            )}
          </>
        ) : (
          <>
            <div>
              <p className="label">How many travellers?</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Number of travellers">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={seats === n}
                    onClick={() => onSeatsChange(n)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      seats === n
                        ? 'border-forest bg-forest text-sand'
                        : 'border-line bg-white text-charcoal/80 hover:border-forest/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <dl className="space-y-2 rounded-xl bg-forest-soft/70 p-3.5 text-sm">
              <Row label="Whole car, one price" value={formatPrice(tour.privatePrice)} strong />
              <Row label="Travellers" value={`${seats} of 3`} />
              <p className="pt-1 text-xs leading-relaxed text-charcoal/70">
                Confirmed the moment you book. No waiting for the car to fill, no shared seats.
              </p>
            </dl>
          </>
        )}

        <Link to={bookingHref} className={`btn w-full ${status === 'almost_full' && mode === 'shared' ? 'btn-primary' : 'btn-forest'}`}>
          {primaryCtaLabel(departure, mode === 'private')}
        </Link>

        {alreadyBooked && (
          <p className="flex items-start gap-2 rounded-lg bg-teal-soft p-3 text-xs leading-relaxed text-teal">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            You already hold a seat in this car. Booking again adds another seat.
          </p>
        )}

        <ul className="space-y-1.5 text-xs text-sage">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
            Free cancellation until 48 hours before departure.
          </li>
          <li className="flex items-start gap-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-teal" aria-hidden="true" />
            Meets at JB CIQ, {formatDateLong(departure.date)} at {departure.startTime}.
          </li>
        </ul>

        <p className="rounded-lg bg-sand px-3 py-2 text-[11px] leading-relaxed text-sage">
          Demo prototype — checkout is simulated and no card is charged.
        </p>
      </div>
    </section>
  )
}

function ModeButton({
  active,
  onClick,
  Icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  Icon: typeof Users
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-3 text-left transition ${
        active ? 'border-forest bg-forest text-sand' : 'border-line bg-white hover:border-forest/40'
      }`}
    >
      <Icon className={`size-4 ${active ? 'text-gold' : 'text-sage'}`} aria-hidden="true" />
      <span className="mt-1.5 block text-sm font-semibold">{title}</span>
      <span className={`block text-[11px] ${active ? 'text-sand/70' : 'text-sage'}`}>{subtitle}</span>
    </button>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={strong ? 'font-semibold text-forest' : 'text-charcoal/75'}>{label}</dt>
      <dd className={strong ? 'font-semibold text-forest' : 'text-charcoal/75'}>{value}</dd>
    </div>
  )
}
