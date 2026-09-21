import { useEffect, useState } from 'react'
import { loadTripWeather, peekTripWeather } from './weather'
import type { TripWeatherState } from './weather'

/** One request per trip and date, shared across cards and the detail page. */
export function useTripWeather(tripId: string, date: string | undefined): TripWeatherState {
  const [state, setState] = useState<TripWeatherState>(() =>
    date ? (peekTripWeather(tripId, date) ?? { status: 'loading' }) : { status: 'loading' },
  )
  const [renderedKey, setRenderedKey] = useState(`${tripId}:${date ?? ''}`)
  const key = `${tripId}:${date ?? ''}`

  if (renderedKey !== key) {
    setRenderedKey(key)
    setState(date ? (peekTripWeather(tripId, date) ?? { status: 'loading' }) : { status: 'loading' })
  }

  useEffect(() => {
    if (!date) return
    let active = true
    loadTripWeather(tripId, date).then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [tripId, date])

  return state
}
