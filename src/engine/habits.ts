/**
 * Habit Engine — Frequenzen, Streaks mit Ruhetagen, Kennzahlen.
 * Reine Funktionen ohne DOM und ohne React: vollständig unit-testbar (siehe habits.test.ts).
 *
 * Die zentrale Produktentscheidung steckt in `computeStreak`: Eine Serie darf einen
 * geplanten Tag überspringen, ohne zu reißen, solange das wöchentliche Ruhetage-Budget
 * reicht. Genau daran scheitern übliche Tracker — eine Erkältung löscht 80 Tage Fortschritt,
 * und danach kommt niemand zurück.
 */
import { addDays, isoWeek, range, today, weekday, type DayKey } from './dates'

export type Frequency =
  | { kind: 'daily' }
  /** X-mal pro Woche, Tag frei wählbar */
  | { kind: 'weekly'; times: number }
  /** feste Wochentage, 0 = Sonntag */
  | { kind: 'weekdays'; days: number[] }

export const CATEGORIES = [
  { id: 'fitness', name: 'Fitness', color: '#ff3b5c' },
  { id: 'mental', name: 'Mental', color: '#4fb477' },
  { id: 'wasser', name: 'Wasser', color: '#22b8ff' },
  { id: 'schlaf', name: 'Schlaf', color: '#7c8cff' },
  { id: 'lernen', name: 'Lernen', color: '#a855f7' },
  { id: 'sonstiges', name: 'Sonstiges', color: '#6366f1' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export type Habit = {
  id: string
  name: string
  icon: string
  color: string
  frequency: Frequency
  /** erlaubte Aussetzer pro Kalenderwoche, ohne dass die Serie reißt */
  graceDays: number
  createdAt: DayKey
  archived?: boolean
  /** Uhrzeit der Erinnerung als 'HH:MM'; nicht gesetzt = keine Erinnerung */
  reminder?: string
  category?: CategoryId
}

/** Prüft eine Uhrzeit im Format 'HH:MM'. Alles andere wird verworfen statt gespeichert. */
export function isValidTime(value: string): boolean {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
  return m !== null
}

/** Minuten seit Mitternacht; -1 bei ungültiger Eingabe. */
export function minutesOfDay(time: string): number {
  if (!isValidTime(time)) return -1
  const [h, m] = time.trim().split(':').map(Number)
  return h * 60 + m
}

export type Entry = {
  done: boolean
  /** 1 = mies … 5 = großartig */
  mood?: number
  note?: string
}

/** habitId -> Tagesschlüssel -> Eintrag */
export type Log = Record<string, Record<DayKey, Entry>>

export const HABIT_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#84cc16',
] as const

export const MOOD_LABELS = ['', 'mies', 'mäßig', 'okay', 'gut', 'großartig'] as const

/** „1 Tag" statt „1 Tage" — Zahlwort und Einheit müssen zusammenpassen. */
export function unitLabel(unit: 'Tage' | 'Wochen', count: number): string {
  if (count !== 1) return unit
  return unit === 'Tage' ? 'Tag' : 'Woche'
}

/* -------------------------------- Frequenzen ------------------------------- */

/** Ist der Tag für dieses Habit eingeplant? Bei „X-mal pro Woche" zählt jeder Tag. */
export function isScheduled(habit: Habit, day: DayKey): boolean {
  if (day < habit.createdAt) return false
  switch (habit.frequency.kind) {
    case 'daily':
      return true
    case 'weekdays':
      return habit.frequency.days.includes(weekday(day))
    case 'weekly':
      return true
  }
}

export function describeFrequency(f: Frequency): string {
  if (f.kind === 'daily') return 'Täglich'
  if (f.kind === 'weekly') return `${f.times}× pro Woche`
  const labels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const days = [...f.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  return days.length ? days.map((d) => labels[d]).join(', ') : 'Keine Tage gewählt'
}

const isDone = (log: Log, habitId: string, day: DayKey) => log[habitId]?.[day]?.done === true

/* ---------------------------------- Streaks -------------------------------- */

export type StreakInfo = {
  current: number
  longest: number
  /** in dieser Woche bereits verbrauchte Ruhetage */
  restUsedThisWeek: number
  restLeftThisWeek: number
  /** Einheit der Zählung — bei „X-mal pro Woche" sind es Wochen, sonst Tage */
  unit: 'Tage' | 'Wochen'
}

/**
 * Serienberechnung. Läuft einmal vorwärts durch die Historie und liefert aktuelle und
 * längste Serie in einem Durchgang.
 *
 * Regeln:
 * - Täglich / feste Wochentage: gezählt werden erledigte geplante Tage. Ein verpasster
 *   geplanter Tag verbraucht einen Ruhetag der betroffenen Kalenderwoche; ist das Budget
 *   aufgebraucht, reißt die Serie.
 * - Der heutige Tag reißt nie — solange der Tag läuft, ist er offen, nicht verpasst.
 * - X-mal pro Woche: gezählt werden erfüllte Kalenderwochen. Die laufende Woche zählt
 *   erst, wenn das Ziel erreicht ist, bricht die Serie aber nie ab.
 */
export function computeStreak(habit: Habit, log: Log, upTo: DayKey = today()): StreakInfo {
  if (habit.frequency.kind === 'weekly') return weeklyStreak(habit, log, upTo)

  let current = 0
  let longest = 0
  const missesPerWeek: Record<string, number> = {}

  for (const day of range(habit.createdAt, upTo)) {
    if (!isScheduled(habit, day)) continue
    if (isDone(log, habit.id, day)) {
      current++
      if (current > longest) longest = current
      continue
    }
    if (day === upTo) continue // heute ist noch offen

    const week = isoWeek(day)
    missesPerWeek[week] = (missesPerWeek[week] ?? 0) + 1
    if (missesPerWeek[week] > habit.graceDays) current = 0
  }

  const used = missesPerWeek[isoWeek(upTo)] ?? 0
  return {
    current,
    longest,
    restUsedThisWeek: used,
    restLeftThisWeek: Math.max(0, habit.graceDays - used),
    unit: 'Tage',
  }
}

function weeklyStreak(habit: Habit, log: Log, upTo: DayKey): StreakInfo {
  const target = habit.frequency.kind === 'weekly' ? habit.frequency.times : 1
  const perWeek: Record<string, number> = {}
  for (const day of range(habit.createdAt, upTo)) {
    const week = isoWeek(day)
    perWeek[week] = (perWeek[week] ?? 0) + (isDone(log, habit.id, day) ? 1 : 0)
  }

  let current = 0
  let longest = 0
  const currentWeek = isoWeek(upTo)
  for (const week of Object.keys(perWeek).sort()) {
    const reached = perWeek[week] >= target
    if (reached) {
      current++
      if (current > longest) longest = current
    } else if (week !== currentWeek) {
      current = 0
    }
  }

  return {
    current,
    longest,
    restUsedThisWeek: 0,
    restLeftThisWeek: 0,
    unit: 'Wochen',
  }
}

/* --------------------------------- Kennzahlen ------------------------------ */

/** Fortschritt der laufenden Woche — für „X-mal pro Woche" die eigentliche Zielanzeige. */
export function weekProgress(habit: Habit, log: Log, upTo: DayKey = today()) {
  const week = isoWeek(upTo)
  let done = 0
  let scheduled = 0
  for (const day of range(addDays(upTo, -6), upTo)) {
    if (isoWeek(day) !== week) continue
    if (isScheduled(habit, day)) scheduled++
    if (isDone(log, habit.id, day)) done++
  }
  const target = habit.frequency.kind === 'weekly' ? habit.frequency.times : scheduled
  return { done, target: Math.max(target, 0) }
}

/** Erfüllungsquote über die letzten `days` Tage, gemessen an geplanten Tagen. */
export function completionRate(habit: Habit, log: Log, days = 30, upTo: DayKey = today()): number {
  let planned = 0
  let done = 0
  for (const day of range(addDays(upTo, -(days - 1)), upTo)) {
    if (day < habit.createdAt || !isScheduled(habit, day)) continue
    planned++
    if (isDone(log, habit.id, day)) done++
  }
  return planned === 0 ? 0 : Math.round((done / planned) * 100)
}

export type Cell = {
  day: DayKey
  state: 'done' | 'missed' | 'rest' | 'unplanned' | 'future'
  mood?: number
}

/**
 * Datengrundlage der Heatmap. `rest` markiert einen verpassten Tag, der noch vom
 * Ruhetage-Budget gedeckt ist — er wird anders eingefärbt als ein echter Ausfall,
 * damit die Matrix ehrlich bleibt, ohne zu bestrafen.
 */
export function heatmap(
  habit: Habit,
  log: Log,
  from: DayKey,
  to: DayKey,
  // Wie überall in dieser Datei einstellbar statt aus der Systemuhr gelesen: sonst hängt
  // das Ergebnis am Zeitpunkt des Aufrufs und lässt sich weder testen noch reproduzieren.
  upTo: DayKey = today(),
): Cell[] {
  const missesPerWeek: Record<string, number> = {}
  const now = upTo
  return range(from, to).map((day) => {
    const entry = log[habit.id]?.[day]
    if (day > now) return { day, state: 'future' }
    if (day < habit.createdAt || !isScheduled(habit, day)) return { day, state: 'unplanned' }
    if (entry?.done) return { day, state: 'done', mood: entry.mood }
    if (day === now) return { day, state: 'future' }
    const week = isoWeek(day)
    missesPerWeek[week] = (missesPerWeek[week] ?? 0) + 1
    return { day, state: missesPerWeek[week] <= habit.graceDays ? 'rest' : 'missed' }
  })
}

/** Wurde heute schon alles erledigt? Grundlage für die Tagesanzeige im Dashboard. */
export function dayScore(habits: Habit[], log: Log, day: DayKey = today()) {
  const planned = habits.filter((h) => !h.archived && isScheduled(h, day))
  const done = planned.filter((h) => isDone(log, h.id, day))
  return { done: done.length, planned: planned.length }
}
