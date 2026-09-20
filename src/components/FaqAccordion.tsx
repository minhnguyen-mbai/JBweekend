import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FaqItem } from '../types'

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-line overflow-hidden rounded-[--radius-card] border border-line bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[15px] font-semibold text-forest transition hover:bg-sand/50 sm:px-5"
              >
                {item.question}
                <ChevronDown
                  className={`size-5 shrink-0 text-sage transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
              <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/75 sm:px-5">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
