import { expect, test } from 'vitest'
import { addDays, isoWeek, range, toKey, weekday } from './dates'
import {
  completionRate,
  computeStreak,
  dayScore,
  describeFrequency,
  heatmap,
  isScheduled,
  weekProgress,
  unitLabel,
  type Habit,
  type Log,
} from './habits'

/* Fester Bezugspunkt statt "heute": Sonntag, 2026-07-26 … Sonntag, 2026-08-02.
   2026-07-27 ist ein Montag, also Wochenanfang nach ISO. */
const MON = '2026-07-27'
const habit = (over: Partial<Habit> = {}): Habit => ({
  id: 'h1',
  name: 'Lesen',
  icon: 'book',
  color: '#6366f1',
  frequency: { kind: 'daily' },
  graceDays: 0,
  createdAt: MON,
  ...over,
})

const logFrom = (days: string[]): Log => ({
  h1: Object.fromEntries(days.map((d) => [d, { done: true }])),
})

/* ---------------------------------- Daten ---------------------------------- */

test('Tagesschlüssel folgt der lokalen Zeitzone, nicht UTC', () => {
  // 23:30 Uhr Ortszeit muss noch zum selben Kalendertag gehören
  const late = new Date(2026, 6, 27, 23, 30)
  expect(toKey(late)).toBe('2026-07-27')
  expect(weekday('2026-07-27')).toBe(1) // Montag
})

test('ISO-Woche beginnt am Montag und wechselt korrekt', () => {
  expect(isoWeek('2026-07-26')).not.toBe(isoWeek('2026-07-27')) // So vs. Mo
  expect(isoWeek('2026-07-27')).toBe(isoWeek('2026-08-02')) // Mo bis So = dieselbe Woche
  expect(isoWeek('2026-08-02')).not.toBe(isoWeek('2026-08-03'))
})

test('range liefert beide Grenzen und kehrt bei vertauschten Argumenten nichts zurück', () => {
  expect(range('2026-07-27', '2026-07-29')).toEqual(['2026-07-27', '2026-07-28', '2026-07-29'])
  expect(range('2026-07-29', '2026-07-27')).toEqual([])
})

/* -------------------------------- Frequenzen ------------------------------- */

test('feste Wochentage planen nur die gewählten Tage ein', () => {
  const h = habit({ frequency: { kind: 'weekdays', days: [1, 3, 5] } }) // Mo, Mi, Fr
  expect(isScheduled(h, '2026-07-27')).toBe(true) // Mo
  expect(isScheduled(h, '2026-07-28')).toBe(false) // Di
  expect(isScheduled(h, '2026-07-29')).toBe(true) // Mi
})

test('vor dem Anlegedatum ist nichts eingeplant', () => {
  expect(isScheduled(habit(), '2026-07-26')).toBe(false)
})

test('Frequenzen werden lesbar beschrieben', () => {
  expect(describeFrequency({ kind: 'daily' })).toBe('Täglich')
  expect(describeFrequency({ kind: 'weekly', times: 3 })).toBe('3× pro Woche')
  expect(describeFrequency({ kind: 'weekdays', days: [5, 1] })).toBe('Mo, Fr')
  expect(describeFrequency({ kind: 'weekdays', days: [] })).toBe('Keine Tage gewählt')
})

/* ---------------------------------- Streaks -------------------------------- */

test('lückenlose Tage ergeben eine Serie in voller Länge', () => {
  const days = range(MON, addDays(MON, 4))
  const s = computeStreak(habit(), logFrom(days), addDays(MON, 4))
  expect(s.current).toBe(5)
  expect(s.longest).toBe(5)
})

test('ohne Ruhetage reißt die Serie beim ersten verpassten Tag', () => {
  // Mo, Di erledigt – Mi verpasst – Do, Fr erledigt
  const log = logFrom([MON, addDays(MON, 1), addDays(MON, 3), addDays(MON, 4)])
  const s = computeStreak(habit({ graceDays: 0 }), log, addDays(MON, 4))
  expect(s.current).toBe(2) // nur Do + Fr
  expect(s.longest).toBe(2)
})

