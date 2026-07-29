/**
 * Rechtstexte für den Verkauf digitaler Inhalte an Verbraucher in DE/AT.
 * Alle [PLATZHALTER] vor dem Livegang ersetzen — Checkliste steht in der README.
 * Die Vorlagen sind sorgfältig gebaut, ersetzen aber keine Rechtsberatung.
 */
import type { ReactNode } from 'react'
import { useSeo } from '../lib/seo'
import { RevokeConsentButton } from '../components/CookieConsent'
import { DISCLAIMER } from '../engine/scientificMilestones'

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL ?? 'support@deine-domain.de'
const DOMAIN = (import.meta.env.VITE_SITE_URL ?? 'https://deine-domain.de').replace(/^https?:\/\//, '')
const SUPABASE = Boolean(import.meta.env.VITE_SUPABASE_URL)

function Page({
  title,
  description,
  path,
  children,
}: {
  title: string
  description: string
  path: string
  children: ReactNode
}) {
  useSeo({ title: `${title} — HabitGrid Pro`, description, path })
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <a href="#/" className="text-sm" style={{ color: 'var(--muted)' }}>
        ← Zurück
      </a>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">{title}</h1>
      <article className="mt-10 space-y-6 text-[15px] leading-relaxed">{children}</article>
    </main>
  )
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="pt-6 text-lg font-semibold">{children}</h2>
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg p-4 text-sm" style={{ background: 'var(--accent-soft)' }}>
      {children}
    </p>
  )
}

export function Impressum() {
  return (
    <Page
      title="Impressum"
      description="Anbieterkennzeichnung nach § 5 DDG für HabitGrid Pro."
      path="/#/impressum"
    >
      <Note>
        Platzhalter — vor dem Livegang mit den echten Anbieterdaten befüllen. Fehlende oder falsche
        Pflichtangaben sind abmahnfähig.
      </Note>

      <H2>Angaben gemäß § 5 DDG</H2>
      <p>
        [VOR- UND NACHNAME / FIRMA]
        <br />
        [STRASSE UND HAUSNUMMER]
        <br />
        [PLZ ORT]
        <br />
        [LAND]
      </p>

      <H2>Vertreten durch</H2>
      <p>[GESCHÄFTSFÜHRER / INHABER — bei Einzelunternehmen entfällt dieser Punkt]</p>

      <H2>Kontakt</H2>
      <p>
        Telefon: [TELEFONNUMMER]
        <br />
        E-Mail: {CONTACT}
      </p>

      <H2>Registereintrag</H2>
      <p>
        Registergericht: [AMTSGERICHT]
        <br />
        Registernummer: [HRB / HRA]
        <br />
        <span style={{ color: 'var(--muted)' }}>
          (entfällt bei Einzelunternehmen ohne Registereintrag)
        </span>
      </p>

      <H2>Umsatzsteuer-ID</H2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [USt-IdNr.]
        <br />
        <span style={{ color: 'var(--muted)' }}>
          Kleinunternehmer nach § 19 UStG: stattdessen den Hinweis „Gemäß § 19 UStG wird keine
          Umsatzsteuer berechnet." aufnehmen und die Preisangaben entsprechend anpassen.
        </span>
      </p>

      <H2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</H2>
      <p>[NAME, ANSCHRIFT WIE OBEN]</p>

      <H2>EU-Streitschlichtung</H2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{' '}
        <a className="underline" href="https://ec.europa.eu/consumers/odr/" rel="noreferrer" target="_blank">
          ec.europa.eu/consumers/odr
        </a>
        . Unsere E-Mail-Adresse steht oben.
      </p>

      <H2>Verbraucherstreitbeilegung</H2>
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </Page>
  )
}

