import { Link } from 'react-router-dom'

export function Logo({ tone = 'forest' }: { tone?: 'forest' | 'sand' }) {
  const text = tone === 'sand' ? 'text-sand' : 'text-forest'
  return (
    <Link to="/" className="group inline-flex min-h-11 items-center gap-2.5" aria-label="JB Weekend — home">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest">
        <svg viewBox="0 0 64 64" className="size-6" aria-hidden="true">
          <circle cx="21" cy="26" r="7" fill="#F6F0E5" />
          <circle cx="43" cy="26" r="7" fill="#F6F0E5" />
          <circle cx="32" cy="44" r="7" fill="#E86F51" />
        </svg>
      </span>
      <span className={`font-display text-lg font-semibold tracking-tight ${text}`}>
        JB Weekend
      </span>
    </Link>
  )
}
