import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  CalendarRange,
  Car,
  CircleAlert,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react'
import { useApp } from '../state/appContext'
import { useToast } from '../state/toastContext'
import { tourById } from '../data/tours'
import { hostById } from '../data/hosts'
import type { Booking, Departure, Tour } from '../types'
import { deriveStatus, seatHeadline, seatsLeft } from '../lib/seats'
import { formatDateLong, formatDateShort, formatDeadline, formatPrice, isPastDate } from '../lib/format'
import { SeatProgress } from '../components/SeatProgress'
import { StatusBadge } from '../components/StatusBadge'
import { EmptyState } from '../components/EmptyState'
import { ShareModal } from '../components/ShareModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Modal } from '../components/Modal'

type Row = { booking: Booking; departure: Departure; tour: Tour }

export function MyTripsPage() {
  const { state, cancelBooking, moveBooking, resetDemo } = useApp()
  const { pushToast } = useToast()
  const [shareRow, setShareRow] = useState<Row | null>(null)
  const [cancelRow, setCancelRow] = useState<Row | null>(null)
  const [moveRow, setMoveRow] = useState<Row | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const rows = useMemo(() => {
    return state.bookings
      .map((booking) => {
        const departure = state.departures.find((d) => d.id === booking.departureId)
        const tour = departure ? tourById(departure.tourId) : undefined
        return departure && tour ? { booking, departure, tour } : null
      })
      .filter((r): r is Row => r !== null)
  }, [state.bookings, state.departures])

  const isPastRow = (row: Row) =>
    isPastDate(row.departure.date) || row.booking.status === 'cancelled'

  const awaiting = rows.filter((r) => !isPastRow(r) && r.booking.status === 'seat_held')
  const confirmed = rows.filter((r) => !isPastRow(r) && r.booking.status === 'confirmed')
  const waitlist = rows.filter((r) => !isPastRow(r) && r.booking.status === 'waitlisted')
  const past = rows.filter(isPastRow)

  const hasAny = rows.some((r) => !r.booking.isSample)

  return (
    <div className="wrap py-10 sm:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Your bookings</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">My trips</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">
          Every seat you hold, what has been paid, and exactly when each car needs to fill. Bookings
          are stored in this browser for the demo.
        </p>
      </header>

      {!hasAny && (
        <div className="mt-8">
          <EmptyState
            icon={<Compass className="size-6" aria-hidden="true" />}
            title="No seats held yet"
            description="Claim a seat in a car that is already forming, or start your own on a date that suits you. Your bookings and seat status will appear here."
            action={
              <>
                <Link to="/trips" className="btn btn-primary">
                  Find upcoming trips
                </Link>
                <Link to="/start-trip" className="btn btn-quiet">
                  Start a trip
                </Link>
              </>
            }
          />
        </div>
      )}

      <div className="mt-8 space-y-10">
        <Section
          title="Awaiting group"
          caption="Your deposit is held. These cars confirm when the third seat is claimed."
          rows={awaiting}
          emptyCopy="Nothing waiting on a group right now."
          onShare={setShareRow}
          onCancel={setCancelRow}
          onMove={setMoveRow}
        />
        <Section
          title="Confirmed"
          caption="These trips are running. Meeting details are unlocked."
          rows={confirmed}
          emptyCopy="No confirmed departures yet."
          onShare={setShareRow}
          onCancel={setCancelRow}
          onMove={setMoveRow}
        />
        <Section
          title="Waitlist"
          caption="You are first in line if a seat opens. Nothing has been charged."
          rows={waitlist}
          emptyCopy="You are not on any waitlists."
          onShare={setShareRow}
          onCancel={setCancelRow}
          onMove={setMoveRow}
        />
        <Section
          title="Past trips"
          caption="Completed and cancelled bookings."
          rows={past}
          emptyCopy="Nothing here yet."
          onShare={setShareRow}
          onCancel={setCancelRow}
          onMove={setMoveRow}
        />
      </div>

      <div className="mt-12 flex flex-col gap-3 rounded-[1.25rem] border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base">Demo controls</h2>
          <p className="mt-1 text-sm text-charcoal/70">
            Reset clears every booking you made in this browser and restores the original demo
            departures.
          </p>
        </div>
        <button type="button" className="btn btn-quiet shrink-0" onClick={() => setResetOpen(true)}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Reset demo data
        </button>
      </div>

      {shareRow && (
        <ShareModal
          open
          onClose={() => setShareRow(null)}
          tour={shareRow.tour}
          departure={shareRow.departure}
          shareCode={shareRow.booking.shareCode}
        />
      )}

      {cancelRow && (
        <ConfirmDialog
          open
          onClose={() => setCancelRow(null)}
          onConfirm={() => {
            cancelBooking(cancelRow.booking.id)
            pushToast('Booking cancelled. Your seat has been released.')
          }}
          title="Cancel this booking?"
          description={`${cancelRow.tour.title} · ${formatDateLong(cancelRow.departure.date)}`}
          confirmLabel="Cancel booking"
          tone="danger"
        >
          <div className="space-y-3 text-sm leading-relaxed text-charcoal/80">
            <p>
              {cancelRow.booking.bookingType === 'private'
                ? 'Cancelling releases the whole car and your host is told straight away.'
                : cancelRow.booking.bookingType === 'waitlist'
                  ? 'Leaving the waitlist removes you from the queue for this car. You can rejoin later if a seat is still open.'
                  : 'Cancelling releases your seat back to the car straight away, and the other travellers are told the seat reopened.'}
            </p>
            <p className="rounded-xl bg-sand p-3">
              {cancelRow.booking.bookingType === 'waitlist'
                ? 'Nothing has been charged for a waitlist request, so there is nothing to refund.'
                : `More than 48 hours before departure your ${formatPrice(
                    cancelRow.booking.depositPaid,
                  )} ${
                    cancelRow.booking.bookingType === 'private' ? 'payment' : 'deposit'
                  } is refunded in full. Inside 48 hours it is forfeited. If JB Weekend cancels, you always get everything back.`}
            </p>
          </div>
        </ConfirmDialog>
      )}

      {moveRow && (
        <MoveDateModal
          row={moveRow}
          departures={state.departures}
          onClose={() => setMoveRow(null)}
          onMove={(toId) => {
            moveBooking(moveRow.booking.id, toId)
            pushToast('Deposit moved to your new date.')
            setMoveRow(null)
          }}
        />
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo()
          pushToast('Demo data reset.')
        }}
        title="Reset the demo?"
        description="This clears bookings saved in this browser."
        confirmLabel="Reset demo data"
        tone="danger"
      >
        <p className="text-sm leading-relaxed text-charcoal/80">
          Seat counts return to their original state and every booking you made in this session is
          removed. Nothing outside this browser is affected.
        </p>
      </ConfirmDialog>
    </div>
  )
}

