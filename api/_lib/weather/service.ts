import { TtlCache } from '../cache.js'
import { tours } from '../../../src/data/tours.js'
import { getTripWeatherConfig } from './trips.js'
import type { TripWeatherConfig } from './trips.js'
import {
  CACHE_TTL_MS,
  LATEST_FORECAST_DAYS,
  OFFICIAL_FORECAST_HORIZON_DAYS,
  WEATHER_TIMEZONE,
} from './thresholds.js'
import { WeatherProviderError, fetchOfficialForecast, fetchOfficialWarnings } from './official.js'
import type { OfficialDailyForecast, OfficialWarning } from './official.js'
import { fetchHourly, resolveHourlyProvider } from './hourly.js'
import type { HourlyPoint } from './hourly.js'
import { assessImpact } from './impact.js'
import type { WeatherImpact } from './impact.js'

export type ForecastStage = 'latest' | 'early-outlook' | 'outside-horizon'

export type TripWeatherResponse = {
  tripId: string
  tripDate: string
  timezone: typeof WEATHER_TIMEZONE
  forecastAvailable: boolean
  forecastStage: ForecastStage
  lastUpdated?: string
  stale?: boolean
  official?: {
    locationName: string
    summary: string
    summaryWhen?: string
    morning?: string
    afternoon?: string
    night?: string
    temperatureMin?: number
    temperatureMax?: number
  }
  hourly?: HourlyPoint[]
  warning?: {
    active: boolean
    severity?: 'moderate' | 'high' | 'severe'
    title?: string
    description?: string
  }
  impact?: WeatherImpact
  sources: Array<{ name: string; label: string }>
}

type CachedOfficial = { forecasts: OfficialDailyForecast[]; fetchedAt: string }
type CachedWarnings = { warnings: OfficialWarning[]; fetchedAt: string }

const officialCache = new TtlCache<CachedOfficial>(CACHE_TTL_MS.official)
const warningCache = new TtlCache<CachedWarnings>(CACHE_TTL_MS.warning)
const hourlyCache = new TtlCache<{ points: HourlyPoint[]; fetchedAt: string }>(CACHE_TTL_MS.hourly)

/** Last known good data, used only as an explicitly-marked stale fallback. */
const lastGoodOfficial = new Map<string, CachedOfficial>()

export function clearWeatherCache(): void {
  officialCache.clear()
  warningCache.clear()
  hourlyCache.clear()
  lastGoodOfficial.clear()
}

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  )
}

/** Whole days from today (Malaysia time) to the trip date. */
export function daysUntil(tripDate: string, now = new Date()): number {
  const today = new Date(now.toLocaleDateString('en-CA', { timeZone: WEATHER_TIMEZONE }))
  const target = new Date(`${tripDate}T00:00:00Z`)
  const todayUtc = new Date(`${today.toISOString().slice(0, 10)}T00:00:00Z`)
  return Math.round((target.getTime() - todayUtc.getTime()) / 86_400_000)
}

export function forecastStageFor(tripDate: string, now = new Date()): ForecastStage {
  const days = daysUntil(tripDate, now)
  if (days < 0 || days > OFFICIAL_FORECAST_HORIZON_DAYS) return 'outside-horizon'
  return days <= LATEST_FORECAST_DAYS ? 'latest' : 'early-outlook'
}

function severityFor(warning: OfficialWarning): 'moderate' | 'high' | 'severe' {
  const text = `${warning.title} ${warning.description}`.toLowerCase()
  if (text.includes('third category') || text.includes('danger')) return 'severe'
  if (text.includes('second category') || text.includes('heavy rain')) return 'high'
  return 'moderate'
}

