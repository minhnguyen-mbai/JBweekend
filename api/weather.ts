import { handleWeather } from './_lib/handler.js'
import { applyResult, requestUrl } from './_lib/adapter.js'
import type { ServerlessRequest, ServerlessResponse } from './_lib/adapter.js'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const result = await handleWeather(requestUrl(req), process.env)
  applyResult(res, result)
}
