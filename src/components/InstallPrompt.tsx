import { useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { useInstallPrompt } from '../lib/useInstallPrompt'

const DISMISS_KEY = 'habitgrid.install.dismissed'

/**
 * Installationshinweis im Dashboard — als ruhige Karte im Fluss der Seite, nicht als
 * schwebender Balken. Wer schon angemeldet ist, wird nicht mehr überzeugt, sondern
 * erinnert. Die Erkennungslogik teilt sich diese Komponente mit dem Landing-Banner.
 */
export function InstallPrompt() {
  const { canPrompt, standalone, isIos, install } = useInstallPrompt()
  const [showIosHint, setShowIosHint] = useState(false)
  const [hidden, setHidden] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  if (standalone || hidden) return null
  if (!canPrompt && !isIos) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setHidden(true)
  }

  return (
    <div className="no-print card mt-6 p-4">
      <div className="flex items-start gap-3">
        <Download size={20} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium">HabitGrid als App installieren</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Startet im Vollbild, funktioniert offline und liegt direkt auf dem Home-Bildschirm.
          </p>

          {showIosHint && (
            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
              In Safari auf <Share size={15} aria-label="Teilen" /> tippen, dann
              <strong>„Zum Home-Bildschirm"</strong> wählen.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            {canPrompt ? (
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (await install()) setHidden(true)
                }}
              >
                Installieren
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowIosHint(true)}>
                So geht's auf dem iPhone
              </button>
            )}
            <button className="btn btn-ghost" onClick={dismiss}>
              Später
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Hinweis schließen" className="shrink-0 p-1">
          <X size={18} style={{ color: 'var(--muted)' }} />
        </button>
      </div>
    </div>
  )
}
