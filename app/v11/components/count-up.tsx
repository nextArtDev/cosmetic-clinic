'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Persian-digit count-up that runs once when scrolled into view — the
 * equivalent of the reference site's "170+ projets" stat counter.
 * Respects prefers-reduced-motion (jumps straight to the final value).
 */
export default function CountUp({
  to,
  suffix = '',
  duration = 1.6,
}: {
  to: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // deferred: no sync setState in the effect body (React lint rule)
      queueMicrotask(() => setValue(to))
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value.toLocaleString('fa-IR')}
      {suffix}
    </span>
  )
}
