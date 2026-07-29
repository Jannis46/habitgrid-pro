/**
 * „In 3 einfachen Schritten" — bebilderte Anleitung.
 *
 * Die Illustrationen sind handgezeichnetes SVG statt Bilddateien: Sie übernehmen die
 * Design-Tokens, folgen damit Hell- und Dunkelmodus von selbst, bleiben auf jedem
 * Display scharf und wiegen zusammen weniger als ein einzelnes PNG.
 */

const STEPS = [
  {
    title: 'Habit anlegen & Etappenziel wählen',
    body: 'Name, Kategorie, Frequenz — drei Angaben, eine Ansicht. Die Kategorie bestimmt, welche wissenschaftlichen Etappen dich später begleiten und welche Farbe dein Kristall bekommt.',
    Illustration: StepCreate,
  },
  {
    title: '1-Klick-Check-in im Alltag',
    body: 'Öffnen, tippen, fertig — unter zwei Sekunden. Die Trefferfläche ist daumengroß, es gibt keine Rückfrage und kein Menü. Der Fortschritt füllt sich sofort.',
    Illustration: StepCheckin,
  },
  {
    title: 'Meilensteine & 3D-Kristall freischalten',
    body: 'Die Matrix zeigt zwölf Monate auf einen Blick, jede Etappe nennt ihre Quelle, und der Kristall wächst mit deiner längsten Serie bis zum Glaskörper mit Lichtbrechung.',
    Illustration: StepReward,
  },
]

