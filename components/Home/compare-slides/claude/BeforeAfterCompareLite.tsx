'use client'

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image, { type StaticImageData } from 'next/image'

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  BeforeAfterCompareLite — the "more performant comparator" fallback
 * ─────────────────────────────────────────────────────────────────────────
 *  No `position: sticky` pin, no scroll-driven animation, no GSAP. This is
 *  what `AdaptiveBeforeAfter` swaps in when `useEffectTier()` measures that
 *  a device can't comfortably paint the rich version's clip-path +
 *  backdrop-filter reveal across a long pinned scroll.
 *
 *  Deliberately does not import anything from `BeforeAfterRevealSlider.tsx`
 *  — that file loads gsap/@gsap/react, and importing even one named export
 *  from it would pull gsap's module-scope `ScrollTrigger.config(...)` call
 *  into this bundle too, defeating the point of a lightweight fallback. A
 *  ~15-line duplicate of `usePrefersReducedMotion` is a better trade than
 *  that coupling.
 *
 *  Interaction: tap/click anywhere on the frame to glide the divider there
 *  (a discrete gesture, so it never fights page scroll); drag the small
 *  handle for continuous control (`touch-action: none` is scoped to just
 *  that ~44px handle, not the photo — the same fix applied to the rich
 *  version's hold-to-compare control, for the same reason: capturing touch
 *  on the whole photo is what makes scrolling past it feel broken).
 *  Arrow keys move the divider when the handle is focused.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface CompareLiteImage {
  src: string | StaticImageData
  alt: string
}

export interface BeforeAfterCompareLiteProps {
  before: CompareLiteImage
  after: CompareLiteImage
  /** Same convention as `BeforeAfterRevealSlider`: which half is "before". */
  beforeSide?: 'left' | 'right'
  title?: string
  tags?: string[]
  accent?: string
  link?: string
  linkLabel?: string
  /** Starting divider position, 0–100. */
  initialPercent?: number
  /** Tailwind arbitrary aspect-ratio value, e.g. `'4/5'`, `'1/1'`. */
  aspectRatio?: string
  priority?: boolean
  className?: string
}

const DEFAULT_ACCENT = '#e3c98f'

const reducedMotionSubscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}
const getReducedMotionSnapshot = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function usePrefersReducedMotion() {
  return useSyncExternalStore(reducedMotionSubscribe, getReducedMotionSnapshot, () => false)
}

const toSrc = (src: string | StaticImageData) => (typeof src === 'string' ? src : src.src)
const clampPercent = (value: number) => Math.max(0, Math.min(100, value))

