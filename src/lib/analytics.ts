/**
 * Vendor-neutral event sink. The project has no analytics provider, and this
 * deliberately does not introduce one: events are dispatched to an optional
 * sink that a provider can be wired into later.
 */
export type AnalyticsEvent =
  | 'weather_card_viewed'
  | 'weather_details_viewed'
  | 'weather_warning_viewed'
  | 'weather_backup_viewed'
  | 'booking_continued_after_weather_view'

export type AnalyticsProperties = Record<string, string | number | boolean | undefined>

type Sink = (event: AnalyticsEvent, properties: AnalyticsProperties) => void

let sink: Sink | null = null

/** Point this at a real provider when one is chosen. */
export function setAnalyticsSink(next: Sink | null): void {
  sink = next
}

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  const clean: AnalyticsProperties = {}
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) clean[key] = value
  }
  try {
    sink?.(event, clean)
  } catch {
    // Analytics must never break a page.
  }
  if (import.meta.env.DEV && !sink) {
    console.debug('[analytics]', event, clean)
  }
}

/**
 * Remembers that a traveller actually saw the weather section, so continuing to
 * checkout can be attributed to it.
 */
const weatherViewed = new Set<string>()

export function markWeatherViewed(tripId: string, date: string): void {
  weatherViewed.add(`${tripId}:${date}`)
}

export function wasWeatherViewed(tripId: string, date: string): boolean {
  return weatherViewed.has(`${tripId}:${date}`)
}

export function resetAnalyticsMemory(): void {
  weatherViewed.clear()
}
