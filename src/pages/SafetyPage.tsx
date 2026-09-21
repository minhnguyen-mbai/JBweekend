import { Link } from 'react-router-dom'
import { Car, FileText, MapPin, MessageSquare, Phone, ShieldCheck, Users, Wallet } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { FaqAccordion } from '../components/FaqAccordion'

/**
 * Every claim here describes something the product actually does today.
 * Anything still being built is labelled as such rather than implied.
 */
const pillars = [
  {
    Icon: Users,
    title: 'Three travellers, never more',
    copy: 'Group size is fixed by the car, not by demand. Three traveller seats plus your host — nobody is added at the last minute, and the trip never becomes a coach tour.',
  },
  {
    Icon: MapPin,
    title: 'One fixed meeting point',
    copy: 'Every trip starts and ends at JB CIQ. You cross the border independently, so we never collect you from home and your address is never shared.',
  },
  {
    Icon: Phone,
    title: 'A real contact for every booking',
    copy: 'Each booking carries a mobile number and email. We use them to reach you about the trip, and your host gets your number on the day. They are never shown to other travellers.',
  },
  {
    Icon: Car,
    title: 'The same host all day',
    copy: 'One local host drives and guides the whole route. You know who you are travelling with before you book, and that does not change on the day.',
  },
  {
    Icon: Wallet,
    title: 'Refund protection',
    copy: 'Free cancellation more than 48 hours before departure. If a car does not fill you choose a refund, another date, or the whole car. If we cancel a trip, you get everything back.',
  },
  {
    Icon: ShieldCheck,
    title: 'Clear prices, no surprises',
    copy: 'Your seat covers the car, the host and the itinerary. Food, tickets and activities are paid as you go, and every route page lists exactly what is and is not included.',
  },
]

const conductRules = [
  'Be at JB CIQ at the stated meeting time. The car leaves on schedule out of respect for the other travellers.',
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
      'Tell your host, who can change the seating, adjust the pace or separate the group at a stop. You can also contact JB Weekend directly using the number on your booking confirmation. If you choose to leave the trip early, your host arranges transport back to JB CIQ at our cost.',
  },
  {
    question: 'How do I report a traveller or a host?',
    answer:
      'Reply to your booking email or call the number on your confirmation. We acknowledge every report the same day and tell you the outcome. Reports are never shared with the person you reported in a way that identifies you.',
  },
  {
    question: 'What information do the other travellers see about me?',
    answer:
      'Your first name, plus anything you chose to add under Trip preferences — an age range, a preferred language and up to three travel preferences. All of that is optional. They never see your surname, contact details, employer, home address or social media.',
  },
  {
    question: 'Can I ask for a women-only car?',
    answer:
      'You can mark a date you request as a women-only departure, and it is shown on the trip card so travellers know before they book. We review the bookings on those cars by hand — it is a manual process today, not an automated restriction, so tell us if anything looks wrong.',
  },
  {
    question: 'Are hosts screened, and is JB Weekend licensed and insured?',
    answer:
      'Being built, and we will not claim otherwise. Hosts are people we know personally and have travelled with, and each holds the Malaysian licence required to drive their own vehicle. A formal screening process, our tour-operator registration and public liability cover are all still being set up, and this page will name the checks, the licence numbers and the insurer once they exist. Until it does, please arrange your own travel insurance.',
  },
]

export function SafetyPage() {
  return (
    <div className="pb-6">
      <section className="border-b border-line bg-forest text-sand">
        <div className="wrap py-10 sm:py-14">
          <p className="eyebrow text-gold">Trust and safety</p>
          <h1 className="mt-3 max-w-3xl text-page text-sand">
            Getting into a car with strangers should feel considered, not brave.
          </h1>
          <p className="mt-4 max-w-2xl copy text-sand/80">
            JB Weekend is small on purpose: one host, three travellers, one fixed meeting point and
            a written set of rules everyone agrees to. Below is what we actually do today — and,
            just as plainly, what we are still building.
          </p>
        </div>
      </section>

      <section className="wrap py-10 sm:py-14">
        <SectionHeading
          eyebrow="What we do today"
          title="Six things that make a shared car work"
          description="None of this is unusual. It is simply written down, applied every time, and visible before you pay."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ Icon, title, copy }) => (
            <div key={title} className="card p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-soft text-teal">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-lg">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="conduct" className="scroll-mt-24 border-y border-line bg-white">
        <div className="wrap grid gap-7 py-10 sm:py-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow">Agreed at checkout</p>
            <h2 className="mt-2 text-section">Traveller code of conduct</h2>
            <p className="mt-3 copy text-charcoal/75">
              Confirming a booking means agreeing to this, and every host agrees to the same
              standard. Breaking it ends the trip and the account.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/trips" className="btn btn-forest">
                View available departures
              </Link>
            </div>
          </div>
          <ul className="space-y-2.5">
            {conductRules.map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-3 rounded-xl border border-line bg-sand/40 p-3.5"
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-charcoal/80">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line bg-gold-soft">
        <div className="wrap flex flex-col gap-4 py-8 sm:flex-row sm:items-start">
          <FileText className="size-6 shrink-0 text-gold" aria-hidden="true" />
          <div className="max-w-3xl">
            <h2 className="text-xl">Still being built — screening, licensing and insurance</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
              We would rather say this plainly than imply otherwise. JB Weekend does not yet run
              formal background screening, and our tour-operator registration and public liability
              cover are still in progress. Hosts are people we know personally and have travelled
              with, and each holds the Malaysian licence required to drive their own vehicle. This
              section will name the checks, the licence numbers and the insurer once they are real.
              Until then, please arrange your own travel insurance.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <MessageSquare className="size-5 text-coral" aria-hidden="true" />
            <h2 className="mt-3 text-lg">Telling us something went wrong</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              Reply to your booking email or call the number on your confirmation. Every report is
              acknowledged the same day and you are told the outcome.
            </p>
          </div>
          <div className="card p-4">
            <Users className="size-5 text-coral" aria-hidden="true" />
            <h2 className="mt-3 text-lg">Women-only departures</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/75">
              A date you request can be marked women-only, and that shows on the trip card before
              anyone books. It is reviewed by hand today rather than enforced automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap pb-12">
        <SectionHeading eyebrow="Questions" title="Safety questions we get asked" />
        <div className="mt-5 max-w-3xl">
          <FaqAccordion items={safetyFaqs} />
        </div>
      </section>
    </div>
  )
}
