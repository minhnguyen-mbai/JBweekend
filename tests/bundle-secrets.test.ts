import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Guards the boundary: provider keys, provider hosts and auth headers must never
 * reach the client bundle. Requires `npm run build` to have produced dist/.
 */
const ASSETS = 'dist/assets'

describe('client bundle', () => {
  it('contains no provider secrets or direct provider calls', () => {
    if (!existsSync(ASSETS)) {
      expect.fail('dist/assets is missing — run `npm run build` before this test')
    }
    const bundles = readdirSync(ASSETS).filter((f) => f.endsWith('.js'))
    expect(bundles.length).toBeGreaterThan(0)

    const source = bundles.map((f) => readFileSync(join(ASSETS, f), 'utf8')).join('\n')

    for (const forbidden of [
      'PEXELS_API_KEY',
      'WEATHER_HOURLY_PROVIDER',
      'api.pexels.com',
      'api.data.gov.my',
      'api.open-meteo.com',
      'Authorization',
    ]) {
      expect(source, `bundle must not contain ${forbidden}`).not.toContain(forbidden)
    }

    // The client talks only to same-origin endpoints.
    expect(source).toContain('/api/weather?tripId=')
  })
})
