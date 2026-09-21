import type { TravellerPreview } from '../types'

/**
 * Privacy rule: first name plus whatever the traveller chose to share. Never
 * surnames, contact details, employers or social links.
 */
export function TravellerAvatars({
  travellers,
  travellerCapacity = 3,
  className = '',
}: {
  travellers: TravellerPreview[]
  travellerCapacity?: number
  className?: string
}) {
  const empty = Math.max(0, travellerCapacity - travellers.length)
  const names = travellers.map((t) => (t.isYou ? 'You' : t.firstName)).join(', ')
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2" aria-hidden="true">
        {travellers.map((t) => (
          <span
            key={t.id}
            className={`grid size-7 place-items-center rounded-full text-[11px] font-semibold ring-2 ring-white ${
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
        {travellers.length === 0 ? 'No seats claimed yet' : names}
      </p>
    </div>
  )
}

/** A single traveller in "Your travel group". */
export function TravellerChip({ traveller }: { traveller: TravellerPreview }) {
  const details = [
    traveller.ageRange,
    traveller.languages?.join(', '),
    traveller.preferences?.slice(0, 2).join(', '),
  ].filter(Boolean)

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
        <p className="text-sm font-semibold text-forest">
          {traveller.isYou ? `${traveller.firstName} (you)` : traveller.firstName}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-sage">
          {details.length > 0 ? details.join(' · ') : 'Shared nothing else yet'}
        </p>
      </div>
    </li>
  )
}