export function HowItWorks() {
  return (
    <section id="anleitung" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-3xl font-semibold sm:text-4xl">
        In 3 einfachen Schritten zu dauerhaften Gewohnheiten
      </h2>
      <p className="lede mt-3">
        Kein Onboarding-Assistent, keine Einrichtung über mehrere Bildschirme. Vom ersten Öffnen
        bis zum ersten Haken vergeht weniger als eine Minute.
      </p>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="card card-interactive flex flex-col p-5">
            <div
              className="mb-5 overflow-hidden rounded-xl"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <step.Illustration />
            </div>
            <span
              className="grid h-7 w-7 place-items-center rounded-full text-[0.8rem] font-semibold"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              {index + 1}
            </span>
            <h3 className="mt-3 font-semibold">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ──────────────────────────── Schritt 1: Anlegen ──────────────────────────── */

function StepCreate() {
  return (
    <svg viewBox="0 0 260 150" className="h-auto w-full" role="img" aria-label="Eingabemaske mit Kategorie-Auswahl">
      <rect x="20" y="16" width="220" height="118" rx="12" fill="var(--surface)" stroke="var(--border)" />

      {/* Eingabefeld */}
      <rect x="34" y="32" width="70" height="7" rx="3.5" fill="var(--muted)" opacity="0.5" />
      <rect x="34" y="45" width="192" height="24" rx="8" fill="var(--surface-2)" stroke="var(--border)" />
      <rect x="44" y="53" width="86" height="8" rx="4" fill="var(--text)" opacity="0.75" />
      <rect x="134" y="51" width="1.5" height="12" rx="0.75" fill="var(--accent)">
        <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
      </rect>

      {/* Kategorie-Chips */}
      <rect x="34" y="80" width="62" height="7" rx="3.5" fill="var(--muted)" opacity="0.5" />
      {[
        { x: 34, w: 46, label: 'F', color: '#f05a4f', active: false },
        { x: 86, w: 50, label: 'M', color: '#d6a441', active: false },
        { x: 142, w: 50, label: 'W', color: '#3aa0d8', active: true },
        { x: 198, w: 28, label: 'L', color: '#8b62c9', active: false },
      ].map((chip) => (
        <g key={chip.x}>
          <rect
            x={chip.x}
            y="94"
            width={chip.w}
            height="22"
            rx="11"
            fill={chip.active ? 'var(--accent-soft)' : 'var(--surface-2)'}
            stroke={chip.active ? 'var(--accent)' : 'var(--border)'}
          />
          <circle cx={chip.x + 13} cy="105" r="4" fill={chip.color} />
          <rect
            x={chip.x + 21}
            y="102"
            width={chip.w - 30}
            height="6"
            rx="3"
            fill="var(--muted)"
            opacity="0.55"
          />
        </g>
      ))}
    </svg>
  )
}

/* ──────────────────────────── Schritt 2: Check-in ─────────────────────────── */

function StepCheckin() {
  return (
    <svg viewBox="0 0 260 150" className="h-auto w-full" role="img" aria-label="Finger tippt eine Habit-Kachel an, der Fortschritt füllt sich">
      {/* Kachel */}
      <rect x="26" y="30" width="208" height="46" rx="12" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="52" cy="53" r="15" fill="var(--done)" />
      <path
        d="M45 53 l5 5 l9 -10"
        fill="none"
        stroke="var(--accent-text)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="76" y="44" width="88" height="8" rx="4" fill="var(--text)" opacity="0.75" />
      <rect x="76" y="58" width="56" height="6" rx="3" fill="var(--muted)" opacity="0.5" />

      {/* Tippende Hand */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -7; 0 0"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <circle cx="52" cy="53" r="22" fill="var(--accent)" opacity="0.16">
          <animate attributeName="r" values="15;26;15" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.28;0;0.28" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <path
          d="M60 74 q0 -12 7 -12 q4 0 4 5 l0 -14 q0 -5 4.5 -5 q4.5 0 4.5 5 l0 12 l0 -8 q0 -4.5 4.5 -4.5 q4.5 0 4.5 4.5 l0 8 q3 -3 6 0 q2.5 2.5 0 6 l-9 12 q-4 5 -11 5 l-8 0 q-7 0 -7 -7 z"
          fill="var(--surface)"
          stroke="var(--text)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </g>

      {/* Fortschrittsbalken, der sich füllt */}
      <rect x="26" y="98" width="208" height="10" rx="5" fill="var(--surface-2)" />
      <rect x="26" y="98" width="0" height="10" rx="5" fill="var(--done)">
        <animate attributeName="width" values="0;146;146" dur="2.4s" repeatCount="indefinite" />
      </rect>
      <text x="26" y="128" fontSize="12" fontWeight="600" fill="var(--muted)">
        unter 2 Sekunden
      </text>
      <text x="234" y="128" fontSize="13" fontWeight="700" textAnchor="end" fill="var(--done)">
        70 %
      </text>
    </svg>
  )
}

/* ──────────────────────────── Schritt 3: Belohnung ────────────────────────── */

function StepReward() {
  return (
    <svg viewBox="0 0 260 150" className="h-auto w-full" role="img" aria-label="Heatmap-Raster, Quellenhinweis und Kristall">
      {/* Heatmap */}
      {Array.from({ length: 18 }, (_, c) =>
        Array.from({ length: 6 }, (_, r) => {
          const v = (Math.sin(c * 1.25 + r * 0.85) + 1) / 2
          return (
            <rect
              key={`${c}-${r}`}
              x={22 + c * 9}
              y={22 + r * 9}
              width="7"
              height="7"
              rx="2"
              fill={v > 0.62 ? 'var(--done)' : v > 0.46 ? 'var(--rest)' : 'var(--missed)'}
              opacity={v > 0.62 ? 0.5 + v * 0.5 : 1}
            />
          )
        }),
      )}

      {/* Quellenhinweis */}
      <rect x="22" y="86" width="128" height="34" rx="9" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="36" cy="97" r="6" fill="var(--surface-2)" />
      <text x="36" y="100.5" fontSize="8" fontWeight="700" textAnchor="middle" fill="var(--muted)">
        i
      </text>
      <rect x="47" y="93" width="90" height="6" rx="3" fill="var(--text)" opacity="0.7" />
      <rect x="47" y="104" width="66" height="5" rx="2.5" fill="var(--muted)" opacity="0.5" />

      {/* Kristall */}
      <g transform="translate(200 78)">
        <ellipse cx="0" cy="42" rx="26" ry="6" fill="var(--text)" opacity="0.08" />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -5; 0 0"
            dur="3.6s"
            repeatCount="indefinite"
          />
          <path d="M0 -34 L26 -6 L0 34 L-26 -6 Z" fill="var(--accent)" opacity="0.16" />
          <path
            d="M0 -34 L26 -6 L0 34 L-26 -6 Z"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <path d="M-26 -6 L26 -6" stroke="var(--accent)" strokeWidth="1.3" opacity="0.5" />
          <path d="M0 -34 L0 34" stroke="var(--accent)" strokeWidth="1.3" opacity="0.32" />
          <circle cx="0" cy="-1" r="7" fill="var(--accent)" />
        </g>
      </g>
    </svg>
  )
}
