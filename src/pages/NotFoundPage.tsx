import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="wrap flex max-w-xl flex-col items-center py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-forest-soft text-forest">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-page">That road does not go anywhere</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">
        The page you are looking for is not here. The departures board is the best place to start —
        three routes, a handful of dates, three seats each.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/trips" className="btn btn-primary">
          See upcoming trips
        </Link>
        <Link to="/" className="btn btn-quiet">
          Back to home
        </Link>
      </div>
    </div>
  )
}
