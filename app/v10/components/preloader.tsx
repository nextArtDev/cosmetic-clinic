'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { clinic, toFa } from '../lib/content'
import { useIsClient } from './motion'
import { Flower } from './ui'

/**
 * Boot preloader — the original NERVANA intro counts up while the hero
 * assets decode, then wipes upward off screen. Ported from the sibling
 * route (`app/v12/components/Preloader.tsx`) and re-skinned to the /v10
 * palette: cream type on the deep-brown ground the hero already uses.
 *
 * Shown once per browser session so repeat visits go straight to the page.
 * Reduced-motion users never see it, and the body scroll lock is released
 * by the same effect that applies it, so an unmount mid-count can never
 * strand the page in a locked state.
 *
 * State model (no setState inside an effect body, which would trip
 * react-hooks/set-state-in-effect):
 *   - `played` comes from `useSyncExternalStore`, so it is read
 *     synchronously and is `true` on the server (render nothing → no
 *     hydration mismatch).
 *   - `finished` flips only from the count-up's own timer callback.
 *   - the running interval and the scroll lock are driven by `playing`.
 */

const SESSION_KEY = 'v10-intro-played'

const subscribeNoop = () => () => {}

function useIntroPlayed() {
  return useSyncExternalStore(
    subscribeNoop,
    () => {
      try {
        return window.sessionStorage.getItem(SESSION_KEY) === '1'
      } catch {
        return false
      }
    },
    // Server: assume it already played so the overlay never appears in SSR
    // markup (avoids a flash for returning visitors and any mismatch).
    () => true,
  )
}

export function Preloader() {
  const isClient = useIsClient()
  const played = useIntroPlayed()
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const playing = isClient && !played && !reduced && !finished

  useEffect(() => {
    if (!playing) return
    let current = 0
    let settle = 0
    const interval = window.setInterval(() => {
      current += Math.floor(Math.random() * 11) + 5
      if (current >= 100) {
        current = 100
        window.clearInterval(interval)
        settle = window.setTimeout(() => {
          try {
            window.sessionStorage.setItem(SESSION_KEY, '1')
          } catch {
            /* storage blocked — the intro simply replays next visit */
          }
          setFinished(true)
        }, 320)
      }
      setCount(current)
    }, 85)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(settle)
    }
  }, [playing])

  useEffect(() => {
    if (!playing) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.dispatchEvent(new CustomEvent('v10:lock', { detail: true }))
    return () => {
      document.body.style.overflow = previous
      window.dispatchEvent(new CustomEvent('v10:lock', { detail: false }))
    }
  }, [playing])

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          className="v10-preloader"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="preloader-top">
            <Flower className="preloader-flower" />
            <span className="mono">{clinic.role}</span>
          </div>
          <div className="preloader-mid">
            <motion.span
              className="preloader-brand"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {clinic.name}
            </motion.span>
          </div>
          <div className="preloader-bottom">
            <div className="preloader-bar" aria-hidden="true">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: count / 100 }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>
            <span className="preloader-count mono">{toFa(count)}٪</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
