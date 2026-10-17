import { forwardRef, useImperativeHandle, useRef } from 'react'

const TAU = Math.PI * 2
const rand = (a, b) => a + Math.random() * (b - a)

const HEART = (() => {
  const p = new Path2D()
  for (let i = 0; i <= 90; i++) {
    const t = (i / 90) * TAU
    const x = (16 * Math.sin(t) ** 3) / 32
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 32
    i ? p.lineTo(x, y) : p.moveTo(x, y)
  }
  p.closePath()
  return p
})()

const PALETTES = [
  ['#ff8fa6', '#e11d48', '#9f0f2e', '#4a0516'],
  ['#ffb3c4', '#f43f6e', '#b8123a', '#5c0a1e'],
  ['#ff6b81', '#c4102f', '#7d0a20', '#33030d'],
]
let sprites
function build() {
  if (sprites) return sprites
  const S = 256, C = 320
  const hearts = PALETTES.map(pal => {
    const c = document.createElement('canvas'); c.width = c.height = C
    const g = c.getContext('2d')
    g.translate(C / 2, C / 2 + 0.08 * S); g.scale(S, S)
    g.shadowColor = 'rgba(255,40,90,.55)'; g.shadowBlur = 0.08
    const body = g.createRadialGradient(-0.16, -0.24, 0.02, 0, 0, 0.8)
    pal.forEach((col, i) => body.addColorStop([0, 0.35, 0.72, 1][i], col))
    g.fillStyle = body; g.fill(HEART)
    g.shadowBlur = 0
    g.save(); g.clip(HEART)
    const rim = g.createLinearGradient(0.3, 0.4, -0.3, -0.5)
    rim.addColorStop(0, 'rgba(0,0,0,.35)'); rim.addColorStop(0.5, 'rgba(0,0,0,0)')
    g.fillStyle = rim; g.fillRect(-1, -1, 2, 2)
    g.translate(-0.2, -0.26); g.rotate(-0.55); g.scale(1, 0.5)
    const gl = g.createRadialGradient(0, 0, 0, 0, 0, 0.2)
    gl.addColorStop(0, 'rgba(255,255,255,.9)'); gl.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 0.2, 0, TAU); g.fill()
    g.restore()
    g.lineWidth = 0.012; g.strokeStyle = 'rgba(255,222,170,.55)'; g.stroke(HEART)
    return c
  })
  const rad = stops => {
    const c = document.createElement('canvas'); c.width = c.height = 256
    const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c
  }
  sprites = {
    hearts, C, S,
    glow: rad([[0, 'rgba(255,70,120,.85)'], [0.4, 'rgba(230,20,80,.35)'], [1, 'rgba(200,0,60,0)']]),
    gold: rad([[0, 'rgba(255,248,220,1)'], [0.25, 'rgba(255,205,120,.8)'], [1, 'rgba(255,170,60,0)']]),
  }
  return sprites
}

const BEATS = [0.42, 0.72, 1.32, 1.62, 2.22]
const END_HOLD = 2.7, END = 3.6

