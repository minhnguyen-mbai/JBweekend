import type { TravellerDetails } from '../types'
import type { FormErrors } from '../lib/validation'
import { ageRanges, languages, vibeTags } from '../data/options'

export function TravellerForm({
  details,
  onChange,
  errors,
  consent,
  onConsentChange,
}: {
  details: TravellerDetails
  onChange: (next: TravellerDetails) => void
  errors: FormErrors
  consent: boolean
  onConsentChange: (value: boolean) => void
}) {
  function set<K extends keyof TravellerDetails>(key: K, value: TravellerDetails[K]) {
    onChange({ ...details, [key]: value })
  }

  function toggleVibe(tag: string) {
    const has = details.vibes.includes(tag)
    if (has) {
      set('vibes', details.vibes.filter((v) => v !== tag))
    } else if (details.vibes.length < 3) {
      set('vibes', [...details.vibes, tag])
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          hint="Shown to your travel companions. Your surname is never displayed."
          error={errors.firstName}
        >
          <input
            id="firstName"
            name="given-name"
            autoComplete="given-name"
            className="field"
            value={details.firstName}
            aria-invalid={Boolean(errors.firstName)}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>

        <Field id="email" label="Email" hint="Booking confirmation and trip updates." error={errors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="field"
            value={details.email}
            aria-invalid={Boolean(errors.email)}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field
          id="phone"
          label="Mobile number"
          hint="Verified before departure. Only your host sees it."
          error={errors.phone}
        >
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+65 8123 4567"
            className="field"
            value={details.phone}
            aria-invalid={Boolean(errors.phone)}
            onChange={(e) => set('phone', e.target.value)}
          />
        </Field>

        <Field id="ageRange" label="Age range" hint="Shown as a range, never your date of birth." error={errors.ageRange}>
          <select
            id="ageRange"
            className="field"
            value={details.ageRange}
            aria-invalid={Boolean(errors.ageRange)}
            onChange={(e) => set('ageRange', e.target.value)}
          >
            <option value="">Select an age range</option>
            {ageRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </Field>

        <Field id="language" label="Preferred language" error={errors.language}>
          <select
            id="language"
            className="field"
            value={details.language}
            aria-invalid={Boolean(errors.language)}
            onChange={(e) => set('language', e.target.value)}
          >
            <option value="">Select a language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="dietary"
          label="Dietary requirements"
          hint="Halal, vegetarian, allergies — anything your host should plan around."
        >
          <input
            id="dietary"
            className="field"
            placeholder="Optional"
            value={details.dietary}
            onChange={(e) => set('dietary', e.target.value)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="label">Travel vibe · pick up to three</legend>
        <p className="mb-2 text-xs text-sage">
          Used to describe you to your companions. It never ranks or filters people.
        </p>
        <div className="flex flex-wrap gap-2">
          {vibeTags.map((tag) => {
            const active = details.vibes.includes(tag)
            const disabled = !active && details.vibes.length >= 3
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => toggleVibe(tag)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
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

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="label">Emergency contact</legend>
        <Field id="emergencyName" label="Name" error={errors.emergencyName}>
          <input
            id="emergencyName"
            className="field"
            value={details.emergencyName}
            aria-invalid={Boolean(errors.emergencyName)}
            onChange={(e) => set('emergencyName', e.target.value)}
          />
        </Field>
        <Field id="emergencyPhone" label="Contact number" error={errors.emergencyPhone}>
          <input
            id="emergencyPhone"
            type="tel"
            inputMode="tel"
            className="field"
            value={details.emergencyPhone}
            aria-invalid={Boolean(errors.emergencyPhone)}
            onChange={(e) => set('emergencyPhone', e.target.value)}
          />
        </Field>
      </fieldset>

      <div>
        <label className="flex items-start gap-3 rounded-xl border border-line bg-white p-3.5">
          <input
            type="checkbox"
            checked={consent}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[#18382B]"
          />
          <span className="text-sm leading-relaxed text-charcoal/80">
            I agree to the <strong className="text-forest">traveller code of conduct</strong>: be on
            time, be respectful of the other two travellers and the host, no alcohol or substances in
            the car, and no contacting other travellers outside the trip chat without their consent.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-1.5 text-sm text-coral-dark">
            {errors.consent}
          </p>
        )}
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
      {hint && !error && <p className="mt-1.5 text-xs text-sage">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-sm text-coral-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
