import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarPlus,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Link2,
  Loader2,
  Lock,
  PartyPopper,
  Share2,
  Ticket,
  Users,
} from 'lucide-react'
import { tourById } from '../data/tours'
import { useApp } from '../state/appContext'
import { useToast } from '../state/toastContext'
import type { Booking, TravellerDetails } from '../types'
import { DEPOSIT_PER_SEAT, deriveStatus, maxSelectableSeats, seatsLeft } from '../lib/seats'
import { formatDateLong, formatDeadline, formatPrice } from '../lib/format'
import { copyText } from '../lib/clipboard'
import { downloadIcs } from '../lib/calendar'
import { BookingStepper } from '../components/BookingStepper'
import { SeatProgress } from '../components/SeatProgress'
import { TravellerForm } from '../components/TravellerForm'
import { validateTraveller } from '../lib/validation'
import type { FormErrors } from '../lib/validation'
import { buildShareLink } from '../lib/share'
import { ShareModal } from '../components/ShareModal'
import { NotFoundPage } from './NotFoundPage'

type BookingType = 'shared' | 'private' | 'waitlist'

const emptyTraveller: TravellerDetails = {
  firstName: '',
  email: '',
  phone: '',
  ageRange: '',
  language: '',
  vibes: [],
  dietary: '',
  emergencyName: '',
  emergencyPhone: '',
}

const steps = ['Booking type', 'Seats', 'Your details', 'Payment']

