import { useEffect, useState } from 'react'
import { tours } from '../data/tours'
import { loadTripImages } from '../lib/tripImages'

/**
 * Development-only, non-blocking diagnostic. Never rendered in a production
 * build, and it reports only that the provider is unconfigured — no env detail.
 */
export function PexelsDevNotice() {
  const [code, setCode] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const route = tours[0]?.slug
    if (!route) return
    let active = true
    loadTripImages(route).then((state) => {
      if (active && state.status === 'error') setCode(state.code)
    })
    return () => {
      active = false
    }
  }, [])

  if (!code || dismissed) return null

  const notConfigured = code === 'not_configured'
  return (
    <div className="border-b border-gold/40 bg-gold-soft">
      <div className="wrap flex items-start gap-3 py-2 text-sm text-charcoal/85">
        <p className="flex-1">
          <strong className="font-semibold text-forest">Dev notice:</strong>{' '}
          {notConfigured
            ? 'Pexels is not configured, so routes are showing the brand illustrations. Add PEXELS_API_KEY to .env and restart the dev server.'
            : `Trip images unavailable (${code}). The brand illustrations are being used instead.`}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 font-semibold text-forest underline underline-offset-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
