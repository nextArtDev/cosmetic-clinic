'use client'

import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, ScrollTrigger)

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
 *   • Images render through next/image (`fill`) instead of a bare <img>.
 *     That buys automatic responsive `srcSet`/`sizes` resolution, a blur
 *     placeholder when the source has one, and real `priority` preloading
 *     for the LCP image — all of which matter more on mobile networks
 *     than on desktop, since a bare <img src> ships one full-resolution
 *     file to every screen size.
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
  /** Total pinned scroll distance, in viewport heights (desktop). Halved
   *  automatically on screens under 768px — see `effectiveScrollVh`. */
  scrollVh?: number
  /** Final seam position, 0–1 across the frame width. 0.5 = dead centre. */
  splitAt?: number
  /** Fraction of the scroll spent on the wipe itself; the remainder is a
   *  still hold (with a light parallax settle) rather than more wipe. */
  revealHoldAt?: number
  /** Shared object-position for both photos, so a face lines up across
   *  the seam the same way it would in a plain side-by-side crop. */
  imgPosition?: string
  /** Mark this instance's images `priority` for LCP — only the first one
   *  on a page should usually be true. */
  priority?: boolean
  className?: string
}

const DEFAULTS = {
  accent: '#e3c98f',
  scrollVh: 220,
  splitAt: 0.5,
  revealHoldAt: 0.62,
  parallaxScale: 0.08,
}

function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** SSR-safe media query via useSyncExternalStore (no setState-in-effect). */
function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Only string sources are worth a manual <img>-style guess at intrinsic
 *  size; StaticImageData already carries width/height/blurDataURL, which
 *  next/image uses on its own. */
const hasBlurData = (src: string | StaticImageData): src is StaticImageData =>
  typeof src !== 'string' && 'blurDataURL' in src && !!src.blurDataURL

// Fired on ArrowUp/Down/PageUp/Down to nudge the page through the pinned
// section. Skipped while an editable element has focus, so it never
// hijacks arrow-key navigation inside a text field, select, etc.
const isEditableTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  )
}

