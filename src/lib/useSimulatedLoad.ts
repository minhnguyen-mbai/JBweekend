import { useEffect, useState } from 'react'

/**
 * Demo-only: shows the loading skeletons once per surface per session so the
 * loading state is real, without adding a delay every time you navigate back.
 */
const seen = new Set<string>()

export function useSimulatedLoad(key: string, ms = 420): boolean {
  const [loading, setLoading] = useState(() => !seen.has(key))

  useEffect(() => {
    if (seen.has(key)) return
    const timer = window.setTimeout(() => {
      seen.add(key)
      setLoading(false)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [key, ms])

  return loading
}
