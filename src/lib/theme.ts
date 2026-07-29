/**
 * Erscheinungsbild: Systemvorgabe, hell oder dunkel.
 *
 * Gespeichert wird die *Absicht* („System"), nicht das Ergebnis („dunkel"). Sonst bliebe
 * ein Nutzer, der einmal bei Nacht die App geöffnet hat, für immer im Dunkelmodus hängen,
 * auch wenn sein Telefon längst wieder hell ist.
 *
 * Gesetzt wird ein `data-theme`-Attribut mit dem aufgelösten Wert am <html>-Element. Daran
 * hängen sowohl die CSS-Variablen als auch die `dark:`-Utilities von Tailwind (siehe
 * @custom-variant in index.css) — eine einzige Quelle für beides.
 */

export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Hell' },
  { id: 'dark', label: 'Dunkel' },
]

const KEY = 'habitgrid.theme'

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

export function getMode(): ThemeMode {
  const stored = localStorage.getItem(KEY) as ThemeMode | null
  return stored && THEME_MODES.some((m) => m.id === stored) ? stored : 'system'
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return darkQuery().matches ? 'dark' : 'light'
  return mode
}

/** Wendet den Modus an und merkt ihn sich. Gibt zurück, was tatsächlich aktiv ist. */
export function applyMode(mode: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(mode)
  document.documentElement.dataset.theme = resolved
  localStorage.setItem(KEY, mode)

  // Adressleiste und Statusleiste der installierten App ziehen mit
  const color = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', color || (resolved === 'dark' ? '#0f172a' : '#f9fafb'))
  return resolved
}

/**
 * Reagiert auf einen Wechsel der Systemeinstellung — aber nur, solange „System" gewählt ist.
 * Gibt die Abmeldefunktion zurück.
 */
/**
 * Beobachtet, welches Theme gerade tatsächlich aktiv ist — egal ob es aus der
 * Systemvorgabe oder aus einer manuellen Wahl stammt. Nötig für Komponenten, die ihr
 * Aussehen nicht über CSS-Variablen regeln können, etwa die WebGL-Szene.
 */
export function watchResolvedTheme(onChange: (resolved: ResolvedTheme) => void): () => void {
  const observer = new MutationObserver(() => {
    const value = document.documentElement.dataset.theme
    if (value === 'light' || value === 'dark') onChange(value)
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function currentResolvedTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function watchSystemTheme(onChange?: (resolved: ResolvedTheme) => void): () => void {
  const query = darkQuery()
  const handler = () => {
    if (getMode() !== 'system') return
    onChange?.(applyMode('system'))
  }
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}
