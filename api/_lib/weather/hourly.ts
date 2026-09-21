import { REQUEST_TIMEOUT_MS, WEATHER_TIMEZONE } from './thresholds.js'
import { WeatherProviderError } from './official.js'
import type { TripWeatherConfig } from './trips.js'

/**
 * Optional hourly provider, kept isolated so a commercial provider can replace
 * it without touching the rest of the service.
 *
 * It stays OFF unless WEATHER_HOURLY_PROVIDER is set explicitly. Open-Meteo's
 * free tier is non-commercial, so enabling it is a licensing decision for the
 * operator, not a default. Official Malaysian data is always the primary source
 * and hourly values are labelled as an estimate, never as an official forecast.
 */
export type HourlyPoint = {
  time: string
  temperature?: number
  apparentTemperature?: number
  precipitationProbability?: number
  rain?: number
  windSpeed?: number
  weatherCode?: number
}

export type HourlyProviderName = 'open-meteo'

export function resolveHourlyProvider(
  env: Record<string, string | undefined>,
): HourlyProviderName | null {
  const configured = env.WEATHER_HOURLY_PROVIDER?.trim().toLowerCase()
  return configured === 'open-meteo' ? 'open-meteo' : null
}

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'

export async function fetchHourly(
  config: TripWeatherConfig,
  date: string,
): Promise<HourlyPoint[]> {
  const params = new URLSearchParams({
    latitude: String(config.location.latitude),
    longitude: String(config.location.longitude),
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,rain,wind_speed_10m,weather_code',
    timezone: WEATHER_TIMEZONE,
    start_date: date,
    end_date: date,
  })

  let response: Response
  try {
    response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const name = (error as { name?: string } | null)?.name
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new WeatherProviderError('timeout', 'The hourly provider did not respond in time.')
    }
    throw new WeatherProviderError('provider_error', 'Could not reach the hourly provider.')
  }
  if (!response.ok) {
    throw new WeatherProviderError('provider_error', 'The hourly provider returned an error.')
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new WeatherProviderError('invalid_response', 'The hourly provider sent an unreadable response.')
  }

  const hourly = (payload as { hourly?: Record<string, unknown> } | null)?.hourly
  const times = hourly?.time
  if (!Array.isArray(times)) {
    throw new WeatherProviderError('invalid_response', 'Unexpected hourly payload.')
  }

  const at = (key: string, index: number): number | undefined => {
    const series = hourly?.[key]
    if (!Array.isArray(series)) return undefined
    const value = series[index]
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined
  }

  return times.map((time: unknown, index: number) => ({
    time: typeof time === 'string' ? time : '',
    temperature: at('temperature_2m', index),
    apparentTemperature: at('apparent_temperature', index),
    precipitationProbability: at('precipitation_probability', index),
    rain: at('rain', index),
    windSpeed: at('wind_speed_10m', index),
    weatherCode: at('weather_code', index),
  }))
}
