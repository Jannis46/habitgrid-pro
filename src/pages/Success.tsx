import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { redeem } from '../lib/pro'
import { useSeo } from '../lib/seo'

export function Success() {
  useSeo({
    title: 'Danke für deinen Kauf — HabitGrid Pro',
    description: 'Lizenzschlüssel eingeben und die Vollversion freischalten.',
    path: '/#/success',
    noindex: true,
  })

  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (redeem(key)) {
      setDone(true)
      setError('')
    } else {
      setError('Dieser Schlüssel wurde nicht erkannt. Bitte genau aus der E-Mail kopieren.')
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-full"
        style={{ background: 'var(--accent-soft)', color: 'var(--done)' }}
      >
        <Check size={26} />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Danke für deinen Kauf</h1>

      {done ? (
        <>
          <p className="mt-4" style={{ color: 'var(--muted)' }}>
            Die Vollversion ist in diesem Browser freigeschaltet. Bewahre den Schlüssel auf — auf
            jedem weiteren Gerät gibst du ihn einmalig erneut ein.
          </p>
          <a href="#/app" className="btn btn-primary mt-8">
            Zu deinen Habits
          </a>
        </>
      ) : (
        <>
          <p className="mt-4" style={{ color: 'var(--muted)' }}>
            Deinen Lizenzschlüssel findest du in der Bestätigungs-E-Mail von Stripe. Trage ihn hier
            ein, um alle Funktionen freizuschalten.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-3">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="HG-PRO-XXXX-YYYY"
              autoFocus
              aria-label="Lizenzschlüssel"
              className="field text-center font-mono tracking-wider uppercase"
            />
            <button className="btn btn-primary w-full">Vollversion freischalten</button>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-sm" style={{ color: '#dc2626' }}>
              {error}
            </p>
          )}
        </>
      )}

      <a href="#/" className="mt-10 inline-block text-sm" style={{ color: 'var(--muted)' }}>
        ← Zur Startseite
      </a>
    </main>
  )
}