test('ein Ruhetag pro Woche hält die Serie über eine Lücke hinweg', () => {
  const log = logFrom([MON, addDays(MON, 1), addDays(MON, 3), addDays(MON, 4)])
  const s = computeStreak(habit({ graceDays: 1 }), log, addDays(MON, 4))
  expect(s.current).toBe(4) // Mi als Ruhetag verbucht, Serie läuft weiter
  expect(s.restUsedThisWeek).toBe(1)
  expect(s.restLeftThisWeek).toBe(0)
})

test('der zweite Ausfall derselben Woche reißt die Serie trotz Ruhetag', () => {
  // Mo erledigt, Di + Mi verpasst, Do + Fr erledigt
  const log = logFrom([MON, addDays(MON, 3), addDays(MON, 4)])
  const s = computeStreak(habit({ graceDays: 1 }), log, addDays(MON, 4))
  expect(s.current).toBe(2)
  expect(s.restUsedThisWeek).toBe(2)
  expect(s.restLeftThisWeek).toBe(0)
})

test('das Ruhetage-Budget füllt sich in der neuen Woche wieder auf', () => {
  // Woche 1: Mi verpasst. Woche 2: Mi verpasst. Mit 1 Ruhetag/Woche hält die Serie durch.
  const all = range(MON, addDays(MON, 13))
  const missed = [addDays(MON, 2), addDays(MON, 9)]
  const log = logFrom(all.filter((d) => !missed.includes(d)))
  const s = computeStreak(habit({ graceDays: 1 }), log, addDays(MON, 13))
  expect(s.current).toBe(12) // 14 Tage minus 2 Ruhetage
})

test('der heutige Tag reißt die Serie nicht, solange er noch offen ist', () => {
  const log = logFrom(range(MON, addDays(MON, 3))) // heute (Tag 5) noch nicht erledigt
  const s = computeStreak(habit({ graceDays: 0 }), log, addDays(MON, 4))
  expect(s.current).toBe(4)
})

test('verpasste Tage außerhalb des Plans zählen nicht als Ausfall', () => {
  const h = habit({ frequency: { kind: 'weekdays', days: [1, 3, 5] }, graceDays: 0 })
  const log = logFrom(['2026-07-27', '2026-07-29', '2026-07-31']) // Mo, Mi, Fr
  const s = computeStreak(h, log, '2026-07-31')
  expect(s.current).toBe(3) // Di, Do, Sa, So sind keine Ausfälle
})

test('X-mal pro Woche zählt Wochen und lässt den Tag frei', () => {
  const h = habit({ frequency: { kind: 'weekly', times: 3 } })
  // Woche 1: 3 Treffer, Woche 2: 3 Treffer — Tage frei verteilt
  const log = logFrom([
    '2026-07-27', '2026-07-29', '2026-08-01',
    '2026-08-03', '2026-08-06', '2026-08-08',
  ])
  const s = computeStreak(h, log, '2026-08-09')
  expect(s.unit).toBe('Wochen')
  expect(s.current).toBe(2)
})

test('eine verfehlte Wochenvorgabe beendet die Wochenserie', () => {
  const h = habit({ frequency: { kind: 'weekly', times: 3 } })
  const log = logFrom(['2026-07-27', '2026-07-29', '2026-08-01', '2026-08-03']) // Woche 2 nur 1×
  // Bewertet wird in Woche 3 — erst dann ist Woche 2 abgeschlossen und darf reißen.
  const s = computeStreak(h, log, '2026-08-10')
  expect(s.current).toBe(0)
  expect(s.longest).toBe(1)
})

