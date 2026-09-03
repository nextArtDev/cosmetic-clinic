'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react'
import { useInView } from 'react-intersection-observer'
import { Check, Loader2, MousePointer2, RefreshCcw, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Timeline } from '@/components/timeline/timeline'
import { buildVisitEntries, type VisitNode } from './visit-timeline'
import { fetchMoreVisits } from '@/lib/actions/home/user-timeline'

/**
 * Skeleton bar with a sweeping shimmer highlight (skeleton-shimmer keyframe).
 * `overflow-hidden` clips the highlight overlay to the bar's rounded shape.
 */
function SkeletonBar({
  className,
  style,
  ref,
}: {
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'relative overflow-hidden rounded-full bg-ink-elevated',
        className,
      )}
    >
      <div className="absolute inset-0 animate-skeleton-shimmer bg-gradient-to-r from-transparent via-ivory/15 to-transparent motion-reduce:animate-none" />
    </div>
  )
}

/**
 * Measures a target inside the previous timeline entry so a placeholder bar
 * can match the real content's width. `selector` is resolved within the
 * previous entry's li; `useRange` switches between a Range-based read (the
 * text box only — needed for the date h3s, which carry padding or are
 * full-width blocks) and a plain element rect (the visible width — right for
 * the card's truncated title/subtitle lines and the padded status pill).
 *
 * A non-positive width means the target is display:none at the current
 * breakpoint — the placeholder is hidden there too and keeps its default.
 * The ResizeObserver covers viewport resizes, the md↔mobile breakpoint
 * crossing (display none↔block fires it), and late font swaps, so a window
 * resize listener would be redundant.
 */
function useMeasuredWidth(selector: string, useRange = false) {
  const barRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  // useLayoutEffect so the very first paint already carries the measured
  // width (no default-width flash); a single synchronous read, no thrash.
  useLayoutEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const prevLi = bar.closest('li')?.previousElementSibling as HTMLElement | null
    if (!prevLi) return

    const el = prevLi.querySelector<HTMLElement>(selector)
    if (!el) return

    const measure = () => {
      const box = el.getBoundingClientRect()
      if (box.width <= 0) return
      const w = useRange
        ? (() => {
            const range = document.createRange()
            range.selectNodeContents(el)
            return range.getBoundingClientRect().width
          })()
        : box.width
      if (w > 0) setWidth(w)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [selector, useRange])

  return { barRef, width }
}

/**
 * A shimmer bar sized to a measured element in the previous timeline entry,
 * falling back to the fixed default width when the target is missing or
 * hidden.
 */
function MeasuredBar({
  selector,
  className,
  useRange = false,
}: {
  selector: string
  className: string
  useRange?: boolean
}) {
  const { barRef, width } = useMeasuredWidth(selector, useRange)
  return (
    <SkeletonBar
      ref={barRef}
      style={width ? { width } : undefined}
      className={className}
    />
  )
}

/**
 * Date placeholder for the loading entry's sticky date column. The Timeline
 * renders `title` in two spots (desktop sticky column + mobile header), so
 * this renders one shimmer bar per breakpoint — each sized to the real Jalali
 * date label of the previous entry at that breakpoint. `useRange` reads the
 * text box, excluding the sticky column's ps-20 padding.
 */
function TimelineDateShimmer() {
  return (
    <>
      {/* Desktop sticky date column (text-5xl) */}
      <MeasuredBar
        selector="h3.md\\:block"
        useRange
        className="hidden h-12 w-44 md:block md:h-14 md:w-56"
      />
      {/* Mobile header above the card (text-2xl); the h3 already adds mb-4 */}
      <MeasuredBar
        selector="h3.md\\:hidden"
        useRange
        className="block h-7 w-28 md:hidden"
      />
    </>
  )
}

/**
 * Skeleton placeholder for the next timeline page. Rendered as a timeline
 * entry (so it inherits the dot on the scroll line), with shimmering bars
 * that mimic the appointment/treatment card layout.
 */
