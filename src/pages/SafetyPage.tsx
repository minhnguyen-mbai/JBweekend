import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Car,
  FileText,
  Flag,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { FaqAccordion } from '../components/FaqAccordion'

const pillars = [
  {
    Icon: BadgeCheck,
    title: 'Verified hosts',
    copy: 'Before anyone drives for JB Weekend we check government ID, a valid Malaysian driving licence, vehicle registration and insurance, and run a background screening. Hosts are reviewed after every trip and removed if standards slip.',
  },
  {
    Icon: Phone,
    title: 'Verified travellers',
    copy: 'Every seat is tied to a verified mobile number and email address. There are no anonymous bookings, and the same details are used if we need to reach you on the day.',
  },
  {
    Icon: Users,
    title: 'Three travellers, never more',
    copy: 'Group size is fixed by the car, not by demand. Three paying travellers plus your host — nobody is added at the last minute, and the trip never becomes a coach tour.',
  },
  {
    Icon: MapPin,
    title: 'One fixed meeting point',
    copy: 'Every trip starts and ends at JB CIQ. You cross the border independently, so you are never picked up from your home address and your address is never shared.',
  },
  {
    Icon: LifeBuoy,
    title: 'Emergency contact on file',
    copy: 'Each traveller gives an emergency contact at booking. It is visible only to JB Weekend operations, never to your host or the other travellers, and is used only if something goes wrong.',
  },
  {
    Icon: Wallet,
    title: 'Refund protection',
    copy: 'Free cancellation more than 48 hours before departure. If a car does not fill, you choose a refund, another date, or a private upgrade. If we cancel a trip, you get everything back including the deposit.',
  },
]

const conductRules = [
  'Be at JB CIQ at the stated meeting time. The car leaves on schedule out of respect for the other two travellers.',
  'Treat your host and your companions the way you would treat a colleague you have just met.',
  'No alcohol or illegal substances in the vehicle, and no pressuring anyone to drink.',
  'No romantic or sexual advances toward travellers or hosts. JB Weekend is a travel service, not a social matching product.',
  'No photography of other travellers without asking. Ask once, accept a no.',
  'Do not contact other travellers outside the trip chat unless they invite you to.',
  'Follow your host on site safety: circuit briefings, boardwalk rules, jetty edges and tide conditions.',
]

const safetyFaqs = [
  {
    question: 'What happens if I feel uncomfortable during a trip?',
    answer:
      'Tell your host, who can change the seating, adjust the pace or separate the group at a stop. You can also message JB Weekend operations directly from the trip chat at any point, and we will call you. If you choose to leave the trip early, your host arranges safe transport back to JB CIQ at our cost.',
  },
  {
    question: 'How do I report a traveller or a host?',
    answer:
      'Use the report link in the trip chat or reply to your booking email. We acknowledge every report the same day. Serious reports suspend the account involved while we investigate, and we will tell you the outcome. Reports are never shared with the person you reported in a way that identifies you.',
  },
  {
    question: 'Can I request a women-only departure?',
    answer:
      'Yes. When you start a trip you can mark it as a women-only departure, and only women travellers can claim the remaining seats. Existing departures show this on the trip card and the detail page. We will also match a female host where one is available for that route.',
  },
  {
    question: 'What information do the other travellers see about me?',
    answer:
      'Your first name, age range, languages, one travel-vibe tag, your verification badge and your number of completed trips. They never see your surname, contact details, employer, home address or social media.',
  },
  {
    question: 'Is JB Weekend licensed and insured?',
    answer:
      'Placeholder pending verification. Host vehicles carry commercial passenger insurance and hosts hold the relevant Malaysian licences; JB Weekend is in the process of confirming its own tour-operator registration and public liability cover, and this page will state the licence numbers and insurer once that is complete. Until then, please do not treat this as a statement of licensed or insured status, and travel insurance of your own is recommended.',
  },
]

export function SafetyPage() {
  return (
    <div className="pb-6">
      <section className="border-b border-line bg-forest text-sand">
        <div className="wrap py-12 sm:py-16">
          <p className="eyebrow text-gold">Trust and safety</p>
          <h1 className="mt-3 max-w-3xl text-3xl text-sand sm:text-5xl">
            Getting into a car with strangers should feel considered, not brave.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-sand/80">
            JB Weekend is small on purpose. One host, three travellers, one fixed meeting point and
            a written set of rules everyone agrees to before they book. Here is exactly what we
            check, what we promise, and what we cannot claim yet.
          </p>
        </div>
      </section>

      <section className="wrap py-12 sm:py-14">
        <SectionHeading
          eyebrow="What we check"
          title="The six things that make a shared car work"
          description="None of this is unusual. It is simply written down, applied every time, and visible to you before you pay."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ Icon, title, copy }) => (
            <div key={title} className="card p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-soft text-teal">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="conduct" className="border-y border-line bg-white scroll-mt-24">
        <div className="wrap grid gap-8 py-12 sm:py-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">Agreed at checkout</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Traveller code of conduct</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">
              Every traveller ticks this box before a seat is held, and every host agrees to the
              same standard. Breaking it ends the trip and the account.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/trips" className="btn btn-forest">
                See upcoming trips
              </Link>
              <Link to="/start-trip" className="btn btn-quiet">
                Start a women-only car
              </Link>
            </div>
          </div>
          <ul className="space-y-3">
            {conductRules.map((rule) => (
              <li key={rule} className="flex items-start gap-3 rounded-xl border border-line bg-sand/40 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-charcoal/80">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-12 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <Flag className="size-5 text-coral" aria-hidden="true" />
            <h2 className="mt-3 text-lg">Reporting</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
              Report a traveller or host from the trip chat or by replying to your booking email.
              Acknowledged the same day, investigated within three working days, and you are told
              the outcome.
            </p>
          </div>
          <div className="card p-5">
            <MessageSquare className="size-5 text-coral" aria-hidden="true" />
            <h2 className="mt-3 text-lg">Reviews</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
              Only travellers who completed a confirmed departure can leave a review, and reviews
              are published unedited. Hosts cannot remove them. We publish every review we have, not
              a selection.
            </p>
          </div>
          <div className="card p-5">
            <Car className="size-5 text-coral" aria-hidden="true" />
            <h2 className="mt-3 text-lg">Women-only departures</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
              Any car can be started as a women-only departure. Only women travellers can claim the
              remaining seats, and the preference is shown on the trip card before anyone books.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-gold-soft">
        <div className="wrap flex flex-col gap-4 py-10 sm:flex-row sm:items-start">
          <FileText className="size-6 shrink-0 text-gold" aria-hidden="true" />
          <div className="max-w-3xl">
            <h2 className="text-xl">Insurance and licensing — placeholder pending verification</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
              Host vehicles carry commercial passenger insurance and hosts hold the relevant
              Malaysian driving licences, both checked at onboarding. JB Weekend&apos;s own
              tour-operator registration and public liability cover are still being confirmed, and
              this section will list the licence numbers, the insurer and the policy limits once
              that is done. Until it says otherwise here, please do not treat JB Weekend as a
              licensed or insured tour operator, and we recommend your own travel insurance for
              every trip.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-12 sm:py-14">
        <SectionHeading eyebrow="Questions" title="Safety questions we get asked" />
        <div className="mt-6 max-w-3xl">
          <FaqAccordion items={safetyFaqs} />
        </div>
      </section>
    </div>
  )
}
