import { useEffect, useState } from 'react'
import { tours } from '../data/tours'
import { loadTripImages } from '../lib/tripImages'
import type { TripImagesState } from '../lib/tripImages'

/**
 * Development-only helper for choosing `preferredPhotoId` values. Never linked
 * from customer-facing navigation, and the route is not registered in builds.
 */
export function DevPhotosPage() {
  const [states, setStates] = useState<Record<string, TripImagesState>>({})
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    tours.forEach((tour) => {
      loadTripImages(tour.slug).then((state) =>
        setStates((prev) => ({ ...prev, [tour.slug]: state })),
      )
    })
  }, [])

  return (
    <div className="wrap py-10">
      <p className="eyebrow">Development only</p>
      <h1 className="mt-2 text-page">Pexels candidates</h1>
      <p className="copy mt-3 max-w-2xl text-charcoal/75">
        Candidates for each route, in the same deterministic order the API uses. Copy an id into{' '}
        <code className="rounded bg-sand-deep px-1.5 py-0.5 text-sm">preferredPhotoId</code> in{' '}
        <code className="rounded bg-sand-deep px-1.5 py-0.5 text-sm">api/_lib/routes.ts</code> to pin
        a route to one photograph.
      </p>

      {tours.map((tour) => {
        const state = states[tour.slug]
        return (
          <section key={tour.slug} className="mt-10">
            <h2 className="text-card">{tour.title}</h2>
            <p className="copy-sm text-sage">route slug: {tour.slug}</p>

            {!state && <p className="copy-sm mt-3 text-sage">Loading…</p>}
            {state?.status === 'error' && (
              <p className="copy-sm mt-3 rounded-xl border border-coral/30 bg-coral-soft p-3 text-coral-dark">
                {state.code}: {state.message}
              </p>
            )}
            {state?.status === 'empty' && (
              <p className="copy-sm mt-3 text-sage">No candidates returned for this query.</p>
            )}

            {state?.status === 'ready' && (
              <>
                <p className="copy-sm mt-1 text-sage">query: {state.payload.query}</p>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {state.payload.photos.map((photo, index) => (
                    <li key={photo.id} className="card overflow-hidden">
                      <img
                        src={photo.src.medium}
                        alt={photo.alt || `${tour.title} candidate ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm font-semibold text-forest">
                          id {photo.id}
                          {index === 0 && <span className="ml-2 text-xs text-teal">current pick</span>}
                        </p>
                        <p className="copy-sm text-sage">
                          {photo.photographer} · {photo.width}×{photo.height}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-quiet min-h-11 px-3 text-sm"
                            onClick={() => {
                              navigator.clipboard?.writeText(String(photo.id))
                              setCopied(photo.id)
                            }}
                          >
                            {copied === photo.id ? 'Copied' : 'Copy id'}
                          </button>
                          <a
                            href={photo.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="btn btn-quiet min-h-11 px-3 text-sm"
                          >
                            View on Pexels
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )
      })}
    </div>
  )
}
