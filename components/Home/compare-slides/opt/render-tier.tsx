'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { QUALITY_HIGH } from './quality'
import { FRAGMENT_SHADERS_HIGH } from './shaders'
import {
  demoteTier,
  probeCapability,
  tierIndex,
  type Capability,
  type RenderTier,
} from './render-capability'

const STORAGE_KEY = 'cc-render-tier-v3'
/** Bump when shader cost changes, so cached verdicts don't outlive their basis. */
const PROBE_VERSION = 3
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14

interface TierActions {
  /** Drop one tier. Idempotent per level; safe to call from anywhere. */
  demote: (reason: string) => void
  /** Clear the cached verdict and re-probe. Handy from a "try effects again" link. */
  reprobe: () => void
}

const TierContext = createContext<RenderTier>('css-rich')
const ActionsContext = createContext<TierActions>({
  demote: () => {},
  reprobe: () => {},
})

export const useRenderTier = () => useContext(TierContext)
export const useRenderTierActions = () => useContext(ActionsContext)

export interface RenderTierProviderProps {
  children: ReactNode
  /**
   * Fires once per visit with the full verdict. Wire it to analytics: after a
   * week you have a real device matrix with GPU strings and millisecond costs,
   * which beats guessing at a blocklist forever.
   */
  onProbe?: (capability: Capability) => void
  /** Force a tier. Use for QA and screenshot runs, never in production. */
  forceTier?: RenderTier
}

/**
 * Owns the single source of truth for how rich this device may render.
 *
 * Starts at `css-rich` so server and client agree on the first paint (no
 * hydration mismatch, no blank canvas flash), probes once on idle, and from
 * then on only ever *downgrades*. A live frame-time watchdog keeps watching,
 * because static detection can't see thermal throttling: a phone that passes
 * the probe cold will still fall apart twenty seconds into a long scroll.
 */
export function RenderTierProvider({
  children,
  onProbe,
  forceTier,
}: RenderTierProviderProps) {
  const [tier, setTier] = useState<RenderTier>(forceTier ?? 'css-rich')
  const tierRef = useRef(tier)
  const probeCb = useRef(onProbe)

  // Keep the latest callback on the ref after every commit, never during render.
  useEffect(() => {
    probeCb.current = onProbe
  })

  const commit = useCallback(
    (next: RenderTier, reason: string, persist: boolean) => {
      if (tierIndex(next) === tierIndex(tierRef.current)) return
      tierRef.current = next
      setTier(next)
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[comparator] tier → ${next} (${reason})`)
      }
      if (!persist) return
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ v: PROBE_VERSION, tier: next, at: Date.now() }),
        )
      } catch {
        // private browsing / embedded webviews throw; we just re-probe next visit
      }
    },
    [],
  )

  const demote = useCallback(
    (reason: string) => commit(demoteTier(tierRef.current), reason, true),
    [commit],
  )

  const reprobe = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    window.location.reload()
  }, [])

  useEffect(() => {
    if (forceTier) return

    let cached: RenderTier | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          v?: number
          tier?: RenderTier
          at?: number
        }
        const fresh =
          typeof parsed.at === 'number' && Date.now() - parsed.at < CACHE_TTL_MS
        if (parsed.v === PROBE_VERSION && fresh && parsed.tier)
          cached = parsed.tier
      }
    } catch {
      cached = null
    }

    let cancelled = false

    const run = () => {
      if (cancelled) return
      if (cached) {
        commit(cached, 'cached', false)
        return
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // The stage frame is ~78vh of the viewport at the widest breakpoint.
      const pixels = window.innerWidth * dpr * (window.innerHeight * 0.78) * dpr
      const capability = probeCapability(
        QUALITY_HIGH + FRAGMENT_SHADERS_HIGH.chrysalis,
        pixels,
      )
      probeCb.current?.(capability)
      commit(capability.tier, capability.reason, true)
    }

    // Never probe during hydration: it's a synchronous GPU stall and it would
    // land squarely in the interaction-to-next-paint window.
    const idle: (cb: () => void) => number =
      (
        window as unknown as {
          requestIdleCallback?: (cb: () => void) => number
        }
      ).requestIdleCallback ?? ((cb) => window.setTimeout(cb, 300))
    const handle = idle(run)

    return () => {
      cancelled = true
      ;(
        window as unknown as { cancelIdleCallback?: (h: number) => void }
      ).cancelIdleCallback?.(handle)
      window.clearTimeout(handle)
    }
  }, [commit, forceTier])

  // --- live watchdog --------------------------------------------------------
  useEffect(() => {
    if (forceTier) return
    let raf = 0
    let last = performance.now()
    let bad = 0

    const tick = (now: number) => {
      const dt = now - last
      last = now
      // >400ms means the tab was backgrounded or the main thread was blocked by
      // something that isn't us. Counting it would demote innocent devices.
      if (dt > 28 && dt < 400) bad += 1
      else if (bad > 0) bad -= 1
      if (bad >= 12) {
        bad = 0
        demote('sustained-jank')
      }
      raf = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      last = performance.now()
      bad = 0
    }

    raf = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [demote, forceTier])

  const actions = useMemo<TierActions>(
    () => ({ demote, reprobe }),
    [demote, reprobe],
  )

  return (
    <TierContext.Provider value={tier}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </TierContext.Provider>
  )
}
