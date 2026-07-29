import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Aktualisierungen ziehen sich im Hintergrund; der Nutzer bekommt beim nächsten Start
// die neue Fassung, ohne dass ihm ein Neuladen-Banner ins Gesicht springt.
// Fehler beim Registrieren dürfen die App nicht mitreißen — in Umgebungen ohne
// erreichbaren Service Worker (Vorschau als Einzeldatei, unsicherer Kontext) läuft
// sie einfach ohne Offline-Cache weiter.
registerSW({
  immediate: true,
  onRegisterError: (error) => console.info('Service Worker nicht verfügbar:', error),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
