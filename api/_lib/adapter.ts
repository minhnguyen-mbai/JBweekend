import type { ApiResult } from './handler.js'

/**
 * Structural types for the Node request/response a serverless platform hands us.
 * Typing them here keeps the functions free of a platform SDK dependency.
 */
export type ServerlessRequest = {
  url?: string
  headers: Record<string, string | string[] | undefined>
}

export type ServerlessResponse = {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
}

export function requestUrl(req: ServerlessRequest): URL {
  const host = req.headers.host
  const base = `http://${typeof host === 'string' && host ? host : 'localhost'}`
  return new URL(req.url ?? '/', base)
}

export function applyResult(res: ServerlessResponse, result: ApiResult): void {
  res.statusCode = result.status
  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value)
  res.end(JSON.stringify(result.body))
}
