import { Link } from 'react-router-dom'
import { Car, Info, Users } from 'lucide-react'
import type { Departure, Tour } from '../types'
import type { BookingKind } from '../lib/booking'
import {
  deriveStatus,
  maxSelectableSeats,
  primaryCtaLabel,
  quoteFor,
  remainingSeats,
} from '../lib/booking'
import { formatDeadline, formatPrice } from '../lib/format'

/**
 * Booking type and seat count are chosen here and carried into checkout, so the
 * customer never picks them twice. Every figure comes from quoteFor().
 */
export function BookingPanel({
  tour,
  departure,
  kind,
  onKindChange,
  seats,
  onSeatsChange,
  className = '',
  alreadyBooked = false,
}: {
  tour: Tour
  departure: Departure
  kind: BookingKind
  onKindChange: (kind: BookingKind) => void
  seats: number
  onSeatsChange: (seats: number) => void
  className?: string
  alreadyBooked?: boolean
}) {
  const status = deriveStatus(departure)
  const left = remainingSeats(departure)
  const soldOut = left === 0
  const sharedUnavailable = soldOut && kind === 'shared'
  const quote = quoteFor(tour, departure, kind, seats)
  const maxSeats = maxSelectableSeats(departure, kind)

  const href = sharedUnavailable
    ? `/book/${departure.id}?type=waitlist&seats=1`
    : `/book/${departure.id}?type=${kind}&seats=${quote.seats}`

  return (
    <section className={`card overflow-hidden ${className}`} aria-label="Book this departure">
      <div className="border-b border-line bg-sand/50 px-5 py-4">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-2xl font-semibold text-forest">
            {formatPrice(kind === 'private' ? tour.privateCarPrice : tour.sharedSeatPrice)}
          </span>
          <span className="text-sm text-sage">{kind === 'private' ? 'whole car' : 'per seat'}</span>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-sage">
          Private car and local host included. Food, tickets and activities are paid as you go.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="label" id="booking-kind-label">
            How do you want to travel?
          </p>
          <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="booking-kind-label">
            <KindButton
              active={kind === 'shared'}
              onClick={() => onKindChange('shared')}
              Icon={Users}
              title={soldOut ? 'Waitlist' : 'Share the car'}
              subtitle={soldOut ? 'No seats left' : `${formatPrice(tour.sharedSeatPrice)} a seat`}
            />
            <KindButton
              active={kind === 'private'}
              onClick={() => onKindChange('private')}
              Icon={Car}
              title="Whole car"
              subtitle="Confirmed now"
            />
          </div>
        </div>

        {kind === 'shared' && !soldOut && (
          <SeatChooser
            label="How many seats?"
            max={maxSeats}
            value={quote.seats}
            onChange={onSeatsChange}
            note={
              quote.fillsCar
                ? 'This takes the last of the car, so the trip confirms straight away.'
                : undefined
            }
          />
        )}

        {kind === 'private' && (
          <SeatChooser
            label="How many travellers?"
            max={3}
            value={quote.seats}
            onChange={onSeatsChange}
            note="The price is per car, so it does not change with the number of travellers."
          />
        )}

        {sharedUnavailable ? (
          <p className="rounded-xl bg-gold-soft p-3.5 text-sm leading-relaxed text-charcoal/80">
            All three seats are claimed. Join the waitlist and we will message you first if one
            opens — nothing is charged to join.
          </p>
        ) : (
          <dl className="space-y-2 rounded-xl bg-forest-soft/70 p-3.5 text-sm">
            <Row
              label={kind === 'private' ? 'Whole car' : `${quote.seats} × seat`}
              value={formatPrice(quote.fareTotal)}
            />
            {quote.balanceAfterConfirmation > 0 && (
              <Row
                label="Balance once the car fills"
                value={formatPrice(quote.balanceAfterConfirmation)}
              />
            )}
            <div className="border-t border-forest/10 pt-2">
              <Row label="Amount due today" value={formatPrice(quote.dueToday)} strong />
            </div>
            <p className="pt-1 text-xs leading-relaxed text-charcoal/70">
              {quote.resultingStatus === 'confirmed'
                ? 'Confirmed as soon as you book — the full fare is due now, not a deposit.'
                : `A refundable ${formatPrice(quote.depositPerSeat)} deposit per seat holds your place. Confirms by ${formatDeadline(departure.confirmationDeadline)}; if it does not fill you can take a full refund, move to another date, or upgrade to the whole car.`}
            </p>
          </dl>
        )}

        <Link to={href} className={`btn w-full ${status === 'almost_full' && kind === 'shared' ? 'btn-primary' : 'btn-forest'}`}>
          {sharedUnavailable ? 'Join waitlist' : primaryCtaLabel(departure, kind)}
        </Link>

        {alreadyBooked && (
          <p className="flex items-start gap-2 rounded-lg bg-teal-soft p-3 text-xs leading-relaxed text-teal">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            You already hold a seat in this car. Booking again adds another seat.
          </p>
        )}

        <p className="text-xs leading-relaxed text-sage">
          Meets at JB CIQ. Free cancellation until 48 hours before departure.
        </p>
      </div>
    </section>
  )
}

function SeatChooser({
  label,
  max,
  value,
  onChange,
  note,
}: {
  label: string
  max: number
  value: number
  onChange: (n: number) => void
  note?: string
}) {
  const options = Array.from({ length: Math.max(1, max) }, (_, i) => i + 1)
  return (
    <div>
      <p className="label" id={`${label.replace(/\W/g, '')}-label`}>
        {label}
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        role="group"
        aria-labelledby={`${label.replace(/\W/g, '')}-label`}
      >
        {options.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={`min-h-11 rounded-xl border text-sm font-semibold transition ${
              value === n
                ? 'border-forest bg-forest text-sand'
                : 'border-line bg-white text-charcoal/80 hover:border-forest/40'
            }`}
          >
            {n}
            <span className="sr-only"> {n === 1 ? 'seat' : 'seats'}</span>
          </button>
        ))}
      </div>
      {note && <p className="mt-2 text-xs leading-relaxed text-charcoal/70">{note}</p>}
    </div>
  )
}

function KindButton({
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
      className={`min-h-11 rounded-xl border p-3 text-left transition ${
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
