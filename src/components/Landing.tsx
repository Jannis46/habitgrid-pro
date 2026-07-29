import { lazy, Suspense } from 'react'
import { Bell, Check, Flame, Minus, Printer, ShieldCheck, WifiOff } from 'lucide-react'
import { softwareApplicationLd, useJsonLd, useSeo } from '../lib/seo'
import { CheckoutButton, PRICE } from './Checkout'
import { useAuth } from '../auth/AuthContext'
import { Logo, Wordmark } from './Logo'
import { DISCLAIMER } from '../engine/scientificMilestones'
import { ThemeToggle } from './ThemeToggle'
import { HowItWorks } from './HowItWorks'
import { AppDashboardPreview } from './AppDashboardPreview'
import { InstallBanner } from './InstallBanner'
import { Chatbot } from './Chatbot'

/**
 * Landingpage im Bento-Layout.
 *
 * Der Kristall ist dieselbe Komponente wie im Dashboard, hier fest im Endzustand:
 * Besucher sehen sofort das Objekt, das sie sich erarbeiten. three.js liegt in einem
 * eigenen Chunk und wird nachgeladen, damit Überschrift und Aufruf zur Handlung stehen,
 * bevor 119 kB Grafikcode eintreffen.
 */
const StreakCrystal = lazy(() =>
  import('./StreakCrystal').then((m) => ({ default: m.StreakCrystal })),
)

export const TAGLINE = 'Deine Habits. Dein Kristall. Kein Abo.'

/** Einmal gepflegt, doppelt genutzt: sichtbarer FAQ-Bereich und FAQPage-Structured-Data. */
const FAQ = [
  {
    q: 'Ist HabitGrid wirklich ohne Abo nutzbar?',
    a: 'Ja. Drei Habits sind dauerhaft kostenlos, ohne Zeitlimit und ohne Kreditkarte. Wer mehr braucht, zahlt einmalig 9,99 € und behält alle Funktionen — keine Verlängerung, keine Preiserhöhung, keine Kündigungsfrist.',
  },
  {
    q: 'Was passiert mit meiner Serie, wenn ich krank werde?',
    a: 'Du legst pro Habit fest, wie viele Ruhetage dir pro Woche zustehen. Ein verpasster Tag innerhalb dieses Budgets bricht die Serie nicht ab — er wird in der Matrix als Ruhetag eingefärbt statt als Ausfall. Genau daran scheitern die meisten Habit-Tracker: Eine Erkältung löscht achtzig Tage Fortschritt, und danach kommt niemand zurück.',
  },
  {
    q: 'Funktioniert die App offline?',
    a: 'Ja. HabitGrid ist eine Progressive Web App mit Service Worker. Nach dem ersten Aufruf lädt sie aus dem Cache und funktioniert im Flugmodus, in der U-Bahn und im Funkloch vollständig — inklusive Check-in, Matrix und Statistiken.',
  },
  {
    q: 'Kann ich die App auf dem iPhone installieren?',
    a: 'Ja. Auf dem iPhone öffnest du die Seite in Safari, tippst auf das Teilen-Symbol und wählst „Zum Home-Bildschirm". Unter Android und auf dem Desktop erscheint stattdessen ein Installationsknopf. Danach startet HabitGrid im Vollbild wie eine native App — ohne App Store, ohne Update-Zwang.',
  },
  {
    q: 'Was ist der Streak-Kristall?',
    a: 'Ein 3D-Objekt im Dashboard, das mit deiner besten laufenden Serie wächst. Bis drei Tage ist er matt und schlicht, ab vier Tagen beginnt er zu leuchten und bekommt Partikel, ab fünfzehn Tagen wird er zum Glaskristall mit Lichtbrechung. Seine Farbwelt richtet sich nach der Kategorie deines stärksten Habits.',
  },
  {
    q: 'Welche Frequenzen kann ich einstellen?',
    a: 'Täglich, X-mal pro Woche mit frei wählbaren Tagen, oder feste Wochentage. Bei der Wochenvorgabe zählt die Woche als Einheit: Du entscheidest selbst, an welchen Tagen du sie erfüllst.',
  },
  {
    q: 'Kann ich meine Habit-Matrix ausdrucken?',
    a: 'Ja. Über „Drucken" erzeugst du ein sauberes Arbeitsblatt ohne Navigation und Farbflächen — geeignet für Papier ebenso wie für den PDF-Export nach GoodNotes, Notability oder ins Bullet Journal.',
  },
  {
    q: 'Wo werden meine Daten gespeichert?',
    a: 'Standardmäßig ausschließlich auf deinem Gerät. Ohne konfiguriertes Konto-Backend verlässt kein Habit, keine Notiz und keine Stimmungsangabe deinen Browser. Über „Sicherung herunterladen" nimmst du deine Daten jederzeit als JSON-Datei mit.',
  },
  {
    q: 'Kann ich den Kauf widerrufen?',
    a: 'Bei digitalen Inhalten erlischt das Widerrufsrecht, sobald die Ausführung beginnt — dem stimmst du im Bestellvorgang ausdrücklich zu. Deshalb ist die kostenlose Version nicht beschnitten: Alle Funktionen sind enthalten, nur die Anzahl der Habits ist begrenzt. Du kannst das Produkt vollständig beurteilen, bevor du zahlst.',
  },
]

