'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { setLenis } from '../lib/lenis'

/**
 * /v7 smooth scrolling, mirroring the reference site's locomotive-style
 * feel. Uses native window scroll under the hood, so framer-motion
 * useScroll, position:sticky and the browser scrollbar keep working.
 * Skipped entirely under prefers-reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -72 },
    })
    setLenis(lenis)
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])
  return null
}
