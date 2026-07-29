import { expect, test } from 'vitest'
import { dueToday, habitFromHash, msUntil } from './reminders'
import { isValidTime, minutesOfDay, type Habit, type Log } from '../engine/habits'

const MON = '2026-07-27' // Montag
const habit = (over: Partial<Habit> = {}): Habit => ({
  id: 'h1',
  name: 'Wasser trinken',
  icon: '💧',
  color: '#22b8ff',
  frequency: { kind: 'daily' },
  graceDays: 0,
  createdAt: MON,
  reminder: '08:00',
  ...over,
})

test('Uhrzeiten werden streng geprüft', () => {
  for (const ok of ['00:00', '08:05', '23:59']) expect(isValidTime(ok)).toBe(true)
  for (const bad of ['24:00', '8:00', '07:60', '', 'acht', '08:00:00']) {
    expect(isValidTime(bad)).toBe(false)
  }
})

test('Minuten seit Mitternacht, -1 bei Unsinn', () => {
  expect(minutesOfDay('00:00')).toBe(0)
  expect(minutesOfDay('08:30')).toBe(510)
  expect(minutesOfDay('23:59')).toBe(1439)
  expect(minutesOfDay('25:00')).toBe(-1)
})

test('nur geplante Habits mit Erinnerungszeit werden fällig', () => {
  const habits = [
    habit({ id: 'a' }),
    habit({ id: 'b', reminder: undefined }), // keine Erinnerung gesetzt
    habit({ id: 'c', reminder: 'morgens' }), // ungültige Zeit
    habit({ id: 'd', archived: true }),
    habit({ id: 'e', frequency: { kind: 'weekdays', days: [0] } }), // nur sonntags
  ]
  expect(dueToday(habits, {}, MON).map((i) => i.habitId)).toEqual(['a'])
})

test('erledigte Habits werden als erledigt gemeldet, nicht ausgeblendet', () => {
  // Der Worker muss den Stand kennen, um die Meldung zu unterdrücken — nicht die Seite
  const log: Log = { h1: { [MON]: { done: true } } }
  const items = dueToday([habit()], log, MON)
  expect(items).toHaveLength(1)
  expect(items[0].done).toBe(true)
})

test('msUntil zählt vorwärts und rückwärts innerhalb des Tages', () => {
  const now = new Date(2026, 6, 27, 7, 0, 0)
  expect(msUntil('08:00', now)).toBe(60 * 60 * 1000)
  expect(msUntil('06:30', now)).toBe(-30 * 60 * 1000)
  expect(msUntil('07:00', now)).toBe(0)
  expect(Number.isNaN(msUntil('kaputt', now))).toBe(true)
})

test('msUntil ignoriert Sekunden der aktuellen Zeit nicht stillschweigend', () => {
  const now = new Date(2026, 6, 27, 7, 59, 30)
  expect(msUntil('08:00', now)).toBe(30 * 1000)
})

test('Deep Link liefert die Habit-ID, sonst null', () => {
  expect(habitFromHash('#/app?habit=abc-123')).toBe('abc-123')
  expect(habitFromHash('#/app')).toBeNull()
  expect(habitFromHash('#/app?other=1')).toBeNull()
  expect(habitFromHash('')).toBeNull()
})
