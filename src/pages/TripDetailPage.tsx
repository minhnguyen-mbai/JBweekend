import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CloudRain,
  Clock,
  Gift,
  MapPin,
  Share2,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'
import { tourBySlug } from '../data/tours'
import { hostById } from '../data/hosts'
import { useApp } from '../state/appContext'
import { upcomingTrips } from '../lib/trips'
import { deriveStatus, primaryCtaLabel, seatHeadline, seatsLeft } from '../lib/seats'
import { formatDateLong, formatDateShort, formatDeadline, formatPrice } from '../lib/format'
import { TourArt } from '../components/TourArt'
import { SeatProgress } from '../components/SeatProgress'
import { StatusBadge } from '../components/StatusBadge'
import { TravellerChip } from '../components/TravellerAvatars'
import { HostCard } from '../components/HostCard'
import { ItineraryTimeline } from '../components/ItineraryTimeline'
import { InclusionList } from '../components/InclusionList'
import { FaqAccordion } from '../components/FaqAccordion'
import { BookingPanel } from '../components/BookingPanel'
import type { BookingMode } from '../components/BookingPanel'
import { ShareModal } from '../components/ShareModal'
import { NotFoundPage } from './NotFoundPage'
import { sharedFaqs } from '../data/faqs'

export function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [params, setParams] = useSearchParams()
  const { state, bookingForDeparture } = useApp()
  const [mode, setMode] = useState<BookingMode>('shared')
  const [seats, setSeats] = useState(1)
  const [shareOpen, setShareOpen] = useState(false)

  const tour = slug ? tourBySlug(slug) : undefined

  const tourDepartures = useMemo(
    () => upcomingTrips(state.departures).filter((t) => t.tour.slug === slug),
    [state.departures, slug],
  )

  const requestedId = params.get('d')
  const selected =
    tourDepartures.find((t) => t.departure.id === requestedId) ??
    tourDepartures.find((t) => deriveStatus(t.departure) === 'almost_full') ??
    tourDepartures[0]

  const departure = selected?.departure
  const status = departure ? deriveStatus(departure) : 'open'
  const left = departure ? seatsLeft(departure) : 0
  const referred = params.get('ref')

  // Derived rather than stored, so switching car or mode can never leave an illegal count.
  const selectableSeats =
    mode === 'shared' && departure ? Math.min(seats, Math.max(1, Math.min(2, left))) : seats

  if (!tour) return <NotFoundPage />

  const host = departure ? hostById(departure.hostId) : hostById('host-amirul')
  const existingBooking = departure ? bookingForDeparture(departure.id) : undefined

  return (
    <div className="pb-28 md:pb-0">
      {/* ---------------- Hero ---------------- */}
      <section className="relative">
        <div className="relative h-[280px] sm:h-[360px] lg:h-[440px]">
          <TourArt
            image={tour.heroImage}
            title={`${tour.title} — ${tour.hook}`}
            focus="horizon"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/10" />
          <div className="wrap absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
            <Link
              to="/trips"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sand/85 underline-offset-4 transition hover:text-sand hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All departures
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {departure && <StatusBadge status={status} />}
              {tour.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-sand/15 px-2.5 py-1 text-xs font-semibold text-sand ring-1 ring-sand/25"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl text-sand sm:text-5xl">{tour.title}</h1>
            <p className="mt-2 max-w-2xl text-base text-sand/90 sm:text-lg">{tour.hook}</p>
          </div>
        </div>
      </section>

      {referred && (
        <div className="border-b border-gold/30 bg-gold-soft">
          <p className="wrap flex items-center gap-2 py-3 text-sm text-charcoal/80">
            <Gift className="size-4 shrink-0 text-gold" aria-hidden="true" />
            You opened an invite link. Claim a seat and you will be in the same car as the traveller
            who sent it.
          </p>
        </div>
      )}

      <div className="wrap grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:py-12">
        {/* ---------------- Main column ---------------- */}
        <div className="min-w-0">
          {/* Departure picker */}
          <section aria-labelledby="dates-heading">
            <h2 id="dates-heading" className="text-lg">
              Pick your departure
            </h2>
            <p className="mt-1 text-sm text-charcoal/70">
              {tourDepartures.length > 0
                ? 'Each date is its own car with its own three seats.'
                : 'No scheduled cars for this trip right now.'}
            </p>
            <div className="no-scrollbar -mx-5 mt-3 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {tourDepartures.map(({ departure: dep }) => {
                const active = dep.id === departure?.id
                const depStatus = deriveStatus(dep)
                const depLeft = seatsLeft(dep)
                return (
                  <button
                    key={dep.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setParams(
                        (prev) => {
                          const next = new URLSearchParams(prev)
                          next.set('d', dep.id)
                          return next
                        },
                        { replace: true },
                      )
                    }
                    className={`w-40 shrink-0 rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-forest bg-forest text-sand'
                        : 'border-line bg-white hover:border-forest/40'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{formatDateShort(dep.date)}</span>
                    <span className={`mt-0.5 block text-xs ${active ? 'text-sand/70' : 'text-sage'}`}>
                      {dep.startTime}–{dep.endTime}
                    </span>
                    <span
                      className={`mt-2 block text-xs font-semibold ${
                        active
                          ? 'text-gold'
                          : depStatus === 'almost_full'
                            ? 'text-coral-dark'
                            : 'text-forest'
                      }`}
                    >
                      {depStatus === 'confirmed' || depStatus === 'private'
                        ? 'Confirmed · waitlist'
                        : depLeft === 1
                          ? '1 seat left'
                          : `${depLeft} seats left`}
                    </span>
                  </button>
                )
              })}
              <Link
                to="/start-trip"
                className="flex w-40 shrink-0 flex-col justify-center rounded-xl border border-dashed border-sage/50 bg-white p-3 text-left transition hover:border-forest/50"
              >
                <span className="text-sm font-semibold text-forest">Another date</span>
                <span className="mt-0.5 text-xs text-sage">Start your own car</span>
              </Link>
            </div>
          </section>

          {departure ? (
            <>
              {/* Availability block — deliberately above the itinerary */}
              <section
                className="card mt-6 p-5 sm:p-6"
                aria-labelledby="seats-heading"
                id="seats"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 id="seats-heading" className="text-xl">
                      {formatDateLong(departure.date)}
                    </h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal/75">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4 text-sage" aria-hidden="true" />
                        {departure.startTime}–{departure.endTime} · {tour.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-4 text-sage" aria-hidden="true" />
                        Meets at JB CIQ
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="btn btn-quiet px-3.5 py-2 text-sm"
                  >
                    <Share2 className="size-4" aria-hidden="true" />
                    Share
                  </button>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                  <SeatProgress departure={departure} size="lg" />
                  <div className="sm:border-l sm:border-line sm:pl-5">
                    <p className="text-[15px] font-semibold text-forest">{seatHeadline(departure)}</p>
                    <p className="mt-2 flex items-start gap-2 text-sm text-charcoal/75">
                      <CalendarClock className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden="true" />
                      <span>
                        {status === 'confirmed' || status === 'private'
                          ? 'This trip is confirmed and running.'
                          : `Confirms by ${formatDeadline(departure.confirmationDeadline)}.`}
                      </span>
                    </p>
                    <p className="mt-2 flex items-start gap-2 text-sm text-charcoal/75">
                      <Ticket className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden="true" />
                      <span>
                        {formatPrice(tour.sharedSeatPrice)} per seat · whole car{' '}
                        {formatPrice(tour.privatePrice)} · all-inclusive
                      </span>
                    </p>
                  </div>
                </div>

                {departure.preferences && departure.preferences.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {departure.preferences.map((pref) => (
                      <li
                        key={pref}
                        className="rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal"
                      >
                        {pref}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Booking panel, inline on mobile and tablet */}
              <BookingPanel
                tour={tour}
                departure={departure}
                mode={mode}
                onModeChange={setMode}
                seats={selectableSeats}
                onSeatsChange={setSeats}
                alreadyBooked={Boolean(existingBooking)}
                className="mt-6 lg:hidden"
              />

              {/* Travellers */}
              <section className="mt-10" aria-labelledby="travellers-heading">
                <h2 id="travellers-heading" className="text-xl">
                  Who is already in this car
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-charcoal/75">
                  Before a trip is confirmed you see a first name, age range, languages and one
                  travel vibe — enough to know who you are sharing a back seat with, and nothing
                  more. Contact details are never shown.
                </p>
                {departure.travellers.length > 0 ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {departure.travellers.map((traveller) => (
                      <TravellerChip key={traveller.id} traveller={traveller} />
                    ))}
                    {left > 0 && (
                      <li className="flex items-center gap-3 rounded-xl border border-dashed border-sage/50 bg-white/60 p-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-dashed border-sage/50 text-sage">
                          <Users className="size-4" aria-hidden="true" />
                        </span>
                        <p className="text-sm text-sage">
                          {left === 1 ? 'One seat still open' : `${left} seats still open`}
                        </p>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-sage/50 bg-white/60 p-4 text-sm text-sage">
                    Nobody has claimed a seat yet. Start this car and the next two travellers join
                    you.
                  </p>
                )}
              </section>

              {/* Host */}
              <section className="mt-10" aria-labelledby="host-heading">
                <h2 id="host-heading" className="sr-only">
                  Your local host
                </h2>
                <HostCard host={host} />
              </section>
            </>
          ) : (
            <section className="card mt-6 p-6">
              <h2 className="text-xl">No scheduled car for this trip yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                This route runs on request at the moment. Start a car on the date you want and other
                travellers can claim the remaining seats.
              </p>
              <Link to="/start-trip" className="btn btn-primary mt-4">
                Start this trip
              </Link>
            </section>
          )}

          {/* Itinerary */}
          <section className="mt-10" aria-labelledby="itinerary-heading">
            <h2 id="itinerary-heading" className="text-xl">
              The day, hour by hour
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-charcoal/75">
              {tour.shortDescription}
            </p>
            <div className="mt-5">
              <ItineraryTimeline items={tour.itinerary} />
            </div>
          </section>

          {/* Inclusions */}
          <section className="mt-10" aria-labelledby="included-heading">
            <h2 id="included-heading" className="text-xl">
              Included and not included
            </h2>
            <div className="mt-5">
              <InclusionList included={tour.included} excluded={tour.excluded} />
            </div>
          </section>

          {/* Meeting point + policies */}
          <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-labelledby="logistics-heading">
            <h2 id="logistics-heading" className="sr-only">
              Meeting point and policies
            </h2>
            <InfoCard Icon={MapPin} title="Where the trip begins">
              Everyone meets at <strong>JB CIQ</strong>, {tour.meetingPoint.toLowerCase()}, at{' '}
              {departure?.startTime ?? tour.defaultStartTime}. You cross the Singapore–Malaysia
              border on your own — by bus, taxi or on foot — and your host meets you on the Johor
              side. The exact map pin, your host&apos;s phone number and the group chat are released
              as soon as the car is confirmed.
            </InfoCard>
            <InfoCard Icon={ShieldCheck} title="Cancellation and refunds">
              Free cancellation more than <strong>48 hours</strong> before departure. Inside 48
              hours the S$30 deposit per seat is forfeited. If JB Weekend cancels a trip for any
              reason, you get a full refund including the deposit. If the car never fills, you
              choose a refund, another date, or a private upgrade.
            </InfoCard>
            <InfoCard Icon={CloudRain} title="If the weather turns">
              {tour.weatherPlan}
            </InfoCard>
            <InfoCard Icon={BadgeCheck} title="Trust and safety">
              Your host is identity-checked, licensed and insured for this vehicle. Every traveller
              verifies a phone number and email, agrees to the traveller code of conduct and gives
              an emergency contact.{' '}
              <Link to="/safety" className="font-semibold text-teal underline underline-offset-4">
                Read the full safety page
              </Link>
              .
            </InfoCard>
          </section>

          {/* FAQ */}
          <section className="mt-10" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl">
              Questions people actually ask
            </h2>
            <div className="mt-5">
              <FaqAccordion items={[...tour.faqs, ...sharedFaqs]} />
            </div>
          </section>
        </div>

        {/* ---------------- Sticky sidebar (desktop) ---------------- */}
        {departure && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel
                tour={tour}
                departure={departure}
                mode={mode}
                onModeChange={setMode}
                seats={selectableSeats}
                onSeatsChange={setSeats}
                alreadyBooked={Boolean(existingBooking)}
              />
            </div>
          </aside>
        )}
      </div>

      {/* ---------------- Sticky CTA (mobile) ---------------- */}
      {departure && (
        <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <SeatProgress departure={departure} size="sm" showLabel={false} />
              <p
                className={`mt-1 truncate text-xs font-semibold ${
                  left === 1 ? 'text-coral-dark' : 'text-forest'
                }`}
              >
                {status === 'confirmed' || status === 'private'
                  ? 'Confirmed · waitlist open'
                  : `${departure.seatsClaimed}/3 claimed · ${formatPrice(tour.sharedSeatPrice)} a seat`}
              </p>
            </div>
            <Link
              to={`/book/${departure.id}?type=${
                status === 'confirmed' || status === 'private' ? 'waitlist' : 'shared'
              }&seats=1`}
              className={`btn shrink-0 ${status === 'almost_full' ? 'btn-primary' : 'btn-forest'} px-4 py-3 text-sm`}
            >
              {primaryCtaLabel(departure)}
            </Link>
          </div>
        </div>
      )}

      {departure && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          tour={tour}
          departure={departure}
          shareCode={existingBooking?.shareCode}
        />
      )}
    </div>
  )
}

function InfoCard({
  Icon,
  title,
  children,
}: {
  Icon: typeof MapPin
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 text-base">
        <Icon className="size-4 text-teal" aria-hidden="true" />
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{children}</p>
    </div>
  )
}
