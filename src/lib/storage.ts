const KEY = 'jbweekend.demo.v1'

export function loadState<T>(): T | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    // Private browsing or disabled storage: the demo still works, it just forgets.
    return null
  }
}

export function saveState<T>(state: T): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function makeShareCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}
