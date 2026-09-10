'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import s from '../privy.module.css'

type Phase = 'loading' | 'leaving' | 'gone'

/**
 * Landing intro overlay (the original's `preloader` + `preloaderIntro`
 * plugins): the ribbon logo draws itself in, a progress meter fills, then
 * the curtain lifts away to reveal the hero. Honors prefers-reduced-motion
 * by removing itself immediately.
 */
export default function Preloader({ onDone }: { onDone?: () => void }) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const timers: number[] = []
    const finish = () => {
      setPhase('gone')
      doneRef.current?.()
    }
    const leave = () => {
      setPhase('leaving')
      timers.push(window.setTimeout(finish, 1150))
    }

    if (reduced) {
      // no animation at all — dismiss on the next tick
      timers.push(window.setTimeout(finish, 0))
      return () => timers.forEach(clearTimeout)
    }

    const start = performance.now()
    const duration = 1550
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setValue(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else timers.push(window.setTimeout(leave, 280))
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [reduced])

  const draw = { pathLength: 0, opacity: 0 }
  const drawIn = { pathLength: 1, opacity: 1 }

  return (
    <AnimatePresence>
      {phase !== 'gone' && (
        <motion.div
          className={s.preloader}
          initial={{ y: 0 }}
          animate={phase === 'leaving' ? { y: '-100%' } : { y: 0 }}
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <div className={s.preloaderInner}>
            <motion.span
              className={s.preloaderLogo}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <svg viewBox="0 0 60 30" fill="none">
                <motion.path
                  d="M29 9C20-2 4 1 4 14c0 13 15 17 26 3L38 8C48-4 60 8 55 20c-4 10-16 8-22 1M25 21c-6 8-18 6-20-3M35 9c6-8 18-6 20 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  pathLength={1}
                  initial={draw}
                  animate={drawIn}
                  transition={{ duration: 1.25, ease: 'easeInOut' }}
                />
                <motion.path
                  d="m17 23 23-17M19 26 44 7"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  pathLength={1}
                  initial={draw}
                  animate={drawIn}
                  transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.25 }}
                />
              </svg>
            </motion.span>

            <motion.span
              className={s.preloaderBrand}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'leaving' ? 0 : 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              PRIVY
            </motion.span>

            <div className={s.preloaderProgress}>
              <span className={s.preloaderBar} style={{ transform: `scaleX(${value})` }} />
            </div>
            <span className={s.preloaderPct}>{String(Math.round(value * 100)).padStart(3, '0')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
