/**
 * SEO-Helfer ohne zusätzliche Abhängigkeit.
 *
 * react-helmet-async wäre der übliche Griff, löst aber ein Problem, das diese Seite nicht
 * hat: Sie rendert clientseitig, hat fünf statische Routen und braucht weder SSR-Streaming
 * noch verschachtelte Helmet-Kontexte. Was bleibt, sind ein paar Attributzuweisungen.
 */
import { useEffect } from 'react'

const SITE = import.meta.env.VITE_SITE_URL ?? 'https://deine-domain.de'

export type SeoInput = {
  title: string
  description: string
  /** Pfad inklusive führendem Slash, z. B. '/#/agb' */
  path?: string
  noindex?: boolean
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useSeo({ title, description, path = '/', noindex = false }: SeoInput) {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', SITE + path)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = SITE + path

    // Seiten hinter dem Login gehören nicht in den Index
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (noindex) {
      setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, follow')
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, path, noindex])
}

/**
 * JSON-LD als eigenes <script>-Element im <head>. Wird beim Routenwechsel entfernt,
 * damit nie zwei widersprüchliche Datensätze gleichzeitig im Dokument stehen.
 */
export function useJsonLd(id: string, data: unknown) {
  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    el.textContent = JSON.stringify(data)
    document.head.appendChild(el)
    return () => el.remove()
  }, [id, data])
}

export const PRICE_EUR = '9.99'

export function softwareApplicationLd(faq: { q: string; a: string }[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'HabitGrid Pro',
      applicationCategory: 'LifestyleApplication',
      applicationSubCategory: 'Habit Tracker',
      operatingSystem: 'Web, iOS, Android, Windows, macOS',
      inLanguage: 'de',
      url: SITE,
      description:
        'Minimalistischer Habit Tracker als installierbare PWA: Heatmap-Matrix, Ruhetage gegen Streak-Frust, flexible Frequenzen, Offline-Modus und druckbare Habit-Matrix. Einmalkauf statt Abo.',
      featureList: [
        '1-Klick Daily Check-in',
        'Flexible Frequenzen (täglich, X-mal pro Woche, feste Wochentage)',
        'Ruhetage als Streak-Schutz',
        'Heatmap-Matrix über 12 Monate',
        'Notizen und Stimmungs-Tracking',
        'Offline nutzbar als installierbare App',
        'Druckansicht für GoodNotes und PDF',
      ],
      offers: {
        '@type': 'Offer',
        price: PRICE_EUR,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: SITE,
        category: 'Einmalzahlung',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'HabitGrid Pro — Vollversion',
      description:
        'Unbegrenzte Habits sowie Druck- und PDF-Export der Matrix. Einmal zahlen, dauerhaft nutzen — kein Abonnement.',
      brand: { '@type': 'Brand', name: 'HabitGrid' },
      offers: {
        '@type': 'Offer',
        price: PRICE_EUR,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: SITE,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]
}
