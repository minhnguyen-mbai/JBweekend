import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleHealth, handleTripImages, clearTripImageCache } from '../api/_lib/handler'
import { normalizePhoto } from '../api/_lib/pexels'
import { jsonResponse, pexelsPhoto, searchResponse } from './fixtures'

const ENV = { PEXELS_API_KEY: 'test-key-not-real' }
const url = (route?: string) =>
  new URL(`http://localhost/api/trip-images${route === undefined ? '' : `?route=${route}`}`)

beforeEach(() => {
  clearTripImageCache()
  vi.unstubAllGlobals()
})

describe('route validation', () => {
  it('accepts a known route slug', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(searchResponse([30, 10, 20]))))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.status).toBe(200)
    expect((res.body as { route: string }).route).toBe('end-of-asia')
  })

  it.each(['unknown-route', '../../etc/passwd', '', 'END-OF-ASIA'])(
    'rejects %s with 400 and never calls the provider',
    async (slug) => {
      const fetchSpy = vi.fn()
      vi.stubGlobal('fetch', fetchSpy)
      const res = await handleTripImages(url(encodeURIComponent(slug)), ENV)
      expect(res.status).toBe(400)
      expect((res.body as { error: string }).error).toBe('invalid_route')
      expect(fetchSpy).not.toHaveBeenCalled()
    },
  )

  it('rejects a missing route parameter', async () => {
    const res = await handleTripImages(url(), ENV)
    expect(res.status).toBe(400)
  })
})

describe('missing API key', () => {
  it('returns a controlled configuration error without leaking environment details', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const res = await handleTripImages(url('kampung-table'), {})
    expect(res.status).toBe(503)
    const body = res.body as Record<string, unknown>
    expect(body.error).toBe('not_configured')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(JSON.stringify(body)).not.toMatch(/PEXELS|key|env/i)
  })

  it('treats a blank key as missing', async () => {
    const res = await handleTripImages(url('kampung-table'), { PEXELS_API_KEY: '   ' })
    expect(res.status).toBe(503)
  })
})

describe('normalization', () => {
  it('returns only the agreed fields and drops provider extras', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(searchResponse([101]))))
    const res = await handleTripImages(url('kampung-table'), ENV)
    const photo = (res.body as { photos: Record<string, unknown>[] }).photos[0]
    expect(Object.keys(photo).sort()).toEqual(
      ['alt', 'avgColor', 'height', 'id', 'photoUrl', 'photographer', 'photographerUrl', 'src', 'width'].sort(),
    )
    expect(Object.keys(photo.src as object).sort()).toEqual(
      ['landscape', 'large', 'large2x', 'medium'].sort(),
    )
    expect(JSON.stringify(photo)).not.toContain('original')
  })

  it('keeps attribution fields intact', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(searchResponse([55]))))
    const res = await handleTripImages(url('kampung-table'), ENV)
    const photo = (res.body as { photos: Record<string, unknown>[] }).photos[0]
    expect(photo.photographer).toBe('Photographer 55')
    expect(photo.photographerUrl).toBe('https://www.pexels.com/@photographer-55')
    expect(photo.photoUrl).toBe('https://www.pexels.com/photo/sample-55/')
  })

  it('discards entries missing required fields instead of inventing them', () => {
    expect(normalizePhoto(pexelsPhoto(1, { src: undefined }))).toBeNull()
    expect(normalizePhoto(pexelsPhoto(2, { id: 'nope' }))).toBeNull()
    expect(normalizePhoto(null)).toBeNull()
  })
})

