import { BadgeCheck } from 'lucide-react'
import type { TravellerPreview } from '../types'

/**
 * Privacy rule: first name, age range, languages, one vibe tag, verification and trip
 * count only. Never surnames, contact details, employers or social links.
 */
export function TravellerAvatars({
  travellers,
  capacity = 3,
  className = '',
}: {
  travellers: TravellerPreview[]
  capacity?: number
  className?: string
}) {
  const empty = Math.max(0, capacity - travellers.length)
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {travellers.map((t) => (
          <span
            key={t.id}
            title={`${t.firstName}, ${t.ageRange}`}
            className={`grid size-7 place-items-center rounded-full ring-2 ring-white text-[11px] font-semibold ${
              t.isYou ? 'bg-coral text-white' : 'bg-forest text-sand'
            }`}
          >
            {t.firstName.slice(0, 1).toUpperCase()}
          </span>
        ))}
        {Array.from({ length: empty }, (_, i) => (
          <span
            key={`empty-${i}`}
            className="size-7 rounded-full border-2 border-dashed border-sage/40 bg-white ring-2 ring-white"
          />
        ))}
      </div>
      <p className="ml-2.5 text-xs text-sage">
        {travellers.length === 0
          ? 'No travellers yet'
          : travellers.map((t) => (t.isYou ? 'You' : t.firstName)).join(', ')}
      </p>
    </div>
  )
}

export function TravellerChip({ traveller }: { traveller: TravellerPreview }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-white p-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
          traveller.isYou ? 'bg-coral text-white' : 'bg-forest text-sand'
        }`}
        aria-hidden="true"
      >
        {traveller.firstName.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-forest">
          {traveller.isYou ? `${traveller.firstName} (you)` : traveller.firstName}
          {traveller.verified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Verified
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-sage">
          {traveller.ageRange} · {traveller.languages.join(', ')}
          {traveller.vibes[0] ? ` · ${traveller.vibes[0]}` : ''}
        </p>
        <p className="mt-0.5 text-xs text-sage">
          {traveller.completedTrips === 0
            ? 'First JB Weekend trip'
            : `${traveller.completedTrips} trip${traveller.completedTrips === 1 ? '' : 's'} completed`}
        </p>
      </div>
    </li>
  )
}
