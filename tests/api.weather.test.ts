import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleWeather } from '../api/_lib/handler'
import { clearWeatherCache, forecastStageFor, isValidDate } from '../api/_lib/weather/service'
import { translatePhrase, translateWhen, whenDayParts } from '../api/_lib/weather/phrases'
import { isWarningRelevant, stripMarineAreas } from '../api/_lib/weather/official'
import { forecastRow, jsonResponse, warningRow } from './weather.fixtures'

const ENV = {}
const NOW = new Date('2026-09-21T02:00:00Z') // 10:00 in Kuala Lumpur
const TRIP_DATE = '2026-09-22'

const url = (tripId?: string, date?: string) => {
  const u = new URL('http://localhost/api/weather')
  if (tripId !== undefined) u.searchParams.set('tripId', tripId)
  if (date !== undefined) u.searchParams.set('date', date)
  return u
}

/** Routes forecast and warning calls to the right fixture. */
function stubProvider({ forecasts, warnings = [] }: { forecasts: unknown[]; warnings?: unknown[] }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) =>
      String(input).includes('/warning')
        ? jsonResponse(warnings)
        : jsonResponse(forecasts),
    ),
  )
}

beforeEach(() => {
  clearWeatherCache()
  vi.unstubAllGlobals()
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

describe('input validation', () => {
  it('returns normalized weather for a known trip and valid date', async () => {
    stubProvider({ forecasts: [forecastRow(TRIP_DATE)] })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect(res.status).toBe(200)
    const body = res.body as Record<string, unknown>
    expect(body.tripId).toBe('end-of-asia')
    expect(body.timezone).toBe('Asia/Kuala_Lumpur')
    expect(body.forecastAvailable).toBe(true)
  })

  it.each(['unknown-trip', '../../etc/passwd', ''])('rejects trip id %s', async (tripId) => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const res = await handleWeather(url(tripId, TRIP_DATE), ENV)
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toBe('invalid_trip')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it.each(['2026-13-45', '21-09-2026', 'tomorrow', '2026-02-30', ''])(
    'rejects date %s',
    async (date) => {
      const fetchSpy = vi.fn()
      vi.stubGlobal('fetch', fetchSpy)
      const res = await handleWeather(url('end-of-asia', date), ENV)
      expect(res.status).toBe(400)
      expect((res.body as { error: string }).error).toBe('invalid_date')
      expect(fetchSpy).not.toHaveBeenCalled()
    },
  )

  it('accepts only real calendar dates', () => {
    expect(isValidDate('2026-09-22')).toBe(true)
    expect(isValidDate('2026-02-30')).toBe(false)
  })
})

describe('forecast horizon', () => {
  it('labels the next three days as the latest forecast', () => {
    expect(forecastStageFor('2026-09-21', NOW)).toBe('latest')
    expect(forecastStageFor('2026-09-24', NOW)).toBe('latest')
  })

  it('labels days four to seven as an early outlook', () => {
    expect(forecastStageFor('2026-09-25', NOW)).toBe('early-outlook')
    expect(forecastStageFor('2026-09-28', NOW)).toBe('early-outlook')
  })

  it('never fabricates weather beyond the horizon or in the past', async () => {
    stubProvider({ forecasts: [forecastRow('2026-10-20')] })
    const res = await handleWeather(url('end-of-asia', '2026-10-20'), ENV)
    const body = res.body as Record<string, unknown>
    expect(body.forecastStage).toBe('outside-horizon')
    expect(body.forecastAvailable).toBe(false)
    expect(body.official).toBeUndefined()
    expect(body.hourly).toBeUndefined()

    const past = await handleWeather(url('end-of-asia', '2026-09-01'), ENV)
    expect((past.body as Record<string, unknown>).forecastStage).toBe('outside-horizon')
  })
})

describe('Malay phrase mapping', () => {
  it('maps known phrases deterministically', () => {
    expect(translatePhrase('Tiada Hujan')).toEqual({
      english: 'No rain',
      condition: 'clear',
      coverage: 'none',
    })
    expect(translatePhrase('Ribut petir di kebanyakan tempat').condition).toBe('thunderstorm')
    expect(translatePhrase('Ribut petir di kebanyakan tempat').coverage).toBe('widespread')
    expect(translateWhen('Petang dan Malam')).toBe('Afternoon and night')
    expect(whenDayParts('Pagi dan Petang')).toEqual(['morning', 'afternoon'])
  })

  it('passes unknown phrases through without inventing a meaning', () => {
    const result = translatePhrase('Cuaca aneh yang belum pernah ada')
    expect(result.english).toBe('Cuaca aneh yang belum pernah ada')
    expect(result.condition).toBe('unknown')
    expect(result.coverage).toBe('unknown')
    expect(translateWhen('Entah Bila')).toBe('Entah Bila')
    expect(whenDayParts('Entah Bila')).toEqual([])
  })

  it('handles empty and non-string input safely', () => {
    expect(translatePhrase(undefined).condition).toBe('unknown')
    expect(translatePhrase('').english).toBe('')
    expect(whenDayParts(null)).toEqual([])
  })
})

describe('impact rules', () => {
  it('rates an exposed stop under widespread thunderstorms as high', async () => {
    stubProvider({
      forecasts: [forecastRow(TRIP_DATE, { afternoon: 'Ribut petir di kebanyakan tempat' })],
    })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    const impact = (res.body as { impact: { level: string; affectedStops: string[]; reasons: string[] } }).impact
    expect(impact.level).toBe('high')
    expect(impact.affectedStops).toContain('Tanjung Piai National Park')
    expect(impact.reasons.length).toBeGreaterThan(0)
  })

  it('rates isolated afternoon thunderstorms as moderate rather than alarming', async () => {
    stubProvider({
      forecasts: [forecastRow(TRIP_DATE, { afternoon: 'Ribut petir di beberapa tempat' })],
    })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect((res.body as { impact: { level: string } }).impact.level).toBe('moderate')
  })

  it('does not flag rain that falls outside the trip window', async () => {
    // End of Asia starts at 13:00, so morning rain touches no stop.
    stubProvider({ forecasts: [forecastRow(TRIP_DATE, { morning: 'Hujan di beberapa tempat' })] })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    const impact = (res.body as { impact: { level: string; affectedStops: string[] } }).impact
    expect(impact.level).toBe('low')
    expect(impact.affectedStops).toEqual([])
  })

  it('uses the published route weather plan rather than inventing a backup', async () => {
    stubProvider({ forecasts: [forecastRow(TRIP_DATE)] })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    const impact = (res.body as { impact: { recommendation: string } }).impact
    expect(impact.recommendation).toContain('Tanjung Piai')
  })
})

describe('official warnings', () => {
  it('overrides normal impact and asks for host review', async () => {
    stubProvider({
      forecasts: [forecastRow(TRIP_DATE)],
      warnings: [warningRow()],
    })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    const body = res.body as {
      warning: { active: boolean; title: string }
      impact: { level: string; recommendation: string }
    }
    expect(body.warning.active).toBe(true)
    expect(body.warning.title).toBe('Heavy Rain Warning')
    expect(body.impact.level).toBe('review-required')
    expect(body.impact.recommendation).toContain('review the itinerary')
  })

  it('ignores warnings for other regions and for shipping only', () => {
    expect(
      isWarningRelevant(
        'Thunderstorms over the waters of Sarawak and Western Sabah. FOR SHIPPING within 24 nautical miles.',
        TRIP_DATE,
        '2026-09-20T00:00:00',
        '2026-09-30T00:00:00',
      ),
    ).toBe(false)

    expect(
      isWarningRelevant(
        'Heavy rain expected over Johor.',
        TRIP_DATE,
        '2026-09-20T00:00:00',
        '2026-09-30T00:00:00',
      ),
    ).toBe(true)
  })

  it('does not treat "the waters of Johor" as a land warning', () => {
    // Verbatim from the live feed: a marine bulletin that names Johor's waters
    // inside a sea-area list must not alarm a road-trip traveller.
    const marine =
      'FIRST CATEGORY WARNING ON STRONG WINDS AND ROUGH SEAS. Thunderstorms, heavy rain and ' +
      'strong winds are expected over the waters of Johor • Pahang • Terengganu • Kelantan • ' +
      'Sarawak • Western Sabah until 6:00 PM; Monday, 21 September 2026. SECTION B: FOR SHIPPING.'
    expect(isWarningRelevant(marine, TRIP_DATE, '2026-09-20T00:00:00', '2026-09-30T00:00:00')).toBe(false)
    expect(stripMarineAreas(marine.toLowerCase())).not.toContain('johor')
  })

  it('still detects a land warning that also carries shipping wording', () => {
    const mixed =
      'Heavy rain expected over Johor coastal districts. SECTION B: FOR SHIPPING advisories apply.'
    expect(isWarningRelevant(mixed, TRIP_DATE, '2026-09-20T00:00:00', '2026-09-30T00:00:00')).toBe(true)
  })

  it('ignores warnings whose validity window excludes the trip date', () => {
    expect(
      isWarningRelevant('Heavy rain over Johor.', '2026-09-29', '2026-09-20T00:00:00', '2026-09-24T00:00:00'),
    ).toBe(false)
  })
})

describe('provider failure', () => {
  it('returns a safe fallback without leaking upstream detail', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ secret: 'upstream detail' }, 500)))
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect(res.status).toBe(503)
    const body = res.body as Record<string, unknown>
    expect(body.message).toBe('Live weather is temporarily unavailable.')
    expect(JSON.stringify(body)).not.toContain('upstream detail')
  })

  it('keeps the forecast when only the warning feed fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        String(input).includes('/warning')
          ? jsonResponse({}, 500)
          : jsonResponse([forecastRow(TRIP_DATE)]),
      ),
    )
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect(res.status).toBe(200)
    expect((res.body as { warning: { active: boolean } }).warning.active).toBe(false)
  })

  it('serves the last good forecast marked stale when the provider later fails', async () => {
    stubProvider({ forecasts: [forecastRow(TRIP_DATE)] })
    await handleWeather(url('end-of-asia', TRIP_DATE), ENV)

    clearWeatherCacheKeepingLastGood()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 500)))
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect(res.status).toBe(200)
    expect((res.body as { stale?: boolean }).stale).toBe(true)
  })
})

