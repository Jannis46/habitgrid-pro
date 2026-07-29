// Baut die App in EINE eigenständige HTML-Datei (CSS + JS inline, keine externen Requests).
// Zweck: Vorschau ohne Hosting, z. B. um die Seite auf dem Handy anzusehen.
// Achtung: In dieser Fassung gibt es keinen Service Worker und kein Manifest — der
// Offline-Modus und die Installation funktionieren nur im echten Build (npm run build).
//   node scripts/build-single.mjs   ->   dist-single/habitgrid-pro.html
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = 'dist-single'

await build({
  // Ohne configFile:false erbt dieser Lauf das manualChunks aus vite.config.ts —
  // das verträgt sich nicht mit inlineDynamicImports und bricht den Build ab.
  configFile: false,
  // VitePWA bleibt eingebunden, damit `virtual:pwa-register` auflösbar ist;
  // die Registrierung scheitert zur Laufzeit still (siehe onRegisterError in main.tsx).
  plugins: [react(), tailwindcss(), VitePWA({ injectRegister: null })],
  build: {
    outDir: OUT,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: { output: { inlineDynamicImports: true } }, // kein Code-Splitting
  },
})

const assets = join(OUT, 'assets')
const files = await readdir(assets)
const code = (await readFile(join(assets, files.find((f) => f.endsWith('.js'))), 'utf8')).replaceAll(
  '</script',
  '<\\/script',
)
const styles = await readFile(join(assets, files.find((f) => f.endsWith('.css'))), 'utf8')
const html = await readFile(join(OUT, 'index.html'), 'utf8')

// Nur den Kopfinhalt übernehmen — doctype/html/head/body liefert die Zielumgebung selbst.
const meta = html
  .match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<link[^>]*>/g, '')
  .trim()

await writeFile(
  join(OUT, 'habitgrid-pro.html'),
  `${meta}\n<style>\n${styles}\n</style>\n<div id="root"></div>\n<script type="module">\n${code}\n</script>\n`,
  'utf8',
)

console.log(
  `${OUT}/habitgrid-pro.html geschrieben (${Math.round((code.length + styles.length) / 1024)} kB)`,
)
