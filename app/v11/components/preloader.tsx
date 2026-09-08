'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Intro preloader in the reference site's style: a brief percentage
 * counter over the brand word, then a two-stage curtain wipe that lifts
 * the overlay and hands off to the page. Runs once per mount (not per
 * navigation back to /v11), skips entirely for reduced-motion users and
 * second visits in the same tab (sessionStorage) so it never annoys.
 */
export default function Preloader({ label }: { label: string }) {
  const [done, setDone] = useState(false)
  const [skip, setSkip] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const finish = () => {
      document.documentElement.setAttribute('data-v11-booted', '1')
      window.dispatchEvent(new Event('v11:booted'))
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const seen = window.sessionStorage.getItem('v11-preloaded') === '1'
    if (reduced || seen) {
      finish()
      return
    }
    // deferred: no sync setState in the effect body (React lint rule)
    queueMicrotask(() => setSkip(false))
    window.sessionStorage.setItem('v11-preloaded', '1')
    document.documentElement.style.overflow = 'hidden'

    const start = performance.now()
    const DURATION = 1100
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION)
      setProgress(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else
        setTimeout(() => {
          finish()
          setDone(true)
        }, 150)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (done) document.documentElement.style.overflow = ''
  }, [done])

  return (
    <AnimatePresence>
      {!skip && !done && (
        <motion.div
          className="scmd:fixed scmd:inset-0 scmd:z-[9998] scmd:flex scmd:flex-col scmd:items-center scmd:justify-center"
          style={{ backgroundColor: '#272526', color: '#f8f7f2' }}
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <motion.div
            className="scmd:flex scmd:items-baseline"
            style={{ lineHeight: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              style={{
                fontFamily: 'var(--scmd-font-sans)',
                fontWeight: 700,
                fontSize: '2.2em',
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: 'var(--pink)',
                fontSize: '2.2em',
                fontFamily: 'var(--scmd-font-sans)',
              }}
            >
              .
            </span>
          </motion.div>
          <div
            className="text-14-regular"
            style={{
              marginTop: '1.5em',
              color: 'rgba(248,247,242,0.6)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {progress.toLocaleString('fa-IR')}٪
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