export default function BeforeAfterCompareLite({
  before,
  after,
  beforeSide = 'right',
  title,
  tags,
  accent = DEFAULT_ACCENT,
  link,
  linkLabel = 'View Full Case',
  initialPercent = 50,
  aspectRatio = '4/5',
  priority = false,
  className,
}: BeforeAfterCompareLiteProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const topLayerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const draggingRef = useRef(false)

  const [percent, setPercent] = useState(clampPercent(initialPercent))
  const [isDragging, setIsDragging] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  const reduceMotion = usePrefersReducedMotion()

  const leftImage = beforeSide === 'right' ? after : before
  const rightImage = beforeSide === 'right' ? before : after
  const leftLabel = beforeSide === 'right' ? 'after' : 'before'
  const rightLabel = beforeSide === 'right' ? 'before' : 'after'

  // One-shot entrance when the card scrolls into view — a single class
  // flip driving a CSS transition, not a continuous scroll-linked cost.
  useEffect(() => {
    if (!frameRef.current || reduceMotion) {
      setHasEntered(true)
      return
    }
    const node = frameRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduceMotion])

  const paint = useCallback((value: number) => {
    if (topLayerRef.current) {
      topLayerRef.current.style.clipPath = `inset(0 ${100 - value}% 0 0)`
    }
    if (handleRef.current) {
      handleRef.current.style.left = `${value}%`
    }
  }, [])

  useEffect(() => {
    paint(percent)
  }, [paint, percent])

  const percentFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return percent
    return clampPercent(((clientX - rect.left) / rect.width) * 100)
  }, [percent])

  // Tap/click anywhere on the frame glides the divider there. Guarded to
  // the frame itself (not bubbled clicks) — the handle and the link both
  // sit above it with pointer-events enabled and have their own behavior;
  // every other layer (photos, chips) is pointer-events-none, so a real
  // tap on the photo always targets the frame directly.
  const handleFrameClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (draggingRef.current) return
    if (event.target !== frameRef.current) return
    setPercent(percentFromClientX(event.clientX))
  }

  const handleHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    draggingRef.current = true
    setIsDragging(true)
    handleRef.current?.setPointerCapture(event.pointerId)
  }

  const handleHandlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return
    const next = percentFromClientX(event.clientX)
    paint(next) // instant, unthrottled — this is the one place per-frame
    setPercent(next) // updates are intentional; it only runs while dragging
  }

  const endDrag = () => {
    draggingRef.current = false
    setIsDragging(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 3
    if (event.key === 'ArrowLeft') setPercent((p) => clampPercent(p - step))
    else if (event.key === 'ArrowRight') setPercent((p) => clampPercent(p + step))
    else if (event.key === 'Home') setPercent(0)
    else if (event.key === 'End') setPercent(100)
    else return
    event.preventDefault()
  }

  const transition = isDragging || reduceMotion ? 'none' : 'clip-path 260ms cubic-bezier(0.22,1,0.36,1), left 260ms cubic-bezier(0.22,1,0.36,1)'

  return (
    <div
      className={`relative w-full overflow-hidden bg-black transition-[opacity,transform] duration-700 ease-out ${
        hasEntered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className ?? ''}`}
      style={{ aspectRatio }}
    >
      <div
        ref={frameRef}
        onClick={handleFrameClick}
        className="relative h-full w-full cursor-pointer select-none"
      >
        {/* base layer — always full-bleed, never clipped */}
        <Image
          src={toSrc(rightImage.src)}
          alt={rightImage.alt}
          fill
          draggable={false}
          priority={priority}
          sizes="(max-width: 640px) 100vw, 500px"
          className="pointer-events-none object-cover"
        />

        {/* top layer — clipped to the divider, only element that repaints */}
        <div
          ref={topLayerRef}
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)`, transition }}
        >
          <Image
            src={toSrc(leftImage.src)}
            alt={leftImage.alt}
            fill
            draggable={false}
            priority={priority}
            sizes="(max-width: 640px) 100vw, 500px"
            className="pointer-events-none object-cover"
          />
        </div>

        {/* seam, follows the handle */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 z-10 h-full w-px -translate-x-1/2"
          style={{
            left: `${percent}%`,
            transition,
            background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
          }}
        />

        {/* drag handle — the only element allowed to eat touch gestures */}
        <button
          ref={handleRef}
          type="button"
          role="slider"
          aria-label="Compare before and after"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
          style={{ left: `${percent}%`, transition, touchAction: 'none' }}
          className="absolute top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-black/60 focus-visible:outline-none focus-visible:ring-2"
        >
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full border"
            style={{ borderColor: accent, color: accent }}
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
              <path
                d="M6 4 2 8l4 4M10 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {/* chips — flat background, no backdrop-filter anywhere in this file */}
        <div
          className="pointer-events-none absolute start-4 top-4 z-20 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ borderColor: `${accent}55`, color: accent, background: 'rgba(0,0,0,0.6)' }}
        >
          {leftLabel}
        </div>
        <div
          className="pointer-events-none absolute end-4 top-4 z-20 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ borderColor: `${accent}55`, color: accent, background: 'rgba(0,0,0,0.6)' }}
        >
          {rightLabel}
        </div>

        {/* copy */}
        {(title || (tags && tags.length > 0)) && (
          <div className="pointer-events-none absolute bottom-4 left-0 z-20 flex w-full flex-col items-center px-[4%] text-center text-white">
            {tags && tags.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-90 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
                {tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span className="opacity-50">•</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            {title && (
              <h2 className="m-0 text-[clamp(1.1rem,4vw,1.8rem)] font-extrabold uppercase leading-tight tracking-[-0.01em] [text-shadow:0_4px_20px_rgba(0,0,0,0.65)]">
                {title}
              </h2>
            )}
            {link && (
              <a
                href={link}
                className="pointer-events-auto mt-3 border-b pb-0.5 text-xs font-bold uppercase tracking-[0.1em] hover:opacity-80"
                style={{ color: accent, borderColor: accent }}
              >
                {linkLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ── Usage ──────────────────────────────────────────────────────────────
 * Same prop shape as `BeforeAfterRevealSlider`, minus the scroll-specific
 * props — usually rendered via `AdaptiveBeforeAfter` rather than directly.
 *
 * <BeforeAfterCompareLite
 *   before={{ src: rhinoplastyBefore, alt: 'Patient before rhinoplasty' }}
 *   after={{ src: rhinoplastyAfter, alt: 'Patient after rhinoplasty' }}
 *   beforeSide="right"
 *   title="Rhinoplasty"
 * />
 * ──────────────────────────────────────────────────────────────────────
 */
