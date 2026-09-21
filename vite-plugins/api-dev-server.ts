import { loadEnv } from 'vite'
import type { Plugin } from 'vite'
import type { ApiResult } from '../api/_lib/handler.js'

/**
 * Mounts the same handlers the serverless functions use onto Vite's dev server,
 * so `/api/*` behaves identically in development without a second backend.
 *
 * Env is read with an empty prefix so PEXELS_API_KEY stays server-side and is
 * never exposed as a VITE_ variable.
 */
export function apiDevServer(): Plugin {
  let env: Record<string, string> = {}

  return {
    name: 'jb-weekend:api-dev-server',
    apply: 'serve',
    config(_config, { mode }) {
      env = loadEnv(mode, process.cwd(), '')
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? ''
        if (!rawUrl.startsWith('/api/')) return next()

        const url = new URL(rawUrl, `http://${req.headers.host ?? 'localhost'}`)
        const serverEnv = { ...env, ...process.env }

        try {
          const mod = (await server.ssrLoadModule('/api/_lib/handler.ts')) as {
            handleHealth: (e: Record<string, string | undefined>) => ApiResult
            handleTripImages: (u: URL, e: Record<string, string | undefined>) => Promise<ApiResult>
            handleWeather: (u: URL, e: Record<string, string | undefined>) => Promise<ApiResult>
          }

          let result: ApiResult
          if (url.pathname === '/api/health') {
            result = mod.handleHealth(serverEnv)
          } else if (url.pathname === '/api/trip-images') {
            result = await mod.handleTripImages(url, serverEnv)
          } else if (url.pathname === '/api/weather') {
            result = await mod.handleWeather(url, serverEnv)
          } else {
            result = {
              status: 404,
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
              body: { error: 'not_found', message: 'Unknown API route.' },
            }
          }

          res.statusCode = result.status
          for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value)
          res.end(JSON.stringify(result.body))
        } catch (error) {
          server.config.logger.error(`[api-dev-server] ${String(error)}`)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'dev_server_error', message: 'API handler failed.' }))
        }
      })
    },
  }
}
