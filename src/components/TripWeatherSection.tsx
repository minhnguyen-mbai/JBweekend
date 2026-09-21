import { useEffect, useRef } from 'react'
import { CloudRain, CloudSun, Droplets, Info, Sun, TriangleAlert } from 'lucide-react'
import { useTripWeather } from '../lib/useTripWeather'
import type { ImpactLevel, TripWeather } from '../lib/weather'
import { markWeatherViewed, track } from '../lib/analytics'
import { formatDateLong } from '../lib/format'

const stageLabel: Record<TripWeather['forecastStage'], string> = {
  latest: 'Latest forecast',
  'early-outlook': 'Early outlook',
  'outside-horizon': 'Not yet forecast',
}

/** Status is carried by a word and an icon, never colour alone. */
const impactMeta: Record<ImpactLevel, { label: string; Icon: typeof Sun; tone: string }> = {
  low: { label: 'Little impact expected', Icon: Sun, tone: 'border-line bg-sand/50 text-forest' },
  moderate: { label: 'Some impact possible', Icon: CloudSun, tone: 'border-gold/40 bg-gold-soft text-[#7a5910]' },
  high: { label: 'Significant impact possible', Icon: CloudRain, tone: 'border-coral/40 bg-coral-soft text-coral-dark' },
  'review-required': {
    label: 'Under review by your host',
    Icon: TriangleAlert,
    tone: 'border-coral/50 bg-coral-soft text-coral-dark',
  },
}

export function TripWeatherSection({
  tripId,
  date,
  className = '',
}: {
  tripId: string
  date: string
  className?: string
}) {
  const state = useTripWeather(tripId, date)
  const reported = useRef<string | null>(null)

  useEffect(() => {
    if (state.status !== 'ready') return
    const key = `${tripId}:${date}`
    if (reported.current === key) return
    reported.current = key
    markWeatherViewed(tripId, date)
    const w = state.weather
    track('weather_details_viewed', {
      tripId,
      tripDate: date,
      forecastStage: w.forecastStage,
      impactLevel: w.impact?.level,
    })
    if (w.warning?.active) {
      track('weather_warning_viewed', { tripId, tripDate: date, severity: w.warning.severity })
    }
    if (w.impact?.recommendation) {
      track('weather_backup_viewed', { tripId, tripDate: date, impactLevel: w.impact.level })
    }
  }, [state, tripId, date])

  return (
    <section className={className} aria-labelledby="weather-heading">
      <h2 id="weather-heading" className="text-card">
        Weather for your trip
      </h2>

      {state.status === 'loading' && <WeatherSkeleton />}

      {state.status === 'unavailable' && (
        <p className="copy-sm mt-3 rounded-xl border border-line bg-white p-4 text-charcoal/75">
          Live weather is temporarily unavailable. Your host will continue to monitor conditions
          before departure.
        </p>
      )}

      {state.status === 'ready' && <WeatherBody weather={state.weather} date={date} />}
    </section>
  )
}

