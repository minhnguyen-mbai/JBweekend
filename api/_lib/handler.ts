import { TtlCache } from './cache.js'
import { getRouteConfig, allowedRoutes } from './routes.js'
import { ProviderError, fetchRoutePhotos } from './pexels.js'
import type { NormalizedPhoto } from './pexels.js'

export type ApiResult = {
  status: number
  headers: Record<string, string>
  body: unknown
}

export type TripImagesPayload = {
  route: string
  query: string
  representative: true
  photos: NormalizedPhoto[]
  primary: NormalizedPhoto | null
}

const SUCCESS_CACHE_CONTROL = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
const NO_STORE = 'no-store'

/** One day, matching s-maxage, so a warm instance and the CDN agree. */
const memoryCache = new TtlCache<TripImagesPayload>(86_400_000)

export function clearTripImageCache(): void {
  memoryCache.clear()
}

function readApiKey(env: Record<string, string | undefined>): string | null {
  const key = env.PEXELS_API_KEY
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : null
}

export function handleHealth(env: Record<string, string | undefined>): ApiResult {
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': NO_STORE },
    // A boolean only. Never the key, its length or any prefix.
    body: { status: 'ok', pexelsConfigured: readApiKey(env) !== null },
  }
}

export async function handleTripImages(
  url: URL,
  env: Record<string, string | undefined>,
): Promise<ApiResult> {
  const json = (status: number, body: unknown, cacheControl = NO_STORE): ApiResult => ({
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
    body,
  })

  const config = getRouteConfig(url.searchParams.get('route'))
  if (!config) {
    return json(400, {
      error: 'invalid_route',
      message: 'Unknown route. Provide one of the supported route slugs.',
      allowedRoutes,
    })
  }

  const apiKey = readApiKey(env)
  if (!apiKey) {
    // A controlled configuration error: no environment details leak out.
    return json(503, {
      error: 'not_configured',
      message: 'Image provider is not configured.',
      route: config.slug,
    })
  }

  const cached = memoryCache.get(config.slug)
  if (cached) return json(200, cached, SUCCESS_CACHE_CONTROL)

  try {
    const photos = await fetchRoutePhotos(config, apiKey)
    const payload: TripImagesPayload = {
      route: config.slug,
      query: config.query,
      representative: config.representative,
      photos,
      primary: photos[0] ?? null,
    }
    // An empty result is a legitimate answer, not an error, and is not cached
    // so the next request can try again.
    if (photos.length > 0) memoryCache.set(config.slug, payload)
    return json(200, payload, photos.length > 0 ? SUCCESS_CACHE_CONTROL : NO_STORE)
  } catch (error) {
    if (error instanceof ProviderError) {
      return json(error.status, {
        error: error.code,
        message: error.message,
        route: config.slug,
      })
    }
    return json(502, {
      error: 'provider_error',
      message: 'The image provider could not be reached.',
      route: config.slug,
    })
  }
}
