'use client'

import dynamic from 'next/dynamic'
import type { BeforeAfterRevealSliderProps } from './BeforeAfterRevealSlider'
import type { BeforeAfterCompareLiteProps } from './BeforeAfterCompareLite'
import { useEffectTier, type EffectTier } from './use-effect-tier'

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  AdaptiveBeforeAfter — picks a comparator by measured capability
 * ─────────────────────────────────────────────────────────────────────────
 *  Renders `BeforeAfterRevealSlider` (pinned, scroll-scrubbed) on devices
 *  that measure as capable, `BeforeAfterCompareLite` (tap/drag, no pin, no
 *  gsap) on ones that don't — decided by `useEffectTier()`'s live paint
 *  benchmark, never by `window.innerWidth`. That's the point: a `sm:`
 *  breakpoint would downgrade every phone, including the many recent ones
 *  that run the rich version at a full 60fps.
 *
 *  Both variants are lazy-loaded (`next/dynamic`, `ssr: false`) so a
 *  device that lands on 'lite' never downloads gsap's chunk at all, and a
 *  device that lands on 'rich' never downloads it before it's needed.
 *
 *  First client render always shows 'rich' (see `useEffectTier`'s own
 *  doc comment for why), so there's no hydration mismatch; the probe can
 *  only downgrade after that, typically within ~150–250ms — well before
 *  a below-the-fold section is reachable. Pass `forceTier` to bypass
 *  detection entirely for QA, a known-low-power page context, or to
 *  render a specific tier in tests.
 * ─────────────────────────────────────────────────────────────────────────
 */

const BeforeAfterRevealSlider = dynamic(() => import('./BeforeAfterRevealSlider'), {
  ssr: false,
})
const BeforeAfterCompareLite = dynamic(() => import('./BeforeAfterCompareLite'), {
  ssr: false,
})

export interface AdaptiveBeforeAfterProps
  extends Omit<BeforeAfterRevealSliderProps, 'performanceTier'>,
    Pick<BeforeAfterCompareLiteProps, 'initialPercent' | 'aspectRatio'> {
  /** Skip detection and force a tier — QA, a known-constrained page, tests. */
  forceTier?: EffectTier
}

export default function AdaptiveBeforeAfter({
  forceTier,
  initialPercent,
  aspectRatio,
  ...sliderProps
}: AdaptiveBeforeAfterProps) {
  const detectedTier = useEffectTier()
  const tier = forceTier ?? detectedTier

  if (tier === 'lite') {
    const { before, after, beforeSide, title, tags, accent, link, linkLabel, priority, className } =
      sliderProps
    return (
      <BeforeAfterCompareLite
        before={before}
        after={after}
        beforeSide={beforeSide}
        title={title}
        tags={tags}
        accent={accent}
        link={link}
        linkLabel={linkLabel}
        initialPercent={initialPercent}
        aspectRatio={aspectRatio}
        priority={priority}
        className={className}
      />
    )
  }

  return <BeforeAfterRevealSlider {...sliderProps} performanceTier={tier === 'reduced' ? 'reduced' : 'rich'} />
}
