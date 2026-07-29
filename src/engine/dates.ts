/**
 * Datumshilfen. Bewusst lokale Kalendertage statt UTC: Ein Check-in um 23:30 Uhr in
 * Berlin gehört zum heutigen Tag, nicht zum morgigen. `toISOString()` würde genau das
 * falsch machen — der klassische Off-by-one-Fehler in Habit-Trackern.
 */

export type DayKey = string // 'YYYY-MM-DD'

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: DayKey, days: number): DayKey {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

export function today(): DayKey {
  return toKey(new Date())
}

/** 0 = Sonntag … 6 = Samstag (wie Date.getDay). */
export function weekday(key: DayKey): number {
  return fromKey(key).getDay()
}

/**
 * ISO-8601-Wochenschlüssel, z. B. '2026-W31'. Die Woche beginnt am Montag —
 * in Deutschland die einzige Erwartung, die Nutzer haben.
 */
export function isoWeek(key: DayKey): string {
  const d = fromKey(key)
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  // Auf den Donnerstag derselben Woche schieben, der bestimmt das ISO-Jahr
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const firstDayNr = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3)
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 864e5))
  return `${target.getFullYear()}-W${pad(week)}`
}

/** Alle Tage von `from` bis `to`, beide inklusive. */
export function range(from: DayKey, to: DayKey): DayKey[] {
  const out: DayKey[] = []
  let cur = from
  // Schutz gegen versehentliche Endlosschleifen bei vertauschten Argumenten
  let guard = 0
  while (cur <= to && guard++ < 20000) {
    out.push(cur)
    cur = addDays(cur, 1)
  }
  return out
}

export const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const
export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
] as const

export function formatLong(key: DayKey): string {
  return fromKey(key).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
