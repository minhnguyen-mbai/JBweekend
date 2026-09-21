/**
 * Client for GET /api/trip-images. Mirrors the contract in api/_lib/pexels.ts.
 * The search query and any pinned photo id stay server-side, so the browser can
 * only ever ask for a known route slug.
 */
export type TripPhoto = {
  id: number
  width: number
  height: number
  alt: string
  avgColor: string
  photoUrl: string
  photographer: string
  photographerUrl: string
  src: {
    medium: string
    large: string
    large2x: string
    landscape: string
  }
}

export type TripImagesPayload = {
  route: string
  query: string
  representative: true
  photos: TripPhoto[]
  primary: TripPhoto | null
}

export type TripImagesError = {
  error: string
  message: string
}

export type TripImagesState =
  | { status: 'loading' }
  | { status: 'ready'; payload: TripImagesPayload }
  | { status: 'empty' }
  | { status: 'error'; code: string; message: string }

/** One in-flight request per route, reused by every card and page that needs it. */
const inFlight = new Map<string, Promise<TripImagesState>>()

export function peekTripImages(route: string): TripImagesState | undefined {
  return settled.get(route)
}

const settled = new Map<string, TripImagesState>()

export function loadTripImages(route: string): Promise<TripImagesState> {
  const done = settled.get(route)
  if (done) return Promise.resolve(done)

  const existing = inFlight.get(route)
  if (existing) return existing

  const request = fetchTripImages(route)
    .then((state) => {
      settled.set(route, state)
      return state
    })
    .finally(() => {
      inFlight.delete(route)
    })

  inFlight.set(route, request)
  return request
}

async function fetchTripImages(route: string): Promise<TripImagesState> {
  let response: Response
  try {
    response = await fetch(`/api/trip-images?route=${encodeURIComponent(route)}`, {
      headers: { Accept: 'application/json' },
    })
  } catch {
    return { status: 'error', code: 'network', message: 'Could not reach the image service.' }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { status: 'error', code: 'invalid_response', message: 'Unreadable image response.' }
  }

  if (!response.ok) {
    const err = body as Partial<TripImagesError>
    return {
      status: 'error',
      code: typeof err?.error === 'string' ? err.error : 'provider_error',
      message: typeof err?.message === 'string' ? err.message : 'Images are unavailable.',
    }
  }

  const payload = body as TripImagesPayload
  if (!payload || !Array.isArray(payload.photos) || payload.photos.length === 0) {
    return { status: 'empty' }
  }
  return { status: 'ready', payload }
}

/** Test seam. */
export function resetTripImageCache(): void {
  inFlight.clear()
  settled.clear()
}
