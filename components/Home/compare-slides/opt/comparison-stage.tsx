'use client'

import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'
import { useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHoldPreview } from './hooks'
import { LuxuryFallbackStage } from './luxury-fallback-stage'
import { isShaderTier } from './render-capability'
import { useRenderTier, useRenderTierActions } from './render-tier'
import { useStageProgress } from './use-stage-progress'
import type { ComparatorCopy, ComparisonItem } from './types'
import type { StaticImageData } from 'next/image'
import { TierBadge } from './tier-badge'

/** three.js and friends load only when a shader tier is actually selected. */
const ShaderStage = dynamic(() => import('./shader-stage'), { ssr: false })

const resolveSrc = (src: string | StaticImageData) =>
  typeof src === 'string' ? src : src.src

export interface ComparisonStageProps {
  item: ComparisonItem
  index: number
  copy: ComparatorCopy
  formatIndex: (index: number) => string
  reduceAmbientMotion: boolean
}

/**
 * One case study: a tall scroll track with a sticky viewport-height frame.
 *
 * Pinning is native `position: sticky`, not JS. ScrollTrigger pinning fights
 * iOS's off-main-thread scrolling and inserts pin-spacers that relayout a
 * 1640svh document; sticky is composited for free and cannot desync.
 *
 * Heights are `svh`, never `vh` or `dvh`. `dvh` re-resolves every time the
 * mobile URL bar collapses, which relayouts the whole document mid-scroll and
 * is the single biggest source of the "pinning feels laggy" complaint. `svh`
 * resolves once.
 */
export function ComparisonStage({
  item,
  index,
  copy,
  formatIndex,
  reduceAmbientMotion,
}: ComparisonStageProps) {
  const tier = useRenderTier()
  const { demote } = useRenderTierActions()
  const shader = isShaderTier(tier)
  const scrub = tier !== 'css-static'

  const { trackRef, progress, active, near } = useStageProgress<HTMLElement>({
    scrub,
  })
  const { preview, isHolding, bind } = useHoldPreview(progress)

  const [canvasReady, setCanvasReady] = useState(false)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const lastPercentRef = useRef(-1)

  // Derived instead of synced: readiness only flips true via the shader's
  // ready callback, and only counts while the shader tier is active.
  const effectiveCanvasReady = canvasReady && shader

  // Percent readout written straight to the DOM. Through React state this was
  // 60 re-renders a second per stage, for a number that changes ~20 times.
  const writeReadout = useCallback(
    (value: number) => {
      const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
      if (percent === lastPercentRef.current) return
      lastPercentRef.current = percent
      const node = readoutRef.current
      if (!node) return
      node.textContent = copy.progressLabel(percent)
      node.setAttribute('aria-valuenow', String(percent))
    },
    [copy],
  )

  useMotionValueEvent(progress, 'change', (value) => {
    if (preview.get() === null) writeReadout(value)
  })
  useMotionValueEvent(preview, 'change', (value) => {
    writeReadout(value ?? progress.get())
  })

  const showCanvas = shader && active
  const mountedFallbackIsDecorative = showCanvas && effectiveCanvasReady

  return (
    <section
      id={`stage-${item.id}`}
      ref={trackRef}
      style={{ ['--p' as string]: 0 }}
      // `contain` without `paint`: paint containment breaks sticky descendants
      // in older Safari, but layout/style containment still isolates the
      // recalc so one stage's changes can't invalidate the other seven.
      className="relative h-[240svh] [contain:layout_style]"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-4 sm:px-8">
        <figure
          className="relative aspect-[4/5] h-[78svh] max-h-[78svh] w-auto max-w-full
                     overflow-hidden border border-[var(--cc-border)] bg-[var(--cc-surface)]
                     shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)]"
        >
          <TierBadge ready={effectiveCanvasReady} />
          {/* Always mounted: the loading state, the error state and the CSS
              tier are all the same component, so there is never a blank frame
              and a lost context degrades instead of disappearing. */}
          <LuxuryFallbackStage
            item={item}
            copy={copy}
            preview={preview}
            progress={progress}
            draggable={!shader} // was: interactive={!shader && scrub}
            hidden={mountedFallbackIsDecorative}
            className={cn(
              'transition-opacity duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              mountedFallbackIsDecorative && 'opacity-0',
            )}
          />

          {showCanvas && (
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                '[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
                effectiveCanvasReady ? 'opacity-100' : 'opacity-0',
              )}
            >
              <ShaderStage
                effect={item.effect}
                beforeSrc={resolveSrc(item.before?.src ?? item.after.src)}
                afterSrc={resolveSrc(item.after.src)}
                hasRealBefore={Boolean(item.before)}
                seed={item.seed ?? 4.4}
                centerY={item.focusY ?? 0.5}
                tier={tier}
                progress={progress}
                preview={preview}
                reduceAmbientMotion={reduceAmbientMotion}
                onReady={() => setCanvasReady(true)}
                onContextLost={() => {
                  setCanvasReady(false)
                  demote('context-lost')
                }}
              />
            </div>
          )}

          {/* Caption. Sits over the frame, not in a card. */}
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-1.5">
              <span className="font-[var(--cc-font-display)] text-[11px] tracking-[0.3em] text-[var(--cc-accent)]">
                {formatIndex(index + 1)}
              </span>
              <span className="font-[var(--cc-font-display)] text-lg leading-tight text-[var(--cc-ink)] sm:text-2xl">
                {item.procedureLabel}
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--cc-ink-muted)]">
                {item.effectLabel}
              </span>
            </div>

            <span
              ref={readoutRef}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-label={item.procedureLabel}
              className="shrink-0 text-[10px] tabular-nums tracking-[0.18em] text-[var(--cc-ink-muted)]"
            >
              {copy.progressLabel(0)}
            </span>
          </figcaption>

          {/* Hold control: a small, dedicated target. Binding hold triggers to
              the whole photo would fire on the first frame of every scroll. */}
          <button
            type="button"
            {...bind}
            aria-pressed={isHolding}
            className={cn(
              'absolute start-4 top-4 touch-none select-none rounded-full border px-3 py-1.5',
              'text-[10px] tracking-[0.14em] transition-colors duration-200',
              isHolding
                ? 'border-[var(--cc-gem)] bg-[color-mix(in_oklch,var(--cc-gem)_28%,transparent)] text-[var(--cc-ink)]'
                : 'border-[var(--cc-border)] bg-[color-mix(in_oklch,var(--cc-bg)_58%,transparent)] text-[var(--cc-ink-muted)] hover:text-[var(--cc-accent-soft)]',
            )}
          >
            {copy.holdHint}
          </button>

          {index === 0 && (
            <span className="pointer-events-none absolute end-4 top-4 text-[10px] tracking-[0.2em] text-[var(--cc-ink-muted)] opacity-70">
              {copy.scrollHint}
            </span>
          )}
        </figure>
      </div>

      {/* Screen readers get the pair as plain content; the scrub is decorative. */}
      {near && (
        <p className="sr-only">
          {copy.beforeLabel(item.procedureLabel)}:{' '}
          {item.before?.alt ?? item.after.alt}.{' '}
          {copy.afterLabel(item.procedureLabel)}: {item.after.alt}.
        </p>
      )}
    </section>
  )
}
