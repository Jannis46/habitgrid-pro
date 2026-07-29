/**
 * Konfetti-Effekt für den Moment der Freischaltung.
 * Eigenes Canvas statt einer Bibliothek: rund vierzig Zeilen gegen ein zusätzliches Paket.
 * Räumt sich selbst ab und respektiert `prefers-reduced-motion`.
 */
export function confetti(durationMs = 1600) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const dpr = Math.min(window.devicePixelRatio, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  ctx.scale(dpr, dpr)

  const colors = ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7']
  const pieces = Array.from({ length: 110 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 220,
    y: window.innerHeight * 0.42,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -13 - 4,
    size: 5 + Math.random() * 6,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))

  const start = performance.now()
  let raf = 0

  const frame = (now: number) => {
    const elapsed = now - start
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    for (const p of pieces) {
      p.vy += 0.42 // Schwerkraft
      p.vx *= 0.995
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.spin

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = Math.max(0, 1 - elapsed / durationMs)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }

    if (elapsed < durationMs) raf = requestAnimationFrame(frame)
    else {
      cancelAnimationFrame(raf)
      canvas.remove()
    }
  }
  raf = requestAnimationFrame(frame)
}
