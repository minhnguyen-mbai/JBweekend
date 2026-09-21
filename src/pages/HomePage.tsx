import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Car,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { useApp } from '../state/appContext'
import { tours } from '../data/tours'
import { hosts } from '../data/hosts'
import { upcomingTrips } from '../lib/trips'
import { deriveStatus, remainingSeats } from '../lib/booking'
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
  { label: 'One seat left', to: '/trips?f=almost_full' },
]

const groupReasons = [
  {
    Icon: Users,
    title: 'One car, one conversation',
    copy: 'Three travellers and your host. No coach, no name badges, nobody waiting for stragglers.',
  },
  {
    Icon: Wallet,
    title: 'A private car at a shared price',
    copy: 'Take a seat instead of the whole car and the same vehicle, host and route cost a fraction.',
  },
  {
    Icon: MapPin,
    title: 'Routes that need a local',
    copy: 'Stilt villages, night circuits and back-lane dessert shops do not work on a fixed coach itinerary.',
  },
  {
    Icon: ShieldCheck,
    title: 'It fills or you are refunded',
    copy: 'If the car does not fill by the deadline: full refund, another date, or upgrade to the whole car.',
  },
]

export function HomePage() {
  const { state } = useApp()
  const loading = useSimulatedLoad('home-departures')
  const trips = upcomingTrips(state.departures)
  const featured = trips.find((t) => deriveStatus(t.departure) === 'almost_full') ?? trips[0]

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="border-b border-line bg-sand">
        <div className="wrap grid items-center gap-8 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-16">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="size-4 text-gold" aria-hidden="true" />
              Singapore → Johor · Weekend departures
            </p>
            <h1 className="mt-3 text-[2.25rem] leading-[1.06] sm:text-5xl lg:text-6xl">
              Your next JB weekend already has a seat.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-charcoal/80">
              Curated Johor day trips in a small car, with three traveller seats and one local host.
            </p>
            <p className="mt-3 flex max-w-xl items-start gap-2 rounded-xl border border-line bg-white/70 p-3 text-sm leading-relaxed text-charcoal/80">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
              Cross the border independently. We pick you up and drop you off at JB CIQ.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/trips" className="btn btn-primary px-6 text-base">
                View available departures
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link to="/start-trip" className="btn btn-outline px-6 text-base">
                Request a date
              </Link>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-sage">
              <span>Three traveller seats</span>
              <span aria-hidden="true">·</span>
              <span>Private car and local host included</span>
              <span aria-hidden="true">·</span>
              <span>Meets at JB CIQ</span>
            </p>
          </div>

          {featured && (
            <div>
              <div className="overflow-hidden rounded-[1.25rem] border border-line shadow-lift">
                <div className="relative aspect-[16/10]">
                  <TourArt
                    image={featured.tour.heroImage}
                    title={`${featured.tour.title} — ${featured.tour.hook}`}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent p-4 pt-14">
                    <StatusBadge status={deriveStatus(featured.departure)} size="sm" />
                    <h2 className="mt-1.5 text-2xl text-sand">{featured.tour.title}</h2>
                    <p className="text-sm text-sand/85">
                      {formatDateShort(featured.departure.date)} · {featured.departure.startTime}–
                      {featured.departure.endTime}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <SeatProgress departure={featured.departure} size="sm" />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-display text-lg font-semibold text-forest">
                        {formatPrice(featured.tour.sharedSeatPrice)}
                      </span>
                      <span className="text-sage"> / seat</span>
                    </p>
                    <Link
                      to={`/trips/${featured.tour.slug}?d=${featured.departure.id}`}
                      className="btn btn-primary min-h-11 px-4 py-2.5 text-sm"
                    >
                      {remainingSeats(featured.departure) === 1 ? 'Claim the final seat' : 'Claim a seat'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Upcoming departures ---------------- */}
      <section className="wrap py-10 sm:py-14">
        <SectionHeading
          eyebrow="Cars filling now"
          title="Upcoming departures"
          description="A small number of scheduled cars each month, so seats actually fill."
          action={
            <Link to="/trips" className="btn btn-quiet">
              See all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />

        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {quickFilters.map((f) => (
            <Link
              key={f.label}
              to={f.to}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line bg-white px-3.5 text-sm font-medium text-charcoal/80 transition hover:border-forest/40 hover:text-forest"
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="mt-5">
          {loading ? (
            <TripGridSkeleton count={3} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.slice(0, 3).map(({ departure, tour }) => (
                <TripCard key={departure.id} departure={departure} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="border-y border-line bg-white">
        <div className="wrap py-10 sm:py-14">
          <SectionHeading
            eyebrow="How it works"
            title="Three seats. Confirmed when the third is claimed."
          />
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: Compass,
                title: 'Pick a route and a date',
                copy: 'Every car shows how many of its three seats are already claimed.',
              },
              {
                Icon: CalendarCheck,
                title: 'Hold your seat for S$30',
                copy: 'A refundable deposit per seat. Book the last seats instead and the full fare is due, because the trip confirms on the spot.',
              },
              {
                Icon: Car,
                title: 'Meet your host at JB CIQ',
                copy: 'Once confirmed you get the meeting instructions, your host details and the trip chat.',
              },
            ].map(({ Icon, title, copy }, i) => (
              <li key={title} className="rounded-[1.25rem] border border-line bg-sand/40 p-4">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage">
                  <Icon className="size-4 text-forest" aria-hidden="true" />
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-lg">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">{copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-col gap-3 rounded-[1.25rem] border border-gold/30 bg-gold-soft p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-charcoal/80">
              <strong className="text-forest">If the car does not fill:</strong> confirmation closes
              two days before departure. You then choose a full refund, moving your deposit to
              another date, or taking the whole car at the private rate.
            </p>
            <Link to="/safety" className="btn btn-forest shrink-0">
              Read the policies
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Routes ---------------- */}
      <section className="wrap py-10 sm:py-14">
        <SectionHeading
          eyebrow="The routes"
          title="Three routes, three completely different days"
          description="Each one is built and driven by a host who lives there."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tours.map((tour) => (
            <Link
              key={tour.slug}
              to={`/trips/${tour.slug}`}
              className="card group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <TourArt
                  image={tour.heroImage}
                  title={`${tour.title} — ${tour.hook}`}
                  className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
                <h3 className="absolute inset-x-0 bottom-0 p-4 text-xl text-sand">{tour.title}</h3>
              </div>
              <div className="p-4">
                <p className="text-sm leading-relaxed text-charcoal/75">{tour.hook}</p>
                <p className="mt-3 flex items-center justify-between text-sm font-semibold text-forest">
                  {formatPrice(tour.sharedSeatPrice)} per seat
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Why three seats ---------------- */}
      <section className="border-y border-line bg-forest text-sand">
        <div className="wrap py-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold">Why three seats</p>
            <h2 className="mt-2 text-2xl text-sand sm:text-3xl">
              Small enough to stay personal, large enough to be affordable
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-sand/80">
              One car holds four people. Your host takes the wheel, which leaves exactly three seats
              to sell.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {groupReasons.map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-[1.25rem] border border-sand/15 bg-sand/5 p-4">
                <Icon className="size-5 text-gold" aria-hidden="true" />
                <h3 className="mt-3 text-base text-sand">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-sand/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Hosts ---------------- */}
      <section className="wrap py-10 sm:py-14">
        <SectionHeading
          eyebrow="Your local host"
          title="Driven and guided by someone who lives there"
          description="Each route is run by one of three hosts. They set the route, make the reservations and get you back to JB CIQ on time."
          action={
            <Link to="/safety" className="btn btn-quiet">
              Safety and trust
            </Link>
          }
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="wrap pb-14">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-line">
          <TourArt
            image="end-of-asia"
            title="Sunset over the Johor coast"
            focus="horizon"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="relative bg-charcoal/72 px-5 py-12 text-center sm:px-10">
            <h2 className="mx-auto max-w-2xl text-2xl text-sand sm:text-4xl">
              Three seats. One local host. A different side of Johor.
            </h2>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/trips" className="btn btn-primary px-6 text-base">
                View available departures
              </Link>
              <Link
                to="/start-trip"
                className="btn border-sand/40 bg-transparent px-6 text-base text-sand hover:bg-sand/10"
              >
                Request a date
              </Link>
            </div>
            {featured && (
              <p className="mt-5 text-xs text-sand/70">
                Next car out: {featured.tour.title}, confirms by{' '}
                {formatDeadline(featured.departure.confirmationDeadline)}.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
