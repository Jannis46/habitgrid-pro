import { useState } from 'react'
import { WEEKDAY_LABELS } from '../engine/dates'
import {
  CATEGORIES,
  HABIT_COLORS,
  isValidTime,
  type CategoryId,
  type Frequency,
  type Habit,
} from '../engine/habits'
import { ReminderPermissionHint } from './ReminderSetup'

const ICONS = ['💧', '📚', '🏃', '🧘', '💪', '🥗', '😴', '✍️', '🎸', '🧹', '☎️', '🚭']

type Draft = {
  name: string
  icon: string
  color: string
  frequency: Frequency
  graceDays: number
  reminder?: string
  category: CategoryId
}

const emptyDraft = (): Draft => ({
  name: '',
  icon: ICONS[0],
  color: HABIT_COLORS[0],
  frequency: { kind: 'daily' },
  graceDays: 1,
  category: 'sonstiges',
})

/**
 * Anlage- und Bearbeitungsformular. Bewusst eine einzige Ansicht ohne Assistenten:
 * Ein Habit anzulegen darf keine mehrstufige Strecke sein.
 */
export function HabitForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Habit
  onSave: (draft: Draft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Draft>(() =>
    initial
      ? {
          name: initial.name,
          icon: initial.icon,
          color: initial.color,
          frequency: initial.frequency,
          graceDays: initial.graceDays,
          reminder: initial.reminder,
          category: initial.category ?? 'sonstiges',
        }
      : emptyDraft(),
  )
  const [error, setError] = useState('')

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('Gib dem Habit einen Namen.')
      return
    }
    if (draft.frequency.kind === 'weekdays' && draft.frequency.days.length === 0) {
      setError('Wähle mindestens einen Wochentag aus.')
      return
    }
    if (draft.reminder && !isValidTime(draft.reminder)) {
      setError('Die Erinnerungszeit muss im Format HH:MM stehen, z. B. 08:00.')
      return
    }
    onSave({ ...draft, name: draft.name.trim() })
  }

  const freq = draft.frequency

  return (
    <form onSubmit={submit} className="card space-y-5 p-5">
      <div>
        <label className="text-sm font-medium" htmlFor="habit-name">
          Name
        </label>
        <input
          id="habit-name"
          className="field mt-1.5"
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="z. B. 20 Minuten lesen"
          autoFocus
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <span className="text-sm font-medium">Symbol</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => set('icon', icon)}
                aria-label={`Symbol ${icon}`}
                aria-pressed={draft.icon === icon}
                className="grid h-9 w-9 place-items-center rounded-lg border text-lg"
                style={{
                  borderColor: draft.icon === icon ? 'var(--accent)' : 'var(--border)',
                  background: draft.icon === icon ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium">Farbe</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set('color', color)}
                aria-label={`Farbe ${color}`}
                aria-pressed={draft.color === color}
                className="h-9 w-9 rounded-lg"
                style={{
                  background: color,
                  outline: draft.color === color ? '2px solid var(--text)' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Wie oft?</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {[
            { kind: 'daily', label: 'Täglich' },
            { kind: 'weekly', label: 'X-mal pro Woche' },
            { kind: 'weekdays', label: 'Feste Wochentage' },
          ].map((option) => (
            <button
              key={option.kind}
              type="button"
              onClick={() =>
                set(
                  'frequency',
                  option.kind === 'daily'
                    ? { kind: 'daily' }
                    : option.kind === 'weekly'
                      ? { kind: 'weekly', times: 3 }
                      : { kind: 'weekdays', days: [1, 3, 5] },
                )
              }
              className="btn btn-ghost"
              style={{
                borderColor: freq.kind === option.kind ? 'var(--accent)' : 'var(--border)',
                background: freq.kind === option.kind ? 'var(--accent-soft)' : 'transparent',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {freq.kind === 'weekly' && (
          <label className="mt-3 block text-sm">
            Ziel pro Woche: <strong>{freq.times}×</strong>
            <input
              type="range"
              min={1}
              max={7}
              value={freq.times}
              onChange={(e) => set('frequency', { kind: 'weekly', times: Number(e.target.value) })}
              className="mt-1.5 w-full"
              style={{ accentColor: 'var(--accent)' }}
            />
          </label>
        )}

        {freq.kind === 'weekdays' && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {/* Montag zuerst — die deutsche Wochenordnung */}
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const active = freq.days.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    set('frequency', {
                      kind: 'weekdays',
                      days: active ? freq.days.filter((x) => x !== d) : [...freq.days, d],
                    })
                  }
                  className="h-10 w-11 rounded-lg border text-sm font-medium"
                  style={{
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  {WEEKDAY_LABELS[d]}
                </button>
              )
            })}
          </div>
        )}
      </fieldset>

      <div>
        <label className="text-sm font-medium" htmlFor="grace">
          Ruhetage pro Woche: <strong>{draft.graceDays}</strong>
        </label>
        <input
          id="grace"
          type="range"
          min={0}
          max={3}
          value={draft.graceDays}
          onChange={(e) => set('graceDays', Number(e.target.value))}
          className="mt-1.5 w-full"
          style={{ accentColor: 'var(--accent)' }}
          disabled={freq.kind === 'weekly'}
        />
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          {freq.kind === 'weekly'
            ? 'Bei „X-mal pro Woche" brauchst du keine Ruhetage — du wählst die Tage ohnehin frei.'
            : draft.graceDays === 0
              ? 'Streng: Jeder verpasste Tag beendet die Serie.'
              : `So viele geplante Tage darfst du pro Woche auslassen, ohne dass deine Serie reißt.`}
        </p>
      </div>

      <div>
        <span className="text-sm font-medium">Kategorie</span>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Bestimmt die Farbwelt deines Streak-Kristalls im Dashboard.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={draft.category === c.id}
              onClick={() => set('category', c.id)}
              className="btn btn-ghost gap-2 py-1.5"
              style={{
                borderColor: draft.category === c.id ? c.color : 'var(--border)',
                background: draft.category === c.id ? `${c.color}22` : 'transparent',
              }}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: c.color }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={draft.reminder !== undefined}
            onChange={(e) => set('reminder', e.target.checked ? '08:00' : undefined)}
            className="h-4 w-4"
          />
          Erinnerung zu einer festen Uhrzeit
        </label>
        {draft.reminder !== undefined && (
          <>
            <input
              type="time"
              className="field mt-2 w-auto"
              value={draft.reminder}
              onChange={(e) => set('reminder', e.target.value)}
              aria-label="Uhrzeit der Erinnerung"
            />
            <ReminderPermissionHint />
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {initial ? 'Änderungen speichern' : 'Habit anlegen'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  )
}
