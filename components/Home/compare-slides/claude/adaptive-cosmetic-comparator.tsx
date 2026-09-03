'use client'

import dynamic from 'next/dynamic'
import { useWebglSupported } from './hooks'
import type { ComparisonItem } from './types'
import type { BeforeAfterRevealSliderProps } from './BeforeAfterRevealSlider'
import { DEFAULT_THEME } from './theme'

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  AdaptiveCosmeticComparator — WebGL-first, tiered-CSS fallback
 * ─────────────────────────────────────────────────────────────────────────
 *  Combines the two comparator systems in this folder into one decision:
 *
 *   1. `useWebglSupported()` (probes a real webgl2 context + compiles a
 *      probe shader) — if the device can run the GPU effects, render the
 *      shader comparator (`CosmeticComparator` + `EffectMesh` + `shaders`).
 *
 *   2. Otherwise render `AdaptiveBeforeAfter` per item — which uses
 *      `useEffectTier()`'s live paint benchmark to pick between the GSAP
 *      pinned reveal (`BeforeAfterRevealSlider`) and the no-GSAP tap/drag
 *      comparator (`BeforeAfterCompareLite`).
 *
 *  Both heavy renderers are lazy-loaded (`next/dynamic`, `ssr: false`):
 *  a device that lands on the fallback never downloads three.js /
 *  @react-three/fiber, and a device that runs shaders never downloads
 *  gsap. The first paint renders the fallback tier ('rich'), so there's
 *  no hydration mismatch; the probes only ever upgrade/downgrade after
 *  mount and only once per session (see `use-effect-tier.ts`).
 * ─────────────────────────────────────────────────────────────────────────
 */

const ShaderComparator = dynamic(
  () => import('./cosmetic-comparator').then((m) => m.CosmeticComparator),
  { ssr: false },
)
const AdaptiveSingle = dynamic(() => import('./AdaptiveBeforeAfter'), {
  ssr: false,
})

export interface AdaptiveCosmeticComparatorProps {
  items: ComparisonItem[]
  direction?: 'ltr' | 'rtl'
  /** Optional accent hex for the CSS/GSAP fallback tier. */
  fallbackAccent?: string
  /** Tuning passed through to the GSAP pinned reveal tier. */
  fallbackSliderProps?: Pick<
    BeforeAfterRevealSliderProps,
    'scrollVh' | 'splitAt' | 'revealHoldAt' | 'beforeSide'
  >
  /** Any other prop is forwarded to the shader comparator. */
  [key: string]: unknown
}

export default function AdaptiveCosmeticComparator({
  items,
  direction = 'ltr',
  fallbackAccent = DEFAULT_THEME.accent,
  fallbackSliderProps,
  ...shaderProps
}: AdaptiveCosmeticComparatorProps) {
  const webglSupported = useWebglSupported()

  if (items.length === 0) return null

  if (webglSupported === false) {
    console.warn(
      '[ResultsComparator] WebGL2 probe failed → rendering tiered CSS/GSAP clip-path fallback for all items.',
    )
  }

  if (webglSupported === true) {
    return (
      <ShaderComparator
        items={items}
        direction={direction}
        {...(shaderProps as Record<string, unknown>)}
      />
    )
  }

  return (
    <div dir={direction} className="flex flex-col gap-[10vh]">
      {items.map((item) => (
        <AdaptiveSingle
          key={item.id}
          before={{
            src: item.before?.src ?? item.after.src,
            alt:
              item.before?.alt ??
              `${item.procedureLabel} — ${fallbackSliderProps?.beforeSide === 'left' ? 'after' : 'before'}`,
          }}
          after={{ src: item.after.src, alt: item.after.alt }}
          title={item.procedureLabel}
          accent={fallbackAccent}
          {...fallbackSliderProps}
        />
      ))}
    </div>
  )
}
