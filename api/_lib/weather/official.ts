import { REQUEST_TIMEOUT_MS, WARNING_MARINE_ONLY_TERMS, WARNING_REGION_TERMS } from './thresholds.js'
import { translatePhrase, translateWhen, whenDayParts } from './phrases.js'
import type { DayPart, PhraseMeaning } from './phrases.js'

/**
 * Adapter for Malaysia's official open-data weather API (MET Malaysia).
 * The endpoints redirect to a trailing slash, so it is included directly.
 */
const FORECAST_URL = 'https://api.data.gov.my/weather/forecast/'
const WARNING_URL = 'https://api.data.gov.my/weather/warning/'

export class WeatherProviderError extends Error {
  readonly code: 'timeout' | 'provider_error' | 'invalid_response'

  constructor(code: 'timeout' | 'provider_error' | 'invalid_response', message: string) {
    super(message)
    this.name = 'WeatherProviderError'
    this.code = code
  }
}

export type OfficialDailyForecast = {
  locationId: string
  locationName: string
  date: string
  summary: PhraseMeaning
  summaryWhen: string
  summaryParts: DayPart[]
  morning: PhraseMeaning
  afternoon: PhraseMeaning
  night: PhraseMeaning
  temperatureMin?: number
  temperatureMax?: number
}

export type OfficialWarning = {
  title: string
  description: string
  instruction: string
  issued?: string
  validFrom?: string
  validTo?: string
}

async function getJson(url: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const name = (error as { name?: string } | null)?.name
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new WeatherProviderError('timeout', 'The weather service did not respond in time.')
    }
    throw new WeatherProviderError('provider_error', 'Could not reach the weather service.')
  }
  if (!response.ok) {
    throw new WeatherProviderError('provider_error', 'The weather service returned an error.')
  }
  try {
    return await response.json()
  } catch {
    throw new WeatherProviderError('invalid_response', 'The weather service sent an unreadable response.')
  }
}

type RawForecast = {
  location?: { location_id?: unknown; location_name?: unknown }
  date?: unknown
  morning_forecast?: unknown
  afternoon_forecast?: unknown
  night_forecast?: unknown
  summary_forecast?: unknown
  summary_when?: unknown
  min_temp?: unknown
  max_temp?: unknown
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)

/** Seven-day outlook for one district. */
export async function fetchOfficialForecast(locationId: string): Promise<OfficialDailyForecast[]> {
  const url = `${FORECAST_URL}?contains=${encodeURIComponent(locationId)}@location__location_id&limit=14`
  const payload = await getJson(url)
  if (!Array.isArray(payload)) {
    throw new WeatherProviderError('invalid_response', 'Unexpected forecast payload.')
  }

  return payload
    .map((raw: RawForecast): OfficialDailyForecast | null => {
      const date = str(raw?.date)
      if (!date) return null
      return {
        locationId: str(raw?.location?.location_id) || locationId,
        locationName: str(raw?.location?.location_name),
        date,
        summary: translatePhrase(str(raw?.summary_forecast)),
        summaryWhen: translateWhen(str(raw?.summary_when)),
        summaryParts: whenDayParts(str(raw?.summary_when)),
        morning: translatePhrase(str(raw?.morning_forecast)),
        afternoon: translatePhrase(str(raw?.afternoon_forecast)),
        night: translatePhrase(str(raw?.night_forecast)),
        temperatureMin: num(raw?.min_temp),
        temperatureMax: num(raw?.max_temp),
      }
    })
    .filter((f): f is OfficialDailyForecast => f !== null)
}

type RawWarning = {
  warning_issue?: { issued?: unknown; title_en?: unknown }
  valid_from?: unknown
  valid_to?: unknown
  heading_en?: unknown
  text_en?: unknown
  instruction_en?: unknown
}

/**
 * Sea-area enumerations such as "the waters of Johor • Pahang • Terengganu"
 * describe conditions offshore, not on the land route. They are removed before
 * matching so that naming Johor's *waters* does not read as naming Johor.
 */
const MARINE_AREA_PATTERN = /\b(?:the\s+)?(?:waters?\s+of|perairan)\b[^.;]*/g

export function stripMarineAreas(text: string): string {
  return text.replace(MARINE_AREA_PATTERN, ' ')
}

/**
 * The warning feed is national and largely marine. A road trip in Johor is only
 * affected when the text names a relevant region *on land*, so marine bulletins
 * and warnings for other states are filtered out rather than shown.
 */
export function isWarningRelevant(text: string, tripDate: string, validFrom: string, validTo: string): boolean {
  const haystack = text.toLowerCase()
  const landText = stripMarineAreas(haystack)

  const mentionsRegion = WARNING_REGION_TERMS.some((term) => landText.includes(term))
  if (!mentionsRegion) return false

  // A bulletin addressed to shipping does not affect a road itinerary unless it
  // also names the region on land.
  const shippingOnly =
    WARNING_MARINE_ONLY_TERMS.some((term) => haystack.includes(term)) && !landText.includes('johor')
  if (shippingOnly) return false

  if (validFrom && validTo) {
    const from = validFrom.slice(0, 10)
    const to = validTo.slice(0, 10)
    if (tripDate < from || tripDate > to) return false
  }
  return true
}

export async function fetchOfficialWarnings(tripDate: string): Promise<OfficialWarning[]> {
  const payload = await getJson(`${WARNING_URL}?limit=20`)
  if (!Array.isArray(payload)) {
    throw new WeatherProviderError('invalid_response', 'Unexpected warning payload.')
  }

  return payload
    .map((raw: RawWarning): OfficialWarning | null => {
      const title = str(raw?.warning_issue?.title_en) || str(raw?.heading_en)
      const description = str(raw?.text_en)
      const combined = `${title} ${str(raw?.heading_en)} ${description}`
      if (!isWarningRelevant(combined, tripDate, str(raw?.valid_from), str(raw?.valid_to))) return null
      return {
        title,
        description,
        instruction: str(raw?.instruction_en),
        issued: str(raw?.warning_issue?.issued) || undefined,
        validFrom: str(raw?.valid_from) || undefined,
        validTo: str(raw?.valid_to) || undefined,
      }
    })
    .filter((w): w is OfficialWarning => w !== null)
}
