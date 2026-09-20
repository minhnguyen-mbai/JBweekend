import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-sand text-forest">
        {icon ?? <SearchX className="size-6" aria-hidden="true" />}
      </span>
      <h3 className="mt-4 text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal/75">{description}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
