import { Link } from 'react-router-dom'
import { Camera, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Logo } from './Logo'

const columns = [
  {
    title: 'Trips',
    links: [
      { to: '/trips', label: 'Upcoming departures' },
      { to: '/trips/kampung-table', label: 'Kampung Table' },
      { to: '/trips/petrolhead-night', label: 'Petrolhead Night' },
      { to: '/trips/end-of-asia', label: 'End of Asia' },
    ],
  },
  {
    title: 'Travellers',
    links: [
      { to: '/start-trip', label: 'Request a date' },
      { to: '/my-trips', label: 'My trips' },
      { to: '/safety', label: 'Safety and trust' },
      { to: '/safety#conduct', label: 'Traveller code of conduct' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-forest text-sand/85 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:mt-20 md:pb-0">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="[&_a]:text-sand">
            <Logo tone="sand" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand/75">
            Curated Johor day trips in a small car, with three traveller seats and one local host.
            A small number of departures each month, so cars actually fill.
          </p>
          <p className="mt-5 flex items-start gap-2 text-sm text-sand/75">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            All trips meet and end at JB CIQ. You cross the border independently.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Mail, label: 'Email JB Weekend' },
              { Icon: MessageCircle, label: 'WhatsApp JB Weekend' },
              { Icon: Camera, label: 'JB Weekend on Instagram' },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                title={`${label} — not connected yet`}
                className="grid size-9 place-items-center rounded-lg border border-sand/20 text-sand/70"
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="sr-only">{label}</span>
              </span>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-sand">{col.title}</h3>
            <ul className="mt-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-11 items-center text-sm text-sand/75 underline-offset-4 transition hover:text-sand hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-sand/15">
        <div className="wrap flex flex-col gap-2 py-6 text-xs text-sand/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 JB Weekend. An early curated travel service operating from Singapore and Johor.</p>
          <p className="flex flex-wrap items-center gap-x-2">
            <span>Prototype build — payment is arranged manually and no booking is live.</span>
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline underline-offset-4 transition hover:text-sand"
            >
              Photos provided by Pexels
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
