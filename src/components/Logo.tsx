/**
 * HabitGrid — Markenzeichen.
 *
 * Konzept: Ein Kristall, der aus Rasterzellen besteht. Die Raute ist in vier Facetten
 * geteilt; gefüllte Facetten stehen für erledigte Tage, offene für die, die noch kommen.
 * Damit trägt das Zeichen beide Kernideen des Produkts — Belohnung (Kristall) und
 * Klarheit (Matrix) — in einer einzigen Form, statt sie nebeneinanderzustellen.
 *
 * Geometrie bewusst auf ganzen Koordinaten eines 32er-Rasters: Das Zeichen bleibt bis
 * hinunter zu 16 px kantenscharf, weil keine Linie zwischen zwei Pixeln landet.
 */

export type LogoVariant = 'gradient' | 'mono' | 'contrast'

/**
 * Eine Raute, geteilt in vier Facetten wie ein geschliffener Stein. Drei sind gefüllt,
 * eine bleibt offen — das Zeichen zeigt Fortschritt, nicht Vollendung. Die Fugen zwischen
 * den Facetten sind das Raster.
 */
const FACET_TL = 'M15.44 3.12 L15.44 15.44 L3.12 15.44 Z'
const FACET_TR = 'M16.56 3.12 L28.88 15.44 L16.56 15.44 Z'
const FACET_BR = 'M16.56 28.88 L28.88 16.56 L16.56 16.56 Z'
const FACET_BL = 'M15.44 28.88 L15.44 16.56 L3.12 16.56 Z'

export function Logo({
  size = 32,
  variant = 'gradient',
  className = '',
  title = 'HabitGrid',
}: {
  size?: number
  variant?: LogoVariant
  className?: string
  title?: string
}) {
  // Eindeutige IDs, damit mehrere Logos auf einer Seite sich nicht gegenseitig überschreiben
  const id = `hg-${variant}-${size}`
  const filled = variant === 'gradient' ? `url(#${id}-fill)` : 'currentColor'
  const openStroke = 'currentColor'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`logo ${className}`}
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={`${id}-fill`} x1="8" y1="3" x2="26" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent, #10b981)" />
            <stop offset="1" stopColor="var(--accent-hover, #059669)" />
          </linearGradient>
        </defs>
      )}

      {/* Gefüllte Facetten — der bereits erreichte Teil */}
      <path d={FACET_TL} fill={filled} />
      <path d={FACET_TR} fill={filled} opacity={variant === 'mono' ? 0.82 : 1} />
      <path d={FACET_BR} fill={filled} opacity={variant === 'mono' ? 0.62 : 0.85} />

      {/* Offene Facette — was noch aussteht */}
      <path
        d={FACET_BL}
        stroke={openStroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

/** Zeichen plus Schriftzug — für Kopfzeile, Fußzeile und Dialoge. */
export function Wordmark({
  size = 26,
  variant = 'gradient',
  className = '',
}: {
  size?: number
  variant?: LogoVariant
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logo size={size} variant={variant} />
      <span
        className="text-[1.0625rem] font-semibold"
        style={{ letterSpacing: '-0.03em', color: 'var(--text)' }}
      >
        HabitGrid
      </span>
    </span>
  )
}
