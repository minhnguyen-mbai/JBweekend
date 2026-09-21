/**
 * Client for GET /api/weather. Mirrors the contract in
 * api/_lib/weather/service.ts; the browser only ever sends a trip id and date.
 */
export type ForecastStage = 'latest' | 'early-outlook' | 'outside-horizon'
export type ImpactLevel = 'low' | 'moderate' | 'high' | 'review-required'

export type HourlyPoint = {
  time: string
  temperature?: number
  apparentTemperature?: number
  precipitationProbability?: number
  rain?: number
  windSpeed?: number
  weatherCode?: number
}

export type TripWeather = {
  tripId: string
  tripDate: string
  timezone: string
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
  impact?: {
    level: ImpactLevel
    reasons: string[]
    affectedStops: string[]
    recommendation: string
  }
  sources: Array<{ name: string; label: string }>
}

export type TripWeatherState =
  | { status: 'loading' }
  | { status: 'ready'; weather: TripWeather }
  | { status: 'unavailable' }

const settled = new Map<string, TripWeatherState>()
const inFlight = new Map<string, Promise<TripWeatherState>>()

const keyFor = (tripId: string, date: string) => `${tripId}:${date}`

export function peekTripWeather(tripId: string, date: string): TripWeatherState | undefined {
  return settled.get(keyFor(tripId, date))
}

export function loadTripWeather(tripId: string, date: string): Promise<TripWeatherState> {
  const key = keyFor(tripId, date)
  const done = settled.get(key)
  if (done) return Promise.resolve(done)
  const existing = inFlight.get(key)
  if (existing) return existing

  const request = fetchTripWeather(tripId, date)
    .then((state) => {
      settled.set(key, state)
      return state
    })
    .finally(() => inFlight.delete(key))

  inFlight.set(key, request)
  return request
}

async function fetchTripWeather(tripId: string, date: string): Promise<TripWeatherState> {
  try {
    const response = await fetch(
      `/api/weather?tripId=${encodeURIComponent(tripId)}&date=${encodeURIComponent(date)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!response.ok) return { status: 'unavailable' }
    const body = (await response.json()) as TripWeather
    if (!body || typeof body.tripId !== 'string') return { status: 'unavailable' }
    return { status: 'ready', weather: body }
  } catch {
    return { status: 'unavailable' }
  }
}

export function resetTripWeatherCache(): void {
  settled.clear()
  inFlight.clear()
}

/** "Afternoon rain possible · 29–32°C" for the compact card line. */
export function compactWeatherLine(weather: TripWeather): string | null {
  const official = weather.official
  if (!official || !weather.forecastAvailable) return null

  const parts: string[] = []
  const wet = (value?: string) => Boolean(value && !/^no rain$/i.test(value))

  if (wet(official.afternoon)) parts.push(`Afternoon ${official.afternoon!.toLowerCase()}`)
  else if (wet(official.morning)) parts.push(`Morning ${official.morning!.toLowerCase()}`)
  else if (wet(official.night)) parts.push(`Evening ${official.night!.toLowerCase()}`)
  else parts.push(official.summary)

  if (official.temperatureMin !== undefined && official.temperatureMax !== undefined) {
    parts.push(`${official.temperatureMin}–${official.temperatureMax}°C`)
  }
  return parts.join(' · ')
}
