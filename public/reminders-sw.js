/**
 * Erinnerungs-Logik des Service Workers.
 *
 * Wird per `workbox.importScripts` in den generierten Service Worker eingebunden. Bewusst
 * einfaches JavaScript statt eines eigenen injectManifest-Setups: Das hätte drei
 * workbox-Pakete als Abhängigkeit und eine zweite tsconfig für den Worker-Kontext bedeutet —
 * für rund hundert Zeilen Ereignisbehandlung.
 *
 * WAS HIER EHRLICH GESAGT WERDEN MUSS:
 * Es gibt keinen browserübergreifenden Weg, eine lokale Benachrichtigung für eine feste
 * Uhrzeit zu planen, während die App geschlossen ist. `Notification.showTrigger` war ein
 * Chrome-Experiment und wurde wieder entfernt. Was tatsächlich funktioniert:
 *   1. App offen  -> die Seite meldet die fällige Zeit, dieser Worker zeigt die Nachricht.
 *   2. App zu     -> `periodicsync`, sofern der Browser es unterstützt (Chrome/Edge, nur bei
 *                    installierter PWA). Das Intervall bestimmt der Browser, meist stündlich
 *                    bis mehrmals täglich — die Erinnerung kann also verspätet kommen.
 *   3. Sonst      -> keine Benachrichtigung. Punktgenaue Zustellung bei geschlossener App
 *                    ginge nur über echtes Web Push mit VAPID und einem sendenden Server
 *                    (siehe `push`-Handler unten, vorbereitet aber nicht aktiv).
 * Die Oberfläche sagt dem Nutzer genau das, statt Zuverlässigkeit zu versprechen.
 */

/* eslint-env serviceworker */

const DB_NAME = 'habitgrid-reminders'
const STORE = 'kv'

function withStore(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, 1)
    open.onupgradeneeded = () => open.result.createObjectStore(STORE)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction(STORE, mode)
      const request = fn(tx.objectStore(STORE))
      tx.oncomplete = () => {
        db.close()
        resolve(request ? request.result : undefined)
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
    }
  })
}

const idbGet = (key) => withStore('readonly', (store) => store.get(key))
const idbSet = (key, value) => withStore('readwrite', (store) => store.put(value, key))

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/**
 * Zeigt alle Erinnerungen, deren Uhrzeit erreicht ist und die heute noch nicht gezeigt wurden.
 * Die Sperre gegen Doppelmeldungen liegt bewusst nur hier — egal ob die Seite oder
 * `periodicsync` auslöst, es gibt genau eine Stelle, die entscheidet.
 */
async function showDueReminders() {
  const data = await idbGet('reminders')
  if (!data || !Array.isArray(data.items)) return

  const now = new Date()
  const todayKey = dayKey(now)
  // Liste stammt von einem anderen Tag — dann stimmen „erledigt" und Zeitplan nicht mehr
  if (data.date !== todayKey) return

  const shown = (await idbGet('shown')) ?? { date: todayKey, ids: [] }
  if (shown.date !== todayKey) {
    shown.date = todayKey
    shown.ids = []
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  let changed = false

  for (const item of data.items) {
    if (item.done || shown.ids.includes(item.habitId)) continue
    const [h, m] = String(item.time).split(':').map(Number)
    if (!Number.isFinite(h) || !Number.isFinite(m)) continue
    if (h * 60 + m > nowMinutes) continue

    await self.registration.showNotification('HabitGrid Pro Reminder', {
      body: `Zeit für dein Habit: ${item.name}! Tippe hier, um es abzuhaken.`,
      // Ohne führenden Schrägstrich: löst gegen den Scope des Workers auf und
      // funktioniert dadurch auch, wenn die App in einem Unterverzeichnis liegt
      // (GitHub Pages: /repo-name/).
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      // Ein Tag pro Habit: eine erneute Meldung ersetzt die alte, statt sie zu stapeln
      tag: `habit-${item.habitId}`,
      data: { habitId: item.habitId },
      actions: [
        { action: 'done', title: 'Erledigt' },
        { action: 'open', title: 'Öffnen' },
      ],
    })
    shown.ids.push(item.habitId)
    changed = true
  }

  if (changed) await idbSet('shown', shown)
}

self.addEventListener('message', (event) => {
  const message = event.data || {}

  if (message.type === 'SET_REMINDERS') {
    event.waitUntil(idbSet('reminders', message.payload))
  }

  if (message.type === 'FIRE_DUE') {
    event.waitUntil(showDueReminders())
  }

  // Beim Start fragt die Seite ab, ob über eine Benachrichtigung abgehakt wurde.
  if (message.type === 'GET_INTENTS') {
    event.waitUntil(
      (async () => {
        const intents = (await idbGet('intents')) ?? []
        if (intents.length) await idbSet('intents', [])
        event.source?.postMessage({ type: 'INTENTS', habitIds: intents })
      })(),
    )
  }
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'habit-reminders') event.waitUntil(showDueReminders())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const habitId = event.notification.data?.habitId
  const checkedOff = event.action === 'done'

  event.waitUntil(
    (async () => {
      // „Erledigt" direkt aus der Meldung: Der Worker kann den localStorage der Seite nicht
      // schreiben, also wird die Absicht hinterlegt und beim nächsten Öffnen angewandt.
      if (checkedOff && habitId) {
        const intents = (await idbGet('intents')) ?? []
        if (!intents.includes(habitId)) {
          intents.push(habitId)
          await idbSet('intents', intents)
        }
      }

      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const open = windows[0]
      if (open) {
        await open.focus()
        open.postMessage({ type: 'OPEN_HABIT', habitId, checkedOff })
        return
      }
      // Scope statt Wurzelpfad — sonst landet der Klick bei einem Unterverzeichnis-Deployment
      // auf der Domain-Wurzel statt in der App.
      await self.clients.openWindow(
        `${self.registration.scope}#/app${habitId ? `?habit=${habitId}` : ''}`,
      )
    })(),
  )
})

/**
 * Vorbereitung für echtes Web Push. Aktiv wird das erst, wenn ein Server mit VAPID-Schlüsseln
 * Nachrichten sendet — siehe README. Bis dahin läuft dieser Handler nie an.
 */
self.addEventListener('push', (event) => {
  let payload = { title: 'HabitGrid Pro Reminder', body: 'Zeit für dein Habit!' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    // Nicht-JSON-Nutzlast: Standardtext verwenden statt die Meldung zu verschlucken
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      // Ohne führenden Schrägstrich: löst gegen den Scope des Workers auf und
      // funktioniert dadurch auch, wenn die App in einem Unterverzeichnis liegt
      // (GitHub Pages: /repo-name/).
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      data: { habitId: payload.habitId },
    }),
  )
})
