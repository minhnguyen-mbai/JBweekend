import { BadgeCheck, Car, Languages, MapPin, Star } from 'lucide-react'
import type { Host } from '../types'

export function HostCard({ host, compact = false }: { host: Host; compact?: boolean }) {
  return (
    <div className={`card ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start gap-4">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-forest font-display text-xl font-semibold text-sand"
          aria-hidden="true"
        >
          {host.avatarSeed}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Your local host</p>
          <h3 className="mt-1 flex flex-wrap items-center gap-2 text-xl">
            {host.name}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal">
              <BadgeCheck className="size-4" aria-hidden="true" />
              Verified host
            </span>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sage">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {host.homeTown}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
              {host.rating.toFixed(1)} · {host.tripsHosted} trips hosted
            </span>
          </p>
        </div>
      </div>

      {!compact && (
        <>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{host.bio}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-sand/60 p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-forest">
                <Languages className="size-3.5" aria-hidden="true" />
                Speaks
              </dt>
              <dd className="mt-1 text-sm text-charcoal/80">{host.languages.join(', ')}</dd>
            </div>
            <div className="rounded-xl bg-sand/60 p-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-forest">
                <Car className="size-3.5" aria-hidden="true" />
                Drives
              </dt>
              <dd className="mt-1 text-sm text-charcoal/80">{host.drives}</dd>
            </div>
          </dl>
          <ul className="mt-4 flex flex-wrap gap-2">
            {host.verifiedItems.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-soft px-2.5 py-1 text-[11px] font-semibold text-forest"
              >
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
