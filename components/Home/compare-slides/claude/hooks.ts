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

/**
 * One-time feature check so the component can fall back to a plain CSS
 * slider on devices/browsers without WebGL2, instead of failing silently.
 *
 * three.js r163+ is WebGL2-only, so a WebGL1 context is NOT sufficient —
 * asking for `webgl2` explicitly is what actually decides whether the
 * shader canvas can render.
 */
export function useWebglSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    // Deferred so the effect body itself never sets state synchronously.
    const id = setTimeout(() => {
      // Surfaced in the console when the shader path is declined, so a silent
      // fallback to the clip-path stages is never a mystery again.
      let reason = 'unknown'
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2', {
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        })
        if (!gl) {
          reason = 'webgl2 context unavailable (GPU/driver/acceleration off?)'
          console.warn('[ResultsComparator] shaders disabled:', reason)
          setSupported(false)
          return
        }
        // Some very old GPUs expose a context but fail to compile any shader.
        // Compile a trivial shader to catch those before mounting the scene.
        const vs = gl.createShader(gl.VERTEX_SHADER)
        if (!vs) {
          console.warn(
            '[ResultsComparator] shaders disabled: createShader returned null',
          )
          gl.getExtension('WEBGL_lose_context')?.loseContext()
          setSupported(false)
          return
        }
        gl.shaderSource(
          vs,
          'void main(){ gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }',
        )
        gl.compileShader(vs)
        const ok = Boolean(gl.getShaderParameter(vs, gl.COMPILE_STATUS))
        gl.deleteShader(vs)
        if (!ok) {
          console.warn(
            '[ResultsComparator] shaders disabled: probe shader failed to compile',
          )
        }
        // Release the context so the real Canvas can request a fresh one.
        gl.getExtension('WEBGL_lose_context')?.loseContext()
        setSupported(ok)
      } catch (err) {
        console.warn('[ResultsComparator] shaders disabled: probe threw', err)
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
