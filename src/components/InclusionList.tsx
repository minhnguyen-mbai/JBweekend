import { Check, Minus } from 'lucide-react'

export function InclusionList({
  included,
  excluded,
}: {
  included: string[]
  excluded: string[]
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h4 className="text-base font-semibold text-forest">What is included</h4>
        <ul className="mt-3 space-y-2.5">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-charcoal/80">
              <span
                className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-forest text-sand"
                aria-hidden="true"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-base font-semibold text-forest">Not included</h4>
        <ul className="mt-3 space-y-2.5">
          {excluded.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-charcoal/70">
              <span
                className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border border-line bg-white text-sage"
                aria-hidden="true"
              >
                <Minus className="size-3" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
