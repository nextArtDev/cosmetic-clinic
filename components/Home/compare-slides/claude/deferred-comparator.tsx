'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { FA_COPY } from './theme'
import type { ComparatorCopy, ComparisonItem } from './types'

const AdaptiveCosmeticComparator = dynamic(
  () => import('./adaptive-cosmetic-comparator'),
  { ssr: false },
)

/**
 * Copy presets, resolved *inside* the client boundary. `ComparatorCopy`
 * contains label-builder functions, which cannot be serialized across the
 * Server→Client component boundary — so server consumers pass a plain
 * `copyPreset` string and the functions are materialized here instead.
 */
const COPY_PRESETS: Record<string, Partial<ComparatorCopy>> = {
  fa: {
    ...FA_COPY,
    heading: 'هشت مطالعه از آنچه تغییر می‌کند، به‌صورت زنده',
    subheading:
      'هر قاب دقیقاً همگام با اسکرول شما حرکت می‌کند و گذرِ پیش‌ و پسِ عمل را نشان می‌دهد.',
  },
}

/**
 * Reserved height while the comparator is deferred. Mirrors the real layout
 * so the scrollbar barely moves at the swap:
 *   mobile/tablet (<xl): n·240vh − (n−1)·40vh = 8·240 − 7·40 = 1640vh
 *   xl (two columns):    rows·240vh − (rows−1)·40vh = 4·240 − 3·40 = 840vh
 */
const PLACEHOLDER_HEIGHT_CLASS = 'min-h-[1640vh] xl:min-h-[840vh]'

export interface DeferredComparatorProps {
  items: ComparisonItem[]
  direction?: 'ltr' | 'rtl'
  /** Key into client-side copy presets — serializable stand-in for `copy`. */
  copyPreset?: keyof typeof COPY_PRESETS
}

/**
 * Defers the entire comparator system until the reader is actually close to
 * it. The gallery sits far below the home-page fold, so this keeps three.js,
 * @react-three/fiber, drei, gsap and framer-motion out of the initial route
 * entirely: nothing downloads, hydrates, probes WebGL or runs a benchmark
 * until an IntersectionObserver reports the section is within ~2 viewports
 * (rootMargin percentages are relative to the viewport). Once engaged it
 * stays engaged — the swap happens well off-screen, so there is no visible
 * layout shift, and a reader who never scrolls this far pays nothing.
 */
export default function DeferredComparator({
  items,
  direction = 'rtl',
  copyPreset = 'fa',
}: DeferredComparatorProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [engaged, setEngaged] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setEngaged(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEngaged(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200% 0px 200% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn(!engaged && PLACEHOLDER_HEIGHT_CLASS)}>
      {engaged ? (
        <AdaptiveCosmeticComparator
          items={items}
          direction={direction}
          copy={COPY_PRESETS[copyPreset]}
        />
      ) : (
        <div aria-hidden className={PLACEHOLDER_HEIGHT_CLASS} />
      )}
    </div>
  )
}
