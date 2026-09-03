'use client'

import { useCallback } from 'react'
import { CosmeticComparator } from './cosmetic-comparator'
import { RenderTierProvider } from './render-tier'
import type { Capability, RenderTier } from './render-capability'
import type { CosmeticComparatorProps } from './types'

export interface AdaptiveCosmeticComparatorProps extends CosmeticComparatorProps {
  onProbe?: (capability: Capability) => void
  /** QA escape hatch. Pass a tier to skip detection entirely. */
  forceTier?: RenderTier
}

/**
 * The entry point for consumers: pairs the comparator with the capability
 * provider that decides how richly it may render. Everything below this reads
 * one tier from context, so there is exactly one probe and one watchdog per
 * page no matter how many stages are on it.
 */
export default function AdaptiveCosmeticComparator({
  onProbe,
  forceTier,
  ...props
}: AdaptiveCosmeticComparatorProps) {
  const report = useCallback(
    (capability: Capability) => {
      onProbe?.(capability)
      // Replace with your analytics call. This is how you get a real device
      // matrix instead of guessing which phones "don't support shaders".
      if (process.env.NODE_ENV !== 'production') {
        console.info('[comparator] capability', capability)
      }
    },
    [onProbe],
  )

  return (
    <RenderTierProvider onProbe={report} forceTier={forceTier}>
      <CosmeticComparator {...props} />
    </RenderTierProvider>
  )
}
