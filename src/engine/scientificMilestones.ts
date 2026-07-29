/**
 * Etappen mit wissenschaftlicher Grundlage.
 *
 * ═══ REGELN, DIE HIER NICHT VERHANDELBAR SIND ═══
 *
 * 1. KEINE HEILSVERSPRECHEN. Formuliert wird ausschließlich, was in Studien beobachtet
 *    wurde — „in Studien beobachtet", „wird mit … in Verbindung gebracht". Niemals
 *    „heilt", „beseitigt", „schützt vor". Gesundheitsbezogene Werbeaussagen unterliegen
 *    in der EU der Health-Claims-Verordnung (VO (EG) Nr. 1924/2006) und dem HWG; eine
 *    App darf motivieren, aber keine Wirkung zusichern.
 * 2. KEINE INDIVIDUELLE PROGNOSE. Die Angaben sind Durchschnitts- und Spannweitenwerte
 *    aus Gruppenstudien. Was bei einem Menschen passiert, sagen sie nicht voraus.
 * 3. JEDE AUSSAGE HAT EINE QUELLE. Ohne `evidence` kein Eintrag.
 *
 * ═══ PRÜFSTAND DER QUELLEN ═══
 *
 * Direkt im Rahmen dieser Umsetzung gegen die Primärliteratur abgeglichen:
 *   • Lally et al. 2010 — Zahlen (n = 96, Median 66 Tage, Spanne 18–254, ein verpasster
 *     Tag ohne messbaren Effekt) bestätigt.
 *   • Hölzel et al. 2011 — 8-Wochen-MBSR, n = 16, erhöhte Grauzellkonzentration in
 *     linkem Hippocampus, PCC, TPJ und Kleinhirn bestätigt.
 *
 * NICHT einzeln gegengeprüft, sondern aus etabliertem Lehrbuchwissen übernommen:
 *   • Garber et al. 2011 (ACSM Position Stand), Watson et al. 2015 (AASM/SRS Consensus),
 *     Armstrong et al. 2012 und Ganio et al. 2011 zur Hydratation.
 *   Vor dem Livegang sollten diese vier Angaben gegen das Original geprüft werden —
 *   bei gesundheitsnahen Aussagen ist eine falsche Quellenangabe teurer als keine.
 */
import type { CategoryId } from './habits'

export type Milestone = {
  category: CategoryId
  /** Ab wie vielen Tagen Serie die Etappe erreicht ist */
  days: number
  title: string
  /** Was beobachtet wurde — beschreibend, nicht zusichernd */
  description: string
  /** Konkrete Fundstelle, wird im Info-Fenster angezeigt */
  evidenceSource: string
  /** Ergänzende Einordnung: Stichprobe, Grenzen, Streuung */
  evidenceDetail: string
}

export const DISCLAIMER =
  'Die angegebenen Etappen-Effekte basieren auf wissenschaftlichen Durchschnittswerten und ' +
  'dienen der Orientierung und Motivation. Sie stellen keine medizinische Beratung und kein ' +
  'Heilversprechen dar.'

