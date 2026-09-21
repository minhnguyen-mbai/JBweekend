import type { RouteImageConfig } from './routes.js'

export const PEXELS_API = 'https://api.pexels.com/v1'
export const REQUEST_TIMEOUT_MS = 6000
export const RESULTS_PER_PAGE = 10

/** Exactly the fields the browser needs. No provider internals, no headers. */
export type NormalizedPhoto = {
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

export type ProviderErrorCode =
  | 'not_configured'
  | 'timeout'
  | 'provider_auth'
  | 'rate_limited'
  | 'provider_error'
  | 'invalid_response'

export class ProviderError extends Error {
  readonly code: ProviderErrorCode
  readonly status: number

  constructor(code: ProviderErrorCode, message: string, status: number) {
    super(message)
    this.name = 'ProviderError'
    this.code = code
    this.status = status
  }
}

type RawPhoto = {
  id?: unknown
  width?: unknown
  height?: unknown
  alt?: unknown
  avg_color?: unknown
  url?: unknown
  photographer?: unknown
  photographer_url?: unknown
  src?: Record<string, unknown>
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/** Returns null for anything that does not carry the fields we promise. */
export function normalizePhoto(raw: RawPhoto | null | undefined): NormalizedPhoto | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw.src
  if (!src || typeof src !== 'object') return null
  if (typeof raw.id !== 'number') return null

  const medium = src.medium
  const large = src.large
  const large2x = src.large2x
  const landscape = src.landscape
  if (!isNonEmptyString(medium) || !isNonEmptyString(large)) return null

  return {
    id: raw.id,
    width: typeof raw.width === 'number' ? raw.width : 0,
    height: typeof raw.height === 'number' ? raw.height : 0,
    // Pexels alt text is often empty; the caller supplies a route-specific fallback.
    alt: isNonEmptyString(raw.alt) ? raw.alt : '',
    avgColor: isNonEmptyString(raw.avg_color) ? raw.avg_color : '#18382B',
    photoUrl: isNonEmptyString(raw.url) ? raw.url : '',
    photographer: isNonEmptyString(raw.photographer) ? raw.photographer : 'Unknown photographer',
    photographerUrl: isNonEmptyString(raw.photographer_url) ? raw.photographer_url : '',
    src: {
      medium,
      large,
      large2x: isNonEmptyString(large2x) ? large2x : large,
      landscape: isNonEmptyString(landscape) ? landscape : large,
    },
  }
}

async function callPexels(path: string, apiKey: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${PEXELS_API}${path}`, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    const name = (error as { name?: string } | null)?.name
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new ProviderError('timeout', 'The image provider did not respond in time.', 504)
    }
    throw new ProviderError('provider_error', 'Could not reach the image provider.', 502)
  }

  if (response.status === 401 || response.status === 403) {
    throw new ProviderError('provider_auth', 'The image provider rejected the request.', 502)
  }
  if (response.status === 429) {
    throw new ProviderError('rate_limited', 'The image provider rate limit was reached.', 429)
  }
  if (!response.ok) {
    throw new ProviderError('provider_error', 'The image provider returned an error.', 502)
  }

  try {
    return await response.json()
  } catch {
    throw new ProviderError('invalid_response', 'The image provider sent an unreadable response.', 502)
  }
}

/**
 * Deterministic by construction: a pinned id is fetched directly, and a search
 * is sorted by photo id so the same query always yields the same primary image.
 */
export async function fetchRoutePhotos(
  config: RouteImageConfig,
  apiKey: string,
): Promise<NormalizedPhoto[]> {
  if (config.preferredPhotoId !== undefined) {
    const raw = await callPexels(`/photos/${encodeURIComponent(String(config.preferredPhotoId))}`, apiKey)
    const photo = normalizePhoto(raw as RawPhoto)
    if (!photo) {
      throw new ProviderError('invalid_response', 'The pinned photo could not be read.', 502)
    }
    return [photo]
  }

  const params = new URLSearchParams({
    query: config.query,
    orientation: 'landscape',
    per_page: String(RESULTS_PER_PAGE),
  })
  const payload = await callPexels(`/search?${params.toString()}`, apiKey)

  const photos = (payload as { photos?: unknown } | null)?.photos
  if (!Array.isArray(photos)) {
    throw new ProviderError('invalid_response', 'The image provider sent an unreadable response.', 502)
  }

  return photos
    .map((raw) => normalizePhoto(raw as RawPhoto))
    .filter((photo): photo is NormalizedPhoto => photo !== null)
    .sort((a, b) => a.id - b.id)
}
