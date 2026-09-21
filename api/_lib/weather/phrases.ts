/**
 * Deterministic Bahasa Melayu → English dictionary for MET Malaysia forecast
 * phrases. The key set was taken from the live API's distinct values, not
 * guessed, and nothing here is machine-translated at runtime.
 *
 * `condition` and `coverage` drive the impact rules, so a new phrase that is not
 * in this table degrades safely to `unknown` rather than being misclassified.
 */
export type ForecastCondition = 'clear' | 'rain' | 'thunderstorm' | 'haze' | 'unknown'
export type ForecastCoverage = 'none' | 'isolated' | 'widespread' | 'unknown'

export type PhraseMeaning = {
  english: string
  condition: ForecastCondition
  coverage: ForecastCoverage
}

const PHRASES: Record<string, PhraseMeaning> = {
  'Tiada Hujan': { english: 'No rain', condition: 'clear', coverage: 'none' },

  Hujan: { english: 'Rain', condition: 'rain', coverage: 'widespread' },
  'Hujan di beberapa tempat': { english: 'Rain in some areas', condition: 'rain', coverage: 'isolated' },
  'Hujan di kebanyakan tempat': { english: 'Rain in most areas', condition: 'rain', coverage: 'widespread' },
  'Hujan di beberapa tempat di kawasan pedalaman': {
    english: 'Rain in some inland areas',
    condition: 'rain',
    coverage: 'isolated',
  },
  'Hujan di beberapa tempat di kawasan pantai': {
    english: 'Rain in some coastal areas',
    condition: 'rain',
    coverage: 'isolated',
  },
  'Hujan di kebanyakan tempat di kawasan pantai': {
    english: 'Rain in most coastal areas',
    condition: 'rain',
    coverage: 'widespread',
  },

  'Ribut petir': { english: 'Thunderstorms', condition: 'thunderstorm', coverage: 'widespread' },
  'Ribut petir di beberapa tempat': {
    english: 'Thunderstorms in some areas',
    condition: 'thunderstorm',
    coverage: 'isolated',
  },
  'Ribut petir di kebanyakan tempat': {
    english: 'Thunderstorms in most areas',
    condition: 'thunderstorm',
    coverage: 'widespread',
  },
  'Ribut petir menyeluruh': {
    english: 'Widespread thunderstorms',
    condition: 'thunderstorm',
    coverage: 'widespread',
  },
  'Ribut petir di beberapa tempat di kawasan pedalaman': {
    english: 'Thunderstorms in some inland areas',
    condition: 'thunderstorm',
    coverage: 'isolated',
  },
  'Ribut petir di beberapa tempat di kawasan pantai': {
    english: 'Thunderstorms in some coastal areas',
    condition: 'thunderstorm',
    coverage: 'isolated',
  },
  'Ribut petir di kebanyakan tempat di kawasan pantai': {
    english: 'Thunderstorms in most coastal areas',
    condition: 'thunderstorm',
    coverage: 'widespread',
  },
  'Ribut petir di kebanyakan tempat di kawasan pedalaman': {
    english: 'Thunderstorms in most inland areas',
    condition: 'thunderstorm',
    coverage: 'widespread',
  },

  Jerebu: { english: 'Haze', condition: 'haze', coverage: 'widespread' },
}

/** MET Malaysia's `summary_when` values. */
const WHEN_PHRASES: Record<string, string> = {
  'Sepanjang Hari': 'All day',
  Pagi: 'Morning',
  Petang: 'Afternoon',
  Malam: 'Night',
  'Pagi dan Petang': 'Morning and afternoon',
  'Petang dan Malam': 'Afternoon and night',
  'Pagi dan Malam': 'Morning and night',
}

/** Which parts of the day a `summary_when` value covers. */
export type DayPart = 'morning' | 'afternoon' | 'night'

const WHEN_PARTS: Record<string, DayPart[]> = {
  'Sepanjang Hari': ['morning', 'afternoon', 'night'],
  Pagi: ['morning'],
  Petang: ['afternoon'],
  Malam: ['night'],
  'Pagi dan Petang': ['morning', 'afternoon'],
  'Petang dan Malam': ['afternoon', 'night'],
  'Pagi dan Malam': ['morning', 'night'],
}

/** Unknown input is returned verbatim so nothing is invented or dropped. */
export function translatePhrase(value: string | null | undefined): PhraseMeaning {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { english: '', condition: 'unknown', coverage: 'unknown' }
  }
  const trimmed = value.trim()
  const known = PHRASES[trimmed]
  if (known) return known
  return { english: trimmed, condition: 'unknown', coverage: 'unknown' }
}

export function translateWhen(value: string | null | undefined): string {
  if (typeof value !== 'string' || value.trim().length === 0) return ''
  return WHEN_PHRASES[value.trim()] ?? value.trim()
}

export function whenDayParts(value: string | null | undefined): DayPart[] {
  if (typeof value !== 'string') return []
  return WHEN_PARTS[value.trim()] ?? []
}
