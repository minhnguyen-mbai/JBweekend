import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { TravellerDetails } from '../types'
import type { FormErrors } from '../lib/validation'
import { ageRanges, languages, preferenceTags } from '../data/options'

export function TravellerForm({
  details,
  onChange,
  errors,
}: {
  details: TravellerDetails
  onChange: (next: TravellerDetails) => void
  errors: FormErrors
}) {
  const [showPreferences, setShowPreferences] = useState(false)
  const panelId = useId()

  function set<K extends keyof TravellerDetails>(key: K, value: TravellerDetails[K]) {
    onChange({ ...details, [key]: value })
  }

  function togglePreference(tag: string) {
    const current = details.preferences ?? []
    if (current.includes(tag)) {
      set('preferences', current.filter((v) => v !== tag))
    } else if (current.length < 3) {
      set('preferences', [...current, tag])
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          hint="Shown to the others in your car. We never show surnames."
          error={errors.firstName}
        >
          <input
            id="firstName"
            autoComplete="given-name"
            className="field"
            value={details.firstName}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'firstName-error' : 'firstName-hint'}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>

        <Field
          id="email"
          label="Email"
          hint="Booking confirmation and trip updates."
          error={errors.email}
        >
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="field"
            value={details.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : 'email-hint'}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field
          id="phone"
          label="Mobile number"
          hint="How your host reaches you at JB CIQ on the day."
          error={errors.phone}
        >
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+65 8123 4567"
            className="field"
            value={details.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
            onChange={(e) => set('phone', e.target.value)}
          />
        </Field>
      </div>

      {/* Everything below is optional and starts collapsed. */}
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <button
          type="button"
          aria-expanded={showPreferences}
          aria-controls={panelId}
          onClick={() => setShowPreferences((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-sand/50"
        >
          <span>
            <span className="block text-sm font-semibold text-forest">Trip preferences</span>
            <span className="block text-xs text-sage">
              Optional — helps your host plan. You can add these later.
            </span>
          </span>
          <ChevronDown
            className={`size-5 shrink-0 text-sage transition-transform ${showPreferences ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <div id={panelId} hidden={!showPreferences} className="border-t border-line p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ageRange" label="Age range">
              <select
                id="ageRange"
                className="field"
                value={details.ageRange ?? ''}
                onChange={(e) => set('ageRange', e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {ageRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="language" label="Preferred language">
              <select
                id="language"
                className="field"
                value={details.language ?? ''}
                onChange={(e) => set('language', e.target.value)}
              >
                <option value="">No preference</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field
                id="dietary"
                label="Dietary requirements"
                hint="Food is paid as you go, but your host picks the stops."
              >
                <input
                  id="dietary"
                  className="field"
                  placeholder="Halal, vegetarian, allergies…"
                  value={details.dietary ?? ''}
                  onChange={(e) => set('dietary', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="label">How you like to travel · up to three</legend>
            <div className="flex flex-wrap gap-2">
              {preferenceTags.map((tag) => {
                const active = (details.preferences ?? []).includes(tag)
                const disabled = !active && (details.preferences ?? []).length >= 3
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={() => togglePreference(tag)}
                    className={`min-h-11 rounded-full border px-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      active
                        ? 'border-forest bg-forest text-sand'
                        : 'border-line bg-white text-charcoal/80 hover:border-forest/40'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-sage">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-coral-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
