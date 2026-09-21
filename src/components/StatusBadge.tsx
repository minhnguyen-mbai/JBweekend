import { Check, Clock, Flame, Lock, Users } from 'lucide-react'
import type { DepartureStatus } from '../types'
import { statusLabel } from '../lib/booking'

const config: Record<
  DepartureStatus,
  { className: string; Icon: typeof Check; dot?: boolean }
> = {
  open: { className: 'bg-teal-soft text-teal border-teal/20', Icon: Users },
  almost_full: { className: 'bg-coral-soft text-coral-dark border-coral/30', Icon: Flame },
  confirmed: { className: 'bg-forest text-sand border-forest', Icon: Check },
  waitlist: { className: 'bg-gold-soft text-[#8a6413] border-gold/40', Icon: Clock },
  private: { className: 'bg-charcoal text-sand border-charcoal', Icon: Lock },
}

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: DepartureStatus
  size?: 'sm' | 'md'
}) {
  const { className, Icon } = config[status]
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5'
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${pad} ${className}`}
    >
      <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}
