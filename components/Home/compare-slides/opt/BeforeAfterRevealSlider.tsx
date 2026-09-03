'use client'

import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import Image, { type StaticImageData } from 'next/image'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Mobile browsers fire resize events when the address bar shows/hides
// during scroll; by default ScrollTrigger reacts by refreshing (recomputing
// pin bounds), which is the single most common cause of a pinned section
// visibly jumping or stuttering on phones. This is a global, side-effect-
// free config flag — safe to set once, module-wide.
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  BeforeAfterRevealSlider — pinned scroll reveal, single before/after pair
 * ─────────────────────────────────────────────────────────────────────────
 *  Adapted from a multi-slide portfolio scroller into a single-purpose
 *  before/after face comparator. What changed and why:
 *
 *   • No more slide cycling. The original virtualized an infinite stack of
 *     slides per column (bufferSlides, a Map per side, DOM nodes created/
 *     destroyed via raw innerHTML). There's exactly one before photo and
 *     one after photo here, so all of that — the index math, the manual
 *     RAF + lerp loop, the innerHTML slide factory — is gone. Two <Image>
 *     elements, rendered once, driven by one ScrollTrigger.
 *
 *   • The two columns are no longer independent slide-streams; they're a
 *     literal split face. `after` sits on one side, `before` on the other
 *     (which side is which is the `beforeSide` prop), and scrolling grows
 *     a seam from the left edge to the final split line — so the section
 *     opens on a full-frame "before" portrait and peels back to reveal
 *     "after" on its half, ending in a clean left/right comparison that
 *     then holds still while you keep scrolling past it.
 *
 *   • GSAP's own `scrub` replaces the original's hand-rolled RAF/lerp
 *     smoothing loop (`scrollTargetRef` + `settings.smoothness`) — one
 *     less moving part, same buttery trailing feel.
 *
 *  Mobile notes:
 *   • `ScrollTrigger.config({ ignoreMobileResize: true })` (set once,
 *     module-wide, below) stops the pinned section from recalculating
 *     every time the address bar shows/hides mid-scroll — the usual
 *     cause of a pinned section visibly jumping on phones.
 *   • `performanceTier="reduced"` keeps the pin and the wipe but drops
 *     the per-frame parallax writes and the chips' `backdrop-filter`.
 *     Pair this component with `AdaptiveBeforeAfter` (a sibling file) to
 *     pick the tier from an actual capability probe rather than a
 *     screen-width guess — plenty of phones render 'rich' just fine.
 *   • For devices too constrained for a pin at all, swap in
 *     `BeforeAfterCompareLite` (no ScrollTrigger, no pin) instead of
 *     this component — `AdaptiveBeforeAfter` does that automatically.
 *
 *  Requires the section to be tall enough to scroll *through* while
 *  pinned — `scrollVh` controls that runway (default 220vh: enough to
 *  read as a deliberate reveal, not a flicker).
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface RevealImage {
  src: string | StaticImageData
  alt: string
}

export interface BeforeAfterRevealSliderProps {
  before: RevealImage
  after: RevealImage
  /**
   * Which half shows the "before" photo. The seam always grows in from the
   * left edge toward the split line, so the default, `'right'`, opens on a
   * full-frame "before" portrait and peels an "after" view in from the
   * left — matching a typical before/after case reveal. `'left'` opens
   * the mirror image of that (full "after" first, "before" peels in).
   */
  beforeSide?: 'left' | 'right'
  title?: string
  tags?: string[]
  /** Hex accent for the seam glow, chips, and progress bar. */
  accent?: string
  link?: string
  linkLabel?: string
  /** Total pinned scroll distance, in viewport heights. */
  scrollVh?: number
  /** Final seam position, 0–1 across the frame width. 0.5 = dead centre. */
  splitAt?: number
  /** Fraction of the scroll spent on the wipe itself; the remainder is a
   *  still hold (with a light parallax settle) rather than more wipe. */
  revealHoldAt?: number
  /** Mark this instance's images `priority` for LCP — only the first one
   *  on a page should usually be true. */
  priority?: boolean
  /**
   * 'reduced' drops the two costliest-but-decorative touches — the
   * per-frame parallax scale/translate on each half, and the chips'
   * `backdrop-filter` blur — while keeping the actual pinned reveal.
   * Meant to be driven by a capability check (see `use-effect-tier.ts`
   * and `AdaptiveBeforeAfter`), not by screen width: plenty of phones
   * handle 'rich' fine, and some large-screen low-power devices don't.
   */
  performanceTier?: 'rich' | 'reduced'
  className?: string
}

