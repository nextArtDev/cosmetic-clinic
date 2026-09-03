'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react'
import { animate, useMotionValue, type MotionValue } from 'framer-motion'
import { classifyDeviceTier, type DeviceTier, type DeviceTierResult } from './device-tier'

const reducedMotionSubscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}
const getReducedMotionSnapshot = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Tracks `prefers-reduced-motion` so ambient shader animation (uTime-driven
 *  sparkle/ripple) can be frozen — user-initiated scroll-scrub is left alone,
 *  since it's driven by the person's own input, not autoplay. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    reducedMotionSubscribe,
    getReducedMotionSnapshot,
    () => false,
  )
}

/** One-time feature check so the component can fall back to a plain CSS
 *  slider on devices/browsers without WebGL, instead of failing silently. */
export function useWebglSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Deferred so the effect body itself never sets state synchronously.
    const id = setTimeout(() => {
      try {
        const canvas = document.createElement('canvas')
        const gl =
          canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')
        setSupported(Boolean(gl))
      } catch {
        setSupported(false)
      }
    }, 0)
    return () => clearTimeout(id)
  }, [])

  return supported
}

/**
 * "Hold to reveal before" — press and hold to smoothly animate progress to 0
 * (full before), release to smoothly return to wherever scroll currently
 * sits. Returns the trigger functions plus the motion value the mesh/
 * fallback should read alongside raw scroll progress.
 *
 * Callers decide *where* start/end are wired up. On touch devices, binding
 * these to the full photo frame is exactly the bug this hook doesn't cause
 * but a naive integration would: `pointerdown` fires the instant a finger
 * touches the frame, indistinguishable at that point from the first frame
 * of a scroll gesture, so a scroll-intending touch would reset the image.
 * `ComparisonStage` avoids this by binding pointer triggers to a small
 * dedicated control instead of the scrollable photo area itself.
 */
export function useHoldPreview(scrollProgress: MotionValue<number>) {
  const preview = useMotionValue<number | null>(null)
  // framer's `animate()` is typed for MotionValue<number>; `preview` is
  // intentionally nullable so idle frames can cheaply fall through to raw
  // scroll progress. Narrowed once here rather than at every call site.
  const numericPreview = preview as unknown as MotionValue<number>
  const [isHolding, setIsHolding] = useState(false)
  const isHoldingRef = useRef(false)
  const stopRef = useRef<(() => void) | null>(null)

  const start = useCallback(() => {
    // Re-entrant guard: pointer and keyboard triggers can both fire (e.g. a
    // held key repeats keydown), and a second start() mid-hold would restart
    // the spring from wherever it currently sits, causing a visible stutter.
    if (isHoldingRef.current) return
    isHoldingRef.current = true
    stopRef.current?.()
    setIsHolding(true)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8)
      } catch {
        // haptics are a nicety, never worth failing the interaction over
      }
    }
    const controls = animate(numericPreview, 0, {
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1],
    })
    stopRef.current = () => controls.stop()
  }, [numericPreview])

  const end = useCallback(() => {
    if (!isHoldingRef.current) return
    isHoldingRef.current = false
    stopRef.current?.()
    setIsHolding(false)
    const target = scrollProgress.get()
    const controls = animate(numericPreview, target, {
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => preview.set(null),
    })
    stopRef.current = () => controls.stop()
  }, [numericPreview, preview, scrollProgress])

  useEffect(() => () => stopRef.current?.(), [])

  return { preview, isHolding, start, end }
}

/**
 * Resolves a `DeviceTier` once, off the main thread's critical path, and
 * exposes it plus the full measurement for telemetry. Pass `override` to
 * force a tier for QA — e.g. render the component with `qualityOverride="low"`
 * to see exactly what a low-tier visitor sees without needing the hardware.
 */
export function useDeviceTier(override?: DeviceTier): {
  tier: DeviceTier
  detail: DeviceTierResult | null
} {
  const [detail, setDetail] = useState<DeviceTierResult | null>(null)

  useEffect(() => {
    if (override) return
    let cancelled = false
    const run = () => {
      if (!cancelled) setDetail(classifyDeviceTier())
    }
    // The benchmark compiles a shader and forces a GPU sync (`gl.finish`) —
    // never worth doing on the same tick as first paint. Support for
    // requestIdleCallback varies by engine even though the DOM lib types it
    // unconditionally, so this checks at runtime rather than trusting the type.
    const hasIdleCallback = typeof window.requestIdleCallback === 'function'
    const id = hasIdleCallback ? window.requestIdleCallback(run) : window.setTimeout(run, 0)
    return () => {
      cancelled = true
      if (hasIdleCallback && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(id as number)
      } else {
        window.clearTimeout(id as number)
      }
    }
  }, [override])

  // 'mid' pending resolution: safer than assuming 'high' and stuttering the
  // very first stage on a slow device before the benchmark reports back.
  return { tier: override ?? detail?.tier ?? 'mid', detail }
}

/** SSR-safe media query. Returns `false` during SSR and syncs after mount,
 *  so the server render must be the layout you want before hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/**
 * True only while `ref`'s element is within `rootMargin` of the viewport.
 * Used to lazy-mount each stage's WebGL `<Canvas>` — mobile browsers cap
 * concurrent WebGL contexts (commonly 8–16), and every mounted `<Canvas>`
 * runs its own render loop regardless of visibility, so mounting all of a
 * long gallery's stages at once is what actually made scrolling heavy, on
 * capable phones as much as weak ones. Unmounting far-off stages frees
 * both the GPU context and the render loop.
 */
export function useLazyMount(ref: RefObject<HTMLElement | null>, rootMargin = '65% 0px'): boolean {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      // no IO support — mounting everything beats rendering nothing; deferred
      // so the effect body itself never sets state synchronously
      const id = setTimeout(() => setActive(true), 0)
      return () => clearTimeout(id)
    }
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin,
      threshold: 0,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return active
}
