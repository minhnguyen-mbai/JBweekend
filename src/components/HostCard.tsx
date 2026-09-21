import { Car, Languages, MapPin } from 'lucide-react'
import type { Host } from '../types'

/**
 * Descriptive only. No ratings, trip counts or screening badges: we would be
 * inventing them, and a trust claim we cannot back is worse than none.
 */
export function HostCard({ host, compact = false }: { host: Host; compact?: boolean }) {
  return (
    <div className={`card ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-forest font-display text-lg font-semibold text-sand"
          aria-hidden="true"
        >
          {host.avatarSeed}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">Your host and driver</p>
          <h3 className="mt-0.5 text-lg">{host.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-sage">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {host.homeTown}
          </p>
        </div>
      </div>

      {!compact && (
        <>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{host.bio}</p>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex gap-2">
              <dt className="flex items-center gap-1.5 font-medium text-forest">
                <Languages className="size-4 shrink-0 text-sage" aria-hidden="true" />
                Speaks
              </dt>
              <dd className="text-charcoal/80">{host.languages.join(', ')}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="flex items-center gap-1.5 font-medium text-forest">
                <Car className="size-4 shrink-0 text-sage" aria-hidden="true" />
                Drives
              </dt>
              <dd className="text-charcoal/80">{host.vehicle}</dd>
            </div>
          </dl>
        </>
      )}
    </div>
  )
}
