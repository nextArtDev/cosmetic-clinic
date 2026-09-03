'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
 * Server→Client component boundary, so server consumers pass a plain
 * `copyPreset` string and the functions are materialized here.
 */
const COPY_PRESETS: Record<string, Partial<ComparatorCopy>> = {
  fa: {
    ...FA_COPY,
    heading: 'مطالعه‌ای از آنچه تغییر می‌کند، به‌صورت زنده',
    subheading:
      'هر قاب دقیقاً همگام با اسکرول شما حرکت می‌کند و گذرِ پیش‌ و پسِ عمل را نشان می‌دهد.',
  },
}

export interface DeferredComparatorProps {
  items: ComparisonItem[]
  direction?: 'ltr' | 'rtl'
  /** Key into client-side copy presets — serializable stand-in for `copy`. */
  copyPreset?: keyof typeof COPY_PRESETS
  className?: string
}

/**
 * Defers the entire comparator system until the reader is actually near it.
 * The gallery sits far below the fold, so this keeps three.js, fiber, drei and
 * the rest out of the initial route completely: nothing downloads, hydrates,
 * probes WebGL or benchmarks until an IntersectionObserver reports the section
 * is within ~2 viewports. Once engaged it stays engaged, and the swap happens
 * well off-screen, so there is no visible layout shift.
 *
 * The reserved height mirrors the real layout (`svh`, matching the stages) so
 * the scrollbar barely moves at the swap:
 *   <xl  : n·240 − (n−1)·40 svh
 *   xl   : rows·240 − (rows−1)·40 svh
 */
export default function DeferredComparator({
  items,
  direction = 'rtl',
  copyPreset = 'fa',
  className,
}: DeferredComparatorProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [engaged, setEngaged] = useState(false)

  const heights = useMemo(() => {
    const n = Math.max(items.length, 1)
    const rows = Math.ceil(n / 2)
    return {
      ['--cc-reserve-sm' as string]: `${n * 240 - (n - 1) * 40}svh`,
      ['--cc-reserve-xl' as string]: `${rows * 240 - (rows - 1) * 40}svh`,
    }
  }, [items.length])

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
    <div
      ref={ref}
      style={heights}
      className={cn(
        !engaged && '[min-height:var(--cc-reserve-sm)] xl:[min-height:var(--cc-reserve-xl)]',
        className,
      )}
    >
      {engaged ? (
        <AdaptiveCosmeticComparator
          items={items}
          direction={direction}
          copy={COPY_PRESETS[copyPreset]}
        />
      ) : (
        <div
          aria-hidden="true"
          className="[min-height:var(--cc-reserve-sm)] xl:[min-height:var(--cc-reserve-xl)]"
        />
      )}
    </div>
  )
}