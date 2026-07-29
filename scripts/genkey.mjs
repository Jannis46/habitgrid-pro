// Lizenzschlüssel erzeugen: node scripts/genkey.mjs [anzahl]
// Nach dem Kauf versenden (Stripe: Produkt > "Nach der Zahlung" > Nachricht).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeKey(seed) {
  const chars = []
  let x = (seed * 2654435761) % 4294967296
  for (let i = 0; i < 7; i++) {
    x = (x * 1103515245 + 12345) % 4294967296
    chars.push(ALPHABET[Math.floor(x / 65536) % ALPHABET.length])
  }
  const sum = chars.reduce((a, c) => a + ALPHABET.indexOf(c), 0)
  chars.push(ALPHABET[(7 - (sum % 7)) % 7])
  return `HG-PRO-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

const n = Number(process.argv[2] ?? 1)
for (let i = 0; i < n; i++) console.log(makeKey(Math.floor(Math.random() * 1e9)))
