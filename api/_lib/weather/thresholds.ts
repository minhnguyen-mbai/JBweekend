/**
 * Every tunable number and label for the weather feature. Keeping them here
 * means impact decisions can be reviewed in one place rather than read out of
 * component code.
 */
export const WEATHER_TIMEZONE = 'Asia/Kuala_Lumpur'

/** MET Malaysia publishes a rolling seven-day outlook. */
export const OFFICIAL_FORECAST_HORIZON_DAYS = 7
export const LATEST_FORECAST_DAYS = 3

export const CACHE_TTL_MS = {
  /** Official daily outlook: refreshed a few times a day upstream. */
  official: 4 * 60 * 60 * 1000,
  /** Warnings change faster, so they are held for less time. */
  warning: 30 * 60 * 1000,
  hourly: 45 * 60 * 1000,
}

export const REQUEST_TIMEOUT_MS = 7000

/** Hourly precipitation probability, in percent. */
export const PRECIPITATION_PROBABILITY = {
  moderate: 40,
  high: 60,
}

/** Day parts as local clock hours, matching MET Malaysia's bands. */
export const DAY_PART_HOURS = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 19 },
  night: { start: 19, end: 24 },
} as const

/**
 * Terms that make a national warning relevant to a Johor land trip. The warning
 * feed is nationwide and largely marine, so an unfiltered "warning active" flag
 * would alarm travellers about conditions in another state.
 */
export const WARNING_REGION_TERMS = [
  'johor',
  'southern peninsular',
  'peninsular malaysia',
  'selatan semenanjung',
  'straits of melaka',
  'selat melaka',
  'nationwide',
  'seluruh negara',
]

/** Warnings mentioning only these contexts do not affect a road-based day trip. */
export const WARNING_MARINE_ONLY_TERMS = ['for shipping', 'malaysian waters', 'nautical miles']
