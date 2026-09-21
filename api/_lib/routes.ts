/**
 * Server-side allowlist. Customers never send a search query to Pexels; they
 * send a route slug, and the query is chosen here.
 *
 * `preferredPhotoId` pins a route to one curated photo. Leave it undefined to
 * fall back to a deterministic pick from the controlled query — see
 * `/dev/photos` (development only) for choosing an id.
 */
export type RouteImageConfig = {
  slug: string
  source: 'pexels'
  query: string
  preferredPhotoId?: number
  /** Always true: these are representative photographs, not trip documentation. */
  representative: true
}

export const routeImageConfigs: Record<string, RouteImageConfig> = {
  'end-of-asia': {
    slug: 'end-of-asia',
    source: 'pexels',
    query: 'mangrove boardwalk sunset southeast asia',
    representative: true,
  },
  'kampung-table': {
    slug: 'kampung-table',
    source: 'pexels',
    query: 'malaysian local food market',
    representative: true,
  },
  'petrolhead-night': {
    slug: 'petrolhead-night',
    source: 'pexels',
    query: 'night go kart racing track',
    representative: true,
  },
}

export const allowedRoutes = Object.keys(routeImageConfigs)

export function getRouteConfig(slug: unknown): RouteImageConfig | null {
  if (typeof slug !== 'string') return null
  return Object.prototype.hasOwnProperty.call(routeImageConfigs, slug)
    ? routeImageConfigs[slug]
    : null
}
