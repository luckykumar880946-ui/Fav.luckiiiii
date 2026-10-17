import { useCallback, useEffect, useRef, useState } from 'react'
import { LIVE } from './firebaseConfig.js'

const get = k => { try { return localStorage.getItem(k) } catch { return null } }
const set = (k, v) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } }

export function useLikes() {
  const [count, setCount] = useState(null)
  const [liked, setLiked] = useState(() => get('lucky-liked') === '1')
  const api = useRef(null)

  useEffect(() => {
    if (!LIVE) { setCount(Number(get('lucky-likes-demo')) || 0); return }
    let dead = false, off = () => {}
    import('./likesBackend.js')
      .then(m => { if (!dead) { api.current = m; off = m.subscribe(setCount, () => setCount(c => c ?? 0)) } })
      .catch(() => setCount(c => c ?? 0))
    return () => { dead = true; off() }
  }, [])

  const toggle = useCallback(async () => {
    const next = !liked, d = next ? 1 : -1
    setLiked(next); set('lucky-liked', next ? '1' : '0')
    if (!LIVE) {
      setCount(c => { const v = Math.max(0, (c || 0) + d); set('lucky-likes-demo', String(v)); return v })
      return
    }
    try {
      const m = api.current || await import('./likesBackend.js')
      await m.change(d)
    } catch {
      setLiked(!next); set('lucky-liked', next ? '0' : '1')
    }
  }, [liked])

  return { count, liked, toggle }
}