const HeartBurst = forwardRef(function HeartBurst(_, outer) {
  const cv = useRef(null)
  const st = useRef({ run: false, parts: [], t0: 0, last: 0, w: 0, h: 0, dpr: 1, calm: false })

  const frame = now => {
    const s = st.current, c = cv.current, g = c.getContext('2d'), sp = build()
    const dt = Math.min(0.05, (now - s.last) / 1000); s.last = now
    const t = (now - s.t0) / 1000, { w, h } = s
    g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); g.clearRect(0, 0, w, h)

    const env = t < 0.35 ? t / 0.35 : t < END_HOLD ? 1 : Math.max(0, 1 - (t - END_HOLD) / (END - END_HOLD + 0.4))
    const R = Math.max(w, h) * 0.8
    const bg = g.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, R)
    bg.addColorStop(0, `rgba(255,60,110,${0.32 * env})`); bg.addColorStop(0.45, `rgba(170,10,55,${0.24 * env})`); bg.addColorStop(1, `rgba(25,0,10,${0.66 * env})`)
    g.fillStyle = bg; g.fillRect(0, 0, w, h)

    g.globalCompositeOperation = 'lighter'
    if (!s.calm) BEATS.forEach(b => {
      const a = t - b; if (a < 0 || a > 1.1) return
      g.strokeStyle = `rgba(255,205,140,${0.5 * (1 - a / 1.1)})`; g.lineWidth = 1.5 + 5 * (1 - a / 1.1)
      g.beginPath(); g.arc(w / 2, h * 0.48, a * Math.max(w, h) * 0.55, 0, TAU); g.stroke()
    })

    const base = Math.min(w, h) * 0.46
    const grow = t < 0.5 ? (() => { const k = t / 0.5, c1 = 1.9; return 1 + (c1 + 1) * (k - 1) ** 3 + c1 * (k - 1) ** 2 })() : 1
    let pulse = 0; BEATS.forEach(b => { const a = t - b; if (a > 0) pulse += 0.16 * Math.exp(-a * 8) })
    const out = t > END_HOLD ? (t - END_HOLD) / (END - END_HOLD) : 0
    const bigA = Math.min(1, t / 0.2) * (1 - out), size = base * grow * (1 + pulse) * (1 + out * 0.35)
    if (t < END && bigA > 0) {
      g.globalAlpha = bigA * 0.9; g.drawImage(sp.glow, w / 2 - size * 1.5, h * 0.48 - size * 1.5, size * 3, size * 3)
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = bigA
      g.drawImage(sp.hearts[0], w / 2 - size * 1.25, h * 0.48 - size * 1.25, size * 2.5, size * 2.5)
    }

    if (t < 2.5 && !s.calm) { s.acc = (s.acc || 0) + dt * 20; while (s.acc > 1) { s.acc--; spawnRiser(s) } }
    g.globalCompositeOperation = 'lighter'
    s.parts = s.parts.filter(p => (p.age += dt) < p.life)
    for (const p of s.parts) {
      p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; p.vy -= p.rise * dt
      p.x += (p.vx + Math.sin(p.age * p.sw + p.ph) * p.amp) * dt; p.y += p.vy * dt; p.rot += p.vr * dt
      const k = p.age / p.life, a = Math.min(1, p.age / 0.15) * (k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1)
      if (p.type === 'g') {
        const tw = 0.55 + 0.45 * Math.sin(p.age * 14 + p.ph); g.globalAlpha = a * tw
        g.drawImage(sp.gold, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2)
      } else {
        g.globalAlpha = a * 0.55; g.drawImage(sp.glow, p.x - p.s * 1.5, p.y - p.s * 1.5, p.s * 3, p.s * 3)
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = a
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.drawImage(sp.hearts[p.v], -p.s, -p.s, p.s * 2, p.s * 2); g.restore()
        g.globalCompositeOperation = 'lighter'
      }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'

    if (t < END || s.parts.length) requestAnimationFrame(frame)
    else { s.run = false; g.clearRect(0, 0, w, h); c.style.display = 'none' }
  }

  function spawnRiser(s) {
    const size = rand(14, 44)
    s.parts.push({ type: 'h', v: (Math.random() * 3) | 0, x: rand(0, s.w), y: s.h + 30, vx: 0, vy: -rand(120, 300), s: size, rot: rand(-0.4, 0.4), vr: rand(-0.6, 0.6), drag: 0, rise: 0, amp: rand(10, 40), sw: rand(1.5, 3), ph: rand(0, TAU), age: 0, life: rand(2.2, 3.6) })
    if (Math.random() < 0.5) s.parts.push({ type: 'g', x: rand(0, s.w), y: rand(s.h * 0.2, s.h), vx: 0, vy: -rand(20, 70), s: rand(5, 11), rot: 0, vr: 0, drag: 0, rise: 0, amp: 8, sw: 2, ph: rand(0, TAU), age: 0, life: rand(1.2, 2.2) })
  }

  useImperativeHandle(outer, () => ({
    fire(ox, oy) {
      const s = st.current, c = cv.current
      s.calm = matchMedia('(prefers-reduced-motion: reduce)').matches
      s.dpr = Math.min(window.devicePixelRatio || 1, 2); s.w = innerWidth; s.h = innerHeight
      c.width = s.w * s.dpr; c.height = s.h * s.dpr; c.style.display = 'block'
      build()
      const n = s.calm ? 8 : 38
      for (let i = 0; i < n; i++) {
        const ang = rand(0, TAU), sp = rand(180, 620)
        s.parts.push({ type: 'h', v: (Math.random() * 3) | 0, x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 160, s: rand(12, 40), rot: rand(-1, 1), vr: rand(-2, 2), drag: 1.9, rise: 90, amp: 14, sw: rand(2, 4), ph: rand(0, TAU), age: 0, life: rand(1.8, 3.2) })
      }
      for (let i = 0; i < (s.calm ? 0 : 46); i++) {
        const ang = rand(0, TAU), sp = rand(120, 520)
        s.parts.push({ type: 'g', x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, s: rand(4, 10), rot: 0, vr: 0, drag: 2.2, rise: 30, amp: 0, sw: 1, ph: rand(0, TAU), age: 0, life: rand(0.9, 1.9) })
      }
      s.t0 = performance.now(); s.last = s.t0; s.acc = 0
      navigator.vibrate?.([25, 70, 25])
      if (!s.run) { s.run = true; requestAnimationFrame(frame) }
    },
  }))

  return <canvas ref={cv} className="hearts" aria-hidden="true" style={{ display: 'none' }} />
})

export default HeartBurst