export default function BeforeAfterRevealSlider({
  before,
  after,
  beforeSide = 'right',
  title,
  tags,
  accent = DEFAULTS.accent,
  link,
  linkLabel = 'مشاهدهٔ پروندهٔ کامل',
  scrollVh = DEFAULTS.scrollVh,
  splitAt = DEFAULTS.splitAt,
  revealHoldAt = DEFAULTS.revealHoldAt,
  imgPosition = 'center',
  priority = false,
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

  // Mobile: halve the pinned runway (220vh of scroll-jail reads as broken
  // on touch) and let svh handle browser-chrome resize. Desktop unchanged.
  const isCompact = useMediaQuery('(max-width: 767px)')
  const effectiveScrollVh = isCompact
    ? Math.max(60, Math.round(scrollVh * 0.5))
    : scrollVh

  // Scroll-linked motion is easier to tolerate than autoplay, but the
  // decorative parallax settle is still extra motion layered on top of
  // the reveal itself — drop it to zero rather than just easing it.
  const parallaxScale = reduceMotion ? 0 : DEFAULTS.parallaxScale

  const leftImage = beforeSide === 'right' ? after : before
  const rightImage = beforeSide === 'right' ? before : after
  const leftLabel = beforeSide === 'right' ? 'بعد' : 'قبل'
  const rightLabel = beforeSide === 'right' ? 'قبل' : 'بعد'

  // Same generic keyboard assist as the original — scroll the page while
  // the section is in view. Desktop (fine pointer) only: on touch devices
  // there is no keyboard, and the preventDefault hijack fights native scroll.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const handleKey = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
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

          // Decorative settle, tied 1:1 to scroll — never autoplays.
          const settle = 1 - revealProgress
          const leftScale = 1 + settle * parallaxScale
          const rightScale = 1 + settle * parallaxScale
          if (leftImgRef.current) {
            leftImgRef.current.style.transform = `scale(${leftScale}) translateX(${settle * -2}%)`
          }
          if (rightImgRef.current) {
            rightImgRef.current.style.transform = `scale(${rightScale}) translateX(${settle * 2}%)`
          }

          const chipOpacity = String(Math.min(1, revealProgress * 1.6))
          if (leftChipRef.current)
            leftChipRef.current.style.opacity = chipOpacity
          if (rightChipRef.current)
            rightChipRef.current.style.opacity = chipOpacity

          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`
          }
        },
      })

      return () => st.kill()
    },
    {
      scope: containerRef,
      // effectiveScrollVh is included so flipping the compact breakpoint
      // (resize, rotate, foldable) rebuilds the trigger against the new
      // section height instead of scrubbing against a stale one.
      dependencies: [
        beforeSide,
        splitAt,
        revealHoldAt,
        reduceMotion,
        effectiveScrollVh,
      ],
    },
  )

  return (
    <section
      ref={containerRef}
      className={`max-w-lg mx-auto relative w-full rounded-[22px] bg-transparent shadow-[0_40px_90px_-25px_rgba(0,0,0,0.9)] mix-blend-darken ${className ?? ''}`}
      style={{ height: `${effectiveScrollVh}vh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* left half */}
        <div
          ref={leftWrapRef}
          className="absolute inset-0 overflow-hidden will-change-[clip-path]"
        >
          <Image
            ref={leftImgRef}
            src={leftImage.src}
            alt={leftImage.alt}
            fill
            priority={priority}
            draggable={false}
            placeholder={hasBlurData(leftImage.src) ? 'blur' : undefined}
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover will-change-transform"
            style={{ objectPosition: imgPosition }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
        </div>

        {/* right half */}
        <div
          ref={rightWrapRef}
          className="absolute inset-0 overflow-hidden will-change-[clip-path]"
        >
          <Image
            ref={rightImgRef}
            src={rightImage.src}
            alt={rightImage.alt}
            fill
            priority={priority}
            draggable={false}
            placeholder={hasBlurData(rightImage.src) ? 'blur' : undefined}
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover will-change-transform"
            style={{ objectPosition: imgPosition }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
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

        {/* before/after chips — nudged down by the safe-area inset so a
            notch/Dynamic Island in landscape never clips them */}
        <div
          ref={leftChipRef}
          className="pointer-events-none absolute start-4 top-6 z-20 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] opacity-0 backdrop-blur-md sm:start-6 sm:top-8 sm:px-3.5 sm:text-[13px] sm:tracking-[0.15em]"
          style={{
            borderColor: `${accent}55`,
            color: accent,
            background: 'rgba(0,0,0,0.4)',
            marginTop: 'env(safe-area-inset-top)',
          }}
        >
          {leftLabel}
        </div>
        <div
          ref={rightChipRef}
          className="pointer-events-none absolute end-4 top-6 z-20 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] opacity-0 backdrop-blur-md sm:end-6 sm:top-8 sm:px-3.5 sm:text-[13px] sm:tracking-[0.15em]"
          style={{
            borderColor: `${accent}55`,
            color: accent,
            background: 'rgba(0,0,0,0.4)',
            marginTop: 'env(safe-area-inset-top)',
          }}
        >
          {rightLabel}
        </div>

        {/* copy */}
        {(title || (tags && tags.length > 0)) && (
          <div className="pointer-events-none absolute bottom-[18%] left-0 z-20 flex w-full flex-col items-center px-[6%] text-center text-white sm:bottom-[16%] sm:px-[4%]">
            {tags && tags.length > 0 && (
              <div className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-90 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)] sm:mb-4 sm:gap-x-4 sm:text-[13px] sm:tracking-[0.15em]">
                {tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span className="opacity-50">•</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            {title && (
              <h2 className="m-0 text-[clamp(1.6rem,7.5vw,4rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-balance [text-shadow:0_4px_30px_rgba(0,0,0,0.65)]">
                {title}
              </h2>
            )}
            {link && (
              <a
                href={link}
                className="pointer-events-auto mt-5 rounded-sm border-b-2 pb-1 text-[0.8rem] font-bold uppercase tracking-[0.1em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:opacity-80 active:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:mt-6 sm:text-sm"
                style={{
                  color: accent,
                  borderColor: accent,
                  outlineColor: accent,
                }}
              >
                {linkLabel}
              </a>
            )}
          </div>
        )}

        {/* footer bar: scroll hint + progress — safe-area aware so it
            clears the home indicator on notched phones */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 z-20 flex w-full items-end justify-between px-4 pt-8 sm:px-6 md:px-12"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.08em] text-white/70 sm:gap-4 sm:text-xs sm:tracking-[0.1em] md:text-[13px]">
            <span>برای دیدن نتیجه اسکرول کنید</span>
            <div className="h-px w-8 bg-current sm:w-10" />
          </div>
          <div className="h-px w-20 overflow-hidden bg-white/20 sm:w-32 md:w-48">
            <div
              ref={progressRef}
              className="h-full w-full origin-left scale-x-0 bg-white"
            />
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
 *   imgPosition="center"
 *   priority
 * />
 *
 * Use matched before/after photography (same angle, framing, and zoom) —
 * the split only reads as one continuous face if both halves line up.
 * ──────────────────────────────────────────────────────────────────────
 */
