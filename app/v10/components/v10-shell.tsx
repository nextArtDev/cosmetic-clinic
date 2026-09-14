'use client'

import { useEffect, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { shabnamV10, farsiAdadV10 } from '../fonts'

/**
 * Marks <html> with data-v10-active while any /v10 page is mounted.
 * The attribute gates every html/body-level rule in v10/globals.css,
 * so those styles exist only while a /v10 route is on screen and are
 * gone the moment the user navigates away. The wrapper carries the
 * port's own font variables and the fa-IR/rtl context (matches the
 * production <html>, so no direction flip happens at the document
 * level; the subtree stays self-consistent either way).
 *
 * MotionConfig reducedMotion="user" makes every Framer Motion animation in
 * this subtree honour `prefers-reduced-motion` automatically — transforms
 * and layout animations are dropped while opacity cross-fades are kept, so
 * the reveal primitives degrade to simple fades without per-component
 * branching.
 */
export function V10Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v10-active', '')
    return () => {
      html.removeAttribute('data-v10-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <MotionConfig reducedMotion="user">
      <div
        id="v10-site-content"
        className={`v10 ${shabnamV10.variable} ${farsiAdadV10.variable}`}
        lang="fa-IR"
        dir="rtl"
      >
        {children}
      </div>
    </MotionConfig>
  )
}
