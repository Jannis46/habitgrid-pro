import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { today, type DayKey } from '../engine/dates'
import {
  HABIT_COLORS,
  type CategoryId,
  type Entry,
  type Frequency,
  type Habit,
  type Log,
} from '../engine/habits'
import { useAuth } from '../auth/AuthContext'

/**
 * Zustandsspeicher für Habits und Einträge.
 *
 * Persistenz liegt im localStorage, getrennt nach Nutzer-ID. Das ist bewusst die
 * Standardablage und kein Notbehelf: Die App soll offline vollständig funktionieren.
 * Ist Supabase konfiguriert, bleibt der lokale Stand die Quelle der Wahrheit für die
 * Oberfläche; ein Abgleich würde hier ansetzen (siehe `serialize`/`hydrate`).
 */

export const FREE_HABIT_LIMIT = 3

type State = { habits: Habit[]; log: Log }

type Store = State & {
  addHabit: (input: {
    name: string
    icon: string
    color: string
    frequency: Frequency
    graceDays: number
    reminder?: string
    category?: CategoryId
  }) => Habit
  updateHabit: (id: string, patch: Partial<Habit>) => void
  removeHabit: (id: string) => void
  toggleDay: (habitId: string, day: DayKey) => void
  setEntry: (habitId: string, day: DayKey, patch: Partial<Entry>) => void
  /** Vollständiger Zustand als JSON — für Sicherung und späteren Server-Abgleich. */
  serialize: () => string
  hydrate: (json: string) => boolean
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

const keyFor = (userId: string | null) => `habitgrid.data.${userId ?? 'gast'}`

const EMPTY: State = { habits: [], log: {} }

function load(storageKey: string): State {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    // Fremde oder beschädigte Daten dürfen die App nicht in einen kaputten Zustand bringen
    if (!Array.isArray(parsed?.habits) || typeof parsed?.log !== 'object') return EMPTY
    return { habits: parsed.habits, log: parsed.log ?? {} }
  } catch {
    return EMPTY
  }
}

export function HabitStore({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const storageKey = keyFor(user?.id ?? null)
  const [state, setState] = useState<State>(() => load(storageKey))
  // Für das Wegschreiben beim Tabwechsel: dort darf der Effekt nicht am Zustand hängen,
  // sonst würde der Listener bei jeder Änderung neu registriert.
  const stateRef = useRef(state)
  stateRef.current = state

  // Kontowechsel lädt den passenden Datensatz nach
  useEffect(() => {
    setState(load(storageKey))
  }, [storageKey])

  /**
   * Persistenz bewusst außerhalb des Klickpfads.
   *
   * `JSON.stringify` über alle Habits und Einträge lief bisher synchron im selben Frame
   * wie der Check-in. Bei einem Jahr Historie sind das schnell einige Millisekunden —
   * genug, um das Häkchen spürbar hinterherhinken zu lassen. Der Schreibvorgang wandert
   * deshalb in den Leerlauf; anstehende Schreibvorgänge werden zusammengefasst.
   */
  useEffect(() => {
    const write = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state))
      } catch {
        // Speicher voll oder privater Modus — die App läuft weiter, nur ohne Persistenz
      }
    }
    // Kurze Verzögerung statt requestIdleCallback: überall verfügbar, und schnelle
    // Klickfolgen werden zu einem einzigen Schreibvorgang zusammengefasst.
    const handle = window.setTimeout(write, 120)
    return () => clearTimeout(handle)
  }, [state, storageKey])

  // Ein Tabwechsel oder Schließen darf keinen ungeschriebenen Stand zurücklassen
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState !== 'hidden') return
      try {
        localStorage.setItem(storageKey, JSON.stringify(stateRef.current))
      } catch {
        /* siehe oben */
      }
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [storageKey])

  const addHabit: Store['addHabit'] = useCallback((input) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      icon: input.icon,
      color: input.color || HABIT_COLORS[0],
      frequency: input.frequency,
      graceDays: input.graceDays,
      createdAt: today(),
      reminder: input.reminder,
      category: input.category,
    }
    setState((s) => ({ ...s, habits: [...s.habits, habit] }))
    return habit
  }, [])

  const updateHabit: Store['updateHabit'] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }))
  }, [])

  const removeHabit: Store['removeHabit'] = useCallback((id) => {
    setState((s) => {
      const { [id]: _dropped, ...log } = s.log
      return { habits: s.habits.filter((h) => h.id !== id), log }
    })
  }, [])

  const toggleDay: Store['toggleDay'] = useCallback((habitId, day) => {
    setState((s) => {
      const entries = s.log[habitId] ?? {}
      const current = entries[day]
      return {
        ...s,
        log: { ...s.log, [habitId]: { ...entries, [day]: { ...current, done: !current?.done } } },
      }
    })
  }, [])

  const setEntry: Store['setEntry'] = useCallback((habitId, day, patch) => {
    setState((s) => {
      const entries = s.log[habitId] ?? {}
      // Eine Notiz oder Stimmung darf angelegt werden, ohne den Tag als erledigt zu markieren
      const existing: Entry = entries[day] ?? { done: false }
      return {
        ...s,
        log: { ...s.log, [habitId]: { ...entries, [day]: { ...existing, ...patch } } },
      }
    })
  }, [])

  const serialize = useCallback(
    () => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2),
    [state],
  )

  const hydrate: Store['hydrate'] = useCallback((json) => {
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed?.habits)) return false
      setState({ habits: parsed.habits, log: parsed.log ?? {} })
      return true
    } catch {
      return false
    }
  }, [])

  const reset = useCallback(() => setState(EMPTY), [])

  const value = useMemo(
    () => ({
      ...state,
      addHabit,
      updateHabit,
      removeHabit,
      toggleDay,
      setEntry,
      serialize,
      hydrate,
      reset,
    }),
    [state, addHabit, updateHabit, removeHabit, toggleDay, setEntry, serialize, hydrate, reset],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHabits(): Store {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHabits muss innerhalb von <HabitStore> verwendet werden')
  return ctx
}
