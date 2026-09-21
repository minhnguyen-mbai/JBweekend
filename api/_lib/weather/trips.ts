/**
 * Server-controlled weather configuration. The browser sends a trip id; the
 * location, coordinates and stop windows are resolved here so no client can ask
 * for arbitrary coordinates.
 *
 * Stops mirror the published itinerary in src/data/tours.ts exactly — no
 * invented attractions. Sensitivity reflects what each stop actually is:
 * open-air stops are "high", partly covered are "moderate", indoor and
 * in-vehicle are "low".
 */
export type WeatherSensitivity = 'low' | 'moderate' | 'high'

export type TripStopWindow = {
  stopId: string
  label: string
  /** Local 24-hour clock, Asia/Kuala_Lumpur. */
  startTime: string
  endTime: string
  weatherSensitivity: WeatherSensitivity
}

export type TripWeatherConfig = {
  tripId: string
  location: {
    /** MET Malaysia district id, verified against api.data.gov.my. */
    officialLocationId: string
    officialLocationName: string
    /** Used only by the optional hourly adapter. */
    latitude: number
    longitude: number
  }
  stops: TripStopWindow[]
}

export const tripWeatherConfigs: Record<string, TripWeatherConfig> = {
  'kampung-table': {
    tripId: 'kampung-table',
    location: {
      officialLocationId: 'Ds090',
      officialLocationName: 'Johor Bahru',
      latitude: 1.4927,
      longitude: 103.7414,
    },
    stops: [
      { stopId: 'ciq-meet', label: 'Meet your host at JB CIQ', startTime: '13:30', endTime: '14:15', weatherSensitivity: 'low' },
      { stopId: 'kopitiam', label: 'Kopitiam in a 1970s shophouse row', startTime: '14:15', endTime: '15:45', weatherSensitivity: 'low' },
      { stopId: 'wet-market', label: 'Afternoon wet market walk', startTime: '15:45', endTime: '17:15', weatherSensitivity: 'moderate' },
      { stopId: 'kampung-tea', label: 'Kampung detour and tea stop', startTime: '17:15', endTime: '18:45', weatherSensitivity: 'moderate' },
      { stopId: 'seafood-dinner', label: 'Fishing-village seafood dinner', startTime: '18:45', endTime: '20:15', weatherSensitivity: 'low' },
      { stopId: 'dessert-shop', label: 'Neighbourhood dessert shop', startTime: '20:15', endTime: '21:30', weatherSensitivity: 'low' },
    ],
  },
  'petrolhead-night': {
    tripId: 'petrolhead-night',
    location: {
      officialLocationId: 'Ds090',
      officialLocationName: 'Johor Bahru',
      latitude: 1.4927,
      longitude: 103.7414,
    },
    stops: [
      { stopId: 'ciq-meet', label: 'Meet your host at JB CIQ', startTime: '14:00', endTime: '14:45', weatherSensitivity: 'low' },
      // The route description states circuit one is outdoors.
      { stopId: 'circuit-one', label: 'Circuit one — practice and first timed run', startTime: '14:45', endTime: '16:30', weatherSensitivity: 'high' },
      { stopId: 'circuit-two', label: 'Circuit two — technical laps', startTime: '16:30', endTime: '18:15', weatherSensitivity: 'low' },
      { stopId: 'bak-kut-teh', label: 'Bak kut teh and the final standings', startTime: '18:15', endTime: '19:45', weatherSensitivity: 'low' },
      { stopId: 'massage', label: '90-minute sports massage', startTime: '19:45', endTime: '21:45', weatherSensitivity: 'low' },
    ],
  },
  'end-of-asia': {
    tripId: 'end-of-asia',
    location: {
      officialLocationId: 'Ds087',
      officialLocationName: 'Pontian',
      // Tanjung Piai, the most weather-exposed stop on this route.
      latitude: 1.2644,
      longitude: 103.5089,
    },
    stops: [
      { stopId: 'ciq-meet', label: 'Meet your host at JB CIQ', startTime: '13:00', endTime: '14:30', weatherSensitivity: 'low' },
      { stopId: 'tanjung-piai', label: 'Tanjung Piai National Park', startTime: '14:30', endTime: '16:15', weatherSensitivity: 'high' },
      { stopId: 'kukup', label: 'Kukup stilt village', startTime: '16:15', endTime: '17:45', weatherSensitivity: 'high' },
      { stopId: 'pontian-cafe', label: 'Pontian café stop', startTime: '17:45', endTime: '19:00', weatherSensitivity: 'low' },
      { stopId: 'sunset-dinner', label: 'Seafood dinner as the sun goes down', startTime: '19:00', endTime: '21:45', weatherSensitivity: 'moderate' },
    ],
  },
}

export const allowedTripIds = Object.keys(tripWeatherConfigs)

export function getTripWeatherConfig(tripId: unknown): TripWeatherConfig | null {
  if (typeof tripId !== 'string') return null
  return Object.prototype.hasOwnProperty.call(tripWeatherConfigs, tripId)
    ? tripWeatherConfigs[tripId]
    : null
}

/** "14:30" → 14.5, for overlap maths against day-part windows. */
export function toDecimalHours(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (Number.isFinite(h) ? h : 0) + (Number.isFinite(m) ? m : 0) / 60
}
