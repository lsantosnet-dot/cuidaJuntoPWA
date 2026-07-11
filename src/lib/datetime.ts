import type { AppLanguage } from '@/lib/i18n'

const LOCALES: Record<AppLanguage, string> = {
  pt: 'pt-BR',
  en: 'en-US',
}

function locale(lang: AppLanguage): string {
  return LOCALES[lang] ?? 'pt-BR'
}

/** "08:30" style clock, from an ISO timestamp or Date. */
export function formatTime(value: string | Date, lang: AppLanguage): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleTimeString(locale(lang), { hour: '2-digit', minute: '2-digit' })
}

/** Localized medium date, e.g. "10 de jul. de 2026". */
export function formatDate(value: string | Date, lang: AppLanguage): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString(locale(lang), { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Relative-ish label: "Hoje/Today", "Ontem/Yesterday" or a medium date. */
export function formatDayLabel(value: string | Date, lang: AppLanguage): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const today = new Date()
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86_400_000)
  if (diffDays === 0) return lang === 'pt' ? 'Hoje' : 'Today'
  if (diffDays === 1) return lang === 'pt' ? 'Ontem' : 'Yesterday'
  return formatDate(d, lang)
}

/** Today's date as YYYY-MM-DD (local). */
export function todayISODate(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * Start/end of the LOCAL day as UTC instants (ISO). Use these for timestamptz
 * range queries: naive strings like "2026-07-10T00:00:00" are read as UTC by
 * Postgres and shift the window by the timezone offset, dropping evening doses.
 */
export function localDayRangeISO(): { start: string; end: string } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

/** Combines today's date with an "HH:mm" time into an ISO timestamp. */
export function todayAtTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toISOString()
}
