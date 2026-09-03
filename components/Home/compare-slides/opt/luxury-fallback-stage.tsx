'use client'

import Image from 'next/image'
import { useCallback, useRef } from 'react'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ComparatorCopy, ComparisonItem } from './types'

/** Static film grain, baked as a data URI: one decode, not a live filter. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"

/** Curtain offset: 0 → fully below the frame, 1 → fully covering it. */
const SHIFT = 'calc((1 - var(--p, 0)) * 100%)'
const COUNTER_SHIFT = 'calc((1 - var(--p, 0)) * -100%)'

export interface LuxuryFallbackStageProps {
  item: ComparisonItem
  copy: ComparatorCopy
  /** Hold-to-preview override. Shadows the inherited scroll value while active. */
  preview: MotionValue<number | null>
  /** Scroll position. Only read to settle back after a drag. */
  progress: MotionValue<number>
  /** Enables the drag handle. Scroll scrub is inherited either way. */
  draggable?: boolean
  /** true while a shader canvas is painting over this. */
  hidden?: boolean
  className?: string
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * The non-WebGL stage, and a genuine peer of the shader version: a silk
 * curtain drawing back over the before plate, with a hairline champagne seam,
 * a warm bleed spilling onto the untouched half, static grain and a vignette.
 *
 * Two rules keep it cheap. Nothing animates a layout or paint property: the
 * curtain and the seam ride a single `translate3d` and stay on the compositor.
 * And nothing here subscribes to scroll — the shared rAF loop writes `--p`
 * once per frame on the scroll track and every transform below inherits it,
 * so React renders zero times while scrubbing.
 *
 * It doubles as the loading and error state for the shader tiers: it renders
 * underneath the canvas, so there's never a blank frame while textures decode,
 * and a lost context simply reveals it again.
 */
export function LuxuryFallbackStage({
  item,
  copy,
  preview,
  progress,
  draggable = true,
  hidden = false,
  className,
}: LuxuryFallbackStageProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const sizes = '(max-width: 640px) 92vw, (max-width: 1279px) 70vw, 44vw'
  const focus = `50% ${(item.focusY ?? 0.5) * 100}%`

  /**
   * Writes a *local* `--p`, shadowing the value inherited from the scroll
   * track. Removing the property hands control back to scroll with no jump
   * and no state.
   */
  const setLocal = useCallback((value: number | null) => {
    const el = rootRef.current
    if (!el) return
    if (value === null) el.style.removeProperty('--p')
    else el.style.setProperty('--p', clamp01(value).toFixed(4))
  }, [])

  useMotionValueEvent(preview, 'change', (value) => {
    if (draggingRef.current) return
    setLocal(value)
  })

  const readPointer = (event: React.PointerEvent) => {
    const box = rootRef.current?.getBoundingClientRect()
    if (!box || box.height === 0) return null
    // Bottom-up, matching the shader tiers' reveal direction.
    return clamp01(1 - (event.clientY - box.top) / box.height)
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const value = readPointer(event)
    if (value === null) return
    draggingRef.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setLocal(value)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (!draggingRef.current) return
    const value = readPointer(event)
    if (value !== null) setLocal(value)
  }

  const endDrag = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    // Back to inherited scroll, or to the resting value on a non-scrubbed tier.
    setLocal(null)
    void progress.get()
  }

  const currentP = () => {
    const el = rootRef.current
    if (!el) return 0
    return Number(getComputedStyle(el).getPropertyValue('--p')) || 0
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 0.2 : 0.05
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault()
      setLocal(currentP() + step)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault()
      setLocal(currentP() - step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setLocal(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setLocal(1)
    }
  }

  return (
    <div
      ref={rootRef}
      aria-hidden={hidden || undefined}
      className={cn(
        'relative h-full w-full overflow-hidden bg-[var(--cc-surface)]',
        '[--seam:color-mix(in_oklch,var(--cc-accent)_84%,white)]',
        className,
      )}
    >
      {/* Before plate: cooled and pulled down, so "before" reads as a different
          material rather than a dimmer copy of the same photograph. */}
      <Image
        src={item.before?.src ?? item.after.src}
        alt={item.before?.alt ?? copy.beforeLabel(item.procedureLabel)}
        fill
        sizes={sizes}
        draggable={false}
        style={{ WebkitTouchCallout: 'none', objectPosition: focus }}
        className="pointer-events-none select-none object-cover
                   [filter:grayscale(0.34)_contrast(0.93)_brightness(0.86)_saturate(0.7)]"
      />

      {/* THE FIX: `overflow-hidden` here. The child is counter-translated back
          to its natural position so faces stay registered pixel-for-pixel with
          the before photo, and this clip is the only thing that decides how
          much of it you see. Without it the after image is simply always
          visible at full size, which is the bug this replaces. */}
      <div
        className="absolute inset-0 overflow-hidden will-change-transform"
        style={{ transform: `translate3d(0, ${SHIFT}, 0)` }}
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(0, ${COUNTER_SHIFT}, 0)` }}
        >
          <Image
            src={item.after.src}
            alt={item.after.alt}
            fill
            sizes={sizes}
            draggable={false}
            style={{ WebkitTouchCallout: 'none', objectPosition: focus }}
            className="pointer-events-none select-none object-cover"
          />
        </div>
      </div>

      {/* Seam: a separate layer, riding the same offset. It cannot live inside
          the curtain any more, because the clip above would cut off the bleed
          that spills upward onto the untreated plate. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${SHIFT}, 0)` }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: 'var(--seam)',
            boxShadow:
              '0 -1px 3px color-mix(in oklch, var(--seam) 60%, transparent), 0 -24px 34px -14px color-mix(in oklch, var(--cc-accent) 38%, transparent), 0 1px 18px -6px color-mix(in oklch, var(--cc-accent) 30%, transparent)',
            opacity: 'calc(min(var(--p, 0), 1 - var(--p, 0)) * 2.2 + 0.22)',
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(122% 86% at 50% 38%, transparent 40%, color-mix(in oklch, var(--cc-bg) 74%, transparent) 100%)',
        }}
      />

      {/* The only pointer target in the frame. `touch-none` lives here and
          nowhere else, so vertical scrolling over the photo is never stolen. */}
      {draggable && (
        <div
          role="slider"
          tabIndex={0}
          aria-label={copy.fallbackDragHint}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          aria-orientation="vertical"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className="absolute end-3 top-1/2 grid h-20 w-9 -translate-y-1/2 cursor-ns-resize
                     touch-none place-items-center rounded-full border border-[var(--cc-border)]
                     bg-[color-mix(in_oklch,var(--cc-bg)_62%,transparent)]
                     outline-none transition-colors
                     hover:border-[color-mix(in_oklch,var(--cc-accent)_55%,transparent)]
                     focus-visible:border-[var(--cc-accent)]"
        >
          <span className="h-10 w-px bg-[color-mix(in_oklch,var(--cc-accent)_65%,transparent)]" />
        </div>
      )}
    </div>
  )
}
