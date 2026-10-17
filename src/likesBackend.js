import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, runTransaction } from 'firebase/database'
import { firebaseConfig } from './firebaseConfig.js'

const countRef = ref(getDatabase(initializeApp(firebaseConfig)), 'likes/count')

export const subscribe = (cb, onErr) => onValue(countRef, s => cb(Number(s.val()) || 0), onErr)

export const change = delta =>
  runTransaction(countRef, c => {
    const cur = Number(c) || 0
    const next = Math.max(0, cur + delta)
    return next === cur ? undefined : next
  })
