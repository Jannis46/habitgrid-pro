import { useEffect, useRef, useState } from 'react'
import { Download, Share, Smartphone, X } from 'lucide-react'
import { useInstallPrompt } from '../lib/useInstallPrompt'
import { Logo } from './Logo'

const DISMISS_KEY = 'habitgrid.install.banner'

/**
 * Installationshinweis für die Landingpage — sichtbar bereits vor der Anmeldung.
 *
 * Wird er geschlossen, verschwindet er nicht ganz, sondern schrumpft zu einer kleinen
 * Schaltfläche unten rechts. Der Wunsch, eine App zu installieren, entsteht selten in
 * der ersten Sekunde; ein endgültig weggeklickter Hinweis wäre eine verschenkte
 * Gelegenheit, ein wiederkehrender Balken dagegen aufdringlich.
 *
 * Der Hinweis erscheint nur, wenn eine Installation überhaupt möglich ist: Läuft die
 * App bereits im Vollbild, bleibt alles aus.
 */
export function InstallBanner() {
  const { canPrompt, standalone, isIos, install } = useInstallPrompt()
  const [minimized, setMinimized] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const dialog = useRef<HTMLDialogElement>(null)
  const [visible, setVisible] = useState(false)

  // Kurz verzögert einblenden: sofort beim Aufbau der Seite wirkt es wie ein Popup
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 900)
    return () => clearTimeout(timer)
  }, [])

  if (standalone) return null
  if (!canPrompt && !isIos) return null

  const minimize = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setMinimized(true)
  }

  const openDialog = () => dialog.current?.showModal()

  return (
    <>
      {/* Schwebende Schaltfläche, sobald der Balken weggeklickt wurde */}
      {minimized && (
        <button
          onClick={openDialog}
          className="btn btn-ghost no-print fixed right-4 bottom-24 z-40 shadow-lg"
          aria-label="App installieren"
        >
          <Smartphone size={16} aria-hidden /> App installieren
        </button>
      )}

      {!minimized && visible && (
        <div className="no-print fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
          <div className="card mx-auto flex max-w-3xl items-center gap-3 p-3 sm:p-4">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ background: 'var(--surface-2)' }}
            >
              <Logo size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">HabitGrid als App installieren</p>
              <p className="truncate text-sm" style={{ color: 'var(--muted)' }}>
                Startet im Vollbild, funktioniert offline, kein App Store.
              </p>
            </div>
            <button className="btn btn-primary shrink-0" onClick={openDialog}>
              <Download size={16} aria-hidden />
              <span className="hidden sm:inline">Installieren</span>
            </button>
            <button
              onClick={minimize}
              aria-label="Hinweis schließen"
              className="shrink-0 rounded-lg p-2"
              style={{ color: 'var(--muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialog}
        className="m-auto w-[min(94vw,28rem)] rounded-2xl p-0 backdrop:bg-black/50"
        style={{ background: 'var(--surface)', color: 'var(--text)' }}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close()
        }}
      >
        <div className="p-6 text-center">
          <span
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: 'var(--surface-2)' }}
          >
            <Logo size={30} />
          </span>
          <h2 className="mt-4 text-xl font-semibold">HabitGrid installieren</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Auf dem Home-Bildschirm, im Vollbild, offline nutzbar. Kein App Store, kein Update-Zwang,
            keine 80 MB.
          </p>

          {canPrompt ? (
            <button
              className="btn btn-primary mt-6 w-full"
              onClick={async () => {
                const accepted = await install()
                dialog.current?.close()
                if (accepted) setMinimized(false)
              }}
            >
              <Download size={16} aria-hidden /> Jetzt installieren
            </button>
          ) : (
            <ol
              className="mt-6 space-y-2 text-left text-sm"
              style={{ color: 'var(--muted)' }}
            >
              <li className="flex gap-2">
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  1.
                </span>
                Diese Seite in <strong>Safari</strong> öffnen — nicht in Chrome oder einer
                In-App-Ansicht.
              </li>
              <li className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  2.
                </span>
                Unten auf <Share size={15} aria-label="Teilen" /> tippen.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                  3.
                </span>
                <span>
                  <strong>„Zum Home-Bildschirm"</strong> wählen und bestätigen.
                </span>
              </li>
            </ol>
          )}

          <button
            className="mt-3 w-full py-2 text-sm"
            style={{ color: 'var(--muted)' }}
            onClick={() => {
              dialog.current?.close()
              minimize()
            }}
          >
            Später
          </button>
        </div>
      </dialog>
    </>
  )
}
