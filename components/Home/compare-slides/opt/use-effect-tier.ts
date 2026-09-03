'use client'

import { useEffect, useState } from 'react'

export type EffectTier = 'rich' | 'reduced' | 'lite'

const STORAGE_KEY = 'before-after-effect-tier-v1'

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/**
 * Decides whether *this* device can comfortably run the pinned clip-path
 * reveal — not whether it's a phone. Screen width is deliberately not a
 * signal here: plenty of small-screen phones handle it fine, and some
 * large-screen devices (older Android tablets, budget Chromebooks,
 * in-store kiosks) don't. A `sm:` breakpoint check would get both wrong.
 *
 * Three layers, cheapest first:
 *
 *  1. Instant, synchronous signals that short-circuit straight to 'lite'
 *     or 'reduced' — `prefers-reduced-motion`, the Save-Data header hint,
 *     and (Chromium only; Safari/Firefox don't expose these, so they're
 *     used as a downgrade signal, never an upgrade one) `deviceMemory`
 *     and `hardwareConcurrency`.
 *
 *  2. A short *live* paint benchmark: an offscreen 240×240 element runs
 *     the same cost profile as the real component — `clip-path` +
 *     `backdrop-filter` — for 14 animation frames, and the measured
 *     average frame time decides the tier. This is the part that
 *     actually answers "does this device support it": it measures the
 *     real thing rather than inferring from user-agent strings or GPU
 *     tier databases, both of which drift out of date.
 *
 *  3. A per-session cache, so the ~150–250ms probe (it runs at native
 *     frame rate, so worst case ≈14 frames' wall-clock time) only ever
 *     runs once per visit rather than once per mounted instance.
 *
 * Renders 'rich' on the very first paint (client and server agree, so
 * there's no hydration mismatch) and only ever *downgrades* after that —
 * a capable device never flashes a simpler version first.
 */
export function useEffectTier(): EffectTier {
  const [tier, setTier] = useState<EffectTier>('rich')

  useEffect(() => {
    let cancelled = false

    const cached = readCache()
    if (cached) {
      // Deferred so the effect body itself never sets state synchronously.
      const id = setTimeout(() => setTier(cached), 0)
      return () => clearTimeout(id)
    }

    const commit = (next: EffectTier) => {
      if (cancelled) return
      setTier(next)
      writeCache(next)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commit('lite')
      return
    }

    const nav = navigator as NavigatorWithHints
    if (nav.connection?.saveData) {
      commit('lite')
      return
    }
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) {
      commit('lite')
      return
    }

    const startedReduced =
      typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 2

    benchmarkPaintCost().then((avgFrameMs) => {
      if (cancelled) return
      // A 60fps budget is ~16.6ms/frame; this leaves real headroom for the
      // rest of the page's own work, not just the benchmark element alone.
      if (avgFrameMs > 32) commit('lite')
      else if (avgFrameMs > 20 || startedReduced) commit('reduced')
      else commit('rich')
    })

    return () => {
      cancelled = true
    }
  }, [])

  return tier
}

function readCache(): EffectTier | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY)
    return value === 'rich' || value === 'reduced' || value === 'lite' ? value : null
  } catch {
    return null
  }
}

function writeCache(tier: EffectTier) {
  try {
    sessionStorage.setItem(STORAGE_KEY, tier)
  } catch {
    // sessionStorage can throw in private-browsing/embedded contexts — the
    // tier just gets recomputed next time, which is harmless.
  }
}

/** Runs the real cost profile (clip-path + backdrop-filter) on a hidden
 *  layer for a handful of frames and returns the average frame time. */
function benchmarkPaintCost(): Promise<number> {
  return new Promise((resolve) => {
    const probe = document.createElement('div')
    probe.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      width: 240px; height: 240px; pointer-events: none;
      background: linear-gradient(45deg, #333, #999);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    `
    document.body.appendChild(probe)

    const FRAMES = 14
    let frame = 0
    let last = performance.now()
    let total = 0

    const tick = (now: number) => {
      total += now - last
      last = now
      frame += 1
      const t = frame / FRAMES
      probe.style.clipPath = `polygon(0 0, ${t * 100}% 0, ${t * 100}% 100%, 0 100%)`
      if (frame < FRAMES) {
        requestAnimationFrame(tick)
      } else {
        probe.remove()
        resolve(total / FRAMES)
      }
    }

    requestAnimationFrame((now) => {
      last = now
      requestAnimationFrame(tick)
    })
  })
}