export function Landing() {
  useSeo({
    title: 'Habit Tracker ohne Abo — HabitGrid Pro | Einmal kaufen, dauerhaft nutzen',
    description:
      'Minimalistischer Habit Tracker als PWA: 3D-Streak-Kristall, Heatmap-Matrix, Ruhetage gegen Streak-Frust, offline nutzbar, druckbare Habit-Matrix. 9,99 € einmalig statt Monatsgebühr.',
    path: '/',
  })
  useJsonLd('habitgrid-ld', softwareApplicationLd(FAQ))

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <AppPreviewSection />
        <BentoFeatures />
        <Comparison />
        <Pricing />
        <FaqSection />
      </main>
      <SiteFooter />
      {/* Beide schweben unten rechts und stapeln sich: Chat unten, Installation darüber */}
      <InstallBanner />
      <Chatbot />
    </>
  )
}

function AppPreviewSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="card grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">So sieht es aus</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Ein Bildschirm. Alles Wichtige.
          </h2>
          <p className="lede mt-4">
            Oben der Tagesfortschritt, darunter die Habits von heute, dann dein Kristall und die
            Matrix. Keine Reiter, keine Untermenüs, kein Suchen — die Ansicht, die du täglich
            öffnest, muss in zwei Sekunden lesbar sein.
          </p>
          <ul className="mt-6 grid gap-2.5 text-[15px]" style={{ color: 'var(--muted)' }}>
            {[
              'Fortschrittsring zeigt Tagesetappe und Prozentwert',
              'Erledigte Habits füllen sich sofort grün',
              'Das (i) neben jeder Etappe öffnet die Studienquelle',
              'Der Kristall wächst sichtbar mit der längsten Serie',
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check size={17} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <AppDashboardPreview />
      </div>
    </section>
  )
}

function SiteHeader() {
  const { user } = useAuth()
  return (
    <header className="no-print sticky top-0 z-30 px-3 pt-3">
      <nav
        className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 sm:px-5"
        aria-label="Hauptnavigation"
      >
        <a href="#/" className="logo-hover">
          <Wordmark size={24} />
        </a>
        <div className="flex items-center gap-1 text-sm sm:gap-5">
          <a href="#anleitung" className="hidden px-2 sm:block" style={{ color: 'var(--muted)' }}>
            Anleitung
          </a>
          <a href="#funktionen" className="hidden px-2 sm:block" style={{ color: 'var(--muted)' }}>
            Funktionen
          </a>
          <a href="#vergleich" className="hidden px-2 sm:block" style={{ color: 'var(--muted)' }}>
            Vergleich
          </a>
          <a href="#preis" className="hidden px-2 sm:block" style={{ color: 'var(--muted)' }}>
            Preis
          </a>
          <a href={user ? '#/app' : '#/login'} className="btn btn-primary px-4 py-2 text-sm">
            {user ? 'Zur App' : 'Kostenlos starten'}
          </a>
        </div>
      </nav>
    </header>
  )
}

/* ─────────────────────────────────── Hero ─────────────────────────────────── */

