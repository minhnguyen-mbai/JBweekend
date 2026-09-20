import type { ItineraryItem } from '../types'

export function ItineraryTimeline({ items }: { items: ItineraryItem[] }) {
  return (
    <ol className="relative space-y-6 border-l border-dashed border-sage/40 pl-6">
      {items.map((item, index) => (
        <li key={`${item.time}-${item.title}`} className="relative">
          <span
            className={`absolute -left-[31px] top-1 grid size-[18px] place-items-center rounded-full border-2 border-sand ${
              index === 0 || index === items.length - 1 ? 'bg-coral' : 'bg-forest'
            }`}
            aria-hidden="true"
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-sage">{item.time}</p>
          <h4 className="mt-1 text-base font-semibold text-forest">{item.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-charcoal/75">{item.detail}</p>
        </li>
      ))}
    </ol>
  )
}