describe('caching and hourly provider', () => {
  it('calls the provider once for repeated requests', async () => {
    const fetchSpy = vi.fn(async (input: string) =>
      String(input).includes('/warning') ? jsonResponse([]) : jsonResponse([forecastRow(TRIP_DATE)]),
    )
    vi.stubGlobal('fetch', fetchSpy)
    await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    const forecastCalls = fetchSpy.mock.calls.filter((c) => !String(c[0]).includes('/warning'))
    expect(forecastCalls).toHaveLength(1)
  })

  it('sets CDN cache headers', async () => {
    stubProvider({ forecasts: [forecastRow(TRIP_DATE)] })
    const res = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect(res.headers['Cache-Control']).toContain('s-maxage=')
    expect(res.headers['Cache-Control']).toContain('stale-while-revalidate=')
  })

  it('omits hourly data unless a provider is explicitly configured', async () => {
    stubProvider({ forecasts: [forecastRow(TRIP_DATE)] })
    const off = await handleWeather(url('end-of-asia', TRIP_DATE), ENV)
    expect((off.body as { hourly?: unknown }).hourly).toBeUndefined()
    expect((off.body as { sources: unknown[] }).sources).toHaveLength(1)
  })
})

/** The service keeps a last-good copy; only the TTL caches are dropped here. */
function clearWeatherCacheKeepingLastGood() {
  // Advance past the official TTL instead of clearing, so last-good survives.
  vi.setSystemTime(new Date(NOW.getTime() + 5 * 60 * 60 * 1000))
}
