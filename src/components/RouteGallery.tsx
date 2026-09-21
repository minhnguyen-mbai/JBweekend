import { useTripImages } from '../lib/useTripImages'
import { PexelsTripImage } from './PexelsTripImage'

/**
 * "A feel for the day" — up to three representative photographs. Deliberately
 * labelled: these are not pictures from a completed JB Weekend trip.
 */
export function RouteGallery({
  route,
  title,
  className = '',
}: {
  route: string
  title: string
  className?: string
}) {
  const state = useTripImages(route)
  if (state.status !== 'ready') return null

  // Skip the primary photo so the gallery adds something the hero did not.
  const photos = state.payload.photos.slice(1, 4)
  if (photos.length === 0) return null

  return (
    <section className={className} aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-card">
        A feel for the day
      </h2>
      <p className="copy-sm mt-1 max-w-2xl text-charcoal/75">
        Representative photography of this part of Johor, chosen to show the character of the route.
        These are not photographs from a JB Weekend departure.
      </p>

      {/* One image at a time on mobile with the next one peeking; a row on desktop. */}
      <ul className="no-scrollbar bleed mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {photos.map((photo, index) => (
          <li key={photo.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <PexelsTripImage
              route={route}
              photo={photo}
              illustration="kampung-table"
              title={`${title} — representative photography ${index + 1}`}
              aspect="aspect-[4/3]"
              className="overflow-hidden rounded-xl"
              imageClassName="rounded-xl"
              priority="lazy"
              sizes="(min-width: 640px) 15rem, 78vw"
              attribution="below"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
