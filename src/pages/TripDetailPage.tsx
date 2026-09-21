import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CloudRain,
  Clock,
  Gift,
  MapPin,
  Minus,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { tourBySlug } from '../data/tours'
import { hostById } from '../data/hosts'
import { sharedFaqs } from '../data/faqs'
import { useApp } from '../state/appContext'
import { upcomingTrips } from '../lib/trips'
import type { BookingKind } from '../lib/booking'
import { deriveStatus, quoteFor, remainingSeats, shortCtaLabel } from '../lib/booking'
import { formatDateLong, formatDateShort, formatDeadline, formatPrice } from '../lib/format'
import { TourArt } from '../components/TourArt'
import { StatusBadge } from '../components/StatusBadge'
import { TravellerChip } from '../components/TravellerAvatars'
import { HostCard } from '../components/HostCard'
import { ItineraryTimeline } from '../components/ItineraryTimeline'
import { InclusionList } from '../components/InclusionList'
import { FaqAccordion } from '../components/FaqAccordion'
import { BookingPanel } from '../components/BookingPanel'
import { ShareModal } from '../components/ShareModal'
import { NotFoundPage } from './NotFoundPage'

export function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [params, setParams] = useSearchParams()
  const { state, bookingForDeparture } = useApp()
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

  // The panel's selection lives in the URL so checkout and Edit stay in sync.
  const kind: BookingKind = params.get('type') === 'private' ? 'private' : 'shared'
  const seatParam = Number(params.get('seats'))
  const seats = Number.isFinite(seatParam) && seatParam > 0 ? seatParam : 1

  function updateSelection(next: { type?: BookingKind; seats?: number; d?: string }) {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (next.d) p.set('d', next.d)
        if (next.type) p.set('type', next.type)
        if (next.seats) p.set('seats', String(next.seats))
        return p
      },
      { replace: true },
    )
  }

  if (!tour) return <NotFoundPage />

  const host = departure ? hostById(departure.hostId) : hostById('host-amirul')
  const existingBooking = departure ? bookingForDeparture(departure.id) : undefined
  const status = departure ? deriveStatus(departure) : 'open'
  const left = departure ? remainingSeats(departure) : 0
  const soldOut = left === 0
  const quote = departure ? quoteFor(tour, departure, kind, seats) : undefined
  const referred = params.get('ref')

  return (
    <div className={departure ? 'pb-28 lg:pb-0' : ''}>
      {/* ---------------- Compact hero ---------------- */}
      <section className="relative h-44 sm:h-56 lg:h-72">
        <TourArt
          image={tour.heroImage}
          title={`${tour.title} — ${tour.hook}`}
          focus="horizon"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/10" />
        <div className="wrap absolute inset-x-0 bottom-0 pb-4">
          <Link
            to="/trips"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-sand/85 underline-offset-4 transition hover:text-sand hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All departures
          </Link>
          <h1 className="mt-1 text-page text-sand">{tour.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-sand/90">{tour.hook}</p>
        </div>
      </section>

      {referred && (
        <p className="wrap flex items-center gap-2 border-b border-gold/30 bg-gold-soft py-3 text-sm text-charcoal/80">
          <Gift className="size-4 shrink-0 text-gold" aria-hidden="true" />
          You opened an invite link — claim a seat to join that car.
        </p>
      )}

      <div className="wrap grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-10 lg:py-10">
        <div className="min-w-0">
          {departure ? (
            <>
              {/* ---------------- Key facts, above the fold ---------------- */}
              <section className="card p-4 sm:p-5" aria-labelledby="facts-heading">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <div className="min-w-0">
                    <StatusBadge status={status} size="sm" />
                    <h2 id="facts-heading" className="mt-2 text-card">
                      {formatDateLong(departure.date)}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    className="btn btn-quiet min-h-11 px-3.5 py-2 text-sm"
                  >
                    <Share2 className="size-4" aria-hidden="true" />
                    Share
                  </button>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <Fact Icon={Clock} label="Time">
                    {departure.startTime}–{departure.endTime} · {tour.duration}
                  </Fact>
                  <Fact Icon={MapPin} label="Meeting point">
                    JB CIQ — you cross the border independently
                  </Fact>
                  <Fact Icon={Users} label="Seats">
                    <span className={left === 1 ? 'font-semibold text-coral-dark' : ''}>
                      {departure.claimedSeats} of {departure.travellerCapacity} claimed
                      {soldOut ? ' · car full' : ` · ${left} left`}
                    </span>
                  </Fact>
                  <Fact Icon={CalendarClock} label="Confirmation">
                    {soldOut
                      ? 'Confirmed — this car is going'
                      : `By ${formatDeadline(departure.confirmationDeadline)}`}
                  </Fact>
                </dl>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-4">
                  <p>
                    <span className="font-display text-2xl font-semibold text-forest">
                      {formatPrice(tour.sharedSeatPrice)}
                    </span>
                    <span className="text-sm text-sage"> per seat</span>
                  </p>
                  <p className="text-sm text-sage">
                    Whole car {formatPrice(tour.privateCarPrice)}
                  </p>
                </div>

                {/* Concise included / not included */}
                <div className="mt-4 grid gap-3 rounded-xl bg-sand/50 p-3.5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-forest">
                      Included
                    </h3>
                    <ul className="mt-1.5 space-y-1">
                      {[
                        kind === 'private'
                          ? 'Private use of the whole car'
                          : 'Small-group car transport in Johor',
                        'Local host who drives and guides',
                        'Pick-up and drop-off at JB CIQ',
                      ].map(
                        (item) => (
                          <li key={item} className="flex items-start gap-1.5 text-xs text-charcoal/80">
                            <Check className="mt-0.5 size-3 shrink-0 text-forest" aria-hidden="true" />
                            {item}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-sage">
                      Not included
                    </h3>
                    <ul className="mt-1.5 space-y-1">
                      {['Food and drinks', 'Tickets and activities', 'Shopping'].map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-charcoal/70">
                          <Minus className="mt-0.5 size-3 shrink-0 text-sage" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-sage sm:col-span-2">
                    <a href="#included" className="inline-flex min-h-11 items-center font-medium text-teal underline underline-offset-2">
                      See the full list
                    </a>
                  </p>
                </div>
              </section>

              {/* ---------------- Other dates ---------------- */}
              <section className="mt-6" aria-labelledby="dates-heading">
                <h2 id="dates-heading" className="text-lg">
                  Other dates for this route
                </h2>
                <div className="no-scrollbar bleed mt-3 flex gap-2.5 overflow-x-auto pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                  {tourDepartures.map(({ departure: dep }) => {
                    const active = dep.id === departure.id
                    const depLeft = remainingSeats(dep)
                    return (
                      <button
                        key={dep.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateSelection({ d: dep.id, seats: 1 })}
                        className={`min-h-11 w-36 shrink-0 rounded-xl border p-3 text-left transition ${
                          active ? 'border-forest bg-forest text-sand' : 'border-line bg-white hover:border-forest/40'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{formatDateShort(dep.date)}</span>
                        <span
                          className={`mt-1 block text-xs font-medium ${
                            active ? 'text-gold' : depLeft === 0 ? 'text-sage' : depLeft === 1 ? 'text-coral-dark' : 'text-forest'
                          }`}
                        >
                          {depLeft === 0 ? 'Car full' : `${depLeft} of 3 left`}
                        </span>
                      </button>
                    )
                  })}
                  <Link
                    to="/start-trip"
                    className="flex min-h-11 w-36 shrink-0 flex-col justify-center rounded-xl border border-dashed border-sage/50 bg-white p-3 transition hover:border-forest/50"
                  >
                    <span className="text-sm font-semibold text-forest">Another date</span>
                    <span className="mt-0.5 text-xs text-sage">Request one</span>
                  </Link>
                </div>
              </section>

              {/* Booking panel inline below tablet width */}
              <BookingPanel
                tour={tour}
                departure={departure}
                kind={kind}
                onKindChange={(k) => updateSelection({ type: k, seats: 1 })}
                seats={seats}
                onSeatsChange={(n) => updateSelection({ seats: n })}
                alreadyBooked={Boolean(existingBooking)}
                className="mt-6 lg:hidden"
              />

              {/* ---------------- Your travel group ---------------- */}
              <section className="mt-8" aria-labelledby="group-heading">
                <h2 id="group-heading" className="text-card">
                  Your travel group
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-charcoal/75">
                  You see a first name and whatever each traveller chose to share. Contact details
                  are never shown.
                </p>
                {departure.travellers.length > 0 ? (
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {departure.travellers.map((traveller) => (
                      <TravellerChip key={traveller.id} traveller={traveller} />
                    ))}
                    {left > 0 && (
                      <li className="flex items-center gap-3 rounded-xl border border-dashed border-sage/50 bg-white/60 p-3 text-sm text-sage">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-dashed border-sage/50">
                          <Users className="size-4" aria-hidden="true" />
                        </span>
                        {left === 1 ? 'One seat still open' : `${left} seats still open`}
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-sage/50 bg-white/60 p-4 text-sm text-sage">
                    No seats claimed yet. Book all three and the trip confirms straight away.
                  </p>
                )}
              </section>

              <section className="mt-8">
                <HostCard host={host} />
              </section>
            </>
          ) : (
            <section className="card p-5">
              <h2 className="text-card">No scheduled car for this route yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                Request the date you want and other travellers can claim the remaining seats.
              </p>
              <Link to="/start-trip" className="btn btn-primary mt-4">
                Request a date
              </Link>
            </section>
          )}

          <section className="mt-8" aria-labelledby="itinerary-heading">
            <h2 id="itinerary-heading" className="text-card">
              The day, hour by hour
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-charcoal/75">
              {tour.shortDescription}
            </p>
            <div className="mt-4">
              <ItineraryTimeline items={tour.itinerary} />
            </div>
          </section>

          <section id="included" className="mt-8 scroll-mt-24" aria-labelledby="included-heading">
            <h2 id="included-heading" className="text-card">
              What your seat covers
            </h2>
            <div className="mt-4">
              <InclusionList included={tour.included} excluded={tour.excluded} />
            </div>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-2" aria-labelledby="logistics-heading">
            <h2 id="logistics-heading" className="sr-only">
              Meeting point and policies
            </h2>
            <InfoCard Icon={MapPin} title="Where the trip begins">
              Everyone meets at <strong>JB CIQ</strong>, {tour.meetingPoint.toLowerCase()}, at{' '}
              {departure?.startTime ?? tour.defaultStartTime}. You cross the Singapore–Malaysia
              border on your own and your host meets you on the Johor side. Exact meeting
              instructions follow once the car is confirmed.
            </InfoCard>
            <InfoCard Icon={ShieldCheck} title="Cancellation and refunds">
              Free cancellation more than <strong>48 hours</strong> before departure. Inside 48
              hours the deposit is forfeited. If the car never fills, you choose a full refund,
              another date, or the whole car at the private rate.
            </InfoCard>
            <InfoCard Icon={CloudRain} title="If the weather turns">
              {tour.weatherPlan}
            </InfoCard>
            <InfoCard Icon={Users} title="Who you travel with">
              Two other travellers who chose the same route and date, plus your host.{' '}
              <Link to="/safety" className="font-semibold text-teal underline underline-offset-4">
                How we handle safety
              </Link>
              .
            </InfoCard>
          </section>

          <section className="mt-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-card">
              Questions people actually ask
            </h2>
            <div className="mt-4">
              <FaqAccordion items={[...tour.faqs, ...sharedFaqs]} />
            </div>
          </section>
        </div>

        {/* ---------------- Sticky panel, desktop ---------------- */}
        {departure && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BookingPanel
                tour={tour}
                departure={departure}
                kind={kind}
                onKindChange={(k) => updateSelection({ type: k, seats: 1 })}
                seats={seats}
                onSeatsChange={(n) => updateSelection({ seats: n })}
                alreadyBooked={Boolean(existingBooking)}
              />
            </div>
          </aside>
        )}
      </div>

      {/* ---------------- Sticky CTA, mobile ---------------- */}
      {departure && quote && (
        <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-40 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-forest">
                {soldOut && kind === 'shared'
                  ? 'Car full'
                  : `${formatPrice(quote.dueToday)} due today`}
              </p>
              <p className={`text-xs ${left === 1 ? 'text-coral-dark' : 'text-sage'}`}>
                {soldOut ? 'Waitlist open' : `${departure.claimedSeats} of 3 claimed`}
              </p>
            </div>
            <Link
              to={
                soldOut && kind === 'shared'
                  ? `/book/${departure.id}?type=waitlist&seats=1`
                  : `/book/${departure.id}?type=${kind}&seats=${quote.seats}`
              }
              className={`btn min-h-11 shrink-0 ${status === 'almost_full' ? 'btn-primary' : 'btn-forest'} px-4 text-sm`}
            >
              {soldOut && kind === 'shared'
                ? 'Join waitlist'
                : kind === 'private'
                  ? 'Book whole car'
                  : shortCtaLabel(departure)}
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

function Fact({
  Icon,
  label,
  children,
}: {
  Icon: typeof Clock
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-sage">{label}</dt>
        <dd className="mt-0.5 text-sm text-charcoal/85">{children}</dd>
      </div>
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
    <div className="card p-4">
      <h3 className="flex items-center gap-2 text-base">
        <Icon className="size-4 shrink-0 text-teal" aria-hidden="true" />
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{children}</p>
    </div>
  )
}
