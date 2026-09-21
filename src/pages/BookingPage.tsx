import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarPlus,
  CheckCircle2,
  Link2,
  Loader2,
  Lock,
  PencilLine,
  Share2,
  Ticket,
} from 'lucide-react'
import { tourById } from '../data/tours'
import { useApp } from '../state/appContext'
import { useToast } from '../state/toastContext'
import type { Booking, TravellerDetails } from '../types'
import type { BookingKind } from '../lib/booking'
import { quoteFor, remainingSeats } from '../lib/booking'
import { formatDateLong, formatDeadline, formatPrice } from '../lib/format'
import { validateTraveller } from '../lib/validation'
import type { FormErrors } from '../lib/validation'
import { copyText } from '../lib/clipboard'
import { buildShareLink } from '../lib/share'
import { downloadIcs } from '../lib/calendar'
import { BookingStepper } from '../components/BookingStepper'
import { TravellerForm } from '../components/TravellerForm'
import { ShareModal } from '../components/ShareModal'
import { NotFoundPage } from './NotFoundPage'

type CheckoutType = BookingKind | 'waitlist'

const emptyTraveller: TravellerDetails = { firstName: '', email: '', phone: '' }

const steps = ['Your details', 'Review and pay']

export function BookingPage() {
  const { departureId } = useParams<{ departureId: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { state, book } = useApp()
  const { pushToast } = useToast()

  const departure = state.departures.find((d) => d.id === departureId)
  const tour = departure ? tourById(departure.tourId) : undefined
  const left = departure ? remainingSeats(departure) : 0

  // The selection was made on the route page and travels here in the URL.
  const requestedType = params.get('type')
  const checkoutType: CheckoutType =
    requestedType === 'private' ? 'private' : requestedType === 'waitlist' || left === 0 ? 'waitlist' : 'shared'
  const requestedSeats = Number(params.get('seats'))

  const [step, setStep] = useState(0)
  const [details, setDetails] = useState<TravellerDetails>(() => state.profile ?? emptyTraveller)
  const [errors, setErrors] = useState<FormErrors>({})
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState<Booking | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const resultDeparture = useMemo(
    () => (completed ? state.departures.find((d) => d.id === completed.departureId) : undefined),
    [completed, state.departures],
  )

  if (!departure || !tour) return <NotFoundPage />

  const quote = quoteFor(
    tour,
    departure,
    checkoutType === 'waitlist' ? 'shared' : checkoutType,
    Number.isFinite(requestedSeats) && requestedSeats > 0 ? requestedSeats : 1,
  )
  const isWaitlist = checkoutType === 'waitlist'
  const dueToday = isWaitlist ? 0 : quote.dueToday
  const editHref = `/trips/${tour.slug}?d=${departure.id}&type=${checkoutType === 'waitlist' ? 'shared' : checkoutType}&seats=${quote.seats}`

  function goToReview() {
    const found = validateTraveller(details)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0]
      document.getElementById(firstKey)?.focus()
      pushToast('Check the highlighted fields before continuing.', 'error')
      return
    }
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleConfirm() {
    setProcessing(true)
    // Payment is arranged manually; this records the booking, it does not charge.
    window.setTimeout(() => {
      const created = book({
        departureId: departure!.id,
        seats: quote.seats,
        traveller: details,
        bookingType: checkoutType,
      })
      setProcessing(false)
      setCompleted(created)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      pushToast(
        isWaitlist ? 'You are on the waitlist. Nothing is due.' : 'Booking recorded. Payment is arranged separately.',
      )
    }, 900)
  }

  /* ---------------- Confirmation ---------------- */
  if (completed && resultDeparture) {
    const confirmed = completed.bookingStatus === 'confirmed'
    const stillNeeded = remainingSeats(resultDeparture)
    // Read the booking that was actually created: `checkoutType` is derived from
    // live availability, which this booking may just have changed.
    const wasWaitlist = completed.bookingType === 'waitlist'

    const headline = wasWaitlist
      ? 'You are on the waitlist.'
      : completed.bookingType === 'private'
        ? 'Your private trip is confirmed.'
        : confirmed
          ? 'Your trip is confirmed.'
          : 'Your seat is held.'

    const explainer = wasWaitlist
      ? `We will message you the moment a seat opens on ${tour.title}, ${formatDateLong(resultDeparture.date)}. Nothing is due.`
      : completed.bookingType === 'private'
        ? `The whole car is yours for ${formatDateLong(resultDeparture.date)}. Your host meets you at JB CIQ at ${resultDeparture.startTime}.`
        : confirmed
          ? `Your booking took the last ${completed.seats === 1 ? 'seat' : `${completed.seats} seats`}, so this car is now full and the trip is going ahead on ${formatDateLong(resultDeparture.date)}.`
          : `${stillNeeded === 1 ? 'One more seat' : `${stillNeeded} more seats`} and this trip is confirmed. Confirmation closes ${formatDeadline(resultDeparture.confirmationDeadline)}.`

    return (
      <div className="wrap max-w-2xl py-8 sm:py-12">
        <div className="card overflow-hidden">
          <div className={`px-5 py-8 text-center ${confirmed ? 'bg-forest text-sand' : 'bg-sand'}`}>
            <span
              className={`mx-auto grid size-12 place-items-center rounded-full ${
                confirmed ? 'bg-sand/15 text-gold' : 'bg-white text-coral'
              }`}
            >
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </span>
            <h1 className={`mt-4 text-page ${confirmed ? 'text-sand' : ''}`}>{headline}</h1>
            <p
              className={`mx-auto mt-2 max-w-md text-sm leading-relaxed ${
                confirmed ? 'text-sand/80' : 'text-charcoal/75'
              }`}
            >
              {explainer}
            </p>
          </div>

          <div className="space-y-5 p-5">
            <dl className="space-y-2 text-sm">
              <SummaryRow label="Route" value={tour.title} />
              <SummaryRow label="Date" value={formatDateLong(resultDeparture.date)} />
              <SummaryRow
                label="Meets"
                value={`JB CIQ · ${resultDeparture.startTime}–${resultDeparture.endTime}`}
              />
              <SummaryRow
                label="Booking"
                value={
                  completed.bookingType === 'private'
                    ? 'Whole car'
                    : wasWaitlist
                      ? 'Waitlist request'
                      : `${completed.seats} ${completed.seats === 1 ? 'seat' : 'seats'}, shared`
                }
              />
              {!wasWaitlist && (
                <>
                  <SummaryRow label="Amount due today" value={formatPrice(completed.amountDueToday)} strong />
                  {completed.balanceAfterConfirmation > 0 && (
                    <SummaryRow
                      label="Balance once confirmed"
                      value={formatPrice(completed.balanceAfterConfirmation)}
                    />
                  )}
                  <SummaryRow label="Payment" value="Pending — we will be in touch to settle it" />
                </>
              )}
              <SummaryRow label="Reference" value={completed.shareCode} />
            </dl>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <Link to="/my-trips" className="btn btn-forest">
                <Ticket className="size-4" aria-hidden="true" />
                View my trips
              </Link>
              <button type="button" className="btn btn-quiet" onClick={() => setShareOpen(true)}>
                <Share2 className="size-4" aria-hidden="true" />
                Invite a friend
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
                  const ok = await copyText(buildShareLink(tour, resultDeparture, completed.shareCode))
                  pushToast(
                    ok ? 'Invite link copied.' : 'Could not copy — use Invite a friend instead.',
                    ok ? 'success' : 'error',
                  )
                }}
              >
                <Link2 className="size-4" aria-hidden="true" />
                Copy invite link
              </button>
            </div>
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

  /* ---------------- Checkout ---------------- */
  return (
    <div className="wrap max-w-2xl py-6 sm:py-10">
      <button
        type="button"
        onClick={() => (step === 0 ? navigate(-1) : setStep(0))}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-sage underline-offset-4 transition hover:text-forest hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {step === 0 ? 'Back to the route' : 'Back to your details'}
      </button>

      <header className="mt-2">
        <p className="eyebrow">{tour.title}</p>
        <h1 className="mt-1 text-page">
          {formatDateLong(departure.date)}
        </h1>
      </header>

      <div className="mt-5">
        <BookingStepper steps={steps} current={step} />
      </div>

      {/* Selection made on the route page — editable, never re-asked. */}
      <div className="card mt-5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-forest">Your booking</h2>
            <p className="mt-1 text-sm leading-relaxed text-charcoal/80">
              {isWaitlist
                ? 'Waitlist request · 1 seat'
                : checkoutType === 'private'
                  ? `Whole car · up to ${quote.seats} ${quote.seats === 1 ? 'traveller' : 'travellers'}`
                  : `${quote.seats} shared ${quote.seats === 1 ? 'seat' : 'seats'} · ${formatPrice(tour.sharedSeatPrice)} each`}
            </p>
            <p className="mt-0.5 text-sm text-sage">
              {departure.startTime}–{departure.endTime} · meets at JB CIQ
            </p>
          </div>
          <Link
            to={editHref}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-teal underline-offset-4 hover:underline"
          >
            <PencilLine className="size-4" aria-hidden="true" />
            Edit
          </Link>
        </div>
      </div>

      <div className="card mt-4 p-5">
        {step === 0 ? (
          <div>
            <h2 className="text-xl">Your details</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              Three things only. Your companions see your first name; the rest is how we reach you.
            </p>
            <div className="mt-5">
              <TravellerForm details={details} onChange={setDetails} errors={errors} />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl">Review and pay</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              {isWaitlist
                ? 'Joining the waitlist is free. We only ask for payment if a seat opens and you accept it.'
                : quote.resultingStatus === 'confirmed'
                  ? 'This booking fills the car, so the trip confirms immediately and the full fare is due rather than a deposit.'
                  : 'Only the deposit is due now. The balance follows once all three seats are claimed.'}
            </p>

            <dl className="mt-5 space-y-2.5 rounded-xl border border-line bg-sand/40 p-4 text-sm">
              <SummaryRow label="Route" value={`${tour.title} · ${formatDateLong(departure.date)}`} />
              <SummaryRow label="Name" value={details.firstName} />
              <SummaryRow label="Email" value={details.email} />
              <SummaryRow label="Mobile" value={details.phone} />
              {!isWaitlist && (
                <>
                  <SummaryRow
                    label={checkoutType === 'private' ? 'Whole car' : `${quote.seats} × ${formatPrice(tour.sharedSeatPrice)}`}
                    value={formatPrice(quote.fareTotal)}
                  />
                  {quote.balanceAfterConfirmation > 0 && (
                    <SummaryRow
                      label="Balance after confirmation"
                      value={formatPrice(quote.balanceAfterConfirmation)}
                    />
                  )}
                </>
              )}
              <div className="border-t border-line pt-2.5">
                <SummaryRow label="Amount due today" value={formatPrice(dueToday)} strong />
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-dashed border-sage/50 bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                <Lock className="size-4 text-teal" aria-hidden="true" />
                Payment is arranged manually
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
                We do not take card details here. Confirming records your booking and we contact you
                to settle the {formatPrice(dueToday)} due today. Your booking shows as payment
                pending until then.
              </p>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-sage">
              By confirming you agree to the traveller code of conduct: be on time at JB CIQ, be
              respectful of your host and companions, and follow your host on site safety.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => (step === 0 ? navigate(-1) : setStep(0))}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step === 0 ? (
            <button type="button" className="btn btn-forest sm:min-w-44" onClick={goToReview}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary sm:min-w-56"
              onClick={handleConfirm}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Recording your booking…
                </>
              ) : isWaitlist ? (
                'Join the waitlist'
              ) : (
                `Confirm booking · ${formatPrice(dueToday)} due`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? 'font-semibold text-forest' : 'text-charcoal/70'}>{label}</dt>
      <dd className={`break-words text-right ${strong ? 'font-semibold text-forest' : 'text-charcoal/85'}`}>
        {value}
      </dd>
    </div>
  )
}
