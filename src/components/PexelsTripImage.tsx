import { useState } from 'react'
import { TourArt } from './TourArt'
import { useTripImages } from '../lib/useTripImages'
import type { TripPhoto } from '../lib/tripImages'

type Priority = 'eager' | 'lazy'

/**
 * Representative photography with the brand illustration as the fallback for
 * every failure path: no key, provider error, empty results or a broken image.
 * Attribution travels with the photo and is never dropped.
 */
export function PexelsTripImage({
  route,
  illustration,
  title,
  aspect = 'aspect-[16/10]',
  className = '',
  imageClassName = '',
  priority = 'lazy',
  sizes = '100vw',
  attribution = 'overlay',
  showRepresentativeLabel = false,
  illustrationFocus = 'center',
  overlay = false,
  photo: photoOverride,
}: {
  route: string
  illustration: string
  title: string
  aspect?: string
  className?: string
  imageClassName?: string
  priority?: Priority
  sizes?: string
  attribution?: 'overlay' | 'below' | 'none'
  showRepresentativeLabel?: boolean
  illustrationFocus?: 'center' | 'horizon'
  overlay?: boolean
  /** Renders a specific photo (gallery); otherwise the route's primary photo. */
  photo?: TripPhoto
}) {
  const state = useTripImages(route)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const photo = photoOverride ?? (state.status === 'ready' ? state.payload.primary : null)
  const usePhoto = photo !== null && photo !== undefined && !failed

  return (
    <figure className={`m-0 ${className}`}>
      {/* Ratio is reserved before anything loads, so nothing shifts. */}
      <div
        className={`relative w-full overflow-hidden ${aspect}`}
        style={usePhoto && !loaded ? { backgroundColor: photo.avgColor } : undefined}
      >
        {usePhoto ? (
          <>
            <img
              src={photo.src.large}
              srcSet={`${photo.src.medium} 350w, ${photo.src.large} 940w, ${photo.src.large2x} 1880w`}
              sizes={sizes}
              alt={photo.alt || `${title} — representative photography`}
              width={photo.width || undefined}
              height={photo.height || undefined}
              loading={priority === 'eager' ? 'eager' : 'lazy'}
              fetchPriority={priority === 'eager' ? 'high' : 'auto'}
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`size-full object-cover transition-opacity duration-500 ${
                loaded ? 'opacity-100' : 'opacity-0'
              } ${imageClassName}`}
            />
            {!loaded && (
              <span
                className="absolute inset-0 animate-shimmer bg-sand-deep/50"
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          // Loading, empty, provider error and image failure all land here.
          <TourArt
            image={illustration}
            title={title}
            focus={illustrationFocus}
            className={`size-full object-cover ${imageClassName}`}
          />
        )}

        {overlay && (
          <span
            className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/35 to-transparent"
            aria-hidden="true"
          />
        )}

        {usePhoto && attribution === 'overlay' && (
          <figcaption className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-end gap-x-1 px-2 py-1 text-[11px] text-white/80">
            <Credit photo={photo} className="text-white/80" />
          </figcaption>
        )}

        {showRepresentativeLabel && usePhoto && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-charcoal/65 px-2 py-0.5 text-[11px] font-medium text-white/90">
            Representative photography
          </span>
        )}
      </div>

      {usePhoto && attribution === 'below' && (
        <figcaption className="copy-sm mt-1.5 flex flex-wrap items-center gap-x-1 text-sage">
          <Credit photo={photo} />
        </figcaption>
      )}
    </figure>
  )
}

function Credit({ photo, className = '' }: { photo: TripPhoto; className?: string }) {
  return (
    <span className={className}>
      Photo by{' '}
      <a
        href={photo.photographerUrl || photo.photoUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2"
      >
        {photo.photographer}
      </a>{' '}
      on{' '}
      <a
        href={photo.photoUrl || 'https://www.pexels.com'}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2"
      >
        Pexels
      </a>
    </span>
  )
}
