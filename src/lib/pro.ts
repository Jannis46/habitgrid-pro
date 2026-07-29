/**
 * Freischaltung der Vollversion per Lizenzschlüssel.
 *
 * ponytail: Die Prüfung läuft im Client und ist umgehbar. Bewusste Entscheidung — eine
 * serverseitige Prüfung bräuchte einen dauerhaft laufenden Endpoint und würde das
 * Versprechen „keine laufenden Kosten, offline nutzbar" brechen. Wer das ändern will:
 * api/stripe-webhook.ts ausbauen und den Schlüssel dort gegen die Bestellung prüfen.
 */

const STORAGE_KEY = 'habitgrid.license'
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // ohne I/O/0/1 — am Telefon vorlesbar

/** Format: HG-PRO-XXXX-YYYY, Quersumme über alle 8 Zeichen muss durch 7 teilbar sein. */
export function isValidKey(key: string): boolean {
  const k = key.trim().toUpperCase()
  if (!/^HG-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(k)) return false
  const body = k.slice(7).replace('-', '')
  if ([...body].some((c) => !ALPHABET.includes(c))) return false
  return [...body].reduce((acc, c) => acc + ALPHABET.indexOf(c), 0) % 7 === 0
}

/** Deterministisch: gleicher Seed, gleicher Schlüssel (siehe scripts/genkey.mjs). */
export function makeKey(seed: number): string {
  const chars: string[] = []
  let x = (seed * 2654435761) % 4294967296
  for (let i = 0; i < 7; i++) {
    x = (x * 1103515245 + 12345) % 4294967296
    chars.push(ALPHABET[Math.floor(x / 65536) % ALPHABET.length])
  }
  const sum = chars.reduce((acc, c) => acc + ALPHABET.indexOf(c), 0)
  chars.push(ALPHABET[(7 - (sum % 7)) % 7]) // Prüfzeichen füllt auf ein Vielfaches von 7 auf
  return `HG-PRO-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

/** Flag aus der Gutschein-Freischaltung. Getrennt vom Lizenzschlüssel, damit beide Wege
 *  unabhängig voneinander bestehen und der Schlüssel nachträglich ergänzt werden kann. */
const PRO_FLAG = 'pro_user'

export const isPro = () =>
  localStorage.getItem(PRO_FLAG) === 'true' || isValidKey(localStorage.getItem(STORAGE_KEY) ?? '')

export function redeem(key: string): boolean {
  if (!isValidKey(key)) return false
  localStorage.setItem(STORAGE_KEY, key.trim().toUpperCase())
  announce()
  return true
}

/* --------------------------------- Gutschein -------------------------------- */

/**
 * Der 100-%-Gutscheincode kommt aus der Umgebung, damit er nicht im Repository steht.
 *
 * ACHTUNG, damit ist er NICHT geheim: Alles mit VITE_-Präfix wird beim Bauen in das
 * JavaScript-Bundle geschrieben und ist für jeden lesbar, der die Datei öffnet. Eine
 * clientseitige Prüfung kann grundsätzlich kein Geheimnis hüten. Diese Trennung hält den
 * Code lediglich aus dem öffentlichen Quelltext heraus.
 *
 * Wirklich begrenzbar wird ein Code nur serverseitig — praktisch über Stripe-Gutscheine
 * im Payment Link, die Stripe prüft und deren Einlösungen sich begrenzen lassen.
 *
 * Ohne gesetzten Wert ist die Gutscheinfunktion inaktiv; jede Eingabe wird abgelehnt.
 */
export const COUPON_CODE = (import.meta.env.VITE_COUPON_CODE ?? '').trim().toLowerCase()

export const isValidCoupon = (code: string) =>
  COUPON_CODE.length > 0 && code.trim().toLowerCase() === COUPON_CODE

/**
 * Schaltet ohne Zahlung frei. Der Status überlebt das Neuladen, weil er im localStorage
 * steht und `isPro()` beim Start von dort liest.
 */
export function unlockWithCoupon(code: string): boolean {
  if (!isValidCoupon(code)) return false
  localStorage.setItem(PRO_FLAG, 'true')
  announce()
  return true
}

/** Meldet allen offenen Ansichten, dass sich der Status geändert hat. */
function announce() {
  window.dispatchEvent(new CustomEvent('habitgrid:pro'))
}

/** Abonniert Statusänderungen — für Komponenten, die `isPro()` gespeichert haben. */
export function onProChange(handler: () => void): () => void {
  window.addEventListener('habitgrid:pro', handler)
  return () => window.removeEventListener('habitgrid:pro', handler)
}
