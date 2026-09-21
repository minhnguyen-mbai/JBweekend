import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TripWeatherSection } from '../src/components/TripWeatherSection'
import { resetTripWeatherCache } from '../src/lib/weather'
import type { TripWeather } from '../src/lib/weather'

const base: TripWeather = {
  tripId: 'end-of-asia',
  tripDate: '2026-09-22',
  timezone: 'Asia/Kuala_Lumpur',
  forecastAvailable: true,
  forecastStage: 'latest',
  lastUpdated: '2026-09-21T06:00:00.000Z',
  official: {
    locationName: 'Pontian',
    summary: 'Thunderstorms in some areas',
    summaryWhen: 'Afternoon',
    morning: 'No rain',
    afternoon: 'Thunderstorms in some areas',
    night: 'No rain',
    temperatureMin: 24,
    temperatureMax: 32,
  },
  warning: { active: false },
  impact: {
    level: 'moderate',
    reasons: ['Tanjung Piai National Park is in the open, and the official outlook expects thunderstorms in some areas at that time of day.'],
    affectedStops: ['Tanjung Piai National Park'],
    recommendation: 'The boardwalk at Tanjung Piai closes during lightning.',
  },
  sources: [{ name: 'data.gov.my', label: 'Official outlook — MET Malaysia' }],
}

function stub(body: unknown, ok = true, status = 200) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok, status, json: async () => body }) as Response))
}

beforeEach(() => {
  resetTripWeatherCache()
  vi.unstubAllGlobals()
})

describe('TripWeatherSection', () => {
  it('shows a loading state while the request is in flight', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)
    expect(screen.getByRole('status')).toHaveTextContent(/loading the forecast/i)
  })

  it('renders the official outlook, day parts, impact and source', async () => {
    stub(base)
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)

    expect(await screen.findByText('Latest forecast')).toBeInTheDocument()
    expect(screen.getByText(/Thunderstorms in some areas · Afternoon/)).toBeInTheDocument()
    expect(screen.getByText('24–32°C')).toBeInTheDocument()
    expect(screen.getByText('Morning')).toBeInTheDocument()
    expect(screen.getByText('Afternoon')).toBeInTheDocument()
    expect(screen.getByText('Evening')).toBeInTheDocument()
    // Risk is stated in words, not by colour alone.
    expect(screen.getByText('Some impact possible')).toBeInTheDocument()
    // Named in both the reason and the affected-stops line.
    expect(screen.getAllByText(/Tanjung Piai National Park/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Stops that could change:/)).toBeInTheDocument()
    expect(screen.getByText(/MET Malaysia/)).toBeInTheDocument()
  })

  it('labels a four-to-seven day forecast as an early outlook', async () => {
    stub({ ...base, forecastStage: 'early-outlook' })
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-26" />)
    expect(await screen.findByText('Early outlook')).toBeInTheDocument()
  })

  it('explains that weather is not yet available beyond the horizon', async () => {
    stub({
      tripId: 'end-of-asia',
      tripDate: '2026-10-20',
      timezone: 'Asia/Kuala_Lumpur',
      forecastAvailable: false,
      forecastStage: 'outside-horizon',
      sources: [],
    })
    render(<TripWeatherSection tripId="end-of-asia" date="2026-10-20" />)
    expect(await screen.findByText(/Detailed weather will be available closer to your trip/i)).toBeInTheDocument()
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument()
  })

  it('shows the unavailable message without fabricating weather', async () => {
    stub({ error: 'provider_error' }, false, 503)
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)
    expect(
      await screen.findByText(/Live weather is temporarily unavailable/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Latest forecast/)).not.toBeInTheDocument()
  })

  it('surfaces an official warning as an alert', async () => {
    stub({
      ...base,
      warning: {
        active: true,
        severity: 'high',
        title: 'Heavy Rain Warning',
        description: 'Take precautions against possible flooding.',
      },
      impact: {
        level: 'review-required',
        reasons: ['Heavy Rain Warning'],
        affectedStops: ['Tanjung Piai National Park'],
        recommendation: 'An official weather warning is active for this area.',
      },
    })
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Heavy Rain Warning')
    expect(screen.getByText('Under review by your host')).toBeInTheDocument()
  })

  it('renders official data even when hourly data is absent', async () => {
    stub({ ...base, hourly: undefined })
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)
    expect(await screen.findByText('Latest forecast')).toBeInTheDocument()
    expect(screen.queryByText('Hourly estimate')).not.toBeInTheDocument()
  })

  it('marks a stale cached result', async () => {
    stub({ ...base, stale: true })
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)
    expect(await screen.findByText(/showing last known data/i)).toBeInTheDocument()
  })

  it('separates the hourly estimate from the official outlook', async () => {
    stub({
      ...base,
      hourly: [
        { time: '2026-09-22T14:00', precipitationProbability: 70, temperature: 30 },
        { time: '2026-09-22T15:00', precipitationProbability: 55, temperature: 29 },
      ],
      sources: [
        { name: 'data.gov.my', label: 'Official outlook — MET Malaysia' },
        { name: 'open-meteo', label: 'Hourly estimate — Open-Meteo model' },
      ],
    })
    render(<TripWeatherSection tripId="end-of-asia" date="2026-09-22" />)
    expect(await screen.findByText('Hourly estimate')).toBeInTheDocument()
    expect(screen.getByText(/Model estimate, not the official outlook/i)).toBeInTheDocument()
  })
})