const DEFAULTS = {
  accent: '#e3c98f',
  scrollVh: 220,
  splitAt: 0.5,
  revealHoldAt: 0.62,
  parallaxScale: 0.08,
}

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

export default function BeforeAfterRevealSlider({
  before,
  after,
  beforeSide = 'right',
  title,
  tags,
  accent = DEFAULTS.accent,
  link,
  linkLabel = 'View Full Case',
  scrollVh = DEFAULTS.scrollVh,
  splitAt = DEFAULTS.splitAt,
  revealHoldAt = DEFAULTS.revealHoldAt,
  priority = false,
  performanceTier = 'rich',
  className,
}: BeforeAfterRevealSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftWrapRef = useRef<HTMLDivElement>(null)
  const rightWrapRef = useRef<HTMLDivElement>(null)
  const leftImgRef = useRef<HTMLImageElement>(null)
  const rightImgRef = useRef<HTMLImageElement>(null)
  const seamRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const leftChipRef = useRef<HTMLDivElement>(null)
  const rightChipRef = useRef<HTMLDivElement>(null)

  const reduceMotion = usePrefersReducedMotion()

  const leftImage = beforeSide === 'right' ? after : before
  const rightImage = beforeSide === 'right' ? before : after
  const leftLabel = beforeSide === 'right' ? 'after' : 'before'
  const rightLabel = beforeSide === 'right' ? 'before' : 'after'

  // Same generic keyboard assist as the original — scroll the page while
  // the section is in view, unrelated to slide-switching (there's nothing
  // to switch between anymore).
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const inView = rect.top <= window.innerHeight && rect.bottom >= 0
      if (!inView) return
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        window.scrollBy({ top: -window.innerHeight * 0.5, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useGSAP(
    () => {
      if (!containerRef.current) return
      const finalBoundary = Math.max(0, Math.min(1, splitAt)) * 100

      const applyClip = (boundary: number) => {
        leftWrapRef.current?.style.setProperty(
          'clip-path',
          `polygon(0 0, ${boundary}% 0, ${boundary}% 100%, 0 100%)`,
        )
        rightWrapRef.current?.style.setProperty(
          'clip-path',
          `polygon(${boundary}% 0, 100% 0, 100% 100%, ${boundary}% 100%)`,
        )
        if (seamRef.current) {
          seamRef.current.style.left = `${boundary}%`
          seamRef.current.style.opacity = boundary > 0.5 ? '1' : '0'
        }
      }

      // Initial paint before any scroll — full-frame "before" (or "after",
      // per beforeSide), seam hidden, chips hidden.
      applyClip(0)

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reduceMotion ? true : 0.6,
        onUpdate: (self) => {
          const revealProgress = Math.min(1, self.progress / revealHoldAt)
          applyClip(revealProgress * finalBoundary)

          // Decorative settle, tied 1:1 to scroll — never autoplays. Skipped
          // entirely on 'reduced' tier: two fewer style writes per scroll
          // tick, on top of the two clip-path writes above.
          if (performanceTier === 'rich') {
            const settle = 1 - revealProgress
            const scale = 1 + settle * DEFAULTS.parallaxScale
            if (leftImgRef.current) {
              leftImgRef.current.style.transform = `scale(${scale}) translateX(${settle * -2}%)`
            }
            if (rightImgRef.current) {
              rightImgRef.current.style.transform = `scale(${scale}) translateX(${settle * 2}%)`
            }
          }

          const chipOpacity = String(Math.min(1, revealProgress * 1.6))
          if (leftChipRef.current) leftChipRef.current.style.opacity = chipOpacity
          if (rightChipRef.current) rightChipRef.current.style.opacity = chipOpacity

          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`
          }
        },
      })

      return () => st.kill()
    },
    { scope: containerRef, dependencies: [beforeSide, splitAt, revealHoldAt, reduceMotion, performanceTier] },
  )

  return (
    <section
      ref={containerRef}
      className={`relative w-full bg-black ${className ?? ''}`}
      style={{ height: `${scrollVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* left half */}
        <div
          ref={leftWrapRef}
          className="absolute inset-0 h-full w-full overflow-hidden will-change-[clip-path]"
        >
          <Image
            ref={leftImgRef}
            src={toSrc(leftImage.src)}
            alt={leftImage.alt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover will-change-transform"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        </div>

        {/* right half */}
        <div
          ref={rightWrapRef}
          className="absolute inset-0 h-full w-full overflow-hidden will-change-[clip-path]"
        >
          <Image
            ref={rightImgRef}
            src={toSrc(rightImage.src)}
            alt={rightImage.alt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover will-change-transform"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        </div>

        {/* seam — grows in with the reveal, tracks the live boundary */}
        <div
          ref={seamRef}
          aria-hidden
          className="pointer-events-none absolute top-0 z-10 h-full w-px -translate-x-1/2 opacity-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 24px 1px ${accent}55`,
          }}
        />

        {/* before/after chips */}
        <div
          ref={leftChipRef}
          className={`pointer-events-none absolute start-6 top-8 z-20 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] opacity-0 ${performanceTier === 'rich' ? 'backdrop-blur-md' : ''}`}
          style={{ borderColor: `${accent}55`, color: accent, background: 'rgba(0,0,0,0.55)' }}
        >
          {leftLabel}
        </div>
        <div
          ref={rightChipRef}
          className={`pointer-events-none absolute end-6 top-8 z-20 rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] opacity-0 ${performanceTier === 'rich' ? 'backdrop-blur-md' : ''}`}
          style={{ borderColor: `${accent}55`, color: accent, background: 'rgba(0,0,0,0.55)' }}
        >
          {rightLabel}
        </div>

        {/* copy */}
        {(title || (tags && tags.length > 0)) && (
          <div className="pointer-events-none absolute bottom-[16%] left-0 z-20 flex w-full flex-col items-center px-[4%] text-center text-white">
            {tags && tags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.15em] opacity-90 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
                {tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span className="opacity-50">•</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            {title && (
              <h2 className="m-0 text-[clamp(1.5rem,5.5vw,4rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] [text-shadow:0_4px_30px_rgba(0,0,0,0.65)]">
                {title}
              </h2>
            )}
            {link && (
              <a
                href={link}
                className="pointer-events-auto mt-6 border-b-2 pb-1 text-sm font-bold uppercase tracking-[0.1em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:opacity-80"
                style={{ color: accent, borderColor: accent }}
              >
                {linkLabel}
              </a>
            )}
          </div>
        )}

        {/* footer bar: scroll hint + progress */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-20 flex w-full items-end justify-between px-6 py-8 md:px-12">
          <div className="flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.1em] text-white/70 md:text-xs">
            <span>Scroll to reveal</span>
            <div className="h-px w-10 bg-current" />
          </div>
          <div className="h-px w-32 overflow-hidden bg-white/20 md:w-48">
            <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-white" />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * ── Usage ──────────────────────────────────────────────────────────────
 *
 * <BeforeAfterRevealSlider
 *   before={{ src: rhinoplastyBefore, alt: 'Patient before rhinoplasty' }}
 *   after={{ src: rhinoplastyAfter, alt: 'Patient after rhinoplasty' }}
 *   beforeSide="right"
 *   title="Rhinoplasty"
 *   tags={['Surgical', '6 Months Post-Op']}
 *   link="/cases/rhinoplasty-01"
 *   priority
 * />
 *
 * Use matched before/after photography (same angle, framing, and zoom) —
 * the split only reads as one continuous face if both halves line up.
 * ──────────────────────────────────────────────────────────────────────
 */
