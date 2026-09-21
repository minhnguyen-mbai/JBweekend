import type { ReactNode } from 'react'

export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition ${
        active
          ? 'border-forest bg-forest text-sand'
          : 'border-line bg-white text-charcoal/80 hover:border-forest/40 hover:text-forest'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className={`text-xs font-semibold ${active ? 'text-sand/70' : 'text-sage'}`}>{count}</span>
      )}
    </button>
  )
}

export function ChipRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {children}
    </div>
  )
}
