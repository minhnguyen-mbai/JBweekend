import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Gift,
  Link2,
  Loader2,
  Share2,
  Sparkles,
  Ticket,
} from 'lucide-react'
import { tours } from '../data/tours'
import { departurePreferences } from '../data/options'
import { useApp } from '../state/appContext'
import { useToast } from '../state/toastContext'
import type { Booking, Departure, TravellerDetails } from '../types'
import { DEPOSIT_PER_SEAT } from '../lib/seats'
import { formatDateLong, formatDateShort, formatDeadline, formatPrice, parseDate } from '../lib/format'
import { copyText } from '../lib/clipboard'
import { BookingStepper } from '../components/BookingStepper'
import { TourArt } from '../components/TourArt'
import { SeatProgress } from '../components/SeatProgress'
import { TravellerForm } from '../components/TravellerForm'
import { validateTraveller } from '../lib/validation'
import type { FormErrors } from '../lib/validation'
import { buildShareLink } from '../lib/share'
import { ShareModal } from '../components/ShareModal'

const steps = ['Choose a trip', 'Preferred date', 'Backup dates', 'Seats & details']

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

/** Weekend dates with enough lead time for the car to fill before the deadline. */
function weekendDates(count = 10): string[] {
  const out: string[] = []
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)
  cursor.setDate(cursor.getDate() + 4)
  while (out.length < count) {
    const day = cursor.getDay()
    if (day === 6 || day === 0) {
      const y = cursor.getFullYear()
      const m = String(cursor.getMonth() + 1).padStart(2, '0')
      const d = String(cursor.getDate()).padStart(2, '0')
      out.push(`${y}-${m}-${d}`)
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

function minDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 4)
  return d.toISOString().slice(0, 10)
}

