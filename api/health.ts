import { handleHealth } from './_lib/handler.js'
import { applyResult } from './_lib/adapter.js'
import type { ServerlessResponse } from './_lib/adapter.js'

export default function handler(_req: unknown, res: ServerlessResponse) {
  applyResult(res, handleHealth(process.env))
}
