import { Check } from 'lucide-react'

export function BookingStepper({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  const pct = Math.round(((current + 1) / steps.length) * 100)
  return (
    <div>
      {/* Mobile: a single line and a progress bar, like a native checkout. */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-forest">{steps[current]}</p>
          <p className="text-xs text-sage">
            Step {current + 1} of {steps.length}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-deep">
          <div
            className="h-full rounded-full bg-coral transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center gap-2 sm:flex" aria-label="Booking progress">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={step} className="flex flex-1 items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition ${
                  done
                    ? 'bg-forest text-sand'
                    : active
                      ? 'bg-coral text-white'
                      : 'border border-line bg-white text-sage'
                }`}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={`hidden text-xs font-semibold lg:block ${
                  active ? 'text-forest' : 'text-sage'
                }`}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={`h-px flex-1 ${done ? 'bg-forest/40' : 'bg-line'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
