import { useEffect, useState } from 'react'
import { Bell, BellOff, Share, X } from 'lucide-react'
import {
  enableBackgroundDelivery,
  notificationState,
  requestPermission,
  type NotificationState,
} from '../lib/reminders'

const DISMISS_KEY = 'habitgrid.reminders.dismissed'

/**
 * Banner zum Aktivieren der Erinnerungen.
 *
 * Erscheint erst, wenn der Nutzer mindestens ein Habit mit Uhrzeit angelegt hat — vorher
 * gibt es nichts zu erinnern, und eine Berechtigungsabfrage ohne Anlass wird reflexhaft
 * abgelehnt. Danach ist sie dauerhaft blockiert, das ist der teuerste Fehler an dieser Stelle.
 */
export function ReminderSetup({ hasTimedHabits }: { hasTimedHabits: boolean }) {
  const [state, setState] = useState<NotificationState>(notificationState)
  const [background, setBackground] = useState(false)
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    if (state === 'granted') void enableBackgroundDelivery().then(setBackground)
  }, [state])

  if (!hasTimedHabits || hidden) return null
  if (state === 'granted') return <GrantedNote background={background} />

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setHidden(true)
  }

  return (
    <aside className="no-print card mt-6 p-4">
      <div className="flex items-start gap-3">
        <Bell size={20} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
        <div className="min-w-0 flex-1">
          {state === 'ios-install' ? (
            <>
              <p className="font-medium">Erinnerungen auf dem iPhone</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                Apple erlaubt Benachrichtigungen nur für Web-Apps, die auf dem Home-Bildschirm
                liegen. Einmal installieren genügt.
              </p>
              {showIosGuide ? (
                <ol
                  className="mt-3 list-decimal space-y-1 pl-5 text-sm"
                  style={{ color: 'var(--muted)' }}
                >
                  <li>
                    Diese Seite in <strong>Safari</strong> öffnen (nicht in Chrome oder in einer
                    App-Vorschau).
                  </li>
                  <li className="flex flex-wrap items-center gap-1.5">
                    Unten auf <Share size={15} aria-label="Teilen" /> tippen.
                  </li>
                  <li>
                    <strong>„Zum Home-Bildschirm"</strong> wählen und bestätigen.
                  </li>
                  <li>HabitGrid über das neue Symbol starten — dann hier erneut aktivieren.</li>
                </ol>
              ) : (
                <button className="btn btn-primary mt-3" onClick={() => setShowIosGuide(true)}>
                  So geht's
                </button>
              )}
            </>
          ) : state === 'denied' ? (
            <>
              <p className="font-medium">Benachrichtigungen sind blockiert</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                Dein Browser hat sie für diese Seite abgelehnt. Wir können nicht erneut fragen —
                das geht nur über das Schloss- oder Info-Symbol links in der Adressleiste, dort
                unter „Benachrichtigungen".
              </p>
            </>
          ) : state === 'unsupported' ? (
            <>
              <p className="font-medium">Dieser Browser kennt keine Benachrichtigungen</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                Deine Erinnerungszeiten bleiben gespeichert und erscheinen im Tagesplan — nur eben
                ohne Systemmeldung.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Erinnerungen aktivieren</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                Wir melden uns zur eingestellten Uhrzeit — nur für Habits, die an dem Tag noch
                offen sind. Keine Werbung, keine Sammelmeldungen.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="btn btn-primary"
                  onClick={async () => setState(await requestPermission())}
                >
                  <Bell size={16} /> Erinnerungen aktivieren
                </button>
                <button className="btn btn-ghost" onClick={dismiss}>
                  Nein danke
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={dismiss} aria-label="Hinweis schließen" className="shrink-0 p-1">
          <X size={18} style={{ color: 'var(--muted)' }} />
        </button>
      </div>
    </aside>
  )
}

/**
 * Nach der Freigabe: sagt klar, wie zuverlässig die Zustellung tatsächlich ist.
 * Ein Versprechen, das der Browser nicht halten kann, kostet mehr Vertrauen als der
 * ehrliche Hinweis.
 */
function GrantedNote({ background }: { background: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <aside className="no-print card mt-6 p-4">
      <div className="flex items-start gap-3">
        <Bell size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--done)' }} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Erinnerungen sind aktiv
            {background ? ' — auch bei geschlossener App' : ' — solange die App geöffnet ist'}
          </p>
          <button
            className="mt-1 text-sm underline"
            style={{ color: 'var(--muted)' }}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Weniger' : 'Was heißt das genau?'}
          </button>
          {open && (
            <div className="mt-2 space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
              <p>
                Ist HabitGrid geöffnet, kommt die Meldung auf die Minute.{' '}
                {background
                  ? 'Bei geschlossener App weckt dein Browser die Erinnerung im Hintergrund — den genauen Zeitpunkt bestimmt er selbst, die Meldung kann also etwas später kommen.'
                  : 'Ist die App geschlossen, kann dieser Browser keine geplante Meldung auslösen; du siehst die offenen Habits dann beim nächsten Öffnen.'}
              </p>
              <p>
                Grund: Es gibt keine browserübergreifende Schnittstelle, um eine Benachrichtigung
                für eine feste Uhrzeit vorzumerken. Punktgenaue Zustellung bei geschlossener App
                bräuchte einen Server, der sie verschickt — und damit laufende Kosten, die dieses
                Produkt bewusst nicht hat.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

/** Kleiner Statushinweis am Formular, wenn eine Zeit gesetzt, aber nichts erlaubt ist. */
export function ReminderPermissionHint() {
  const state = notificationState()
  if (state === 'granted') return null
  return (
    <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted)' }}>
      <BellOff size={14} aria-hidden />
      {state === 'ios-install'
        ? 'Auf dem iPhone erst nach Installation auf dem Home-Bildschirm.'
        : state === 'denied'
          ? 'Benachrichtigungen sind für diese Seite blockiert.'
          : 'Die Freigabe holen wir gleich nach dem Speichern ein.'}
    </p>
  )
}
