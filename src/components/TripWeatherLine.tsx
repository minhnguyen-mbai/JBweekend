import { useEffect, useRef } from 'react'
import { CloudSun } from 'lucide-react'
import { useTripWeather } from '../lib/useTripWeather'
import { compactWeatherLine } from '../lib/weather'
import { track } from '../lib/analytics'

/**
 * One compact line on a trip card. Renders only when a real forecast exists for
 * that specific date and it actually says something useful.
 */
export function TripWeatherLine({ tripId, date }: { tripId: string; date: string }) {
  const state = useTripWeather(tripId, date)
  const reported = useRef(false)

  const weather = state.status === 'ready' ? state.weather : null
  const line = weather ? compactWeatherLine(weather) : null

  useEffect(() => {
    if (!weather || !line || reported.current) return
    reported.current = true
    track('weather_card_viewed', {
      tripId,
      tripDate: date,
      forecastStage: weather.forecastStage,
      impactLevel: weather.impact?.level,
    })
  }, [weather, line, tripId, date])

  if (!line) return null

  return (
    <p className="copy-sm mt-1.5 flex items-start gap-1.5 text-sage">
      <CloudSun className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span className="break-words">{line}</span>
    </p>
  )
}
