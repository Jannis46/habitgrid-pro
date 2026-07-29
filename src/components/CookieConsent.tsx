import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'

/**
 * DSGVO-Consent mit granularem Opt-in.
 *
 * Zwei Entscheidungen, die rechtlich zählen:
 * 1. Das Banner erscheint nur, wenn tatsächlich ein einwilligungspflichtiger Dienst
 *    konfiguriert ist (`VITE_ANALYTICS_ID`). Ein Banner ohne solche Dienste ist nach
 *    § 25 Abs. 2 TDDDG überflüssig und kostet nur Conversion.
 * 2. „Alle ablehnen" ist genauso prominent wie „Alle akzeptieren". Nudging über
 *    Farbe oder Platzierung ist nach ständiger Rechtsprechung unzulässig.
 *
 * Nicht einwilligungsfähige Kategorien werden gar nicht erst als Schalter angeboten —
 * ein deaktiviertes „notwendig"-Häkchen suggeriert eine Wahl, die es nicht gibt.
 */

const KEY = 'habitgrid.consent'
const VERSION = 1

export type Consent = { statistics: boolean; version: number; at: string }

export function readConsent(): Consent | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    return parsed?.version === VERSION ? parsed : null
  } catch {
    return null
  }
}

/** Für Integrationen: darf das Analysewerkzeug geladen werden? */
export const statisticsAllowed = () => readConsent()?.statistics === true

export function CookieConsent() {
  const configured = Boolean(import.meta.env.VITE_ANALYTICS_ID)
  const [open, setOpen] = useState(false)
  const [statistics, setStatistics] = useState(false)

  useEffect(() => {
    if (configured && !readConsent()) setOpen(true)
  }, [configured])

  const save = (choice: boolean) => {
    const consent: Consent = { statistics: choice, version: VERSION, at: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(consent))
    setOpen(false)
    // Das Analysewerkzeug wird an dieser Stelle nachgeladen, sobald eines eingebunden ist.
    // Vor der Einwilligung darf kein Skript des Anbieters im Dokument stehen.
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="no-print fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div
        className="card mx-auto max-w-3xl p-5 shadow-2xl"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 shrink-0" size={20} style={{ color: 'var(--accent)' }} />
          <div className="min-w-0">
            <h2 id="consent-title" className="font-semibold">
              Deine Wahl bei Cookies
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              Für den Betrieb notwendige Speicherung — dein Login, deine Habits, dein Theme —
              nutzen wir immer; sie ist technisch erforderlich und braucht keine Einwilligung.
              Darüber hinaus möchten wir anonyme Nutzungsstatistiken erheben. Das entscheidest du.
            </p>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg p-3" style={{ background: 'var(--surface-2)' }}>
          <input
            type="checkbox"
            checked={statistics}
            onChange={(e) => setStatistics(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span className="text-sm">
            <strong>Statistik</strong> — anonyme Auswertung, welche Funktionen genutzt werden.
            Keine Weitergabe an Dritte, kein Profil über dich.
          </span>
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {/* Gleiche Gewichtung für Ablehnen und Akzeptieren — bewusst identische Klassen */}
          <button className="btn btn-ghost flex-1" onClick={() => save(false)}>
            Alle ablehnen
          </button>
          <button className="btn btn-ghost flex-1" onClick={() => save(statistics)}>
            Auswahl speichern
          </button>
          <button className="btn btn-ghost flex-1" onClick={() => save(true)}>
            Alle akzeptieren
          </button>
        </div>

        <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
          Du kannst deine Entscheidung jederzeit in der{' '}
          <a href="#/datenschutz" className="underline">
            Datenschutzerklärung
          </a>{' '}
          ändern.
        </p>
      </div>
    </div>
  )
}

/** Schaltfläche für die Datenschutzseite, um eine getroffene Wahl zu widerrufen. */
export function RevokeConsentButton() {
  const [done, setDone] = useState(false)
  if (!import.meta.env.VITE_ANALYTICS_ID) return null
  return (
    <button
      className="btn btn-ghost"
      onClick={() => {
        localStorage.removeItem(KEY)
        setDone(true)
      }}
    >
      {done ? 'Einwilligung widerrufen — beim nächsten Aufruf fragen wir erneut' : 'Einwilligung widerrufen'}
    </button>
  )
}
