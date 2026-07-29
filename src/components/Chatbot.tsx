import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Logo } from './Logo'

/**
 * Support-Widget mit vorbereiteten Antworten.
 *
 * ═══ NICHT AUFNEHMEN ═══
 * Rabatt- und Gutscheincodes gehören NICHT in dieses Widget und in keinen anderen
 * öffentlichen Text der Seite. Wer hier später Antworten ergänzt: keine Codes, auch
 * nicht auf Nachfrage, auch nicht als Beispiel.
 *
 * Bewusst kein Sprachmodell dahinter: Ein Chat, der frei formuliert, kann zu Preisen,
 * Widerrufsrecht und Gesundheitsaussagen Dinge behaupten, für die der Betreiber haftet.
 * Feste Antworten sind hier die belastbare Lösung — und funktionieren offline.
 */

type Entry = { question: string; answer: string }

const ENTRIES: Entry[] = [
  {
    question: 'Ist HabitGrid wirklich ohne Abo?',
    answer:
      'Ja. Drei Habits sind dauerhaft kostenlos — ohne Zeitlimit und ohne Kreditkarte. Wer mehr braucht, zahlt einmalig 9,99 €. Danach gibt es keine Verlängerung, keine Preiserhöhung und nichts zu kündigen.',
  },
  {
    question: 'Wie installiere ich die App auf dem iPhone?',
    answer:
      'Öffne diese Seite in Safari (nicht in Chrome oder einer In-App-Ansicht), tippe unten auf das Teilen-Symbol und wähle „Zum Home-Bildschirm". Danach startet HabitGrid im Vollbild wie eine native App.',
  },
  {
    question: 'Und auf Android?',
    answer:
      'Chrome und Edge zeigen einen Installationsknopf — entweder in der Adressleiste oder über unseren Hinweis unten auf der Seite. Ein Tipp genügt, es ist kein Play-Store-Konto nötig.',
  },
  {
    question: 'Funktioniert die App offline?',
    answer:
      'Ja. Nach dem ersten Aufruf lädt HabitGrid aus dem Cache und funktioniert im Flugmodus vollständig — Check-in, Matrix und Statistiken inklusive. Deine Daten liegen ohnehin auf deinem Gerät.',
  },
  {
    question: 'Was hat es mit den Etappen auf sich?',
    answer:
      'Zu jeder Serie zeigen wir eine Etappe mit Bezug auf eine Studie, etwa den Median von 66 Tagen bis zur Automatisierung (Lally et al., 2010). Jede Angabe nennt ihre Quelle über das (i)-Symbol. Es sind Durchschnittswerte zur Orientierung — keine medizinische Beratung und kein Heilversprechen.',
  },
  {
    question: 'Was passiert mit meiner Serie, wenn ich krank bin?',
    answer:
      'Du legst pro Habit fest, wie viele Ruhetage dir pro Woche zustehen. Ein verpasster Tag innerhalb dieses Budgets bricht die Serie nicht — er wird in der Matrix als Ruhetag eingefärbt statt als Ausfall.',
  },
  {
    question: 'Wo werden meine Daten gespeichert?',
    answer:
      'Standardmäßig ausschließlich in deinem Browser. Ohne konfiguriertes Konto-Backend verlässt kein Habit, keine Notiz und keine Stimmungsangabe dein Gerät. Über „Sicherung herunterladen" nimmst du alles als Datei mit.',
  },
  {
    question: 'Kann ich den Kauf widerrufen?',
    answer:
      'Bei digitalen Inhalten erlischt das Widerrufsrecht, sobald die Ausführung beginnt — dem stimmst du im Bestellvorgang ausdrücklich zu. Deshalb ist die kostenlose Version nicht beschnitten: Du kannst alles vorher in Ruhe beurteilen.',
  },
]

type Message = { from: 'bot' | 'user'; text: string }

const GREETING: Message = {
  from: 'bot',
  text: 'Hallo! Ich beantworte die häufigsten Fragen zu HabitGrid. Wähl eine aus — oder schreib uns, wenn nichts passt.',
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [asked, setAsked] = useState<string[]>([])
  const thread = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Immer die neueste Antwort zeigen
    thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const ask = (entry: Entry) => {
    setAsked((prev) => [...prev, entry.question])
    setMessages((prev) => [...prev, { from: 'user', text: entry.question }])
    // Kurze Verzögerung, damit die Antwort nicht im selben Frame erscheint
    setTimeout(() => setMessages((prev) => [...prev, { from: 'bot', text: entry.answer }]), 320)
  }

  const remaining = ENTRIES.filter((e) => !asked.includes(e.question))

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Hilfe schließen' : 'Hilfe öffnen'}
        className="btn btn-primary no-print fixed right-4 bottom-4 z-40 h-12 w-12 rounded-full p-0 shadow-lg"
      >
        {open ? <X size={20} aria-hidden /> : <MessageCircle size={20} aria-hidden />}
      </button>

      {open && (
        <div
          id="chat-panel"
          role="dialog"
          aria-label="Hilfe und häufige Fragen"
          className="card no-print fixed right-4 bottom-20 z-40 flex w-[min(92vw,22rem)] flex-col overflow-hidden"
          style={{ maxHeight: 'min(32rem, 74vh)', boxShadow: 'var(--shadow-lg)' }}
        >
          <header
            className="flex items-center gap-2.5 border-b p-3.5"
            style={{ borderColor: 'var(--border)' }}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ background: 'var(--surface-2)' }}
            >
              <Logo size={17} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">HabitGrid Hilfe</span>
              <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                Antwortet sofort
              </span>
            </span>
          </header>

          <div ref={thread} className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
            {messages.map((message, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  message.from === 'user' ? 'ml-auto' : ''
                }`}
                style={
                  message.from === 'user'
                    ? { background: 'var(--accent)', color: 'var(--accent-text)' }
                    : { background: 'var(--surface-2)' }
                }
              >
                {message.text}
              </p>
            ))}
          </div>

          <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
            {remaining.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {remaining.slice(0, 4).map((entry) => (
                  <button
                    key={entry.question}
                    onClick={() => ask(entry)}
                    className="rounded-full border px-3 py-1.5 text-left text-xs transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                  >
                    {entry.question}
                  </button>
                ))}
              </div>
            ) : (
              <a
                href="#/impressum"
                className="btn btn-ghost w-full text-sm"
                onClick={() => setOpen(false)}
              >
                <Send size={14} aria-hidden /> Weitere Frage? Kontakt im Impressum
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
