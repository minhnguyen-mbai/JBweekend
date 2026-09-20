import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Car,
  Compass,
  Handshake,
  MapPin,
  MessageSquareQuote,
  PiggyBank,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from 'lucide-react'
import { useApp } from '../state/appContext'
import { tours } from '../data/tours'
import { hosts } from '../data/hosts'
import { reviews } from '../data/reviews'
import { upcomingTrips } from '../lib/trips'
import { deriveStatus, seatHeadline, seatsLeft } from '../lib/seats'
import { formatDateShort, formatDeadline, formatPrice } from '../lib/format'
import { useSimulatedLoad } from '../lib/useSimulatedLoad'
import { TripCard } from '../components/TripCard'
import { TripGridSkeleton } from '../components/Skeleton'
import { SeatProgress } from '../components/SeatProgress'
import { StatusBadge } from '../components/StatusBadge'
import { SectionHeading } from '../components/SectionHeading'
import { TourArt } from '../components/TourArt'
import { HostCard } from '../components/HostCard'

const quickFilters = [
  { label: 'This weekend', to: '/trips?f=this_weekend' },
  { label: 'Next weekend', to: '/trips?f=next_weekend' },
  { label: 'Food', to: '/trips?f=food' },
  { label: 'Adventure', to: '/trips?f=adventure' },
  { label: 'Nature', to: '/trips?f=nature' },
  { label: 'Almost full', to: '/trips?f=almost_full' },
]

const vibes = [
  {
    slug: 'kampung-table',
    title: 'Eat where they eat',
    copy: 'Kopitiams, an afternoon market and a fishing-village dinner your feed has never seen.',
    to: '/trips?f=food',
  },
  {
    slug: 'petrolhead-night',
    title: 'Race, eat, recover',
    copy: 'Two circuits, a leaderboard, bak kut teh and ninety minutes of sports massage.',
    to: '/trips?f=adventure',
  },
  {
    slug: 'end-of-asia',
    title: 'Chase the west coast',
    copy: 'Mangrove boardwalks, a stilt village and dinner facing the sunset at Pontian.',
    to: '/trips?f=nature',
  },
]

const groupReasons = [
  {
    Icon: Users,
    title: 'One car, one conversation',
    copy: 'Three travellers and your host. Nobody is shouting from the back of a coach, and nobody waits for stragglers.',
  },
  {
    Icon: Wallet,
    title: 'Private-car access, shared price',
    copy: 'A seat is S$119 instead of S$350 for the whole car. Same vehicle, same host, same stops.',
  },
  {
    Icon: MapPin,
    title: 'Routes that need a local',
    copy: 'Stilt villages, night circuits and back-lane dessert shops do not work on a fixed coach itinerary.',
  },
  {
    Icon: PiggyBank,
    title: 'It fills or you are refunded',
    copy: 'Three seats is a low bar. If the car does not fill by the deadline, you choose a refund, a new date, or a private upgrade.',
  },
]

const trustPoints = [
  { Icon: BadgeCheck, title: 'Verified hosts', copy: 'Identity, licence, insurance and background screening checked before a host drives.' },
  { Icon: ShieldCheck, title: 'Verified travellers', copy: 'Every seat is tied to a verified phone number and email. No anonymous bookings.' },
  { Icon: Users, title: 'Three travellers, maximum', copy: 'The group size is fixed by the car. No surprise additions on the day.' },
  { Icon: MapPin, title: 'One fixed meeting point', copy: 'Every trip starts and ends at JB CIQ. Exact instructions are released once confirmed.' },
  { Icon: Handshake, title: 'Traveller code of conduct', copy: 'Agreed by everyone at checkout, and enforced. Report anything and we act the same day.' },
  { Icon: Wallet, title: 'Refund protection', copy: 'Free cancellation up to 48 hours before, and a full refund if we cancel a trip.' },
]

