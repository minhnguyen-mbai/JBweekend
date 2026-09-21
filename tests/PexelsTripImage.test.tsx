import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PexelsTripImage } from '../src/components/PexelsTripImage'
import { resetTripImageCache } from '../src/lib/tripImages'

const photo = {
  id: 321,
  width: 4000,
  height: 2500,
  alt: 'A mangrove boardwalk at sunset',
  avgColor: '#3A5A40',
  photoUrl: 'https://www.pexels.com/photo/sample-321/',
  photographer: 'Ada Lim',
  photographerUrl: 'https://www.pexels.com/@ada-lim',
  src: {
    medium: 'https://images.pexels.com/photos/321/medium.jpg',
    large: 'https://images.pexels.com/photos/321/large.jpg',
    large2x: 'https://images.pexels.com/photos/321/large2x.jpg',
    landscape: 'https://images.pexels.com/photos/321/landscape.jpg',
  },
}

function mockApi(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, status, json: async () => body }) as Response),
  )
}

beforeEach(() => {
  resetTripImageCache()
  vi.unstubAllGlobals()
})

describe('PexelsTripImage', () => {
  it('renders responsive image attributes once a photo resolves', async () => {
    mockApi({ route: 'end-of-asia', query: 'q', representative: true, photos: [photo], primary: photo })
    render(
      <PexelsTripImage
        route="end-of-asia"
        illustration="end-of-asia"
        title="End of Asia"
        sizes="(min-width: 640px) 50vw, 100vw"
      />,
    )

    const img = await screen.findByRole('img', { name: /mangrove boardwalk at sunset/i })
    expect(img).toHaveAttribute('srcset', expect.stringContaining('medium.jpg 350w'))
    expect(img).toHaveAttribute('srcset', expect.stringContaining('large2x.jpg 1880w'))
    expect(img).toHaveAttribute('sizes', '(min-width: 640px) 50vw, 100vw')
    expect(img).toHaveAttribute('decoding', 'async')
    // Dimensions are present so the slot is reserved and nothing shifts.
    expect(img).toHaveAttribute('width', '4000')
    expect(img).toHaveAttribute('height', '2500')
    // The full-size original is never requested.
    expect(img.getAttribute('srcset')).not.toContain('original')
  })

  it('loads lazily by default and eagerly when prioritised', async () => {
    mockApi({ route: 'end-of-asia', query: 'q', representative: true, photos: [photo], primary: photo })
    const { unmount } = render(
      <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="End of Asia" />,
    )
    expect(await screen.findByRole('img', { name: /mangrove/i })).toHaveAttribute('loading', 'lazy')
    unmount()

    render(
      <PexelsTripImage
        route="end-of-asia"
        illustration="end-of-asia"
        title="End of Asia"
        priority="eager"
      />,
    )
    const eager = await screen.findByRole('img', { name: /mangrove/i })
    expect(eager).toHaveAttribute('loading', 'eager')
    expect(eager).toHaveAttribute('fetchpriority', 'high')
  })

  it('renders photographer and Pexels attribution with safe link relations', async () => {
    mockApi({ route: 'end-of-asia', query: 'q', representative: true, photos: [photo], primary: photo })
    render(
      <PexelsTripImage
        route="end-of-asia"
        illustration="end-of-asia"
        title="End of Asia"
        attribution="below"
      />,
    )

    const photographerLink = await screen.findByRole('link', { name: 'Ada Lim' })
    expect(photographerLink).toHaveAttribute('href', 'https://www.pexels.com/@ada-lim')
    expect(photographerLink).toHaveAttribute('target', '_blank')
    expect(photographerLink.getAttribute('rel')).toContain('noopener')
    expect(photographerLink.getAttribute('rel')).toContain('noreferrer')

    const pexelsLink = screen.getByRole('link', { name: 'Pexels' })
    expect(pexelsLink).toHaveAttribute('href', 'https://www.pexels.com/photo/sample-321/')
  })

  it('can label the photograph as representative', async () => {
    mockApi({ route: 'end-of-asia', query: 'q', representative: true, photos: [photo], primary: photo })
    render(
      <PexelsTripImage
        route="end-of-asia"
        illustration="end-of-asia"
        title="End of Asia"
        showRepresentativeLabel
      />,
    )
    expect(await screen.findByText('Representative photography')).toBeInTheDocument()
  })

  it('falls back to the brand illustration when the provider is not configured', async () => {
    mockApi({ error: 'not_configured', message: 'Image provider is not configured.' }, false, 503)
    render(
      <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="End of Asia route" />,
    )

    // The illustration is an inline SVG labelled with the route title.
    const illustration = await screen.findByRole('img', { name: 'End of Asia route' })
    expect(illustration.tagName.toLowerCase()).toBe('svg')
    expect(screen.queryByRole('link', { name: 'Pexels' })).not.toBeInTheDocument()
  })

  it('falls back to the illustration on an empty provider result', async () => {
    mockApi({ route: 'end-of-asia', query: 'q', representative: true, photos: [], primary: null })
    render(
      <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="End of Asia route" />,
    )
    const illustration = await screen.findByRole('img', { name: 'End of Asia route' })
    expect(illustration.tagName.toLowerCase()).toBe('svg')
  })

  it('falls back to the illustration when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    render(
      <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="End of Asia route" />,
    )
    await waitFor(async () => {
      const illustration = await screen.findByRole('img', { name: 'End of Asia route' })
      expect(illustration.tagName.toLowerCase()).toBe('svg')
    })
  })

  it('shows the illustration while the request is still in flight', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    render(
      <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="End of Asia route" />,
    )
    expect(screen.getByRole('img', { name: 'End of Asia route' }).tagName.toLowerCase()).toBe('svg')
  })

  it('requests each route only once across multiple mounts', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ route: 'end-of-asia', query: 'q', representative: true, photos: [photo], primary: photo }),
    }) as Response)
    vi.stubGlobal('fetch', fetchSpy)

    render(
      <>
        <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="One" />
        <PexelsTripImage route="end-of-asia" illustration="end-of-asia" title="Two" />
      </>,
    )
    await screen.findAllByRole('img', { name: /mangrove/i })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('only ever asks the same-origin endpoint for a known slug', async () => {
    const fetchSpy = vi.fn(async (_input: string) => ({
      ok: true, status: 200,
      json: async () => ({ route: 'kampung-table', query: 'q', representative: true, photos: [photo], primary: photo }),
    }) as Response)
    vi.stubGlobal('fetch', fetchSpy)
    render(<PexelsTripImage route="kampung-table" illustration="kampung-table" title="Kampung" />)
    await screen.findByRole('img', { name: /mangrove/i })
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/trip-images?route=kampung-table')
  })
})
