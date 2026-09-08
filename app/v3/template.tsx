'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ease } from './components/motion-primitives'

/**
 * Route-level transition curtain — the /v3 port of the reference site's
 * e-page-transition (an overlay that covers the document while a page is
 * "entering" and slides away once it settles). A template.tsx is remounted
 * with a unique key on every navigation, so the exit animation below replays
 * for the home page, every inner page and every project detail alike.
 */
export default function V3Template({ children }: { children: ReactNode }) {
  const [entering, setEntering] = useState(true)
  const reduce = useReducedMotion()

  useEffect(() => {
    // Hold the curtain long enough for the incoming page to paint, then
    // wipe it upward; identical rhythm on first load and soft navigations.
    const timer = window.setTimeout(() => setEntering(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {entering && (
          <motion.div
            className="intro-curtain"
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: reduce ? 0.01 : 0.85, ease }}
            aria-hidden="true"
          >
            <motion.span
              className="wordmark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              دکتر شبنم فضلی
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
