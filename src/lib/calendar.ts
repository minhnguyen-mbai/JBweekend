import type { Departure, Tour } from '../types'
import { toCalendarStamp } from './format'

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Builds a calendar file locally — nothing is sent anywhere. */
export function downloadIcs(tour: Tour, departure: Departure): void {
  const start = toCalendarStamp(departure.date, departure.startTime)
  const end = toCalendarStamp(departure.date, departure.endTime)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JB Weekend//Demo//EN',
    'BEGIN:VEVENT',
    `UID:${departure.id}@jbweekend.demo`,
    `DTSTAMP:${toCalendarStamp(departure.date, departure.startTime)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(`JB Weekend — ${tour.title}`)}`,
    `DESCRIPTION:${icsEscape(`${tour.hook}\nMeet your host at JB CIQ at ${departure.startTime}. Cross the border yourself and allow extra time at immigration.`)}`,
    'LOCATION:JB CIQ, Johor Bahru, Malaysia',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `jb-weekend-${tour.slug}-${departure.date}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
