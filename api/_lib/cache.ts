/**
 * Small in-memory TTL cache. Warm serverless invocations reuse it; cold starts
 * simply miss. HTTP cache headers do the heavy lifting at the CDN.
 */
type Entry<T> = { value: T; expiresAt: number }

export class TtlCache<T> {
  private store = new Map<string, Entry<T>>()
  private ttlMs: number
  private maxEntries: number

  constructor(ttlMs: number, maxEntries = 50) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
  }

  get(key: string): T | undefined {
    const hit = this.store.get(key)
    if (!hit) return undefined
    if (hit.expiresAt < Date.now()) {
      this.store.delete(key)
      return undefined
    }
    return hit.value
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value
      if (oldest !== undefined) this.store.delete(oldest)
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs })
  }

  clear(): void {
    this.store.clear()
  }
}
