/**
 * Dates in the mock data are plain calendar dates ("2026-10-03"). Parsing them with
 * `new Date(str)` would treat them as UTC midnight and can display the wrong day
 * depending on the viewer's timezone, so we build a local Date explicitly.
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function formatPrice(amount: number): string {
  return `S$${amount.toLocaleString('en-SG')}`
}

/** "Sat, 3 Oct" */
export function formatDateShort(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** "Saturday, 3 October 2026" */
export function formatDateLong(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "Thursday 1 October, 8:00 PM" */
export function formatDeadline(iso: string): string {
  const d = new Date(iso)
  const day = d.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' })
  const time = d
    .toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toUpperCase()
    .replace(/\s/g, ' ')
  return `${day}, ${time}`
}

export function daysUntil(dateStr: string, now = new Date()): number {
  const target = parseDate(dateStr)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function isPastDate(dateStr: string, now = new Date()): boolean {
  return daysUntil(dateStr, now) < 0
}

/** "in 13 days" / "tomorrow" / "this Saturday" */
export function relativeDay(dateStr: string, now = new Date()): string {
  const diff = daysUntil(dateStr, now)
  if (diff < 0) return 'Departed'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7) return `In ${diff} days`
  if (diff < 14) return 'Next week'
  return `In ${Math.round(diff / 7)} weeks`
}

/**
 * The Saturday of the nth upcoming weekend (0 = the weekend coming up).
 * If today is a Saturday, today counts as that weekend.
 */
export function upcomingWeekend(weeksAhead: number, now = new Date()): { start: Date; end: Date } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysToSaturday = (6 - today.getDay() + 7) % 7
  const start = new Date(today)
  start.setDate(today.getDate() + daysToSaturday + weeksAhead * 7)
  const end = new Date(start)
  end.setDate(start.getDate() + 1)
  return { start, end }
}

export function isInWeekend(dateStr: string, weeksAhead: number, now = new Date()): boolean {
  const { start, end } = upcomingWeekend(weeksAhead, now)
  const d = parseDate(dateStr)
  return d >= start && d <= end
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Google Calendar wants UTC basic-format timestamps. */
export function toCalendarStamp(dateStr: string, time12h: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let hour = match ? Number(match[1]) : 12
  const minute = match ? Number(match[2]) : 0
  const meridiem = match?.[3]?.toUpperCase()
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  // Meeting times are Malaysia/Singapore time (UTC+8).
  const utc = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hour - 8, minute)
  return new Date(utc).toISOString().replace(/[-:]|\.\d{3}/g, '')
}