export function Datenschutz() {
  return (
    <Page
      title="Datenschutzerklärung"
      description="Wie HabitGrid Pro mit deinen Daten umgeht: lokale Speicherung, Konten, Stripe, Cookies."
      path="/#/datenschutz"
    >
      <p className="rounded-lg p-4 text-sm" style={{ background: 'var(--accent-soft)' }}>
        Kurzfassung: Deine Habits, Notizen und Stimmungsangaben werden ausschließlich auf deinem
        Gerät gespeichert. {SUPABASE ? 'Für die Kontoverwaltung nutzen wir Supabase.' : 'Auch dein Konto liegt lokal in deinem Browser.'}{' '}
        Wir setzen keine Cookies zu Marketingzwecken und binden keine Werbenetzwerke ein.
      </p>

      <H2>1. Verantwortlicher</H2>
      <p>
        [NAME / FIRMA], [ANSCHRIFT], E-Mail: {CONTACT}. Ein Datenschutzbeauftragter ist [bestellt:
        NAME, KONTAKT / nicht bestellt, da die Voraussetzungen des § 38 BDSG nicht vorliegen].
      </p>

      <H2>2. Verarbeitung beim Aufruf der Website</H2>
      <p>
        Beim Aufruf von {DOMAIN} verarbeitet unser Hosting-Anbieter [HOSTER, z. B. Vercel Inc. /
        Netlify / Hetzner] Server-Logfiles: IP-Adresse (gekürzt, soweit technisch möglich), Datum
        und Uhrzeit, aufgerufene Datei, übertragene Datenmenge, Referrer, Browsertyp und
        Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse
        liegt im sicheren und stabilen Betrieb. Die Logs werden nach [SPEICHERDAUER, z. B. 7 Tagen]
        gelöscht. Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO.
      </p>

      <H2>3. Deine Habit-Daten</H2>
      <p>
        Habits, Check-ins, Notizen und Stimmungsangaben werden ausschließlich im localStorage deines
        Browsers gespeichert und nicht an uns übertragen. Wir haben keinen Zugriff darauf und können
        sie weder einsehen noch wiederherstellen. Über „Sicherung herunterladen" kannst du sie
        jederzeit als Datei exportieren; über die Einstellungen deines Browsers löschst du sie
        vollständig.
      </p>

      <H2>4. Benutzerkonto</H2>
      {SUPABASE ? (
        <p>
          Für Registrierung, Anmeldung und Passwort-Zurücksetzung nutzen wir Supabase (Supabase Inc.,
          970 Toa Payoh North, Singapur, mit Rechenzentrum in [REGION]). Verarbeitet werden
          E-Mail-Adresse, ein Passwort-Hash, dein angegebener Name sowie Zeitstempel der Anmeldungen.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Mit Supabase besteht
          ein Auftragsverarbeitungsvertrag; Übermittlungen in Drittländer werden auf
          Standardvertragsklauseln nach Art. 46 DSGVO gestützt. Dein Konto kannst du jederzeit unter{' '}
          {CONTACT} löschen lassen.
        </p>
      ) : (
        <p>
          Dein Konto wird ohne Server geführt: E-Mail-Adresse, Name und ein gesalzener Hash deines
          Passworts liegen ausschließlich im localStorage deines Browsers. Es findet keine
          Übertragung statt, und es existiert kein Konto auf einem Server, das wir einsehen könnten.
          Rechtsgrundlage für diese technisch erforderliche Speicherung ist § 25 Abs. 2 Nr. 2 TDDDG
          in Verbindung mit Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      )}

      <H2>5. Lokale Speicherung und Offline-Modus</H2>
      <p>
        Neben deinen Inhalten legen wir im localStorage ab: dein gewähltes Theme, deinen
        Lizenzschlüssel nach dem Kauf, den Zeitpunkt deiner Einwilligungen sowie den Hinweis, dass
        du den Installationsvorschlag geschlossen hast. Zusätzlich speichert ein Service Worker die
        Programmdateien im Browser-Cache, damit die App offline funktioniert. All das ist zur
        Erbringung der ausdrücklich gewünschten Leistung unbedingt erforderlich (§ 25 Abs. 2 Nr. 2
        TDDDG) und damit nicht einwilligungspflichtig.
      </p>

      <H2>6. Einwilligung in Statistik-Cookies</H2>
      <p>
        Soweit wir Nutzungsstatistiken erheben, geschieht das ausschließlich nach deiner
        ausdrücklichen Einwilligung über den Consent-Dialog (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a
        DSGVO). Vor deiner Einwilligung wird kein entsprechendes Skript geladen. Du kannst deine
        Entscheidung jederzeit mit Wirkung für die Zukunft widerrufen:
      </p>
      <p>
        <RevokeConsentButton />
      </p>

      <H2>7. Zahlungsabwicklung</H2>
      <p>
        Zahlungen wickeln wir über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand
        Canal Dock, Dublin, Irland ab. Mit dem Klick auf „Zahlungspflichtig bestellen" wirst du auf
        eine von Stripe betriebene Seite weitergeleitet. Stripe verarbeitet dort die von dir
        eingegebenen Zahlungs- und Bestandsdaten (Name, E-Mail-Adresse, Zahlungsmittel,
        Rechnungsanschrift, ggf. USt-ID) in eigener Verantwortung. Rechtsgrundlage ist Art. 6 Abs. 1
        lit. b DSGVO. Wir selbst erhalten keine vollständigen Zahlungsdaten. Einzelheiten:{' '}
        <a className="underline" href="https://stripe.com/de/privacy" rel="noreferrer" target="_blank">
          stripe.com/de/privacy
        </a>
        .
      </p>

      <H2>8. Aufbewahrung von Rechnungsdaten</H2>
      <p>
        Rechnungs- und Buchungsbelege bewahren wir aufgrund handels- und steuerrechtlicher Pflichten
        (§ 147 AO, § 257 HGB) bis zu 10 Jahre auf. Rechtsgrundlage ist Art. 6 Abs. 1 lit. c DSGVO.
      </p>

      <H2>9. Deine Rechte</H2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
        Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) sowie ein Widerspruchsrecht gegen
        Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f (Art. 21 DSGVO). Erteilte
        Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Wende dich dafür
        an {CONTACT}.
      </p>

      <H2>10. Beschwerderecht</H2>
      <p>
        Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, insbesondere
        im Mitgliedstaat deines Aufenthaltsorts. Für uns zuständig ist [ZUSTÄNDIGE
        AUFSICHTSBEHÖRDE DES BUNDESLANDES].
      </p>

      <H2>11. Stand</H2>
      <p>Stand dieser Erklärung: [DATUM].</p>
    </Page>
  )
}