function Section({
  title,
  caption,
  rows,
  emptyCopy,
  onShare,
  onCancel,
  onMove,
}: {
  title: string
  caption: string
  rows: Row[]
  emptyCopy: string
  onShare: (row: Row) => void
  onCancel: (row: Row) => void
  onMove: (row: Row) => void
}) {
  return (
    <section aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`} className="text-xl">
          {title}
        </h2>
        <span className="rounded-full bg-sand-deep px-2 py-0.5 text-xs font-semibold text-forest">
          {rows.length}
        </span>
      </div>
      <p className="mt-1 text-sm text-charcoal/70">{caption}</p>
      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-sage/40 bg-white/50 p-4 text-sm text-sage">
          {emptyCopy}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <BookingCard
              key={row.booking.id}
              row={row}
              onShare={() => onShare(row)}
              onCancel={() => onCancel(row)}
              onMove={() => onMove(row)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function BookingCard({
  row,
  onShare,
  onCancel,
  onMove,
}: {
  row: Row
  onShare: () => void
  onCancel: () => void
  onMove: () => void
}) {
  const { booking, departure, tour } = row
  const status = deriveStatus(departure)
  const confirmed = booking.status === 'confirmed'
  const cancelled = booking.status === 'cancelled'
  const past = isPastDate(departure.date)
  const balance = booking.totalPrice - booking.depositPaid
  const host = hostById(departure.hostId)

  return (
    <article className={`card p-5 ${cancelled ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sage">
            {formatDateShort(departure.date)} · {departure.startTime}–{departure.endTime}
            {booking.isSample && (
              <span className="rounded-full bg-sand-deep px-2 py-0.5 text-[10px] uppercase tracking-wider text-forest">
                Sample history
              </span>
            )}
          </p>
          <h3 className="mt-1 text-lg">
            <Link to={`/trips/${tour.slug}?d=${departure.id}`} className="transition hover:text-forest-light">
              {tour.title}
            </Link>
          </h3>
        </div>
        {cancelled ? (
          <span className="rounded-full border border-line bg-sand px-2.5 py-1 text-xs font-semibold text-sage">
            Cancelled
          </span>
        ) : booking.status === 'waitlisted' ? (
          <StatusBadge status="waitlist" size="sm" />
        ) : (
          <StatusBadge status={status} size="sm" />
        )}
      </div>

      {!cancelled && (
        <div className="mt-4 rounded-xl border border-line bg-sand/40 p-3.5">
          <SeatProgress departure={departure} size="sm" />
          {!past && (
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal/75">
              {booking.status === 'waitlisted'
                ? 'You are on the waitlist. We will message you first if a seat opens.'
                : confirmed
                  ? booking.bookingType === 'private'
                    ? 'The whole car is yours. This departure is guaranteed.'
                    : 'This trip is confirmed. Your seat is locked in.'
                  : seatHeadline(departure)}
            </p>
          )}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-sage">Paid so far</dt>
          <dd className="mt-0.5 font-semibold text-forest">{formatPrice(booking.depositPaid)}</dd>
        </div>
        <div>
          <dt className="text-xs text-sage">
            {confirmed && !past ? 'Balance due' : booking.status === 'waitlisted' ? 'If a seat opens' : 'Balance'}
          </dt>
          <dd className="mt-0.5 font-semibold text-forest">
            {booking.status === 'waitlisted' ? formatPrice(booking.totalPrice) : formatPrice(balance)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-sage">
            {booking.bookingType === 'private' ? 'Booking' : 'Confirmation deadline'}
          </dt>
          <dd className="mt-0.5 flex items-start gap-1.5 text-sm text-charcoal/80">
            {booking.bookingType === 'private' ? (
              <>
                <Car className="mt-0.5 size-3.5 shrink-0 text-sage" aria-hidden="true" />
                Whole car, guaranteed departure
              </>
            ) : (
              <>
                <CalendarClock className="mt-0.5 size-3.5 shrink-0 text-sage" aria-hidden="true" />
                {formatDeadline(departure.confirmationDeadline)}
              </>
            )}
          </dd>
        </div>
      </dl>

      {confirmed && !past && !cancelled && (
        <div className="mt-4 rounded-xl border border-forest/20 bg-forest-soft p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-forest">
            <MapPin className="size-4" aria-hidden="true" />
            Meeting information
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-charcoal/80">
            {host.name} meets you at {tour.meetingPoint} at {departure.startTime} on{' '}
            {formatDateLong(departure.date)}. Cross the border yourself and allow extra time at
            immigration. Back at CIQ by {departure.endTime}.
          </p>
          <p className="mt-2 text-xs text-sage">
            Host contact and the trip chat are sent by WhatsApp 24 hours before departure.
          </p>
        </div>
      )}

      {booking.status === 'seat_held' && !past && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-gold-soft p-3 text-xs leading-relaxed text-charcoal/80">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden="true" />
          {seatsLeft(departure) === 1
            ? 'One seat away from confirmed. Sharing the link is the fastest way to fill it.'
            : 'If this car does not fill by the deadline, you can take a full refund, move the deposit to another date, or upgrade to a private car.'}
        </p>
      )}

      {!cancelled && !past && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet px-3.5 py-2 text-sm" onClick={onShare}>
            <Share2 className="size-4" aria-hidden="true" />
            Invite
          </button>
          {/* Moving the deposit only applies while a car is still waiting on its group. */}
          {booking.bookingType === 'shared' && booking.status === 'seat_held' && (
            <button type="button" className="btn btn-quiet px-3.5 py-2 text-sm" onClick={onMove}>
              <CalendarRange className="size-4" aria-hidden="true" />
              Move date
            </button>
          )}
          <button
            type="button"
            className="btn btn-quiet px-3.5 py-2 text-sm text-coral-dark"
            onClick={onCancel}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
      )}

      {past && !cancelled && (
        <p className="mt-4 flex items-center gap-2 text-xs text-sage">
          <Clock className="size-3.5" aria-hidden="true" />
          Completed {formatDateLong(departure.date)}
        </p>
      )}
    </article>
  )
}

function MoveDateModal({
  row,
  departures,
  onClose,
  onMove,
}: {
  row: Row
  departures: Departure[]
  onClose: () => void
  onMove: (toDepartureId: string) => void
}) {
  const options = departures.filter(
    (d) =>
      d.id !== row.departure.id &&
      d.tourId === row.departure.tourId &&
      !isPastDate(d.date) &&
      deriveStatus(d) !== 'private' &&
      seatsLeft(d) >= row.booking.seats,
  )

  return (
    <Modal
      open
      onClose={onClose}
      title="Move your deposit to another date"
      description={`${row.tour.title} · currently ${formatDateShort(row.departure.date)}`}
    >
      {options.length === 0 ? (
        <p className="text-sm leading-relaxed text-charcoal/75">
          There is no other {row.tour.title} car with {row.booking.seats === 1 ? 'a free seat' : 'two free seats'} right
          now. Start a new car on the date you want, or cancel for a full refund if you are more than
          48 hours out.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onMove(option.id)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white p-3.5 text-left transition hover:border-forest/40"
              >
                <span>
                  <span className="block text-sm font-semibold text-forest">
                    {formatDateLong(option.date)}
                  </span>
                  <span className="mt-0.5 block text-xs text-sage">
                    {option.startTime}–{option.endTime} · {seatsLeft(option)} seat
                    {seatsLeft(option) === 1 ? '' : 's'} left
                  </span>
                </span>
                <StatusBadge status={deriveStatus(option)} size="sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