describe('deterministic selection', () => {
  it('picks the same primary photo regardless of provider ordering', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(searchResponse([900, 100, 500]))))
    const first = await handleTripImages(url('end-of-asia'), ENV)
    clearTripImageCache()
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(searchResponse([500, 900, 100]))))
    const second = await handleTripImages(url('end-of-asia'), ENV)

    const idOf = (r: typeof first) => (r.body as { primary: { id: number } }).primary.id
    expect(idOf(first)).toBe(100)
    expect(idOf(second)).toBe(100)
  })

  it('requests the pinned photo directly when preferredPhotoId is set', async () => {
    const routes = await import('../api/_lib/routes')
    const original = routes.routeImageConfigs['end-of-asia']
    routes.routeImageConfigs['end-of-asia'] = { ...original, preferredPhotoId: 424242 }
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => jsonResponse(pexelsPhoto(424242)))
    vi.stubGlobal('fetch', fetchSpy)

    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(fetchSpy.mock.calls[0][0]).toContain('/photos/424242')
    expect((res.body as { primary: { id: number } }).primary.id).toBe(424242)

    routes.routeImageConfigs['end-of-asia'] = original
  })
})

describe('provider failures', () => {
  it('reports an empty result without inventing metadata', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ photos: [] })))
    const res = await handleTripImages(url('petrolhead-night'), ENV)
    expect(res.status).toBe(200)
    const body = res.body as { photos: unknown[]; primary: unknown }
    expect(body.photos).toEqual([])
    expect(body.primary).toBeNull()
    expect(res.headers['Cache-Control']).toBe('no-store')
  })

  it('maps an authorization failure to a provider error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 401)))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.status).toBe(502)
    expect((res.body as { error: string }).error).toBe('provider_auth')
  })

  it('maps a rate limit to 429', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 429)))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.status).toBe(429)
    expect((res.body as { error: string }).error).toBe('rate_limited')
  })

  it('maps a timeout to 504', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      const err = new Error('timed out')
      err.name = 'TimeoutError'
      throw err
    }))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.status).toBe(504)
    expect((res.body as { error: string }).error).toBe('timeout')
  })

  it('maps an unreadable payload to invalid_response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ nope: true })))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.status).toBe(502)
    expect((res.body as { error: string }).error).toBe('invalid_response')
  })

  it('never echoes the API key in any response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 500)))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(JSON.stringify(res.body)).not.toContain(ENV.PEXELS_API_KEY)
  })
})

describe('caching', () => {
  it('sets CDN cache headers on a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(searchResponse([7]))))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.headers['Cache-Control']).toContain('s-maxage=86400')
    expect(res.headers['Cache-Control']).toContain('stale-while-revalidate=604800')
  })

  it('serves a repeat request from memory without calling the provider again', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(searchResponse([7, 8])))
    vi.stubGlobal('fetch', fetchSpy)
    await handleTripImages(url('kampung-table'), ENV)
    await handleTripImages(url('kampung-table'), ENV)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('does not cache error responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 500)))
    const res = await handleTripImages(url('end-of-asia'), ENV)
    expect(res.headers['Cache-Control']).toBe('no-store')
  })
})

describe('health', () => {
  it('reports configuration as a boolean only', () => {
    const configured = handleHealth(ENV).body as Record<string, unknown>
    expect(configured).toEqual({ status: 'ok', pexelsConfigured: true })
    expect(JSON.stringify(configured)).not.toContain(ENV.PEXELS_API_KEY)

    const missing = handleHealth({}).body as Record<string, unknown>
    expect(missing.pexelsConfigured).toBe(false)
  })
})

describe('request construction', () => {
  it('sends the authorization header and an encoded landscape query', async () => {
    const fetchSpy = vi.fn(async (_url: string, _init?: RequestInit) => jsonResponse(searchResponse([1])))
    vi.stubGlobal('fetch', fetchSpy)
    await handleTripImages(url('kampung-table'), ENV)

    const [requestUrl, init] = fetchSpy.mock.calls[0]
    expect(requestUrl).toContain('query=malaysian+local+food+market')
    expect(requestUrl).toContain('orientation=landscape')
    expect((init?.headers as Record<string, string>).Authorization).toBe(ENV.PEXELS_API_KEY)
  })
})