export function AGB() {
  return (
    <Page
      title="Allgemeine Geschäftsbedingungen"
      description="Vertragsbedingungen für den Kauf von HabitGrid Pro, inklusive Widerrufsverzicht nach § 356 Abs. 5 BGB."
      path="/#/agb"
    >
      <Note>Vorlage mit Platzhaltern. Vor dem Verkauf an Verbraucher anwaltlich prüfen lassen.</Note>

      <H2>§ 1 Geltungsbereich und Anbieter</H2>
      <p>
        Diese Bedingungen gelten für alle Verträge über digitale Produkte zwischen [NAME / FIRMA],
        [ANSCHRIFT] (nachfolgend „Anbieter") und dem Kunden. Abweichende Bedingungen des Kunden
        werden nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt ihnen ausdrücklich zu.
      </p>

      <H2>§ 2 Vertragsgegenstand</H2>
      <p>
        Gegenstand ist die zeitlich unbefristete Bereitstellung eines Lizenzschlüssels, der die
        Vollversion der Webanwendung „HabitGrid Pro" freischaltet: unbegrenzt viele Habits sowie
        der Druck- und PDF-Export der Matrix. Die Anwendung läuft im Browser des Kunden und
        speichert Inhalte lokal auf dessen Gerät. Ein Anspruch auf ununterbrochene Verfügbarkeit der
        Website besteht nicht; einmal freigeschaltete Funktionen bleiben offline nutzbar.
      </p>

      <H2>§ 3 Vertragsschluss</H2>
      <p>
        Die Darstellung auf der Website ist kein bindendes Angebot. Mit dem Klick auf
        „Zahlungspflichtig bestellen" gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt
        mit der Bestätigung des Zahlungsdienstleisters bzw. der Bereitstellung des Lizenzschlüssels
        zustande.
      </p>

      <H2>§ 4 Preise und Zahlung</H2>
      <p>
        Es gilt der zum Zeitpunkt der Bestellung angegebene Preis. Alle Preise sind Endpreise
        inklusive der gesetzlichen Umsatzsteuer [alternativ bei Kleinunternehmerregelung: „Gemäß
        § 19 UStG wird keine Umsatzsteuer berechnet."]. Die Zahlung erfolgt über Stripe mit den dort
        angebotenen Zahlungsarten.
      </p>

      <H2>§ 5 Lieferung</H2>
      <p>
        Der Lizenzschlüssel wird unmittelbar nach erfolgreicher Zahlung angezeigt und zusätzlich an
        die im Bestellvorgang angegebene E-Mail-Adresse versendet.
      </p>

      <H2>§ 6 Widerrufsrecht und dessen vorzeitiges Erlöschen</H2>
      <p>
        Verbrauchern steht grundsätzlich ein 14-tägiges Widerrufsrecht zu (siehe
        Widerrufsbelehrung). Bei Verträgen über die Lieferung von nicht auf einem körperlichen
        Datenträger befindlichen digitalen Inhalten <strong>erlischt das Widerrufsrecht</strong>{' '}
        gemäß § 356 Abs. 5 BGB, wenn der Anbieter mit der Vertragserfüllung begonnen hat, nachdem
        der Verbraucher
      </p>
      <ol className="list-decimal space-y-1 pl-6">
        <li>
          ausdrücklich zugestimmt hat, dass der Anbieter vor Ablauf der Widerrufsfrist mit der
          Vertragserfüllung beginnt,
        </li>
        <li>
          seine Kenntnis davon bestätigt hat, dass er durch diese Zustimmung mit Beginn der
          Vertragserfüllung sein Widerrufsrecht verliert, und
        </li>
        <li>der Anbieter dem Verbraucher eine Bestätigung hierüber zur Verfügung gestellt hat.</li>
      </ol>
      <p>
        Diese Zustimmung holt der Anbieter im Bestellvorgang über eine gesondert zu bestätigende
        Checkbox ein. Ohne diese Bestätigung ist eine Bestellung nicht möglich.
      </p>

      <H2>§ 7 Nutzungsrechte</H2>
      <p>
        Der Kunde erhält ein einfaches, nicht übertragbares, zeitlich unbefristetes Recht zur
        Nutzung der Vollversion für eigene Zwecke auf seinen eigenen Geräten. Die Weitergabe,
        Veröffentlichung oder der Weiterverkauf des Lizenzschlüssels ist untersagt. An den vom
        Kunden erfassten Inhalten erwirbt der Anbieter keine Rechte.
      </p>

      <H2>§ 8 Gewährleistung</H2>
      <p>
        Es gelten die gesetzlichen Bestimmungen für digitale Produkte (§§ 327 ff. BGB), insbesondere
        zu Produkt- und Aktualisierungsanforderungen.
      </p>

      <H2>§ 9 Haftung</H2>
      <p>
        Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung
        von Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haftet er nur bei Verletzung
        einer wesentlichen Vertragspflicht und begrenzt auf den vertragstypischen, vorhersehbaren
        Schaden. Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt. Da die Inhalte des
        Kunden ausschließlich lokal gespeichert werden, obliegt die Datensicherung dem Kunden; die
        App stellt dafür eine Exportfunktion bereit.
      </p>

      <H2>§ 10 Hinweise zu Etappen und Gesundheitsangaben</H2>
      <p>
        Die App zeigt zu erreichten Serien sogenannte Etappen mit Hinweisen auf
        wissenschaftliche Untersuchungen. {DISCLAIMER} Die genannten Werte stammen aus
        Gruppenstudien und erlauben keine Aussage über den Verlauf im Einzelfall. Bei
        gesundheitlichen Fragen wende dich an eine Ärztin oder einen Arzt.
      </p>

      <H2>§ 11 Schlussbestimmungen</H2>
      <p>
        Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gegenüber Verbrauchern gilt
        diese Rechtswahl nur, soweit dadurch nicht zwingende Verbraucherschutzvorschriften des
        Aufenthaltsstaats entzogen werden. Sollte eine Bestimmung unwirksam sein, bleibt die
        Wirksamkeit der übrigen unberührt.
      </p>
      <p style={{ color: 'var(--muted)' }}>Stand: [DATUM]</p>
    </Page>
  )
}

export function Widerruf() {
  return (
    <Page
      title="Widerrufsbelehrung"
      description="Widerrufsrecht, Folgen des Widerrufs und Muster-Widerrufsformular für HabitGrid Pro."
      path="/#/widerruf"
    >
      <H2>Widerrufsrecht</H2>
      <p>
        Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
        widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
      </p>
      <p>
        Um dein Widerrufsrecht auszuüben, musst du uns ([NAME / FIRMA], [ANSCHRIFT], E-Mail:{' '}
        {CONTACT}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder
        eine E-Mail) über deinen Entschluss informieren. Zur Wahrung der Frist reicht es aus, dass
        du die Mitteilung vor Ablauf der Frist absendest.
      </p>

      <H2>Folgen des Widerrufs</H2>
      <p>
        Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten
        haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem
        die Mitteilung über deinen Widerruf bei uns eingegangen ist. Für die Rückzahlung verwenden
        wir dasselbe Zahlungsmittel wie bei der ursprünglichen Transaktion; Entgelte werden dir dafür
        nicht berechnet.
      </p>

      <H2>Vorzeitiges Erlöschen des Widerrufsrechts</H2>
      <p className="rounded-lg p-4" style={{ background: 'var(--surface-2)' }}>
        Dein Widerrufsrecht erlischt bei einem Vertrag über die Lieferung von nicht auf einem
        körperlichen Datenträger befindlichen digitalen Inhalten vorzeitig, wenn wir mit der
        Ausführung begonnen haben, nachdem du ausdrücklich zugestimmt hast, dass wir vor Ablauf der
        Widerrufsfrist damit beginnen, und du deine Kenntnis davon bestätigt hast, dass du dadurch
        dein Widerrufsrecht verlierst. Diese Zustimmung erteilst du im Bestellvorgang durch Setzen
        der entsprechenden Checkbox.
      </p>

      <H2>Muster-Widerrufsformular</H2>
      <p
        className="rounded-lg border p-4 text-sm whitespace-pre-line"
        style={{ borderColor: 'var(--border)' }}
      >
        {`An [NAME / FIRMA], [ANSCHRIFT], ${CONTACT}:

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)

Bestellt am (*) / erhalten am (*):
Name des/der Verbraucher(s):
Anschrift des/der Verbraucher(s):
Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
Datum:

(*) Unzutreffendes streichen.`}
      </p>
    </Page>
  )
}
