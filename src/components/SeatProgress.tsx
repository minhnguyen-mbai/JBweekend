import { Plus } from 'lucide-react'
import type { Departure } from '../types'
import { deriveStatus, seatLabel, seatsLeft } from '../lib/seats'

type Size = 'sm' | 'md' | 'lg'

const sizing: Record<Size, { seat: string; text: string; label: string; gap: string }> = {
  sm: { seat: 'size-8', text: 'text-xs', label: 'text-xs', gap: 'gap-1.5' },
  md: { seat: 'size-10', text: 'text-sm', label: 'text-sm', gap: 'gap-2' },
  lg: { seat: 'size-12', text: 'text-base', label: 'text-sm', gap: 'gap-2.5' },
}

/**
 * The three-seat mechanic is the product, so it gets a literal picture of a car:
 * the host's seat on the left, then exactly three traveller seats. Never a percentage bar.
 */
export function SeatProgress({
  departure,
  size = 'md',
  showLabel = true,
  className = '',
}: {
  departure: Departure
  size?: Size
  showLabel?: boolean
  className?: string
}) {
  const status = deriveStatus(departure)
  const left = seatsLeft(departure)
  const s = sizing[size]
  const isPrivate = status === 'private'

  const seats = Array.from({ length: departure.capacity }, (_, i) => {
    const traveller = departure.travellers[i]
    const filled = i < departure.seatsClaimed
    return { traveller, filled, index: i }
  })

  return (
    <div className={className}>
      <div
        className={`inline-flex items-center rounded-2xl border border-line bg-sand/70 p-1.5 pr-2.5 ${s.gap}`}
        role="img"
        aria-label={`${seatLabel(departure)}. Maximum three travellers per car.`}
      >
        {/* Host seat — the driver, never bookable. */}
        <span
          className={`grid ${s.seat} place-items-center rounded-full border border-dashed border-sage/50 bg-white`}
          title="Your local host drives"
          aria-hidden="true"
        >
          <SteeringWheel className="size-[18px] text-sage" />
        </span>
        <span className="h-6 w-px bg-line" aria-hidden="true" />
        <span className={`flex items-center ${s.gap}`} aria-hidden="true">
          {seats.map(({ traveller, filled, index }) => {
            if (isPrivate) {
              return (
                <span
                  key={index}
                  className={`grid ${s.seat} place-items-center rounded-full bg-charcoal ${s.text} font-semibold text-sand`}
                >
                  {index === 0 ? 'You' : ''}
                </span>
              )
            }
            if (filled) {
              return (
                <span
                  key={index}
                  title={traveller?.isYou ? 'Your seat' : traveller?.firstName}
                  className={`grid ${s.seat} place-items-center rounded-full ${s.text} font-semibold ${
                    traveller?.isYou ? 'bg-coral text-white' : 'bg-forest text-sand'
                  }`}
                >
                  {traveller ? traveller.firstName.slice(0, 1).toUpperCase() : '•'}
                </span>
              )
            }
            const urgent = left === 1
            return (
              <span
                key={index}
                title="Open seat"
                className={`grid ${s.seat} place-items-center rounded-full border-2 border-dashed bg-white ${
                  urgent ? 'border-coral/60 text-coral' : 'border-sage/45 text-sage/70'
                }`}
              >
                <Plus className="size-4" />
              </span>
            )
          })}
        </span>
      </div>

      {showLabel && (
        <p
          className={`mt-2 font-semibold ${s.label} ${
            left === 1 && !isPrivate ? 'text-coral-dark' : 'text-forest'
          }`}
        >
          {seatLabel(departure)}
        </p>
      )}
    </div>
  )
}

function SteeringWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.4 10.5h5.2M15.4 10.5h5.2M12 14.6V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
