'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotionValue, type MotionValue } from 'framer-motion'

/**
 * One rAF loop and one IntersectionObserver for the entire gallery.
 *
 * Eight independent `useScroll` instances meant eight rAF loops each calling
 * `getBoundingClientRect()`, which is eight forced style recalcs per frame on
 * a document that is 1640svh tall. This batches all reads, then all writes.
 *
 * It also enforces the WebGL context budget. Mobile Safari caps live contexts
 * around 8 and silently evicts the oldest, which is the real reason a phone
 * shows blank frames halfway down: nothing was "unsupported", the browser just
 * ran out of contexts. Only the stages nearest the viewport centre get an
 * `active` grant, so at most two canvases exist at once on touch devices.
 */

interface Entry {
  el: HTMLElement
  progress: MotionValue<number>
  candidate: boolean
  active: boolean
  scrub: boolean
  next: number
  dist: number
  setActive: (value: boolean) => void
}

const byElement = new Map<Element, Entry>()
let observer: IntersectionObserver | null = null
let raf = 0
let budget = 2

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function computeBudget() {
  if (typeof window === 'undefined') return 2
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const cores = navigator.hardwareConcurrency ?? 4
  if (coarse) return 2
  return cores >= 8 ? 4 : 3
}

function frame() {
  raf = 0
  const vh = window.innerHeight
  const mid = vh / 2
  const live: Entry[] = []

  // --- read phase: every rect measured before anything is written ----------
  for (const entry of byElement.values()) {
    if (!entry.candidate) continue
    const rect = entry.el.getBoundingClientRect()
    const span = rect.height - vh
    entry.next = span <= 0 ? (rect.top < 0 ? 1 : 0) : clamp01(-rect.top / span)
    entry.dist = Math.abs(rect.top + rect.height / 2 - mid)
    live.push(entry)
  }

  // --- write phase ---------------------------------------------------------
  live.sort((a, b) => a.dist - b.dist)
  live.forEach((entry, index) => {
    if (entry.scrub) {
      entry.progress.set(entry.next)
      // The CSS tiers read `--p` straight off this element through normal
      // custom-property inheritance: no React render, no style object churn.
      entry.el.style.setProperty('--p', entry.next.toFixed(4))
    }
    const shouldBeActive = index < budget
    if (shouldBeActive !== entry.active) {
      entry.active = shouldBeActive
      entry.setActive(shouldBeActive)
    }
  })

  if (live.length > 0) raf = requestAnimationFrame(frame)
}

const kick = () => {
  if (!raf && typeof window !== 'undefined') raf = requestAnimationFrame(frame)
}

function ensureObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return
  budget = computeBudget()
  observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        const entry = byElement.get(record.target)
        if (!entry) continue
        entry.candidate = record.isIntersecting
        if (!record.isIntersecting && entry.active) {
          entry.active = false
          entry.setActive(false)
        }
      }
      kick()
    },
    // Roughly one viewport of lead-in: textures decode and shaders compile
    // well off-screen, and the mount/unmount never happens in view.
    { rootMargin: '70% 0px 70% 0px' },
  )
}

export interface StageProgress<T extends HTMLElement = HTMLElement> {
  /** Attach to the tall scroll track (the element with the sticky child). */
  trackRef: React.RefObject<T | null>
  /** 0–1 scrub position. Only updated while the stage is near the viewport. */
  progress: MotionValue<number>
  /** True when this stage may own a WebGL context. Gate the canvas on it. */
  active: boolean
  /** True when the stage is within the observer margin at all. */
  near: boolean
}

export function useStageProgress<T extends HTMLElement = HTMLElement>(
  options: { scrub?: boolean } = {},
): StageProgress<T> {
  const { scrub = true } = options
  const trackRef = useRef<T | null>(null)
  const progress = useMotionValue(0)
  const [active, setActive] = useState(false)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      // No observer (very old browser, jsdom): everything is near, and the
      // budget still limits how many canvases can be live. Deferred so the
      // effect body itself never sets state synchronously.
      const id = setTimeout(() => {
        setNear(true)
        setActive(true)
      }, 0)
      return () => clearTimeout(id)
    }

    ensureObserver()
    const entry: Entry = {
      el,
      progress,
      candidate: false,
      active: false,
      scrub,
      next: 0,
      dist: Number.POSITIVE_INFINITY,
      setActive: (value) => {
        setActive(value)
        if (value) setNear(true)
      },
    }
    byElement.set(el, entry)
    observer?.observe(el)

    const nearObserver = new IntersectionObserver(
      (records) => setNear(records.some((r) => r.isIntersecting)),
      { rootMargin: '120% 0px 120% 0px' },
    )
    nearObserver.observe(el)

    if (!scrub) el.style.setProperty('--p', '0.5')

    return () => {
      observer?.unobserve(el)
      nearObserver.disconnect()
      byElement.delete(el)
    }
  }, [progress, scrub])

  return { trackRef, progress, active, near }
}
