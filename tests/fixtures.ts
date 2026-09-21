/** Shape-accurate sample of a Pexels search payload. No real API is ever called. */
export function pexelsPhoto(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    width: 4000,
    height: 2500,
    url: `https://www.pexels.com/photo/sample-${id}/`,
    photographer: `Photographer ${id}`,
    photographer_url: `https://www.pexels.com/@photographer-${id}`,
    avg_color: '#3A5A40',
    alt: `Sample photo ${id}`,
    src: {
      original: `https://images.pexels.com/photos/${id}/original.jpg`,
      medium: `https://images.pexels.com/photos/${id}/medium.jpg`,
      large: `https://images.pexels.com/photos/${id}/large.jpg`,
      large2x: `https://images.pexels.com/photos/${id}/large2x.jpg`,
      landscape: `https://images.pexels.com/photos/${id}/landscape.jpg`,
    },
    ...overrides,
  }
}

export function searchResponse(ids: number[]) {
  return { page: 1, per_page: ids.length, photos: ids.map((id) => pexelsPhoto(id)) }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}
