import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  Car,
  CircleAlert,
  Compass,
  MapPin,
  Route,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react'
import { useApp } from '../state/appContext'
import { useToast } from '../state/toastContext'
import { tourById } from '../data/tours'
import { hostById } from '../data/hosts'
import type { Booking, Departure, Tour } from '../types'
import { deriveStatus, remainingSeats } from '../lib/booking'
import { formatDateLong, formatDateShort, formatDeadline, formatPrice, isPastDate } from '../lib/format'
import { downloadIcs } from '../lib/calendar'
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

  const rows = useMemo(
    () =>
      state.bookings
        .map((booking) => {
          const departure = state.departures.find((d) => d.id === booking.departureId)
          const tour = departure ? tourById(departure.tourId) : undefined
          return departure && tour ? { booking, departure, tour } : null
        })
        .filter((r): r is Row => r !== null),
    [state.bookings, state.departures],
  )

  const isClosed = (r: Row) => isPastDate(r.departure.date) || r.booking.bookingStatus === 'cancelled'
  const awaiting = rows.filter(
    (r) => !isClosed(r) && (r.booking.bookingStatus === 'awaiting_group' || r.booking.bookingStatus === 'waitlisted'),
  )
  const confirmed = rows.filter((r) => !isClosed(r) && r.booking.bookingStatus === 'confirmed')
  const closed = rows.filter(isClosed)

  return (
    <div className="wrap py-8 sm:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Your bookings</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">My trips</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-charcoal/75">
          Every seat you hold, what is owed, and exactly when each car needs to fill.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Compass className="size-6" aria-hidden="true" />}
            title="No seats held yet"
            description="Claim a seat in a car that is already forming, or request a date that suits you. Your bookings and seat status appear here."
            action={
              <>
                <Link to="/trips" className="btn btn-primary">
                  View available departures
                </Link>
                <Link to="/start-trip" className="btn btn-quiet">
                  Request a date
                </Link>
              </>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <Section
            title="Awaiting group"
            caption="Held while the car fills. Confirmed once all three seats are claimed."
            rows={awaiting}
            emptyCopy="Nothing waiting on a group right now."
            onShare={setShareRow}
            onCancel={setCancelRow}
            onMove={setMoveRow}
          />
          <Section
            title="Confirmed"
            caption="These trips are going ahead. Meeting details are unlocked."
            rows={confirmed}
            emptyCopy="No confirmed departures yet."
            onShare={setShareRow}
            onCancel={setCancelRow}
            onMove={setMoveRow}
          />
          <Section
            title="Past or cancelled"
            caption="Completed trips and bookings you cancelled."
            rows={closed}
            emptyCopy="Nothing here yet."
            onShare={setShareRow}
            onCancel={setCancelRow}
            onMove={setMoveRow}
          />
        </div>
      )}

      {import.meta.env.DEV && (
        <div className="mt-12 flex flex-col gap-3 rounded-[1.25rem] border border-dashed border-sage/50 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sage">
            <strong className="font-semibold text-forest">Development only.</strong> Bookings are
            held in this browser. Reset restores the seeded departures.
          </p>
          <button type="button" className="btn btn-quiet shrink-0" onClick={() => setResetOpen(true)}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Reset local data
          </button>
        </div>
      )}

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
            pushToast('Booking cancelled.')
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
                  ? 'This removes you from the queue for this car. You can rejoin later if a seat is still open.'
                  : 'Cancelling releases your seat back to the car straight away, and the other travellers are told the seat reopened.'}
            </p>
            <p className="rounded-xl bg-sand p-3">
              {cancelRow.booking.bookingType === 'waitlist'
                ? 'Nothing is owed on a waitlist request, so there is nothing to refund.'
                : `More than 48 hours before departure the ${formatPrice(
                    cancelRow.booking.amountDueToday,
                  )} due on this booking is cancelled in full, or refunded if you have already settled it. Inside 48 hours it is forfeited. If JB Weekend cancels, you always get everything back.`}
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
            pushToast('Booking moved to your new date.')
            setMoveRow(null)
          }}
        />
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo()
          pushToast('Local data reset.')
        }}
        title="Reset local data?"
        description="Development helper."
        confirmLabel="Reset"
        tone="danger"
      >
        <p className="text-sm leading-relaxed text-charcoal/80">
          Seat counts return to the seeded state and every booking made in this browser is removed.
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
  const id = `section-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <section aria-labelledby={id}>
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 id={id} className="text-xl">
          {title}
        </h2>
        <span className="rounded-full bg-sand-deep px-2 py-0.5 text-xs font-semibold text-forest">
          {rows.length}
        </span>
      </div>
      <p className="mt-1 text-sm text-charcoal/70">{caption}</p>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-sage/40 bg-white/50 p-4 text-sm text-sage">
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
  const { pushToast } = useToast()
  const status = deriveStatus(departure)
  const cancelled = booking.bookingStatus === 'cancelled'
  const waitlisted = booking.bookingStatus === 'waitlisted'
  const isConfirmedBooking = booking.bookingStatus === 'confirmed'
  const past = isPastDate(departure.date)
  const host = hostById(departure.hostId)
  const left = remainingSeats(departure)

  return (
    <article className={`card p-4 sm:p-5 ${cancelled ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-sage">
            {formatDateShort(departure.date)} · {departure.startTime}–{departure.endTime}
          </p>
          <h3 className="mt-0.5 text-lg">
            <Link
              to={`/trips/${tour.slug}?d=${departure.id}`}
              className="transition hover:text-forest-light"
            >
              {tour.title}
            </Link>
          </h3>
        </div>
        {cancelled ? (
          <span className="rounded-full border border-line bg-sand px-2.5 py-1 text-xs font-semibold text-sage">
            Cancelled
          </span>
        ) : waitlisted ? (
          <StatusBadge status="waitlist" size="sm" />
        ) : (
          <StatusBadge status={status} size="sm" />
        )}
      </div>

      {/* Awaiting group leads with seat progress and the deadline. */}
      {!cancelled && !past && !isConfirmedBooking && (
        <div className="mt-4 rounded-xl border border-line bg-sand/40 p-3.5">
          <SeatProgress departure={departure} size="sm" />
          <p className="mt-1.5 text-xs leading-relaxed text-charcoal/75">
            {waitlisted
              ? 'You are on the waitlist. We will message you first if a seat opens.'
              : `${left === 1 ? 'One more seat' : `${left} more seats`} and this trip is confirmed.`}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-sage">
            <CalendarClock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Confirms by {formatDeadline(departure.confirmationDeadline)}
          </p>
        </div>
      )}

      {/* Confirmed trips lead with meeting instructions. */}
      {isConfirmedBooking && !past && !cancelled && (
        <div className="mt-4 rounded-xl border border-forest/20 bg-forest-soft p-3.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-forest">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            Meeting instructions
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-charcoal/80">
            {host.name} meets you at {tour.meetingPoint} at {departure.startTime} on{' '}
            {formatDateLong(departure.date)}. Cross the border yourself and allow extra time at
            immigration. Back at JB CIQ by {departure.endTime}.
          </p>
          <p className="mt-2 text-xs text-sage">
            Host contact and the trip chat are sent 24 hours before departure.
          </p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-sage">
            {booking.paymentStatus === 'paid' ? 'Paid' : 'Amount due today'}
          </dt>
          <dd className="mt-0.5 font-semibold text-forest">
            {waitlisted ? 'Nothing due' : formatPrice(booking.amountDueToday)}
          </dd>
          {!waitlisted && booking.paymentStatus === 'pending' && (
            <dd className="mt-0.5 text-xs text-sage">Payment pending</dd>
          )}
        </div>
        <div>
          <dt className="text-xs text-sage">
            {booking.balanceAfterConfirmation > 0 ? 'Balance once confirmed' : 'Balance'}
          </dt>
          <dd className="mt-0.5 font-semibold text-forest">
            {waitlisted ? '—' : formatPrice(booking.balanceAfterConfirmation)}
          </dd>
        </div>
      </dl>

      {booking.bookingType === 'private' && !cancelled && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-sage">
          <Car className="size-3.5 shrink-0" aria-hidden="true" />
          Whole car — guaranteed departure
        </p>
      )}

      {booking.bookingStatus === 'awaiting_group' && !past && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold-soft p-3 text-xs leading-relaxed text-charcoal/80">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden="true" />
          {left === 1
            ? 'One seat away from confirmed. Sharing the link is the fastest way to fill it.'
            : 'If this car does not fill by the deadline you can take a full refund, move to another date, or upgrade to the whole car.'}
        </p>
      )}

      {!cancelled && !past && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-quiet min-h-11 px-3.5 py-2 text-sm" onClick={onShare}>
            <Share2 className="size-4" aria-hidden="true" />
            Invite
          </button>
          {isConfirmedBooking && (
            <>
              <button
                type="button"
                className="btn btn-quiet min-h-11 px-3.5 py-2 text-sm"
                onClick={() => {
                  downloadIcs(tour, departure)
                  pushToast('Calendar file downloaded.')
                }}
              >
                <CalendarPlus className="size-4" aria-hidden="true" />
                Add to calendar
              </button>
              <Link
                to={`/trips/${tour.slug}?d=${departure.id}#included`}
                className="btn btn-quiet min-h-11 px-3.5 py-2 text-sm"
              >
                <Route className="size-4" aria-hidden="true" />
                View itinerary
              </Link>
            </>
          )}
          {booking.bookingStatus === 'awaiting_group' && (
            <button type="button" className="btn btn-quiet min-h-11 px-3.5 py-2 text-sm" onClick={onMove}>
              <CalendarRange className="size-4" aria-hidden="true" />
              Move date
            </button>
          )}
          <button
            type="button"
            className="btn btn-quiet min-h-11 px-3.5 py-2 text-sm text-coral-dark"
            onClick={onCancel}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Cancel
          </button>
        </div>
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
      remainingSeats(d) >= row.booking.seats,
  )

  return (
    <Modal
      open
      onClose={onClose}
      title="Move to another date"
      description={`${row.tour.title} · currently ${formatDateShort(row.departure.date)}`}
    >
      {options.length === 0 ? (
        <p className="text-sm leading-relaxed text-charcoal/75">
          There is no other {row.tour.title} car with{' '}
          {row.booking.seats === 1 ? 'a free seat' : `${row.booking.seats} free seats`} right now.
          Request a new date, or cancel for a full refund if you are more than 48 hours out.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onMove(option.id)}
                className="flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-line bg-white p-3.5 text-left transition hover:border-forest/40"
              >
                <span>
                  <span className="block text-sm font-semibold text-forest">
                    {formatDateLong(option.date)}
                  </span>
                  <span className="mt-0.5 block text-xs text-sage">
                    {option.startTime}–{option.endTime} · {remainingSeats(option)} of 3 left
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
