/** Shape-accurate samples taken from the live api.data.gov.my schema. */
export function forecastRow(
  date: string,
  opts: {
    locationId?: string
    locationName?: string
    morning?: string
    afternoon?: string
    night?: string
    summary?: string
    when?: string
    min?: number
    max?: number
  } = {},
) {
  return {
    location: {
      location_id: opts.locationId ?? 'Ds087',
      location_name: opts.locationName ?? 'Pontian',
    },
    date,
    morning_forecast: opts.morning ?? 'Tiada Hujan',
    afternoon_forecast: opts.afternoon ?? 'Tiada Hujan',
    night_forecast: opts.night ?? 'Tiada Hujan',
    summary_forecast: opts.summary ?? 'Tiada Hujan',
    summary_when: opts.when ?? 'Sepanjang Hari',
    min_temp: opts.min ?? 24,
    max_temp: opts.max ?? 32,
  }
}

export function warningRow(overrides: Record<string, unknown> = {}) {
  return {
    warning_issue: {
      issued: '2026-09-21T09:00:00',
      title_bm: 'Amaran Hujan Lebat',
      title_en: 'Heavy Rain Warning',
    },
    valid_from: '2026-09-20T00:00:00',
    valid_to: '2026-09-30T00:00:00',
    heading_en: 'SECOND CATEGORY WARNING ON HEAVY RAIN',
    text_en: 'Heavy rain is expected over Johor until Wednesday.',
    instruction_en: 'Take precautions against possible flooding.',
    heading_bm: '',
    text_bm: '',
    instruction_bm: '',
    ...overrides,
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}
