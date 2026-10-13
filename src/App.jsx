import { useEffect, useRef, useState } from 'react'

const PHOTO = `${import.meta.env.BASE_URL}assets/lucky-portrait.png`

// Contact links: delete a whole line to remove that link from the site.
const LINKS = [
  { name: 'Instagram', label: 'Follow on Instagram', href: 'https://instagram.com/fav.luckiiii?rpxt=MW56a3R6aWowN2pocA%3D%3D', ext: true },
  { name: 'Snapchat', label: 'Connect on Snapchat', href: 'https://www.snapchat.com/add/fav.luvkiii?share_id=McXUDgx2i2Y&locale=en-US', ext: true },
  { name: 'Email', label: 'Send an Email', href: 'mailto:luckykumar880946@gmail.com' },
]

const ICON = {
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".5" /></>,
  Snapchat: <path d="M6.5 19V10a5.5 5.5 0 0 1 11 0v9l-2.75-2-2.75 2.5-2.75-2.5L6.5 19z" />,
  Email: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 5.5L20 8" /></>,
}

const NAV = [['hero', 'Home'], ['about', 'About'], ['creative-interests', 'Interests'], ['card-stack', 'Cards'], ['contact', 'Contact']]

const INTERESTS = [
  ['Photo Editing', 'An interest in visual composition, portraits, color and creative presentation.'],
  ['Visual Aesthetics', 'Exploring cinematic moods, premium layouts and thoughtful design.'],
  ['Digital Creativity', 'Discovering new ideas and creative possibilities on the internet.'],
]

const CARDS = [
  { t: 'Lucky Kumar', s: 'Welcome to World Healing', photo: true, pos: '40% 38%' },
  { t: 'Visual Aesthetics', s: 'Cinematic moods and thoughtful design.' },
  { t: 'Portrait Study', s: 'Light, shadow and stillness.', photo: true, pos: '30% 100%' },
  { t: 'Digital Creativity', s: 'New ideas, one scroll at a time.' },
]

const DOTS = Array.from({ length: 14 }, (_, i) => ({ x: (i * 37 + 8) % 100, y: (i * 53 + 12) % 100, s: 2 + (i % 3), d: 9 + (i % 5) * 3 }))

function Photo({ pos, eager }) {
  const [bad, setBad] = useState(false)
  if (bad) return <div className="ph" role="img" aria-label="Portrait placeholder">Add <b>lucky-portrait.png</b> to <b>public/assets</b></div>
  return (
    <img src={PHOTO} alt="Black-and-white portrait of Lucky Kumar" width="940" height="1672"
      loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false"
      style={pos ? { objectPosition: pos } : undefined} onError={() => setBad(true)} />
  )
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.15 })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])
}