function Hero() {
  const { user } = useAuth()
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-6 sm:px-6 lg:pt-16">
      <div className="relative grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="eyebrow">{TAGLINE}</p>
          <h1 className="display mt-5">
            Der Habit Tracker,
            <br />
            der dich nicht{' '}
            <span style={{ color: 'var(--accent)' }}>bestraft</span>.
          </h1>
          <p className="lede mt-6">
            Eine Erkältung, ein Umzug, ein voller Tag — und achtzig Tage Serie sind weg. Danach
            kommt kaum jemand zurück. HabitGrid gibt dir Ruhetage: geplante Aussetzer, die deine
            Serie aushält. Und einen Kristall, der mit jedem Tag wächst.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={user ? '#/app' : '#/login'} className="btn btn-primary px-7 py-3.5 text-base">
              Kostenlos starten
            </a>
            <CheckoutButton className="btn btn-ghost px-6 py-3.5" />
          </div>
          <ul
            className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            {[
              [ShieldCheck, 'Daten bleiben auf dem Gerät'],
              [WifiOff, 'Offline nutzbar'],
              [Printer, 'Druckbare Matrix'],
            ].map(([Icon, label]) => {
              const I = Icon as typeof ShieldCheck
              return (
                <li key={label as string} className="flex items-center gap-1.5">
                  <I size={15} aria-hidden style={{ color: 'var(--accent)' }} />
                  {label as string}
                </li>
              )
            })}
          </ul>
        </div>

        {/*
          Mattiertes Glas braucht Umgebung zum Brechen: Im hellen Modus steht der Kristall
          vor Weiß, im dunklen vor dem Seitenhintergrund. Genau dafür ist die dark:-Variante
          da — Schattentokens bleiben davon unberührt und kommen weiter aus dem .card-Stil.
        */}
        <div className="card relative overflow-hidden rounded-[var(--radius-lg)] bg-white p-3 dark:bg-transparent">
          <Suspense fallback={<div className="h-[300px] sm:h-[380px] lg:h-[460px]" />}>
            {/* Markenkategorie statt „wasser": Der Kern trägt das Smaragd der Marke */}
            <StreakCrystal streak={30} category="sonstiges" showcase />
          </Suspense>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-center">
            <span className="chip">
              <Flame size={13} aria-hidden style={{ color: 'var(--accent)' }} />
              Max Streak · ziehen zum Drehen
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── Bento-Raster ─────────────────────────────── */

function BentoFeatures() {
  return (
    <section id="funktionen" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-3xl font-semibold sm:text-4xl">
        Alles, was ein Habit Tracker braucht.
        <br />
        <span style={{ color: 'var(--muted)' }}>Nichts, was nur im Weg steht.</span>
      </h2>

      <div className="bento mt-8">
        {/* Große Kachel: das eigentliche Alleinstellungsmerkmal */}
        <article className="card card-interactive span-4 row-2 p-6 sm:p-8">
          <p className="eyebrow">Der Unterschied</p>
          <h3 className="mt-3 text-2xl font-semibold">Ruhetage statt Alles-oder-nichts</h3>
          <p className="lede mt-3 text-[15px]">
            Du legst pro Habit fest, wie viele Aussetzer dir pro Woche zustehen. Die Matrix färbt
            sie eigenständig ein: erledigt, Ruhetag, verpasst. Ehrlich, aber ohne Bestrafung.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {[
              ['erledigt', 'var(--done)'],
              ['erledigt', 'var(--done)'],
              ['Ruhetag', 'var(--rest)'],
              ['erledigt', 'var(--done)'],
              ['erledigt', 'var(--done)'],
              ['erledigt', 'var(--done)'],
            ].map(([label, color], i) => (
              <span
                key={i}
                title={label}
                className="h-9 w-9 rounded-lg"
                style={{ background: color, opacity: label === 'Ruhetag' ? 0.85 : 1 }}
              />
            ))}
            <span className="chip ml-1">Serie hält</span>
          </div>
        </article>

        <article className="card card-interactive span-2 p-6">
          <Flame size={20} aria-hidden style={{ color: 'var(--accent)' }} />
          <h3 className="mt-3 font-semibold">1-Klick-Check-in</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Öffnen, tippen, fertig. Daumengroße Fläche, kein Menü, keine Rückfrage.
          </p>
        </article>

        <article className="card card-interactive span-2 p-6">
          <Bell size={20} aria-hidden style={{ color: 'var(--accent)' }} />
          <h3 className="mt-3 font-semibold">Erinnerungen mit Uhrzeit</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Meldung nur für das, was heute noch offen ist. Abhaken direkt aus der Nachricht.
          </p>
        </article>

        <article className="card card-interactive span-3 p-6">
          <h3 className="font-semibold">Flexible Frequenzen</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Täglich, dreimal pro Woche oder montags, mittwochs, freitags. Bei Wochenvorgaben zählt
            die Woche als Einheit — du bestimmst den Tag.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d, i) => (
              <span
                key={d}
                className="grid h-8 w-9 place-items-center rounded-lg text-xs font-medium"
                style={{
                  background: [0, 2, 4].includes(i) ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: [0, 2, 4].includes(i) ? 'var(--accent)' : 'var(--muted)',
                  border: `1px solid ${[0, 2, 4].includes(i) ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </article>

        <article className="card card-interactive span-3 p-6">
          <h3 className="font-semibold">Matrix über zwölf Monate</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            53 Wochen auf einen Blick. Ein einzelner Ausfall verschwindet im Jahresbild fast —
            genau das ist der Punkt.
          </p>
          <div className="mt-4 flex gap-[3px] overflow-hidden">
            {Array.from({ length: 26 }, (_, c) => (
              <div key={c} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, r) => {
                  const v = (Math.sin(c * 1.3 + r * 0.7) + 1) / 2
                  return (
                    <span
                      key={r}
                      className="h-2.5 w-2.5 rounded-[3px]"
                      style={{
                        background:
                          v > 0.62 ? 'var(--done)' : v > 0.45 ? 'var(--rest)' : 'var(--missed)',
                        opacity: v > 0.62 ? 0.55 + v * 0.45 : 1,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </article>

        <article className="card card-interactive span-2 p-6">
          <h3 className="font-semibold">Notiz und Stimmung</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Ein Wort und ein Gesicht pro Tag. Nach zwei Monaten siehst du, welche Gewohnheit dich
            trägt und welche dich kostet.
          </p>
          <div className="mt-4 flex gap-1.5 text-lg">
            {['😞', '😐', '🙂', '😊', '🤩'].map((e, i) => (
              <span
                key={e}
                className="grid h-9 w-9 place-items-center rounded-lg"
                style={{
                  background: i === 3 ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: `1px solid ${i === 3 ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {e}
              </span>
            ))}
          </div>
        </article>

        <article className="card card-interactive span-2 p-6">
          <h3 className="font-semibold">Folgt deinem System</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Hell am Tag, dunkel am Abend — automatisch nach deiner Systemeinstellung. Wer lieber
            selbst entscheidet, stellt es mit einem Tipp fest ein.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </article>

        {/* Stimmen als eigene Kachel im Raster */}
        <article className="card span-2 p-6">
          <p className="eyebrow">Stimmen</p>
          <blockquote className="mt-3 text-[15px] leading-relaxed">
            „Ich war zwei Wochen krank und meine Serie stand danach noch. Zum ersten Mal habe ich
            nach einer Pause einfach weitergemacht, statt die App zu löschen."
          </blockquote>
          <footer className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
            [NAME], [ROLLE], [ORT]
          </footer>
          <p
            className="mt-4 rounded-lg p-3 text-xs"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <strong>Hinweis an den Betreiber:</strong> Platzhalter. Erfundene Kundenstimmen sind
            nach § 5b Abs. 3 UWG i. V. m. Anhang Nr. 23b unzulässig — vor dem Livegang ersetzen
            oder entfernen.
          </p>
        </article>
      </div>
    </section>
  )
}

/* ──────────────────────────────── Vergleich ───────────────────────────────── */

function Comparison() {
  const rows: [string, boolean, boolean][] = [
    ['Einmalzahlung statt Abo', true, false],
    ['Ruhetage, die die Serie schützen', true, false],
    ['Vollständig offline nutzbar', true, false],
    ['Ohne Konto ausprobierbar', true, false],
    ['Daten bleiben auf dem Gerät', true, false],
    ['Druckbare Matrix für Papier und PDF', true, false],
    ['Flexible Wochenziele', true, true],
    ['Erinnerungen', true, true],
  ]
  return (
    <section id="vergleich" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold sm:text-3xl">HabitGrid gegen typische Abo-Apps</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Die rechte Spalte beschreibt das im Markt übliche Muster, keinen bestimmten Anbieter.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr style={{ color: 'var(--muted)' }}>
                <th scope="col" className="py-2 font-medium">
                  Merkmal
                </th>
                <th scope="col" className="py-2 text-center font-medium">
                  HabitGrid Pro
                </th>
                <th scope="col" className="py-2 text-center font-medium">
                  Übliche Abo-App
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, mine, theirs]) => (
                <tr key={label} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <th scope="row" className="py-3 pr-4 font-normal">
                    {label}
                  </th>
                  <td className="py-3 text-center">
                    <Cell yes={mine} />
                  </td>
                  <td className="py-3 text-center">
                    <Cell yes={theirs} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Cell({ yes }: { yes: boolean }) {
  return yes ? (
    <>
      <Check size={18} className="inline" style={{ color: 'var(--accent)' }} aria-hidden />
      <span className="sr-only">ja</span>
    </>
  ) : (
    <>
      <Minus size={18} className="inline" style={{ color: 'var(--muted)' }} aria-hidden />
      <span className="sr-only">nein</span>
    </>
  )
}

/* ───────────────────────────────── Preise ─────────────────────────────────── */

function Pricing() {
  const { user } = useAuth()
  return (
    <section id="preis" className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h2 className="text-center text-3xl font-semibold sm:text-4xl">
        Einmal zahlen. Dann nie wieder.
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <article className="card card-interactive p-7">
          <h3 className="font-semibold">Kostenlos</h3>
          <p className="mt-2 text-4xl font-semibold tracking-tight">0 €</p>
          <ul className="mt-6 space-y-2.5 text-sm" style={{ color: 'var(--muted)' }}>
            {[
              'Bis zu drei Habits, dauerhaft',
              'Ruhetage, Serien und volle Matrix',
              'Streak-Kristall bis zur höchsten Stufe',
              'Notizen, Stimmung und Erinnerungen',
              'Offline nutzbar und installierbar',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                {t}
              </li>
            ))}
          </ul>
          <a href={user ? '#/app' : '#/login'} className="btn btn-ghost mt-7 w-full">
            Jetzt anfangen
          </a>
        </article>

        <article
          className="card relative p-7"
          style={{ borderColor: 'var(--accent)', boxShadow: 'var(--shadow-lg)' }}
        >
          <span
            className="absolute -top-3 left-7 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Einmalzahlung
          </span>
          <h3 className="font-semibold">Pro</h3>
          <p className="mt-2 text-4xl font-semibold tracking-tight">
            {PRICE}
            <span className="ml-2 text-base font-normal" style={{ color: 'var(--muted)' }}>
              einmalig
            </span>
          </p>
          <ul className="mt-6 space-y-2.5 text-sm" style={{ color: 'var(--muted)' }}>
            {[
              'Alles aus der kostenlosen Version',
              'Unbegrenzt viele Habits',
              'Kommerzielle Nutzung in Kundenprojekten',
              'Druck- und PDF-Export der Matrix',
              'Dauerhafte Lizenz, keine Verlängerung',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                {t}
              </li>
            ))}
          </ul>
          <CheckoutButton label="Jetzt kaufen" className="btn btn-primary mt-7 w-full" />
          <p className="mt-3 text-center text-xs" style={{ color: 'var(--muted)' }}>
            Lizenzschlüssel sofort nach Zahlung. Preis inkl. USt.
          </p>
        </article>
      </div>
    </section>
  )
}

/* ────────────────────────────────── FAQ ───────────────────────────────────── */

function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h2 className="text-3xl font-semibold sm:text-4xl">Häufige Fragen</h2>
      <div className="mt-8 grid gap-2">
        {FAQ.map((f) => (
          <details key={f.q} className="card card-interactive group p-5">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              <span className="flex items-start justify-between gap-4">
                <h3 className="font-medium">{f.q}</h3>
                <span
                  className="mt-0.5 shrink-0 text-lg transition group-open:rotate-45"
                  style={{ color: 'var(--accent)' }}
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="no-print border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 text-sm sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="#/" className="logo-hover">
            <Wordmark size={22} />
          </a>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-5" style={{ color: 'var(--muted)' }}>
            <a href="#/impressum">Impressum</a>
            <a href="#/datenschutz">Datenschutz</a>
            <a href="#/agb">AGB</a>
            <a href="#/widerruf">Widerruf</a>
          </nav>
        </div>
        <p className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
          <Logo size={14} variant="mono" />© {new Date().getFullYear()} HabitGrid Pro — [NAME / FIRMA]
        </p>
        <p className="max-w-3xl text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  )
}