export function HomePage() {
  const { state } = useApp()
  const loading = useSimulatedLoad('home-departures')
  const trips = upcomingTrips(state.departures)
  const featured = trips.find((t) => deriveStatus(t.departure) === 'almost_full') ?? trips[0]
  const nextTrips = trips.slice(0, 6)

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-line bg-sand">
        <div className="wrap grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="size-4 text-gold" aria-hidden="true" />
              Singapore → Johor · Weekend departures
            </p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.05] sm:text-6xl">
              Your next JB weekend already has a seat.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal/80">
              Join a three-person private car, follow a local host, and discover the Johor most
              day-trippers miss.
            </p>
            <p className="mt-3 max-w-xl text-[15px] font-medium text-forest">
              Pick a trip. Claim a seat. Go when the car fills.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/trips" className="btn btn-primary px-6 text-base">
                Find upcoming trips
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link to="/start-trip" className="btn btn-outline px-6 text-base">
                Start a trip
              </Link>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-sage">
              <span>Small groups</span>
              <span aria-hidden="true">·</span>
              <span>All-inclusive</span>
              <span aria-hidden="true">·</span>
              <span>Pick-up at JB CIQ</span>
            </p>
          </div>

          {featured && (
            <div className="relative">
              <div className="overflow-hidden rounded-[1.5rem] border border-line shadow-lift">
                <div className="relative aspect-[4/3] sm:aspect-[16/11]">
                  <TourArt
                    image={featured.tour.heroImage}
                    title={`${featured.tour.title} — ${featured.tour.hook}`}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent p-5 pt-16">
                    <StatusBadge status={deriveStatus(featured.departure)} size="sm" />
                    <h2 className="mt-2 text-2xl text-sand">{featured.tour.title}</h2>
                    <p className="text-sm text-sand/85">
                      {formatDateShort(featured.departure.date)} · {featured.departure.startTime}–
                      {featured.departure.endTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card mx-4 -mt-10 p-4 sm:mx-8 sm:p-5">
                <SeatProgress departure={featured.departure} size="md" />
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                  {seatHeadline(featured.departure)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm">
                    <span className="font-display text-lg font-semibold text-forest">
                      {formatPrice(featured.tour.sharedSeatPrice)}
                    </span>
                    <span className="text-sage"> / seat</span>
                  </p>
                  <Link
                    to={`/trips/${featured.tour.slug}?d=${featured.departure.id}`}
                    className="btn btn-primary px-4 py-2.5 text-sm"
                  >
                    {seatsLeft(featured.departure) === 1 ? 'Claim the final seat' : 'Claim a seat'}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Quick filters ---------------- */}
      <section className="border-b border-line bg-white/60" aria-label="Quick trip filters">
        <div className="wrap py-5">
          <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            <span className="shrink-0 pr-1 text-xs font-semibold uppercase tracking-wider text-sage">
              Jump to
            </span>
            {quickFilters.map((f) => (
              <Link
                key={f.label}
                to={f.to}
                className="shrink-0 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-charcoal/80 transition hover:border-forest/40 hover:text-forest"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Upcoming departures ---------------- */}
      <section className="wrap py-14 sm:py-16">
        <SectionHeading
          eyebrow="Cars filling now"
          title="Upcoming departures"
          description="We run a small number of scheduled cars each month so seats actually fill. Claim one, or start a new car on a date that suits you."
          action={
            <Link to="/trips" className="btn btn-quiet">
              See all trips
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-8">
          {loading ? (
            <TripGridSkeleton count={3} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {nextTrips.slice(0, 3).map(({ departure, tour }) => (
                <TripCard key={departure.id} departure={departure} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- How shared trips work ---------------- */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-14 sm:py-16">
          <SectionHeading
            eyebrow="How it works"
            title="How shared trips work"
            description="Three seats per car. A trip is confirmed the moment the third one is claimed — and if it never fills, you are never out of pocket."
          />
          <ol className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              {
                Icon: Compass,
                step: 'Step one',
                title: 'Pick a trip and a date',
                copy: 'Three routes, a handful of dates each month. Every car shows exactly how many seats are already claimed.',
              },
              {
                Icon: CalendarCheck,
                step: 'Step two',
                title: 'Claim your seat for S$30',
                copy: 'A refundable S$30 deposit per seat holds your place. The balance is only due once the trip is confirmed.',
              },
              {
                Icon: Car,
                step: 'Step three',
                title: 'Go when the car fills',
                copy: 'Third seat claimed means confirmed. You get the meeting instructions, your host details and the group chat.',
              },
            ].map(({ Icon, step, title, copy }) => (
              <li key={title} className="card p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-forest-soft text-forest">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="eyebrow mt-4">{step}</p>
                <h3 className="mt-1.5 text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-4 rounded-[1.25rem] border border-gold/30 bg-gold-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-lg">What if the car does not fill?</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/80">
                Confirmation closes two days before departure at 8:00 PM. If the third seat is still
                open, you choose: a full refund, move your deposit to another departure, or upgrade
                to a private car at the private rate. We never quietly cancel on you.
              </p>
            </div>
            <Link to="/safety" className="btn btn-forest shrink-0">
              Read the policies
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Choose your vibe ---------------- */}
      <section className="wrap py-14 sm:py-16">
        <SectionHeading
          eyebrow="Choose your vibe"
          title="Three trips, three completely different weekends"
          description="Each route is built and driven by a host who lives there. No coach, no gift-shop stops, no filler."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {vibes.map((vibe) => {
            const tour = tours.find((t) => t.slug === vibe.slug)
            if (!tour) return null
            return (
              <Link
                key={vibe.slug}
                to={`/trips/${tour.slug}`}
                className="card group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <TourArt
                    image={tour.heroImage}
                    title={`${tour.title} — ${tour.hook}`}
                    className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sand/80">
                      {tour.title}
                    </p>
                    <h3 className="mt-0.5 text-xl text-sand">{vibe.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-relaxed text-charcoal/75">{vibe.copy}</p>
                  <p className="mt-3 flex items-center justify-between text-sm font-semibold text-forest">
                    {formatPrice(tour.sharedSeatPrice)} per seat
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ---------------- Why three ---------------- */}
      <section className="border-y border-line bg-forest text-sand">
        <div className="wrap py-14 sm:py-16">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Why three seats</p>
            <h2 className="mt-2 text-2xl text-sand sm:text-3xl">
              Why travel in a three-person group
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-sand/80">
              One car holds four people. Your host takes the wheel, which leaves exactly three seats
              — small enough to stay personal, large enough to make a private car affordable.
            </p>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {groupReasons.map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-[1.25rem] border border-sand/15 bg-sand/5 p-5">
                <Icon className="size-5 text-gold" aria-hidden="true" />
                <h3 className="mt-3 text-base text-sand">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Hosts ---------------- */}
      <section className="wrap py-14 sm:py-16">
        <SectionHeading
          eyebrow="Your local host"
          title="Driven and guided by someone who lives there"
          description="Every JB Weekend car is driven by one of three hosts. They set the route, make the reservations, order for the table and get you back to CIQ on time."
          action={
            <Link to="/safety" className="btn btn-quiet">
              How hosts are verified
            </Link>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>

      {/* ---------------- Trust and safety ---------------- */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-14 sm:py-16">
          <SectionHeading
            eyebrow="Trust and safety"
            title="Travelling with strangers, designed carefully"
            description="You are getting into a car with two other travellers and a host. Here is exactly what we check, and what we promise."
            action={
              <Link to="/safety" className="btn btn-forest">
                Full safety page
              </Link>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map(({ Icon, title, copy }) => (
              <div key={title} className="flex gap-3.5 rounded-[1.25rem] border border-line bg-sand/40 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-teal">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-charcoal/75">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Trip memories ---------------- */}
      <section className="wrap py-14 sm:py-16">
        <SectionHeading
          eyebrow="Trip memories"
          title="What early travellers said"
          description="JB Weekend has run a small number of cars so far. These are all of the reviews, not a curated highlight reel."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => {
            const tour = tours.find((t) => t.id === review.tourId)
            return (
              <figure key={review.id} className="card flex h-full flex-col p-5">
                <Quote className="size-5 text-gold" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-charcoal/80">
                  {review.quote}
                </blockquote>
                <figcaption className="mt-4 border-t border-line pt-3">
                  <p className="text-sm font-semibold text-forest">
                    {review.firstName}, {review.ageRange}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-sage">
                    <span className="flex" aria-label={`${review.rating} out of 5`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${i < review.rating ? 'fill-gold text-gold' : 'text-sage/40'}`}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                    {tour?.title} · {review.month}
                  </p>
                </figcaption>
              </figure>
            )
          })}
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-sage">
          <MessageSquareQuote className="size-4" aria-hidden="true" />
          Reviews can only be left by travellers who completed a confirmed departure.
        </p>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="wrap pb-16">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-line">
          <TourArt
            image="end-of-asia"
            title="Sunset over the Johor coast"
            focus="horizon"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="relative bg-charcoal/72 px-6 py-14 text-center sm:px-10 sm:py-16">
            <h2 className="mx-auto max-w-2xl text-3xl text-sand sm:text-4xl">
              Three seats. One local host. A different side of Johor.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-sand/85">
              Claim a seat in a car that is already forming, or start a new one on the date you
              actually have free.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/trips" className="btn btn-primary px-6 text-base">
                Find upcoming trips
              </Link>
              <Link
                to="/start-trip"
                className="btn border-sand/40 bg-transparent px-6 text-base text-sand hover:bg-sand/10"
              >
                Start a trip
              </Link>
            </div>
            <p className="mt-5 text-xs text-sand/70">
              {featured
                ? `Next car out: ${featured.tour.title}, confirms by ${formatDeadline(
                    featured.departure.confirmationDeadline,
                  )}.`
                : 'New departures are added every week.'}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
