'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BeforeAfterCase {
  clinic: string
  caseLabel: string
  procedure: string
  tags: string[]
  accent: string
  link: string
  /** BEFORE photo — visible on the RIGHT side of the seam */
  beforeImg: string
  /** AFTER photo — visible on the LEFT side of the seam */
  afterImg: string
  /** Both images share one object-position so the face halves stay aligned */
  imgPosition?: string
}

interface BeforeAfterSliderProps {
  data?: BeforeAfterCase
  /** Height of the outer section = total scroll distance.
   *  Defaults to 150vh on mobile / 250vh on md+ (prop overrides both). */
  scrollLength?: string
}

/* ------------------------------------------------------------------ */
/*  Config & demo data                                                 */
/* ------------------------------------------------------------------ */

const settings = {
  /** lerp while the seam follows the page scroll (lower = smoother) */
  smoothness: 0.06,
  /** lerp while the user is dragging (snappier) */
  dragSmoothing: 0.45,
  /** how far the page must scroll before it takes control back after a drag */
  releaseDragHold: 0.02,
  keyboardStep: 0.05,
  /** auto-demo on first view: sweep to AFTER, hold, glide back in sync */
  introDuration: 1.1,
  introHold: 0.5,
  introReturn: 0.7,
}

const demoCase: BeforeAfterCase = {
  clinic: 'کلینیک دکتر  فضلی',
  caseLabel: 'نمونهٔ کار ۰۱',
  procedure: 'رینوپلاستی',
  tags: ['۱۲ ماه پس از عمل', 'تکنیک بسته', 'نتیجهٔ طبیعی'],
  accent: '#a9d0f5',
  link: '#book-consultation',
  beforeImg: '/images/b-a/rhinoplasti-before.webp', // ⚠️ double-check this is the BEFORE photo
  afterImg: '/images/b-a/rhinoplasti-after.webp', // ⚠️ double-check this is the AFTER photo
  imgPosition: 'right',
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  data = demoCase,
  scrollLength,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const afterLabelRef = useRef<HTMLDivElement>(null)
  const beforeLabelRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  /**
   * All per-frame state lives in this ref (never React state → no re-renders,
   * the images physically cannot change/flicker while animating).
   *   0   → seam fully left  → whole face is BEFORE
   *   0.5 → seam centered    → AFTER left / BEFORE right (the split face)
   *   1   → seam fully right → whole face is AFTER
   */
  const pos = useRef({
    current: 0,
    target: 0,
    width: 0,
    dragging: false,
    dragHold: false,
    progressAtDrag: 0,
    scrollProgress: 0,
    introPlaying: false,
  })

  const introTweenRef = useRef<gsap.core.Animation | null>(null)
  const introPlayedRef = useRef(false)

  /* ------------------- render loop + measuring ------------------- */

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    // Reduced motion: no artificial glide — the seam follows scroll/drag 1:1.
    // The autoplay demo is also skipped (motion must be user-initiated).
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const measure = () => {
      pos.current.width = stage.clientWidth
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)

    const update = (p: number) => {
      // Clip the AFTER layer to everything left of the seam
      if (afterRef.current) {
        afterRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`
      }

      // Move the seam + handle
      if (dividerRef.current) {
        dividerRef.current.style.transform = `translate3d(${p * pos.current.width}px,0,0)`
      }

      // Fade / slide each label out as its side gets covered
      if (afterLabelRef.current) {
        const o = clamp01((p - 0.06) / 0.18)
        afterLabelRef.current.style.opacity = o.toFixed(3)
        afterLabelRef.current.style.transform = `translate3d(${(1 - o) * -16}px,0,0)`
      }
      if (beforeLabelRef.current) {
        const o = clamp01((0.94 - p) / 0.18)
        beforeLabelRef.current.style.opacity = o.toFixed(3)
        beforeLabelRef.current.style.transform = `translate3d(${(1 - o) * 16}px,0,0)`
      }

      if (handleRef.current) {
        handleRef.current.setAttribute(
          'aria-valuenow',
          String(Math.round(p * 100)),
        )
      }
    }

    let rafId = 0
    let lastP = -1
    let lastWidth = -1

    const loop = () => {
      const s = prefersReducedMotion
        ? 1
        : pos.current.dragging
          ? settings.dragSmoothing
          : settings.smoothness
      pos.current.current += (pos.current.target - pos.current.current) * s
      if (Math.abs(pos.current.target - pos.current.current) < 0.0001) {
        pos.current.current = pos.current.target
      }
      const p = pos.current.current
      // skip DOM writes when nothing changed (idle cost ≈ zero)
      if (Math.abs(p - lastP) > 0.00005 || pos.current.width !== lastWidth) {
        lastP = p
        lastWidth = pos.current.width
        update(p)
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  /* ------------------- intro auto-demo ------------------- */

  const cancelIntro = useCallback(() => {
    if (introTweenRef.current) {
      introTweenRef.current.kill()
      introTweenRef.current = null
    }
    pos.current.introPlaying = false
  }, [])

  const playIntro = useCallback(() => {
    if (
      introPlayedRef.current ||
      pos.current.introPlaying ||
      (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    )
      return
    introPlayedRef.current = true
    pos.current.introPlaying = true
    // Auto-demo: sweep the seam to full AFTER so the result is seen
    // immediately, then glide back to the scroll-synced position — so the
    // user's first swipe scrubs forward instead of fighting the demo.
    const tl = gsap.timeline({
      onComplete: () => {
        introTweenRef.current = null
        pos.current.introPlaying = false
        // hand control back to page scroll from where it is now
        pos.current.progressAtDrag = pos.current.scrollProgress
        pos.current.dragHold = true
      },
    })
    tl.fromTo(
      pos.current,
      { target: 0 },
      { target: 1, duration: settings.introDuration, ease: 'power2.inOut' },
    ).to(
      pos.current,
      {
        target: () => clamp01(pos.current.scrollProgress),
        duration: settings.introReturn,
        ease: 'power3.inOut',
      },
      `+=${settings.introHold}`,
    )
    introTweenRef.current = tl
  }, [])

  /* ------------------- map page scroll → seam ------------------- */

  useGSAP(
    () => {
      if (!containerRef.current) return

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onEnter: (self) => {
          // first time the section pins, demo the slider automatically
          if (self.progress < 0.2 && !pos.current.dragging) playIntro()
        },
        onUpdate: (self) => {
          pos.current.scrollProgress = self.progress

          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`
          }

          // the intro tween owns the seam until it finishes
          if (pos.current.introPlaying) return

          // After a drag we keep the user's position —
          // actual scrolling takes control back.
          if (pos.current.dragHold) {
            if (
              Math.abs(self.progress - pos.current.progressAtDrag) <
              settings.releaseDragHold
            ) {
              return
            }
            pos.current.dragHold = false
          }

          // Scroll scrubs the seam: top = full BEFORE → bottom = full AFTER
          pos.current.target = self.progress
        },
      })

      return () => {
        st.kill()
        cancelIntro()
      }
    },
    { scope: containerRef },
  )

  /* ------------------- drag + keyboard ------------------- */

  const setFromClientX = useCallback((clientX: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    if (!rect.width) return
    pos.current.target = clamp01((clientX - rect.left) / rect.width)
  }, [])

  const beginDrag = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      cancelIntro()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      pos.current.dragging = true
      pos.current.progressAtDrag = pos.current.scrollProgress
      handleRef.current?.focus({ preventScroll: true })
      setFromClientX(e.clientX)
    },
    [setFromClientX, cancelIntro],
  )

  // Mouse can grab anywhere; touch only grabs the handle (so mobile can still scroll)
  const onStagePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      beginDrag(e)
    },
    [beginDrag],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pos.current.dragging) return
      setFromClientX(e.clientX)
    },
    [setFromClientX],
  )

  const endDrag = useCallback(() => {
    if (!pos.current.dragging) return
    pos.current.dragging = false
    pos.current.dragHold = true
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let next: number | null = null
      if (e.key === 'ArrowLeft')
        next = pos.current.target - settings.keyboardStep
      else if (e.key === 'ArrowRight')
        next = pos.current.target + settings.keyboardStep
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = 1
      if (next === null) return
      e.preventDefault()
      cancelIntro()
      pos.current.target = clamp01(next)
    },
    [cancelIntro],
  )

  /* ------------------- markup ------------------- */

  return (
    <section
      ref={containerRef}
      className="h-[150vh] max-w-lg mx-auto relative w-full bg-transparent md:h-[150vh] rounded-[22px] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.9)] mix-blend-darken"
      style={scrollLength ? { height: scrollLength } : undefined}
    >
      {/* Pinned stage — sticky while the outer section scrolls past.
          dvh (not vh) so mobile URL bars can't make the stage taller than
          the visible viewport → the seam always finishes before unpinning. */}
      <div className="sticky top-0 h-dvh w-full overflow-hidden rounded-[22px]">
        <div
          ref={stageRef}
          className="absolute inset-0 cursor-ew-resize select-none  "
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onStagePointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* BEFORE — base layer, visible RIGHT of the seam */}
          <Image
            src={data.beforeImg}
            alt={`${data.procedure} — قبل`}
            fill
            priority
            sizes="100vw"
            draggable={false}
            className="object-cover"
            style={{ objectPosition: data.imgPosition ?? 'center' }}
          />

          {/* AFTER — clipped layer, visible LEFT of the seam */}
          <div
            ref={afterRef}
            className="absolute inset-0 will-change-[clip-path]"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            <Image
              src={data.afterImg}
              alt={`${data.procedure} — بعد`}
              fill
              priority
              sizes="100vw"
              draggable={false}
              className="object-cover"
              style={{ objectPosition: data.imgPosition ?? 'center' }}
            />
          </div>

          {/* Identical vignette on both halves — keeps the split consistent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"
          />

          {/* Side labels */}
          <div
            ref={afterLabelRef}
            className="pointer-events-none absolute left-5 top-24 z-20 opacity-0 md:left-12 md:top-28"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white backdrop-blur-md md:text-sm">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: data.accent }}
              />
              بعد
            </span>
          </div>
          <div
            ref={beforeLabelRef}
            className="pointer-events-none absolute right-5 top-24 z-20 md:right-12 md:top-28"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur-md md:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              قبل
            </span>
          </div>

          {/* Seam + handle */}
          <div
            ref={dividerRef}
            className="absolute left-0 top-0 z-30 h-full w-0 will-change-transform"
          >
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 bg-white/90 shadow-[0_0_16px_rgba(0,0,0,0.55)]"
            />
            <button
              ref={handleRef}
              type="button"
              role="slider"
              aria-label="مقایسهٔ قبل و بعد"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              onKeyDown={onKeyDown}
              onPointerDown={beginDrag}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="absolute left-0 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-white/50 bg-white/10 text-white backdrop-blur-md transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 md:h-16 md:w-16"
              // pan-y (not none): a vertical swipe starting on the handle
              // must scroll the page — only horizontal drags move the seam.
              // 'none' here turned the screen centre into a scroll trap.
              style={{ touchAction: 'pan-y' }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-6 text-white mix-blend-difference md:px-12 md:py-8">
          <div className="text-xs font-bold uppercase tracking-[0.25em] md:text-sm">
            {data.clinic}
          </div>
          <div className="text-[0.7rem] uppercase tracking-[0.2em] opacity-80 md:text-xs">
            {data.caseLabel}
          </div>
        </div>

        {/* Procedure info */}
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-40 flex flex-col items-center px-6 text-center md:bottom-24">
          <div className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)] md:mb-6 md:text-sm">
            {data.tags.map((tag, i) => (
              <React.Fragment key={tag}>
                {i > 0 && <span className="opacity-50">•</span>}
                <span>{tag}</span>
              </React.Fragment>
            ))}
          </div>
          <h2
            className="m-0 mb-5 text-[clamp(2.2rem,8vw,6.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-balance [text-shadow:0_4px_30px_rgba(0,0,0,0.65)] md:mb-7"
            style={{ color: data.accent }}
          >
            {data.procedure}
          </h2>
          <a
            href={data.link}
            onClick={(e) => data.link === '#' && e.preventDefault()}
            className="pointer-events-auto cursor-pointer border-b-2 pb-2 text-xs font-bold uppercase no-underline tracking-[0.12em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:opacity-80 md:text-sm"
            style={{ color: data.accent, borderColor: data.accent }}
          >
            رزرو مشاوره
          </a>
        </div>

        {/* Bottom bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-end justify-between px-5 py-6 text-white mix-blend-difference md:px-12 md:py-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] opacity-80 md:gap-4 md:text-sm">
            <span className="hidden sm:inline">
              برای مقایسه اسکرول یا بکشید
            </span>
            <span className="sm:hidden">برای مقایسه بکشید</span>
            <div className="h-px w-8 animate-[pulse_2s_infinite_ease-in-out] bg-current md:w-10" />
          </div>
          <div className="h-px w-24 overflow-hidden bg-white/25 md:w-48">
            <div
              ref={progressRef}
              className="h-full w-full origin-left scale-x-0 bg-current"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BeforeAfterSlider