function TimelineSkeletonCard() {
  return (
    <div
      role="status"
      aria-label="در حال بارگذاری ویزیت‌های بیشتر"
      className="glass-panel p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle — fixed h-11 w-11 in both real card types */}
          <SkeletonBar className="h-11 w-11 shrink-0" />
          {/* min-w-0 mirrors the real cards' text container so a wide
              measured bar can shrink instead of wrapping the pill */}
          <div className="min-w-0 space-y-2">
            {/* Title: doctor name (appointment) / «ثبت درمان» (treatment) */}
            <MeasuredBar selector=".glass-panel p.font-display" className="h-4 w-40" />
            {/* Subtitle: reason (appointment) / date label (treatment) */}
            <MeasuredBar selector=".glass-panel p.text-xs" className="h-3 w-56" />
          </div>
        </div>
        {/* Status pill / «درمان ویژه» badge — falls back to default when the
            previous card has neither (plain treatment without badge) */}
        <MeasuredBar selector=".glass-panel span.rounded-full" className="h-7 w-24" />
      </div>

      <div className="mt-5 space-y-2.5 border-t border-glass-border pt-4">
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-2/3" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <SkeletonBar className="h-18 w-24 rounded-xl" />
        <SkeletonBar className="h-18 w-24 rounded-xl" />
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 border-t border-glass-border pt-4 text-xs text-ivory-dim">
        <Loader2 size={13} className="animate-spin text-gold-soft" />
        در حال بارگذاری ویزیت‌های بیشتر…
      </p>
    </div>
  )
}

/**
 * Error placeholder shown when a page fails to load. Rendered as a timeline
 * entry (own dot on the scroll line) with a retry button — the already-loaded
 * visits stay intact above it.
 */
function TimelineErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="glass-panel p-5 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ivory">
            خطا در بارگذاری ویزیت‌های بیشتر
          </h3>
          <p className="mt-1 text-xs leading-5 text-ivory-dim">
            ارتباط با سرور قطع شد. ویزیت‌های قبلی سالم هستند؛ دوباره تلاش کنید.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-glass-border bg-ink-elevated px-4 py-2.5 text-sm font-medium text-ivory transition-colors hover:border-gold-soft/40 hover:text-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft/60"
      >
        <RefreshCcw
          size={15}
          className="transition-transform duration-300 group-hover:-rotate-180"
        />
        تلاش دوباره
      </button>
    </div>
  )
}

export function InfiniteVisits({
  initialNodes,
  initialCursor,
  hasMore: initialHasMore,
}: {
  initialNodes: VisitNode[]
  initialCursor: string | null
  hasMore: boolean
}) {
  const [nodes, setNodes] = useState<VisitNode[]>(initialNodes)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [retryNonce, setRetryNonce] = useState(0)
  const { ref: sentinelRef, inView } = useInView({ rootMargin: '600px 0px' })

  useEffect(() => {
    if (!hasMore || loading || error || cursor === null) return
    // Auto-fetch only fires from the scroll trigger; a manual retry (nonce > 0)
    // fires regardless of scroll position, so retry never silently no-ops.
    if (retryNonce === 0 && !inView) return

    let cancelled = false
    // Deferred: setState may not run synchronously in the effect body.
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true)
    })

    fetchMoreVisits(cursor)
      .then((res) => {
        if (cancelled) return
        if (res.nodes.length > 0) setNodes((prev) => [...prev, ...res.nodes])
        setCursor(res.nextCursor)
        setHasMore(res.nextCursor !== null)
      })
      .catch(() => {
        // Surface the failure instead of silently stopping; the loaded list
        // stays intact and the user can retry. The `error` guard also stops
        // the inView trigger from auto-retrying in a loop.
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [inView, hasMore, loading, cursor, error, retryNonce])

  const retry = () => {
    setError(false)
    setRetryNonce((n) => n + 1)
  }

  // While a page loads, append the skeleton as a timeline entry so it sits on
  // the scroll line exactly where the next real entry will appear. On failure
  // the skeleton is swapped for the error card with its retry button.
  const entries = [
    ...buildVisitEntries(nodes),
    ...(loading
      ? [
          {
            id: 'timeline-loading',
            title: <TimelineDateShimmer />,
            content: <TimelineSkeletonCard />,
          },
        ]
      : error
        ? [{ id: 'timeline-error', title: '', content: <TimelineErrorCard onRetry={retry} /> }]
        : []),
  ]

  return (
    <div>
      <Timeline data={entries} />

      <div
        ref={sentinelRef}
        aria-hidden={loading || error}
        className="flex items-center justify-center gap-2 py-12 text-sm text-ivory-dim"
      >
        {loading || error ? null : !hasMore ? (
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-sage-bright" />
            پایان تایم‌لاین ویزیت‌ها
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <MousePointer2 size={14} className="text-gold-soft" />
            برای دیدن ویزیت‌های بیشتر اسکرول کنید
          </span>
        )}
      </div>
    </div>
  )
}
