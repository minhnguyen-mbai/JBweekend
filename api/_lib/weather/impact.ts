import { DAY_PART_HOURS, PRECIPITATION_PROBABILITY } from './thresholds.js'
import { toDecimalHours } from './trips.js'
import type { TripStopWindow, TripWeatherConfig } from './trips.js'
import type { DayPart, PhraseMeaning } from './phrases.js'
import type { OfficialDailyForecast, OfficialWarning } from './official.js'
import type { HourlyPoint } from './hourly.js'

export type ImpactLevel = 'low' | 'moderate' | 'high' | 'review-required'

export type WeatherImpact = {
  level: ImpactLevel
  reasons: string[]
  affectedStops: string[]
  recommendation: string
}

/** Which day parts a stop overlaps, so a forecast band maps to real stops. */
export function stopDayParts(stop: TripStopWindow): DayPart[] {
  const start = toDecimalHours(stop.startTime)
  const end = toDecimalHours(stop.endTime)
  return (Object.keys(DAY_PART_HOURS) as DayPart[]).filter((part) => {
    const window = DAY_PART_HOURS[part]
    return start < window.end && end > window.start
  })
}

function partForecast(forecast: OfficialDailyForecast, part: DayPart): PhraseMeaning {
  if (part === 'morning') return forecast.morning
  if (part === 'afternoon') return forecast.afternoon
  return forecast.night
}

function wetIn(part: DayPart, forecast: OfficialDailyForecast): PhraseMeaning | null {
  const meaning = partForecast(forecast, part)
  return meaning.condition === 'rain' || meaning.condition === 'thunderstorm' ? meaning : null
}

function peakProbability(hourly: HourlyPoint[], stop: TripStopWindow): number | undefined {
  const start = toDecimalHours(stop.startTime)
  const end = toDecimalHours(stop.endTime)
  const values = hourly
    .filter((point) => {
      const hour = Number(point.time.slice(11, 13))
      return Number.isFinite(hour) && hour >= Math.floor(start) && hour < Math.ceil(end)
    })
    .map((point) => point.precipitationProbability)
    .filter((value): value is number => typeof value === 'number')
  return values.length > 0 ? Math.max(...values) : undefined
}

/**
 * Deterministic and explainable. Every level carries the reasons that produced
 * it; nothing is scored opaquely.
 *
 * Order matters: an official warning overrides everything else.
 */
export function assessImpact({
  config,
  forecast,
  warnings,
  hourly,
  weatherPlan,
}: {
  config: TripWeatherConfig
  forecast?: OfficialDailyForecast
  warnings: OfficialWarning[]
  hourly?: HourlyPoint[]
  /** The route's published weather plan — the only operational promise we make. */
  weatherPlan: string
}): WeatherImpact {
  // 1 — an active, relevant official warning overrides the normal forecast.
  if (warnings.length > 0) {
    return {
      level: 'review-required',
      reasons: warnings.map((w) => w.title || 'An official weather warning is in force.'),
      affectedStops: config.stops.map((s) => s.label),
      recommendation:
        'An official weather warning is active for this area. Your host will review the itinerary before departure and contact you if anything changes.',
    }
  }

  if (!forecast) {
    return {
      level: 'low',
      reasons: [],
      affectedStops: [],
      recommendation: weatherPlan,
    }
  }

  const reasons: string[] = []
  const affected = new Set<string>()
  let highSensitivityWet = false
  let anyWet = false

  for (const stop of config.stops) {
    const parts = stopDayParts(stop)
    const wetParts = parts.map((part) => ({ part, meaning: wetIn(part, forecast) })).filter((p) => p.meaning)
    const probability = hourly ? peakProbability(hourly, stop) : undefined
    const probablyWet =
      probability !== undefined && probability >= PRECIPITATION_PROBABILITY.moderate

    if (wetParts.length === 0 && !probablyWet) continue

    anyWet = true
    const descriptor = wetParts[0]?.meaning?.english.toLowerCase() ?? 'rain'

    if (stop.weatherSensitivity === 'high') {
      const veryLikely =
        probability !== undefined
          ? probability >= PRECIPITATION_PROBABILITY.high
          : wetParts.some((p) => p.meaning?.coverage === 'widespread')
      if (veryLikely) highSensitivityWet = true
      affected.add(stop.label)
      reasons.push(
        probability !== undefined
          ? `${stop.label} is in the open, and rain is ${probability}% likely during that window.`
          : `${stop.label} is in the open, and the official outlook expects ${descriptor} at that time of day.`,
      )
    } else if (stop.weatherSensitivity === 'moderate') {
      affected.add(stop.label)
      reasons.push(`${stop.label} is partly in the open, with ${descriptor} expected around then.`)
    }
  }

  // 2 — wet weather over an exposed stop.
  if (highSensitivityWet) {
    return {
      level: 'high',
      reasons,
      affectedStops: [...affected],
      recommendation: weatherPlan,
    }
  }

  // 3 — rain around the edges, or over stops that are only partly exposed.
  if (anyWet && affected.size > 0) {
    return {
      level: 'moderate',
      reasons,
      affectedStops: [...affected],
      recommendation: weatherPlan,
    }
  }

  if (anyWet) {
    return {
      level: 'moderate',
      reasons: [
        `${forecast.summary.english} is expected${forecast.summaryWhen ? ` (${forecast.summaryWhen.toLowerCase()})` : ''}, mostly outside the parts of this trip that are in the open.`,
      ],
      affectedStops: [],
      recommendation: weatherPlan,
    }
  }

  // 4 — nothing notable.
  return {
    level: 'low',
    reasons: [`The official outlook for this date is ${forecast.summary.english.toLowerCase()}.`],
    affectedStops: [],
    recommendation: weatherPlan,
  }
}
