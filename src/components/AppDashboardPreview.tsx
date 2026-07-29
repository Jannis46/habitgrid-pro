import { useEffect, useRef, useState } from 'react'
import { Check, Info } from 'lucide-react'

/**
 * Realistische Vorschau der App für die Landingpage.
 *
 * Bewusst als HTML und SVG nachgebaut statt als Bildschirmfoto: Das Mockup übernimmt
 * dieselben Design-Tokens wie die echte App, folgt damit automatisch dem Theme und
 * bleibt auf jedem Display gestochen scharf. Ein PNG müsste bei jeder Designänderung
 * neu erzeugt werden und wäre in zwei Wochen veraltet.
 *
 * Der Ring animiert erst, wenn er im Sichtfeld steht — sonst läuft die Animation
 * unbemerkt ab, während der Nutzer noch die Überschrift liest.
 */
export function AppDashboardPreview() {
  const [visible, setVisible] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={host} className="mx-auto w-full max-w-[19rem]">
      {/* Gerätrahmen */}
      <div
        className="relative rounded-[2.25rem] border p-2.5"
        style={{
          borderColor: 'var(--border-strong)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Kamerainsel */}
        <div
          className="absolute top-3.5 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-full"
          style={{ background: 'var(--border-strong)' }}
          aria-hidden
        />

        <div
          className="overflow-hidden rounded-[1.7rem] px-4 pt-8 pb-4"
          style={{ background: 'var(--bg)' }}
        >
          <p className="text-[0.68rem]" style={{ color: 'var(--muted)' }}>
            Mittwoch, 29. Juli
          </p>
          <p className="text-[0.95rem] font-semibold">Hallo Janni</p>

          {/* Fortschrittsring */}
          <div className="mt-3 flex items-center gap-3">
            <ProgressRing percent={30} animate={visible} />
            <div className="min-w-0">
              <p className="text-[0.8rem] font-semibold">Tag 3 von 10</p>
              <p className="text-[0.68rem]" style={{ color: 'var(--muted)' }}>
                Etappe „Verteiltes Lernen"
              </p>
              <p
                className="mt-1 flex items-center gap-1 text-[0.62rem]"
                style={{ color: 'var(--muted)' }}
              >
                Wissenschaftlich belegt
                <span
                  className="grid h-3.5 w-3.5 place-items-center rounded-full"
                  style={{ background: 'var(--surface-2)' }}
                  aria-label="Quelle anzeigen"
                >
                  <Info size={9} />
                </span>
              </p>
            </div>
          </div>

          {/* Habit-Kacheln */}
          <ul className="mt-3.5 grid gap-1.5">
            {[
              { icon: '🏃', name: '30 Min. Sport', sub: 'Täglich · 07:00', done: true },
              { icon: '💧', name: '2 L Wasser', sub: 'Täglich', done: true },
              { icon: '📚', name: '10 Seiten lesen', sub: '5× pro Woche', done: false },
            ].map((habit) => (
              <li
                key={habit.name}
                className="flex items-center gap-2.5 rounded-xl border p-2"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.8rem]"
                  style={{
                    background: habit.done ? 'var(--done)' : 'var(--surface-2)',
                    color: habit.done ? 'var(--accent-text)' : 'inherit',
                    border: habit.done ? 'none' : '1.5px solid var(--border-strong)',
                  }}
                >
                  {habit.done ? <Check size={15} /> : habit.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.78rem] font-medium">{habit.name}</span>
                  <span className="block text-[0.62rem]" style={{ color: 'var(--muted)' }}>
                    {habit.sub}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Kristall als schwebendes Belohnungsobjekt */}
          <div
            className="mt-3 flex items-center gap-3 rounded-xl border p-2.5"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <GemGlyph />
            <span className="min-w-0">
              <span className="block text-[0.78rem] font-medium">Dein Kristall wächst</span>
              <span className="block text-[0.62rem]" style={{ color: 'var(--muted)' }}>
                Noch 12 Tage bis zur höchsten Stufe
              </span>
            </span>
          </div>

          {/* Heatmap-Andeutung */}
          <div className="mt-3 flex gap-[2px]" aria-hidden>
            {Array.from({ length: 22 }, (_, c) => (
              <div key={c} className="flex flex-col gap-[2px]">
                {Array.from({ length: 7 }, (_, r) => {
                  const v = (Math.sin(c * 1.4 + r * 0.8) + 1) / 2
                  return (
                    <span
                      key={r}
                      className="h-[5px] w-[5px] rounded-[1.5px]"
                      style={{
                        background:
                          v > 0.62 ? 'var(--done)' : v > 0.46 ? 'var(--rest)' : 'var(--missed)',
                        opacity: v > 0.62 ? 0.5 + v * 0.5 : 1,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Ring, der sich beim Sichtbarwerden von 0 auf den Zielwert füllt. */
function ProgressRing({ percent, animate }: { percent: number; animate: boolean }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - (animate ? percent : 0) / 100)

  return (
    <svg width="66" height="66" viewBox="0 0 66 66" role="img" aria-label={`${percent} Prozent erreicht`}>
      <circle
        cx="33"
        cy="33"
        r={radius}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth="7"
      />
      <circle
        cx="33"
        cy="33"
        r={radius}
        fill="none"
        stroke="var(--done)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 33 33)"
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.2, 0, 0, 1)' }}
      />
      <text
        x="33"
        y="37"
        textAnchor="middle"
        fontSize="15"
        fontWeight="600"
        fill="var(--text)"
      >
        {percent}%
      </text>
    </svg>
  )
}

/** Kleines Kristall-Zeichen — kein WebGL, das Mockup soll nichts nachladen. */
function GemGlyph() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="gem-preview" x1="8" y1="4" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <path d="M17 3 L28 13 L17 31 L6 13 Z" fill="url(#gem-preview)" />
      <path d="M17 3 L28 13 L17 31 L6 13 Z" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinejoin="round" opacity="0.7" />
      <path d="M6 13 L28 13" stroke="var(--accent)" strokeWidth="0.9" opacity="0.45" />
      <path d="M17 3 L17 31" stroke="var(--accent)" strokeWidth="0.9" opacity="0.3" />
      <circle cx="17" cy="15.5" r="2.6" fill="var(--accent)" />
    </svg>
  )
}