function CardStack() {
  const [top, setTop] = useState(0)
  const [dx, setDx] = useState(0)
  const [drag, setDrag] = useState(false)
  const x0 = useRef(0)
  const n = CARDS.length
  // Simpler 2D stack for reduced-motion or low-memory phones.
  const [lite] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.deviceMemory || 8) <= 2)
  const go = d => setTop(t => (t + d + n) % n)
  const stop = () => { setDrag(false); setDx(0) }
  const up = () => {
    if (drag) { if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); else if (Math.abs(dx) < 6) go(1) }
    stop()
  }
  return (
    <div className={`stage${lite ? ' lite' : ''}`}>
      <div className={`stack${drag ? ' drag' : ''}`} role="group" aria-roledescription="carousel" aria-label="Floating card stack" tabIndex={0}
        onKeyDown={e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }}
        onPointerDown={e => { x0.current = e.clientX; setDrag(true); e.currentTarget.setPointerCapture?.(e.pointerId) }}
        onPointerMove={e => drag && setDx(e.clientX - x0.current)}
        onPointerUp={up} onPointerCancel={stop}>
        {CARDS.map((c, i) => {
          const p = (i - top + n) % n
          return (
            <article key={c.t} className={`card${c.photo ? '' : ' q'}${p ? '' : ' f'}`} aria-hidden={p !== 0}
              style={{ '--p': p, ...(p === 0 ? { '--dx': `${dx}px`, '--r': `${dx * 0.04}deg` } : {}) }}>
              {c.photo && <Photo pos={c.pos} />}
              <div className="cap"><h3>{c.t}</h3><p>{c.s}</p></div>
            </article>
          )
        })}
      </div>
      <div className="ctl">
        <button className="btn" aria-label="Previous card" onClick={() => go(-1)}>←</button>
        <span aria-live="polite">{top + 1} / {n}</span>
        <button className="btn" aria-label="Next card" onClick={() => go(1)}>→</button>
      </div>
    </div>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  useReveal()
  useEffect(() => {
    const k = e => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [])

  return (
    <>
      <header>
        <div className="wrap bar">
          <a className="brand" href="#hero" onClick={close}>Lucky Kumar</a>
          <button className="tog" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Menu'}</button>
          <nav id="menu" className={`menu${open ? ' open' : ''}`} aria-label="Main">
            <ul>{NAV.map(([id, l]) => <li key={id}><a href={`#${id}`} onClick={close}>{l}</a></li>)}</ul>
          </nav>
        </div>
        <div className={`scrim${open ? ' open' : ''}`} onClick={close} aria-hidden="true" />
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="dots" aria-hidden="true">
            {DOTS.map((d, i) => <span key={i} className="dot" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, animationDuration: `${d.d}s`, animationDelay: `-${i}s` }} />)}
          </div>
          <div className="wrap">
            <div className="txt">
              <h1 className="up" style={{ '--n': 1 }}>Lucky Kumar</h1>
              <p className="tag up" style={{ '--n': 2 }}>Welcome to World Healing</p>
              <p className="up" style={{ '--n': 3 }}>A creative mind exploring visual storytelling, editing, aesthetics and digital creativity.</p>
              <p className="sub up" style={{ '--n': 4 }}>A personal space for creativity, ideas and visual expression.</p>
            </div>
            <div className="vis up" style={{ '--n': 0 }}>
              <div className="ring" />
              <div className="disc"><Photo eager /></div>
              <div className="mini" aria-hidden="true"><Photo pos="40% 38%" /></div>
            </div>
          </div>
          <a className="scroll" href="#about" aria-label="Scroll to About"><i /></a>
        </section>

        <section id="about">
          <div className="wrap">
            <p className="eyebrow rv">01 — About</p>
            <h2 className="rv" style={{ '--n': 1 }}>A Little About My World</h2>
            <p className="big rv" style={{ '--n': 2 }}>I'm Lucky Kumar, a Class 10 student from the 2026–2027 batch with an interest in editing, visual aesthetics and digital creativity.</p>
            <p className="rv" style={{ '--n': 3 }}>This portfolio is my personal space to express my style, explore ideas and share my creative journey.</p>
          </div>
        </section>

        <section id="creative-interests">
          <div className="wrap">
            <p className="eyebrow rv">02 — Creative Interests</p>
            <h2 className="rv" style={{ '--n': 1 }}>What Inspires Me</h2>
            <ul className="grid">
              {INTERESTS.map(([t, d], i) => (
                <li key={t} className="rv" style={{ '--n': i }}>
                  <div className="icard"><b>0{i + 1}</b><h3>{t}</h3><p>{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="card-stack">
          <div className="wrap mid">
            <p className="eyebrow rv">03 — Floating Cards</p>
            <h2 className="rv" style={{ '--n': 1 }}>A Stack of Moods</h2>
            <p className="rv" style={{ '--n': 2 }}>Swipe, tap the top card, or use the arrows.</p>
          </div>
          <CardStack />
        </section>

        <section id="contact">
          <div className="wrap">
            <p className="eyebrow rv">04 — Contact</p>
            <h2 className="rv" style={{ '--n': 1 }}>Let's Connect</h2>
            <div className="links">
              {LINKS.map((l, i) => (
                <a key={l.name} className="lnk rv" style={{ '--n': i }} href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">{ICON[l.name]}</svg>
                  <span>{l.label}<small>{l.name}</small></span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <b>Lucky Kumar</b>
        <p>Welcome to World Healing</p>
        <p>© {new Date().getFullYear()} Lucky Kumar</p>
      </footer>
    </>
  )
}
