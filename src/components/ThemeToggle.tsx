import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { applyMode, getMode, THEME_MODES, watchSystemTheme, type ThemeMode } from '../lib/theme'

const ICONS: Record<ThemeMode, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

/**
 * Dreifach-Schalter für das Erscheinungsbild, im Stil eines nativen Segmented Control.
 * „System" ist die Vorgabe und bleibt es auch, bis der Nutzer aktiv etwas anderes wählt.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<ThemeMode>(getMode)

  useEffect(() => {
    applyMode(mode)
  }, [mode])

  // Wechselt das Betriebssystem zwischen hell und dunkel, zieht die App mit.
  // Die Auswahl selbst ändert sich dabei nicht — „System" bleibt „System".
  useEffect(() => watchSystemTheme(), [])

  return (
    <div
      className="segment"
      role="group"
      aria-label="Erscheinungsbild"
      title="Erscheinungsbild wählen"
    >
      {THEME_MODES.map(({ id, label }) => {
        const Icon = ICONS[id]
        return (
          <button
            key={id}
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            title={label}
          >
            <Icon size={14} aria-hidden />
            {compact ? <span className="sr-only">{label}</span> : label}
          </button>
        )
      })}
    </div>
  )
}