export const MILESTONES: Milestone[] = [
  /* ───────────────────────── Kategorieübergreifend: Gewohnheitsbildung ───────── */
  {
    category: 'sonstiges',
    days: 18,
    title: 'Untere Grenze der Automatisierung',
    description:
      'Ab hier liegt dein Verhalten im Bereich, in dem die schnellsten Teilnehmenden einer Londoner Feldstudie erste Automatisierung berichteten. Die Spanne ist groß — 18 Tage war das schnellste beobachtete Ergebnis, nicht der Regelfall.',
    evidenceSource: 'Lally et al. (2010), European Journal of Social Psychology 40(6), 998–1009',
    evidenceDetail:
      '96 Teilnehmende führten zwölf Wochen lang täglich ein selbst gewähltes Verhalten im gleichen Kontext aus und bewerteten, wie automatisch es sich anfühlte. Die Zeit bis zum Erreichen von 95 % des individuellen Automatisierungsplateaus lag zwischen 18 und 254 Tagen.',
  },
  {
    category: 'sonstiges',
    days: 66,
    title: 'Median der Automatisierung erreicht',
    description:
      'Beim Median der Studienteilnehmenden fühlte sich das Verhalten nach 66 Tagen weitgehend automatisch an. Der verbreitete „21-Tage-Mythos" ließ sich in dieser Untersuchung nicht bestätigen.',
    evidenceSource: 'Lally et al. (2010), European Journal of Social Psychology 40(6), 998–1009',
    evidenceDetail:
      'Median 66 Tage bis 95 % des Automatisierungsplateaus. Ebenfalls beobachtet: Eine einzelne ausgelassene Gelegenheit beeinträchtigte den Aufbauprozess nicht messbar — die fachliche Grundlage der Ruhetage in dieser App.',
  },

  /* ─────────────────────────────── Fitness & Bewegung ───────────────────────── */
  {
    category: 'fitness',
    days: 14,
    title: 'Erste Anpassungen im Training',
    description:
      'In den ersten Wochen regelmäßigen Ausdauertrainings werden vor allem neuromuskuläre Anpassungen beschrieben — Bewegungen fühlen sich runder an, bevor sich die Ausdauerleistung messbar ändert.',
    evidenceSource: 'Garber et al. (2011), ACSM Position Stand, Medicine & Science in Sports & Exercise',
    evidenceDetail:
      'Die Positionsbestimmung des American College of Sports Medicine fasst Umfang, Intensität und Anpassungsverläufe für gesunde Erwachsene zusammen. Empfohlen werden mindestens 150 Minuten moderate Ausdaueraktivität pro Woche.',
  },
  {
    category: 'fitness',
    days: 28,
    title: 'Zeitfenster messbarer Ausdauerveränderung',
    description:
      'Nach etwa vier Wochen regelmäßigen Trainings werden in Studien häufig erste messbare Veränderungen der Ausdauerleistungsfähigkeit berichtet. Wie stark sie ausfallen, hängt von Ausgangsniveau, Intensität und Erholung ab.',
    evidenceSource: 'Garber et al. (2011), ACSM Position Stand, Medicine & Science in Sports & Exercise',
    evidenceDetail:
      'Untrainierte zeigen typischerweise deutlichere relative Zuwächse als Trainierte. Die Angabe ist ein Gruppendurchschnitt und keine Vorhersage für den Einzelfall.',
  },
  {
    category: 'fitness',
    days: 90,
    title: 'Training als fester Bestandteil',
    description:
      'Drei Monate liegen über dem Median der Gewohnheitsbildung. Bewegung wird für viele hier zur Selbstverständlichkeit statt zur Entscheidung.',
    evidenceSource: 'Lally et al. (2010), European Journal of Social Psychology 40(6), 998–1009',
    evidenceDetail:
      'Median 66 Tage bis zur weitgehenden Automatisierung; körperlich anspruchsvollere Verhaltensweisen lagen in der Studie tendenziell im oberen Bereich der Spanne.',
  },

  /* ────────────────────────────── Mental & Meditation ───────────────────────── */
  {
    category: 'mental',
    days: 14,
    title: 'Übung wird vertraut',
    description:
      'In den ersten beiden Wochen berichten Teilnehmende von Achtsamkeitsprogrammen vor allem, dass ihnen das Üben selbst leichter fällt — der Einstieg kostet weniger Überwindung.',
    evidenceSource: 'Kabat-Zinn (1982/1990), Grundlagen des MBSR-Programms',
    evidenceDetail:
      'Das standardisierte Programm zur achtsamkeitsbasierten Stressreduktion umfasst acht Wochen mit täglicher Eigenübung und bildet die Grundlage eines Großteils der späteren Forschung.',
  },
  {
    category: 'mental',
    days: 56,
    title: 'Zeitraum des klassischen 8-Wochen-Programms',
    description:
      'Nach acht Wochen täglicher Achtsamkeitsübung wurden in einer kontrollierten MRT-Untersuchung Veränderungen der Grauzellkonzentration in Hirnregionen beobachtet, die mit Lernen, Gedächtnis und Emotionsregulation in Verbindung gebracht werden.',
    evidenceSource: 'Hölzel et al. (2011), Psychiatry Research: Neuroimaging 191(1), 36–43',
    evidenceDetail:
      '16 meditationsunerfahrene Personen wurden vor und nach einem achtwöchigen MBSR-Programm untersucht. Berichtet wurden Zunahmen im linken Hippocampus, im posterioren cingulären Cortex, an der temporoparietalen Junktion und im Kleinhirn. Kleine Stichprobe — die Befunde sind ein Hinweis, kein Beleg für einen individuellen Effekt.',
  },

  /* ───────────────────────── Hydration & Ernährung ──────────────────────────── */
  {
    category: 'wasser',
    days: 7,
    title: 'Trinkverhalten stabilisiert sich',
    description:
      'Eine Woche reicht meist, um das Trinken an feste Alltagsanker zu koppeln. Studien zur Hydratation untersuchen vor allem den akuten Zustand — nicht die Serie —, weshalb hier bewusst keine körperliche Wirkung behauptet wird.',
    evidenceSource: 'Armstrong et al. (2012), The Journal of Nutrition',
    evidenceDetail:
      'Untersucht wurde der Zusammenhang zwischen leichter Dehydratation und Stimmung beziehungsweise Konzentration bei jungen Frauen; eine Parallelarbeit von Ganio et al. (2011) untersuchte Männer.',
  },
  {
    category: 'wasser',
    days: 30,
    title: 'Ausreichende Zufuhr als Regelfall',
    description:
      'Bereits ein Flüssigkeitsverlust im Bereich von ein bis zwei Prozent des Körpergewichts wird in Studien mit Beeinträchtigungen von Stimmung und Konzentrationsleistung in Verbindung gebracht. Regelmäßiges Trinken hält dich zuverlässig unterhalb dieser Schwelle.',
    evidenceSource: 'Armstrong et al. (2012), The Journal of Nutrition; Ganio et al. (2011), British Journal of Nutrition',
    evidenceDetail:
      'Beide Arbeiten arbeiteten mit induzierter milder Dehydratation im Labor. Die beobachteten Effekte waren klein und betrafen vor allem subjektive Maße wie Anstrengungsempfinden und Stimmung.',
  },

  /* ──────────────────────────── Schlaf & Erholung ───────────────────────────── */
  {
    category: 'schlaf',
    days: 14,
    title: 'Regelmäßiger Rhythmus',
    description:
      'Gleichbleibende Zubett- und Aufstehzeiten sind das am besten belegte Einzelmerkmal stabilen Schlafverhaltens. Zwei Wochen genügen vielen, um einen Rhythmus zu etablieren.',
    evidenceSource: 'Watson et al. (2015), Consensus Statement AASM & Sleep Research Society, SLEEP',
    evidenceDetail:
      'Die gemeinsame Empfehlung der American Academy of Sleep Medicine und der Sleep Research Society nennt für gesunde Erwachsene regelmäßig mindestens sieben Stunden Schlaf pro Nacht.',
  },
  {
    category: 'schlaf',
    days: 60,
    title: 'Schlafroutine im Alltag verankert',
    description:
      'Zwei Monate liegen im Bereich des Medians der Gewohnheitsbildung. Die Abendroutine kostet ab hier für viele keine bewusste Entscheidung mehr.',
    evidenceSource: 'Lally et al. (2010), European Journal of Social Psychology 40(6), 998–1009',
    evidenceDetail:
      'Median 66 Tage bis zur weitgehenden Automatisierung, Spanne 18 bis 254 Tage.',
  },

  /* ───────────────────────────────── Lernen ────────────────────────────────── */
  {
    category: 'lernen',
    days: 21,
    title: 'Verteiltes Lernen greift',
    description:
      'Über viele Tage verteiltes Üben führt in der Gedächtnisforschung zu besserem Langzeitbehalten als dieselbe Zeit am Stück — der sogenannte Verteilungseffekt gehört zu den robustesten Befunden des Fachgebiets.',
    evidenceSource: 'Cepeda et al. (2006), Psychological Bulletin 132(3), 354–380',
    evidenceDetail:
      'Metaanalyse über mehr als 250 Experimente zum Abstandseffekt beim Lernen. Der Vorteil verteilten Übens zeigte sich über Materialarten und Altersgruppen hinweg.',
  },
  {
    category: 'lernen',
    days: 66,
    title: 'Lernen ohne Anlauf',
    description:
      'Am Median der Gewohnheitsbildung angekommen: Die tägliche Lerneinheit beginnt für die meisten, ohne dass sie sich dazu überwinden müssen.',
    evidenceSource: 'Lally et al. (2010), European Journal of Social Psychology 40(6), 998–1009',
    evidenceDetail:
      'Median 66 Tage bis 95 % des individuellen Automatisierungsplateaus.',
  },
]

/** Bereits erreichte Etappe für eine Kategorie — die höchste, deren Tageszahl erfüllt ist. */
export function reachedMilestone(category: CategoryId, streak: number): Milestone | null {
  const pool = milestonesFor(category)
  const reached = pool.filter((m) => streak >= m.days)
  return reached.length ? reached[reached.length - 1] : null
}

/** Nächste Etappe für eine Kategorie, oder null wenn alle erreicht sind. */
export function nextMilestone(category: CategoryId, streak: number): Milestone | null {
  return milestonesFor(category).find((m) => streak < m.days) ?? null
}

/**
 * Etappen einer Kategorie, aufsteigend. Kategorien ohne eigene Einträge greifen auf die
 * allgemeinen Befunde zur Gewohnheitsbildung zurück — die gelten für jedes Verhalten.
 */
export function milestonesFor(category: CategoryId): Milestone[] {
  const own = MILESTONES.filter((m) => m.category === category)
  const general = MILESTONES.filter((m) => m.category === 'sonstiges')
  return [...(own.length ? own : []), ...general].sort((a, b) => a.days - b.days)
}
