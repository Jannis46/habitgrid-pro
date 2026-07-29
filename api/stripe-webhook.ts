/**
 * Stripe-Webhook — optionaler Ausbau für automatische Lizenzausgabe.
 *
 * Die App braucht das nicht: Der Verkauf läuft über einen Payment Link, und der
 * Lizenzschlüssel wird über die Stripe-Bestätigungsmail zugestellt. Wer das automatisieren
 * will, deployt diese Datei als Serverless Function (Vercel: `api/stripe-webhook.ts`,
 * Netlify: nach `netlify/functions/` verschieben) und trägt die Endpunkt-URL im
 * Stripe-Dashboard unter „Entwickler > Webhooks" ein.
 *
 * Voraussetzungen:
 *   npm i stripe
 *   Umgebungsvariablen STRIPE_SECRET_KEY und STRIPE_WEBHOOK_SECRET setzen —
 *   OHNE VITE_-Präfix, sonst landen sie im Client-Bundle.
 *
 * Diese Datei ist bewusst nicht Teil des Vite-Builds (siehe tsconfig `include`).
 */

// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const config = { api: { bodyParser: false } } // Signaturprüfung braucht den Rohtext

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body: unknown }
type Res = { status: (code: number) => { json: (body: unknown) => void; end: () => void } }

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end()

  // 1. Signatur prüfen — ohne diesen Schritt kann jeder beliebige Bestellungen vortäuschen.
  //
  // const raw = await readRawBody(req)
  // let event: Stripe.Event
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     raw,
  //     req.headers['stripe-signature'] as string,
  //     process.env.STRIPE_WEBHOOK_SECRET!,
  //   )
  // } catch {
  //   return res.status(400).json({ error: 'Ungültige Signatur' })
  // }
  //
  // 2. Nur den Abschluss auswerten; alle anderen Ereignisse quittieren und ignorieren.
  //
  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object as Stripe.Checkout.Session
  //   const email = session.customer_details?.email
  //   const licenseKey = makeKey(hashToSeed(session.id)) // aus src/lib/pro.ts übernehmen
  //   await saveOrder({ sessionId: session.id, email, licenseKey, at: new Date().toISOString() })
  //   await sendLicenseMail(email, licenseKey)
  // }
  //
  // 3. Schnell mit 200 antworten. Dauert die Verarbeitung länger, wiederholt Stripe den
  //    Aufruf — deshalb muss saveOrder anhand der session.id idempotent sein.

  return res.status(200).json({ received: true })
}