export function StartTripPage() {
  const { state, startTrip } = useApp()
  const { pushToast } = useToast()

  const [step, setStep] = useState(0)
  const [tourId, setTourId] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [flexibleDates, setFlexibleDates] = useState<string[]>([])
  const [seats, setSeats] = useState(1)
  const [preferences, setPreferences] = useState<string[]>([])
  const [details, setDetails] = useState<TravellerDetails>(() => state.profile ?? emptyTraveller)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<{ departure: Departure; booking: Booking } | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const dates = useMemo(() => weekendDates(10), [])
  const tour = tours.find((t) => t.id === tourId)

  function togglePreference(pref: string) {
    setPreferences((prev) => (prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]))
  }

  function toggleFlexible(value: string) {
    setFlexibleDates((prev) => {
      if (prev.includes(value)) return prev.filter((d) => d !== value)
      if (prev.length >= 2) return prev
      return [...prev, value]
    })
  }

  const canContinue = step === 0 ? Boolean(tourId) : step === 1 ? Boolean(date) : true

  function goNext() {
    if (!canContinue) {
      pushToast(step === 0 ? 'Choose a trip to continue.' : 'Choose a date to continue.', 'error')
      return
    }
    setStep((s) => Math.min(steps.length - 1, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit() {
    const found = validateTraveller(details, consent)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0]
      document.getElementById(firstKey)?.focus()
      pushToast('Check the highlighted fields before starting the car.', 'error')
      return
    }
    if (!tour || !date) return
    setSubmitting(true)
    window.setTimeout(() => {
      const result = startTrip({
        tourId: tour.id,
        date,
        flexibleDates,
        seats,
        preferences,
        traveller: details,
      })
      setSubmitting(false)
      setCreated(result)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      pushToast('Your car is live. Demo deposit recorded on this device.')
    }, 900)
  }

  /* ---------------- Success ---------------- */
  if (created && tour) {
    const left = created.departure.capacity - created.departure.seatsClaimed
    const link = buildShareLink(tour, created.departure, created.booking.shareCode)
    return (
      <div className="wrap max-w-3xl py-10 sm:py-14">
        <div className="card overflow-hidden">
          <div className="relative h-40 sm:h-52">
            <TourArt image={tour.heroImage} title={tour.title} className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 to-charcoal/20" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-sand/80">
                {formatDateLong(created.departure.date)}
              </p>
              <h1 className="mt-1 text-2xl text-sand sm:text-3xl">
                You started this trip. {left === 1 ? 'One more seat' : 'Two more seats'} to go.
              </h1>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-xl border border-line bg-sand/50 p-4">
              <SeatProgress departure={created.departure} size="md" />
              <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                Your car is now listed on Explore trips. It confirms as soon as all three seats are
                claimed, and confirmation closes{' '}
                {formatDeadline(created.departure.confirmationDeadline)}.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="new-trip-link">
                Your unique share link
              </label>
              <div className="flex gap-2">
                <input
                  id="new-trip-link"
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="field font-mono text-xs"
                />
                <button
                  type="button"
                  className="btn btn-forest shrink-0 px-3.5"
                  onClick={async () => {
                    const ok = await copyText(link)
                    pushToast(ok ? 'Share link copied.' : 'Could not copy automatically.', ok ? 'success' : 'error')
                  }}
                >
                  <Link2 className="size-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Copy</span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold-soft p-4">
              <Gift className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-forest">
                  Earn S$10 JB Weekend credit when a friend joins through your link.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-charcoal/70">
                  Credit is applied after their seat is confirmed, and you can stack it across
                  friends until the car is full.
                </p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <button type="button" className="btn btn-primary" onClick={() => setShareOpen(true)}>
                <Share2 className="size-4" aria-hidden="true" />
                Invite a friend
              </button>
              <Link
                to={`/trips/${tour.slug}?d=${created.departure.id}`}
                className="btn btn-quiet"
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                View the car
              </Link>
              <Link to="/my-trips" className="btn btn-quiet">
                <Ticket className="size-4" aria-hidden="true" />
                My trips
              </Link>
            </div>

            {created.departure.flexibleDates && created.departure.flexibleDates.length > 0 && (
              <p className="text-xs text-sage">
                Backup dates noted: {created.departure.flexibleDates.map(formatDateShort).join(' and ')}.
                If your preferred date does not fill, we will offer you these first.
              </p>
            )}

            <p className="rounded-lg bg-sand px-3 py-2 text-center text-xs text-sage">
              Demo prototype — no payment was taken and no message was sent.
            </p>
          </div>
        </div>

        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          tour={tour}
          departure={created.departure}
          shareCode={created.booking.shareCode}
        />
      </div>
    )
  }

  /* ---------------- Wizard ---------------- */
  return (
    <div className="wrap max-w-3xl py-8 sm:py-12">
      <header className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2">
          <Sparkles className="size-4 text-gold" aria-hidden="true" />
          Start a trip
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Pick the date. We will find the other two.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">
          Starting a car lists your date publicly so other travellers can claim the remaining seats.
          You pay the same refundable {formatPrice(DEPOSIT_PER_SEAT)} deposit per seat as everyone
          else.
        </p>
      </header>

      <div className="mt-8">
        <BookingStepper steps={steps} current={step} />
      </div>

      <div className="card mt-6 p-5 sm:p-6">
        {step === 0 && (
          <fieldset>
            <legend className="text-xl">Which trip do you want to run?</legend>
            <div className="mt-5 space-y-3">
              {tours.map((t) => {
                const active = tourId === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTourId(t.id)}
                    className={`flex w-full gap-4 overflow-hidden rounded-xl border text-left transition ${
                      active ? 'border-forest bg-forest-soft' : 'border-line bg-white hover:border-forest/40'
                    }`}
                  >
                    <span className="relative hidden w-32 shrink-0 sm:block">
                      <TourArt image={t.heroImage} title={t.title} className="absolute size-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 p-4 sm:pl-0">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-display text-lg font-semibold text-forest">{t.title}</span>
                        {active && (
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-forest text-sand">
                            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-charcoal/75">{t.hook}</span>
                      <span className="mt-2 block text-sm font-semibold text-forest">
                        {formatPrice(t.sharedSeatPrice)} per seat · {t.duration} · meets{' '}
                        {t.defaultStartTime}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="text-xl">When do you want to go?</legend>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              Weekend dates fill fastest. Choose a date at least four days out so there is time for
              the other seats to be claimed before the deadline.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {dates.map((d) => {
                const active = date === d
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setDate(d)
                      setFlexibleDates((prev) => prev.filter((f) => f !== d))
                    }}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      active ? 'border-forest bg-forest text-sand' : 'border-line bg-white hover:border-forest/40'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{formatDateShort(d)}</span>
                    <span className={`mt-0.5 block text-xs ${active ? 'text-sand/70' : 'text-sage'}`}>
                      {parseDate(d).toLocaleDateString('en-SG', { year: 'numeric' })}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <label className="label" htmlFor="custom-date">
                Prefer a weekday? Pick any date
              </label>
              <input
                id="custom-date"
                type="date"
                min={minDate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field sm:max-w-xs"
              />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-xl">Any backup dates?</legend>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              Pick up to two alternatives. If your preferred date does not fill, we offer your
              deposit against these first — it roughly doubles the chance of travelling this month.
              You can skip this.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {dates
                .filter((d) => d !== date)
                .map((d) => {
                  const active = flexibleDates.includes(d)
                  const disabled = !active && flexibleDates.length >= 2
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      disabled={disabled}
                      onClick={() => toggleFlexible(d)}
                      className={`rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        active ? 'border-forest bg-forest text-sand' : 'border-line bg-white hover:border-forest/40'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{formatDateShort(d)}</span>
                      <span className={`mt-0.5 block text-xs ${active ? 'text-sand/70' : 'text-sage'}`}>
                        {active ? 'Backup date' : 'Tap to add'}
                      </span>
                    </button>
                  )
                })}
            </div>
            {flexibleDates.length > 0 && (
              <p className="mt-4 text-sm text-forest">
                Backups: {flexibleDates.map(formatDateShort).join(' and ')}.
              </p>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <fieldset>
              <legend className="text-xl">How many seats are you claiming?</legend>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
                Claim one seat and two travellers join you, or claim two and only one seat is left
                to fill.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={seats === n}
                    onClick={() => setSeats(n)}
                    className={`rounded-xl border p-4 text-left transition ${
                      seats === n ? 'border-forest bg-forest text-sand' : 'border-line bg-white hover:border-forest/40'
                    }`}
                  >
                    <span className="block font-display text-2xl font-semibold">{n}</span>
                    <span className="mt-0.5 block text-sm font-medium">
                      {n === 1 ? 'seat' : 'seats'}
                    </span>
                    <span className={`mt-1 block text-xs ${seats === n ? 'text-sand/70' : 'text-sage'}`}>
                      {formatPrice(n * DEPOSIT_PER_SEAT)} deposit today
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xl">Preferences for this car</legend>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
                Optional. These are shown on your listing so the right travellers join.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {departurePreferences.map((pref) => {
                  const active = preferences.includes(pref)
                  return (
                    <button
                      key={pref}
                      type="button"
                      aria-pressed={active}
                      onClick={() => togglePreference(pref)}
                      className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        active ? 'border-forest bg-forest text-sand' : 'border-line bg-white text-charcoal/80 hover:border-forest/40'
                      }`}
                    >
                      {pref}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="border-t border-line pt-6">
              <h2 className="text-xl">Your details</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
                You are claiming a seat too, so we need the same details as any other traveller.
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

            {tour && date && (
              <dl className="space-y-2 rounded-xl border border-line bg-sand/40 p-4 text-sm">
                <Row label="Trip" value={tour.title} />
                <Row label="Date" value={formatDateLong(date)} />
                <Row label="Seats you are claiming" value={`${seats} of 3`} />
                <Row label="Deposit today" value={formatPrice(seats * DEPOSIT_PER_SEAT)} strong />
                <Row
                  label="Balance once the car fills"
                  value={formatPrice(seats * tour.sharedSeatPrice - seats * DEPOSIT_PER_SEAT)}
                />
              </dl>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          {step === 0 ? (
            <Link to="/trips" className="btn btn-quiet">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Browse existing cars
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button type="button" className="btn btn-forest sm:min-w-44" onClick={goNext}>
              {step === 2 && flexibleDates.length === 0 ? 'Skip for now' : 'Continue'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary sm:min-w-56"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Starting your car…
                </>
              ) : (
                <>
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Start this car · {formatPrice(seats * DEPOSIT_PER_SEAT)} (demo)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? 'font-semibold text-forest' : 'text-charcoal/70'}>{label}</dt>
      <dd className={`text-right ${strong ? 'font-semibold text-forest' : 'text-charcoal/85'}`}>
        {value}
      </dd>
    </div>
  )
}