function WeatherBody({ weather, date }: { weather: TripWeather; date: string }) {
  const { official, impact, warning } = weather
  const meta = impact ? impactMeta[impact.level] : impactMeta.low

  if (weather.forecastStage === 'outside-horizon' || !weather.forecastAvailable) {
    return (
      <div className="mt-3 rounded-xl border border-line bg-white p-4">
        <p className="copy-sm text-charcoal/80">
          Detailed weather will be available closer to your trip. The official Malaysian outlook
          covers about a week ahead.
        </p>
        <p className="copy-sm mt-2 text-sage">{formatDateLong(date)}</p>
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Stage, date and location */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold text-forest">
          <CloudSun className="size-3.5 shrink-0" aria-hidden="true" />
          {stageLabel[weather.forecastStage]}
        </span>
        <span className="copy-sm text-sage">
          {formatDateLong(date)}
          {official?.locationName ? ` · ${official.locationName}` : ''}
        </span>
      </div>

      {warning?.active && (
        <div
          className="rounded-xl border border-coral/50 bg-coral-soft p-4"
          role="alert"
        >
          <p className="flex items-start gap-2 text-sm font-semibold text-coral-dark">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="break-words">Official weather warning: {warning.title}</span>
          </p>
          {warning.description && (
            <p className="copy-sm mt-2 break-words text-charcoal/80">{warning.description}</p>
          )}
        </div>
      )}

      {official && (
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-base font-semibold text-forest">
            {official.summary}
            {official.summaryWhen ? ` · ${official.summaryWhen}` : ''}
          </p>
          {official.temperatureMin !== undefined && official.temperatureMax !== undefined && (
            <p className="copy-sm mt-1 text-sage">
              {official.temperatureMin}–{official.temperatureMax}°C
            </p>
          )}

          <dl className="mt-3 grid gap-2 border-t border-line pt-3 sm:grid-cols-3">
            <DayPart label="Morning" value={official.morning} />
            <DayPart label="Afternoon" value={official.afternoon} />
            <DayPart label="Evening" value={official.night} />
          </dl>
        </div>
      )}

      {weather.hourly && weather.hourly.length > 0 && (
        <HourlyStrip points={weather.hourly} />
      )}

      {impact && (
        <div className={`rounded-xl border p-4 ${meta.tone}`}>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <meta.Icon className="size-4 shrink-0" aria-hidden="true" />
            {meta.label}
          </p>
          {impact.reasons.length > 0 && (
            <ul className="copy-sm mt-2 space-y-1 text-charcoal/80">
              {impact.reasons.map((reason) => (
                <li key={reason} className="break-words">
                  {reason}
                </li>
              ))}
            </ul>
          )}
          {impact.affectedStops.length > 0 && (
            <p className="copy-sm mt-2 text-charcoal/75">
              <span className="font-semibold">Stops that could change:</span>{' '}
              {impact.affectedStops.join(', ')}
            </p>
          )}
          {impact.recommendation && (
            <p className="copy-sm mt-2 break-words text-charcoal/80">{impact.recommendation}</p>
          )}
        </div>
      )}

      <p className="copy-sm flex flex-wrap items-center gap-x-1.5 text-sage">
        <Info className="size-3.5 shrink-0" aria-hidden="true" />
        {weather.sources.map((s) => s.label).join(' · ')}
        {weather.lastUpdated && ` · updated ${new Date(weather.lastUpdated).toLocaleString('en-SG', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}`}
        {weather.stale && ' · showing last known data'}
      </p>
    </div>
  )
}

function DayPart({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 sm:block">
      <dt className="text-xs font-semibold uppercase tracking-wider text-sage">{label}</dt>
      <dd className="copy-sm text-right text-charcoal/85 sm:mt-0.5 sm:text-left">
        {value ?? 'Not published'}
      </dd>
    </div>
  )
}

/** Lightweight timeline, not a meteorological chart. */
function HourlyStrip({ points }: { points: { time: string; precipitationProbability?: number; temperature?: number }[] }) {
  const daytime = points.filter((p) => {
    const hour = Number(p.time.slice(11, 13))
    return hour >= 12 && hour <= 22
  })
  if (daytime.length === 0) return null

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-sm font-semibold text-forest">Hourly estimate</p>
      <p className="copy-sm text-sage">Model estimate, not the official outlook.</p>
      <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
        {daytime.map((point) => (
          <li key={point.time} className="w-14 shrink-0 text-center">
            <span className="block text-xs text-sage">{point.time.slice(11, 16)}</span>
            <span className="mt-1 flex items-center justify-center gap-0.5 text-xs font-semibold text-forest">
              <Droplets className="size-3 shrink-0" aria-hidden="true" />
              {point.precipitationProbability ?? '–'}%
            </span>
            {point.temperature !== undefined && (
              <span className="mt-0.5 block text-xs text-sage">{Math.round(point.temperature)}°</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <div className="mt-3 space-y-3">
      {/* The announcement must stay outside the decorative, aria-hidden block. */}
      <span className="sr-only" role="status">
        Loading the forecast for your trip
      </span>
      <div className="space-y-3" aria-hidden="true">
        <div className="h-7 w-48 animate-shimmer rounded-full bg-sand-deep" />
        <div className="h-28 animate-shimmer rounded-xl bg-sand-deep" />
        <div className="h-20 animate-shimmer rounded-xl bg-sand-deep" />
      </div>
    </div>
  )
}
