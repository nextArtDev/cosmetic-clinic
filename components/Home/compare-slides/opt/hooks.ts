'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { animate, useMotionValue, type MotionValue } from 'framer-motion'

const reducedMotionSubscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}
const getReducedMotionSnapshot = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Tracks `prefers-reduced-motion` so ambient shader animation (uTime-driven
 * sparkle, ripple, shimmer) can be frozen. Deliberately NOT part of the render
 * tier: reduced-motion means "no autoplay", not "your GPU is weak". Scroll
 * scrub stays live either way, since it's the person's own input.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    reducedMotionSubscribe,
    getReducedMotionSnapshot,
    () => false,
  )
}

const HOLD_ARM_MS = 60
const HOLD_SLOP_PX = 8

/**
 * "Hold to reveal before" — press and hold to animate progress to 0, release
 * to return to wherever scroll currently sits. Returns the motion value the
 * stage should read alongside raw scroll progress, plus a ready-made `bind`
 * object for the trigger element.
 *
 * `bind` arms on a short timer and cancels if the finger travels more than a
 * few pixels first, so a touch that turns out to be the start of a scroll
 * gesture never snaps the image back. Bind it to a small dedicated control,
 * never the scrollable photo area.
 */
export function useHoldPreview(scrollProgress: MotionValue<number>) {
  const preview = useMotionValue<number | null>(null)
  // framer's `animate()` is typed for MotionValue<number>; `preview` is
  // intentionally nullable so idle frames fall through to raw scroll progress.
  const numericPreview = preview as unknown as MotionValue<number>
  const [isHolding, setIsHolding] = useState(false)
  const holdingRef = useRef(false)
  const stopRef = useRef<(() => void) | null>(null)
  const armRef = useRef<number | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)

  const start = useCallback(() => {
    // Re-entrant guard: pointer and keyboard triggers can both fire (a held
    // key repeats keydown), and restarting mid-hold visibly stutters.
    if (holdingRef.current) return
    holdingRef.current = true
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
    if (armRef.current !== null) {
      window.clearTimeout(armRef.current)
      armRef.current = null
    }
    originRef.current = null
    if (!holdingRef.current) return
    holdingRef.current = false
    stopRef.current?.()
    setIsHolding(false)
    const controls = animate(numericPreview, scrollProgress.get(), {
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1],
      // Back to null so idle frames stop overriding scroll entirely.
      onComplete: () => preview.set(null),
    })
    stopRef.current = () => controls.stop()
  }, [numericPreview, preview, scrollProgress])

  useEffect(
    () => () => {
      stopRef.current?.()
      if (armRef.current !== null) window.clearTimeout(armRef.current)
    },
    [],
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      originRef.current = { x: event.clientX, y: event.clientY }
      if (event.pointerType === 'mouse') {
        start()
        return
      }
      armRef.current = window.setTimeout(() => {
        armRef.current = null
        start()
      }, HOLD_ARM_MS)
    },
    [start],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const origin = originRef.current
      if (!origin) return
      const moved = Math.hypot(
        event.clientX - origin.x,
        event.clientY - origin.y,
      )
      if (moved <= HOLD_SLOP_PX) return
      // Travelled too far to be a hold: this is a scroll or a drag-away.
      end()
    },
    [end],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      event.preventDefault()
      start()
    },
    [start],
  )

  const onKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      end()
    },
    [end],
  )

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp: end,
    onPointerCancel: end,
    onPointerLeave: end,
    onKeyDown,
    onKeyUp,
    onBlur: end,
  } as const

  return { preview, isHolding, start, end, bind }
}