export function BookingPage() {
  const { departureId } = useParams<{ departureId: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { state, book } = useApp()
  const { pushToast } = useToast()

  const departure = state.departures.find((d) => d.id === departureId)
  const tour = departure ? tourById(departure.tourId) : undefined
  const isFull = departure ? seatsLeft(departure) === 0 : false

  const [step, setStep] = useState(0)
  const [bookingType, setBookingType] = useState<BookingType>(() => {
    const requested = params.get('type')
    if (requested === 'private') return 'private'
    if (requested === 'waitlist' || isFull) return 'waitlist'
    return 'shared'
  })
  const [seats, setSeats] = useState(() => {
    const requested = Number(params.get('seats'))
    return Number.isFinite(requested) && requested > 0 ? Math.min(3, requested) : 1
  })
  const [details, setDetails] = useState<TravellerDetails>(() => state.profile ?? emptyTraveller)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState<Booking | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const maxSeats = departure ? maxSelectableSeats(departure) : 1

  // After booking, the relevant car may be a brand-new private one.
  const resultDeparture = useMemo(
    () => (completed ? state.departures.find((d) => d.id === completed.departureId) : undefined),
    [completed, state.departures],
  )

  if (!departure || !tour) return <NotFoundPage />

  const perSeat = tour.sharedSeatPrice
  const seatCount = bookingType === 'private' ? seats : Math.min(seats, Math.max(1, maxSeats))
  const sharedTotal = seatCount * perSeat
  const deposit = bookingType === 'shared' ? seatCount * DEPOSIT_PER_SEAT : 0
  const dueToday =
    bookingType === 'private' ? tour.privatePrice : bookingType === 'waitlist' ? 0 : deposit

  function goNext() {
    if (step === 2) {
      const found = validateTraveller(details, consent)
      setErrors(found)
      if (Object.keys(found).length > 0) {
        const firstKey = Object.keys(found)[0]
        document.getElementById(firstKey)?.focus()
        pushToast('Check the highlighted fields before continuing.', 'error')
        return
      }
    }
    setStep((s) => Math.min(steps.length - 1, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    if (step === 0) {
      navigate(-1)
      return
    }
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handlePay() {
    setProcessing(true)
    // Simulated gateway round-trip — clearly labelled as a demo throughout the UI.
    window.setTimeout(() => {
      const created = book({
        departureId: departure!.id,
        seats: seatCount,
        traveller: details,
        bookingType,
      })
      setProcessing(false)
      setCompleted(created)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      pushToast(
        bookingType === 'waitlist'
          ? 'You are on the waitlist. Nothing was charged.'
          : 'Demo payment accepted. Your booking is saved on this device.',
      )
    }, 1100)
  }

  /* ---------------- Success ---------------- */
  if (completed && resultDeparture) {
    const status = deriveStatus(resultDeparture)
    const left = seatsLeft(resultDeparture)
    const confirmed = status === 'confirmed' || status === 'private'

    const headline =
      completed.bookingType === 'waitlist'
        ? 'You are on the waitlist.'
        : completed.bookingType === 'private'
          ? 'The car is yours. This trip is confirmed.'
          : confirmed
            ? 'You claimed the final seat. This trip is now confirmed.'
            : left === 1
              ? 'Your seat is held. One more traveller and this trip is on.'
              : 'Your seat is held. Two more travellers and this trip is on.'

    return (
      <div className="wrap max-w-3xl py-10 sm:py-14">
        <div className="card overflow-hidden">
          <div className={`px-6 py-8 text-center ${confirmed ? 'bg-forest text-sand' : 'bg-sand'}`}>
            <span
              className={`mx-auto grid size-14 place-items-center rounded-full ${
                confirmed ? 'bg-sand/15 text-gold' : 'bg-white text-coral'
              }`}
            >
              {confirmed ? (
                <PartyPopper className="size-7" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-7" aria-hidden="true" />
              )}
            </span>
            <h1 className={`mt-4 text-2xl sm:text-3xl ${confirmed ? 'text-sand' : ''}`}>{headline}</h1>
            <p className={`mx-auto mt-2 max-w-md text-sm leading-relaxed ${confirmed ? 'text-sand/80' : 'text-charcoal/75'}`}>
              {completed.bookingType === 'waitlist'
                ? `We will message you the moment a seat opens on ${tour.title}, ${formatDateLong(resultDeparture.date)}. Nothing has been charged.`
                : confirmed
                  ? `Meeting instructions, your host's number and the trip chat are now unlocked for ${formatDateLong(resultDeparture.date)}.`
                  : `We are holding your seat on ${tour.title}, ${formatDateLong(resultDeparture.date)}. Confirmation closes ${formatDeadline(resultDeparture.confirmationDeadline)}.`}
            </p>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-xl border border-line bg-sand/50 p-4">
              <SeatProgress departure={resultDeparture} size="md" />
              {!confirmed && completed.bookingType === 'shared' && (
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                  Invite someone and this car fills faster. If it does not fill by the deadline you
                  can take a full refund, move to another date, or upgrade to a private car.
                </p>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              <SummaryRow label="Trip" value={tour.title} />
              <SummaryRow label="Date" value={formatDateLong(resultDeparture.date)} />
              <SummaryRow
                label="Meets"
                value={`JB CIQ · ${resultDeparture.startTime}–${resultDeparture.endTime}`}
              />
              <SummaryRow
                label="Booking"
                value={
                  completed.bookingType === 'private'
                    ? 'Whole car, private'
                    : completed.bookingType === 'waitlist'
                      ? 'Waitlist · no charge'
                      : `${completed.seats} seat${completed.seats > 1 ? 's' : ''}, shared`
                }
              />
              <SummaryRow label="Paid today" value={formatPrice(completed.depositPaid)} strong />
              {completed.bookingType === 'shared' && (
                <SummaryRow
                  label={confirmed ? 'Balance due now' : 'Balance once confirmed'}
                  value={formatPrice(completed.totalPrice - completed.depositPaid)}
                />
              )}
              <SummaryRow label="Reference" value={completed.shareCode} />
            </dl>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <Link to="/my-trips" className="btn btn-forest">
                <Ticket className="size-4" aria-hidden="true" />
                View my trip
              </Link>
              <button type="button" className="btn btn-quiet" onClick={() => setShareOpen(true)}>
                <Share2 className="size-4" aria-hidden="true" />
                Share trip
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  downloadIcs(tour, resultDeparture)
                  pushToast('Calendar file downloaded.')
                }}
              >
                <CalendarPlus className="size-4" aria-hidden="true" />
                Add to calendar
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={async () => {
                  const ok = await copyText(
                    buildShareLink(tour, resultDeparture, completed.shareCode),
                  )
                  pushToast(
                    ok ? 'Invite link copied.' : 'Could not copy — open Share trip instead.',
                    ok ? 'success' : 'error',
                  )
                }}
              >
                <Link2 className="size-4" aria-hidden="true" />
                Copy invite link
              </button>
            </div>

            <p className="rounded-lg bg-sand px-3 py-2 text-center text-xs text-sage">
              Demo prototype — no payment was taken and no email was sent. Your booking is stored in
              this browser only.
            </p>
          </div>
        </div>

        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          tour={tour}
          departure={resultDeparture}
          shareCode={completed.shareCode}
        />
      </div>
    )
  }

  /* ---------------- Steps ---------------- */
  return (
    <div className="wrap max-w-3xl py-8 sm:py-10">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sage underline-offset-4 transition hover:text-forest hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {step === 0 ? 'Back to the trip' : 'Back'}
      </button>

      <header className="mt-4">
        <p className="eyebrow">{tour.title}</p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl">
          {formatDateLong(departure.date)} · {departure.startTime}
        </h1>
      </header>

      <div className="mt-6">
        <BookingStepper steps={steps} current={step} />
      </div>

      <div className="card mt-6 p-5 sm:p-6">
        {step === 0 && (
          <fieldset>
            <legend className="text-xl">How do you want to book?</legend>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              Every car has one host and three traveller seats. Share it and pay per seat, or take
              the whole car and depart guaranteed.
            </p>
            <div className="mt-5 space-y-3">
              <TypeOption
                active={bookingType === 'shared' || bookingType === 'waitlist'}
                disabled={false}
                onSelect={() => setBookingType(isFull ? 'waitlist' : 'shared')}
                Icon={Users}
                title={isFull ? 'Join the waitlist' : 'Join this shared trip'}
                price={isFull ? 'No charge to join' : `${formatPrice(perSeat)} per seat`}
                copy={
                  isFull
                    ? 'This car is full. We will message you first if a seat opens up, and nothing is charged until you accept it.'
                    : `A refundable ${formatPrice(DEPOSIT_PER_SEAT)} deposit per seat holds your place. The balance is only due once all three seats are claimed.`
                }
              />
              <TypeOption
                active={bookingType === 'private'}
                disabled={false}
                onSelect={() => setBookingType('private')}
                Icon={Car}
                title="Book the whole car"
                price={`${formatPrice(tour.privatePrice)} per car`}
                copy="Your own car for one to three travellers, with the same host and the same itinerary. Confirmed immediately — no waiting for the car to fill."
              />
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-xl">
              {bookingType === 'private'
                ? 'How many travellers?'
                : bookingType === 'waitlist'
                  ? 'Your waitlist request'
                  : 'How many seats?'}
            </legend>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              {bookingType === 'private'
                ? 'The price is per car, so it does not change with the number of travellers.'
                : bookingType === 'waitlist'
                  ? 'Waitlist requests are for one seat at a time.'
                  : 'You can claim one or two seats. Claiming all three would be a private booking.'}
            </p>

            <div className="mt-5 rounded-xl border border-line bg-sand/40 p-4">
              <SeatProgress departure={departure} size="md" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(bookingType === 'private' ? [1, 2, 3] : [1, 2]).map((n) => {
                const disabled = bookingType === 'shared' && n > maxSeats
                const selected = seatCount === n
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={disabled || bookingType === 'waitlist'}
                    aria-pressed={selected}
                    onClick={() => setSeats(n)}
                    className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected ? 'border-forest bg-forest text-sand' : 'border-line bg-white hover:border-forest/40'
                    }`}
                  >
                    <span className="block font-display text-2xl font-semibold">{n}</span>
                    <span className="mt-0.5 block text-sm font-medium">
                      {bookingType === 'private'
                        ? n === 1
                          ? 'traveller'
                          : 'travellers'
                        : n === 1
                          ? 'seat'
                          : 'seats'}
                    </span>
                    <span className={`mt-1 block text-xs ${selected ? 'text-sand/70' : 'text-sage'}`}>
                      {bookingType === 'private'
                        ? formatPrice(tour.privatePrice) + ' total'
                        : `${formatPrice(n * DEPOSIT_PER_SEAT)} deposit today`}
                    </span>
                  </button>
                )
              })}
              {bookingType === 'private' && (
                <div className="rounded-xl border border-dashed border-sage/50 bg-white/60 p-4 text-sm text-sage sm:col-span-3">
                  The car seats three travellers plus your host. Larger groups need a second car —
                  start another private booking on the same date.
                </div>
              )}
            </div>

            {bookingType === 'shared' && maxSeats === 1 && (
              <p className="mt-3 text-sm text-coral-dark">
                Only one seat is left in this car, so this booking is for a single seat.
              </p>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl">Your details</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              Your companions only ever see your first name, age range, languages and travel vibe.
              Your email and number are used for trip updates and shared with your host on the day.
            </p>
            <div className="mt-5">
              <TravellerForm
                details={details}
                onChange={setDetails}
                errors={errors}
                consent={consent}
                onConsentChange={setConsent}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl">Payment summary</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              {bookingType === 'waitlist'
                ? 'Joining the waitlist is free. We only ask for payment if a seat opens and you accept it.'
                : bookingType === 'private'
                  ? 'The whole car is charged upfront and your departure is confirmed immediately.'
                  : 'Only the deposit is charged now. The balance is due when the third seat is claimed.'}
            </p>

            <dl className="mt-5 space-y-2.5 rounded-xl border border-line bg-sand/40 p-4 text-sm">
              <SummaryRow label="Trip" value={`${tour.title} · ${formatDateLong(departure.date)}`} />
              {bookingType === 'private' ? (
                <>
                  <SummaryRow label="Whole car" value={formatPrice(tour.privatePrice)} />
                  <SummaryRow label="Travellers" value={`${seatCount} of 3`} />
                </>
              ) : bookingType === 'waitlist' ? (
                <SummaryRow label="Waitlist request" value="1 seat" />
              ) : (
                <>
                  <SummaryRow label={`Seats (${seatCount} × ${formatPrice(perSeat)})`} value={formatPrice(sharedTotal)} />
                  <SummaryRow
                    label={`Refundable deposit (${seatCount} × ${formatPrice(DEPOSIT_PER_SEAT)})`}
                    value={formatPrice(deposit)}
                  />
                  <SummaryRow
                    label="Balance after confirmation"
                    value={formatPrice(sharedTotal - deposit)}
                  />
                </>
              )}
              <div className="border-t border-line pt-2.5">
                <SummaryRow label="Due today" value={formatPrice(dueToday)} strong />
              </div>
            </dl>

            {bookingType === 'shared' && (
              <div className="mt-4 space-y-2.5 rounded-xl border border-gold/30 bg-gold-soft p-4 text-sm leading-relaxed text-charcoal/80">
                <p className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                  <span>
                    <strong className="text-forest">Confirmation deadline:</strong>{' '}
                    {formatDeadline(departure.confirmationDeadline)}. The trip is confirmed the
                    moment the third seat is claimed.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Ticket className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                  <span>
                    <strong className="text-forest">If it does not fill:</strong> take a full
                    refund, move your deposit to another departure, or upgrade to a private car.
                    Free cancellation until 48 hours before departure; inside 48 hours the deposit
                    is forfeited.
                  </span>
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-dashed border-sage/50 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                <Lock className="size-4 text-teal" aria-hidden="true" />
                Simulated checkout
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
                This prototype does not connect to a payment gateway and never asks for card
                details. Pressing the button below records the booking in this browser so you can
                see how the seat count and My Trips update.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- Step controls ---------------- */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="btn btn-quiet" onClick={goBack}>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn-forest sm:min-w-44" onClick={goNext}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary sm:min-w-56"
              onClick={handlePay}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Processing demo payment…
                </>
              ) : (
                <>
                  <CreditCard className="size-4" aria-hidden="true" />
                  {bookingType === 'waitlist'
                    ? 'Join the waitlist'
                    : `Pay ${formatPrice(dueToday)} (demo)`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TypeOption({
  active,
  disabled,
  onSelect,
  Icon,
  title,
  price,
  copy,
}: {
  active: boolean
  disabled: boolean
  onSelect: () => void
  Icon: typeof Users
  title: string
  price: string
  copy: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onSelect}
      className={`flex w-full gap-4 rounded-xl border p-4 text-left transition disabled:opacity-40 ${
        active ? 'border-forest bg-forest-soft' : 'border-line bg-white hover:border-forest/40'
      }`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${
          active ? 'bg-forest text-sand' : 'bg-sand text-forest'
        }`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-base font-semibold text-forest">{title}</span>
          <span className="text-sm font-semibold text-charcoal/80">{price}</span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-charcoal/75">{copy}</span>
      </span>
    </button>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? 'font-semibold text-forest' : 'text-charcoal/70'}>{label}</dt>
      <dd className={`text-right ${strong ? 'font-semibold text-forest' : 'text-charcoal/85'}`}>
        {value}
      </dd>
    </div>
  )
}