test('die laufende Woche bricht eine Wochenserie nicht ab', () => {
  const h = habit({ frequency: { kind: 'weekly', times: 3 } })
  const log = logFrom(['2026-07-27', '2026-07-29', '2026-08-01', '2026-08-03'])
  const s = computeStreak(h, log, '2026-08-04') // Woche 2 läuft noch
  expect(s.current).toBe(1)
})

test('die längste Serie bleibt erhalten, auch wenn die aktuelle reißt', () => {
  const log = logFrom(range(MON, addDays(MON, 6))) // 7 Tage am Stück
  const later = addDays(MON, 12) // danach eine Woche Pause
  const s = computeStreak(habit({ graceDays: 0 }), log, later)
  expect(s.longest).toBe(7)
  expect(s.current).toBe(0)
})

test('Einheit steht im Singular, wenn die Serie bei eins steht', () => {
  expect(unitLabel('Tage', 1)).toBe('Tag')
  expect(unitLabel('Tage', 0)).toBe('Tage')
  expect(unitLabel('Tage', 12)).toBe('Tage')
  expect(unitLabel('Wochen', 1)).toBe('Woche')
  expect(unitLabel('Wochen', 3)).toBe('Wochen')
})

/* -------------------------------- Kennzahlen ------------------------------- */

test('Wochenfortschritt zählt gegen die richtige Zielgröße', () => {
  const h = habit({ frequency: { kind: 'weekly', times: 4 } })
  const log = logFrom(['2026-07-27', '2026-07-28'])
  expect(weekProgress(h, log, '2026-07-29')).toEqual({ done: 2, target: 4 })
})

test('Erfüllungsquote misst nur geplante Tage', () => {
  const h = habit({ frequency: { kind: 'weekdays', days: [1, 3, 5] }, createdAt: '2026-07-27' })
  const log = logFrom(['2026-07-27', '2026-07-29']) // Mo + Mi erledigt, Fr verpasst
  expect(completionRate(h, log, 5, '2026-07-31')).toBe(67) // 2 von 3 geplanten Tagen
})

test('Erfüllungsquote ohne geplante Tage ist 0 statt NaN', () => {
  const h = habit({ frequency: { kind: 'weekdays', days: [0] }, createdAt: '2026-07-27' })
  expect(completionRate(h, {}, 3, '2026-07-29')).toBe(0)
})

/* --------------------------------- Heatmap --------------------------------- */

test('Heatmap unterscheidet Ruhetag und echten Ausfall', () => {
  const log = logFrom([MON])
  const cells = heatmap(habit({ graceDays: 1 }), log, MON, addDays(MON, 3), addDays(MON, 3))
  const states = cells.map((c) => c.state)
  expect(states[0]).toBe('done')
  expect(states[1]).toBe('rest') // erster Ausfall: vom Budget gedeckt
  expect(states[2]).toBe('missed') // zweiter Ausfall derselben Woche
})

test('Heatmap markiert ungeplante Tage getrennt von Ausfällen', () => {
  const h = habit({ frequency: { kind: 'weekdays', days: [1] }, graceDays: 0 })
  const cells = heatmap(h, {}, MON, addDays(MON, 2), addDays(MON, 2))
  expect(cells[1].state).toBe('unplanned')
  expect(cells[2].state).toBe('unplanned')
})

test('Heatmap trägt die Stimmung des Tages mit', () => {
  const log: Log = { h1: { [MON]: { done: true, mood: 4 } } }
  expect(heatmap(habit(), log, MON, MON, MON)[0].mood).toBe(4)
})

/* -------------------------------- Tagesscore ------------------------------- */

test('Tagesscore zählt nur nicht archivierte, eingeplante Habits', () => {
  const habits: Habit[] = [
    habit({ id: 'h1' }),
    habit({ id: 'h2', archived: true }),
    habit({ id: 'h3', frequency: { kind: 'weekdays', days: [0] } }), // nur sonntags
  ]
  const log: Log = { h1: { [MON]: { done: true } } }
  expect(dayScore(habits, log, MON)).toEqual({ done: 1, planned: 1 })
})
