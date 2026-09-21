import { useEffect, useState } from 'react'
import { loadTripImages, peekTripImages } from './tripImages'
import type { TripImagesState } from './tripImages'

/**
 * Shares one normalized result per route across the homepage, Explore Trips and
 * the trip-detail page, so Pexels is not called again for every card render.
 */
export function useTripImages(route: string): TripImagesState {
  const [state, setState] = useState<TripImagesState>(
    () => peekTripImages(route) ?? { status: 'loading' },
  )
  const [renderedRoute, setRenderedRoute] = useState(route)

  // Reset during render rather than in an effect when the route changes.
  if (renderedRoute !== route) {
    setRenderedRoute(route)
    setState(peekTripImages(route) ?? { status: 'loading' })
  }

  useEffect(() => {
    let active = true
    loadTripImages(route).then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [route])

  return state
}