async function loadOfficial(config: TripWeatherConfig): Promise<{ data: CachedOfficial; stale: boolean }> {
  const key = config.location.officialLocationId
  const cached = officialCache.get(key)
  if (cached) return { data: cached, stale: false }

  try {
    const forecasts = await fetchOfficialForecast(key)
    const fresh: CachedOfficial = { forecasts, fetchedAt: new Date().toISOString() }
    officialCache.set(key, fresh)
    lastGoodOfficial.set(key, fresh)
    return { data: fresh, stale: false }
  } catch (error) {
    // Serve the last good payload rather than nothing, but say that it is stale.
    const fallback = lastGoodOfficial.get(key)
    if (fallback) return { data: fallback, stale: true }
    throw error
  }
}

export async function getTripWeather(
  tripId: string,
  tripDate: string,
  env: Record<string, string | undefined>,
  now = new Date(),
): Promise<TripWeatherResponse> {
  const config = getTripWeatherConfig(tripId)
  if (!config) throw new WeatherProviderError('provider_error', 'Unknown trip.')

  const stage = forecastStageFor(tripDate, now)
  const sources: TripWeatherResponse['sources'] = [
    { name: 'data.gov.my', label: 'Official outlook — MET Malaysia' },
  ]

  const base: TripWeatherResponse = {
    tripId,
    tripDate,
    timezone: WEATHER_TIMEZONE,
    forecastAvailable: false,
    forecastStage: stage,
    sources,
  }

  // Never fabricate a forecast beyond the provider's published horizon.
  if (stage === 'outside-horizon') return base

  const { data: official, stale } = await loadOfficial(config)
  const forecast = official.forecasts.find((f) => f.date === tripDate)

  let warnings: OfficialWarning[] = []
  try {
    const cachedWarnings = warningCache.get('all')
    if (cachedWarnings) {
      warnings = cachedWarnings.warnings.filter(
        (w) => !w.validFrom || !w.validTo || (tripDate >= w.validFrom.slice(0, 10) && tripDate <= w.validTo.slice(0, 10)),
      )
    } else {
      warnings = await fetchOfficialWarnings(tripDate)
      warningCache.set('all', { warnings, fetchedAt: new Date().toISOString() })
    }
  } catch {
    // A warning-feed failure must not hide an otherwise good forecast.
    warnings = []
  }

  let hourly: HourlyPoint[] | undefined
  if (resolveHourlyProvider(env)) {
    const key = `${config.tripId}:${tripDate}`
    const cachedHourly = hourlyCache.get(key)
    if (cachedHourly) {
      hourly = cachedHourly.points
    } else {
      try {
        hourly = await fetchHourly(config, tripDate)
        hourlyCache.set(key, { points: hourly, fetchedAt: new Date().toISOString() })
      } catch {
        hourly = undefined
      }
    }
    if (hourly) sources.push({ name: 'open-meteo', label: 'Hourly estimate — Open-Meteo model' })
  }

  const tour = tours.find((t) => t.slug === tripId)
  const impact = assessImpact({
    config,
    forecast,
    warnings,
    hourly,
    weatherPlan: tour?.weatherPlan ?? '',
  })

  const topWarning = warnings[0]

  return {
    ...base,
    forecastAvailable: Boolean(forecast),
    lastUpdated: official.fetchedAt,
    ...(stale ? { stale: true } : {}),
    ...(forecast
      ? {
          official: {
            locationName: forecast.locationName || config.location.officialLocationName,
            summary: forecast.summary.english,
            summaryWhen: forecast.summaryWhen || undefined,
            morning: forecast.morning.english || undefined,
            afternoon: forecast.afternoon.english || undefined,
            night: forecast.night.english || undefined,
            temperatureMin: forecast.temperatureMin,
            temperatureMax: forecast.temperatureMax,
          },
        }
      : {}),
    ...(hourly && hourly.length > 0 ? { hourly } : {}),
    warning: topWarning
      ? {
          active: true,
          severity: severityFor(topWarning),
          title: topWarning.title,
          description: topWarning.instruction || topWarning.description.slice(0, 400),
        }
      : { active: false },
    impact,
  }
}
