'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react'
import { comparisons, type Comparison } from '../lib/site-content'

/**
 * /v7 before/after comparators.
 *
 * The reference site (grigoriak.doctor) ships NO comparison UI at all, so
 * these are ported from the clinic's own home-route comparators and
 * re-skinned for this route's editorial language:
 *
 *  - `BeforeAfterCompare` — the star-mask reveal from
 *    `components/Home/MaskRevealCompare.tsx`. The result opens out of the
 *    four-point flower that the reference uses for its HolisticScene, and
 *    which this port already echoes in its `✧` ornaments. Scroll scrubs
 *    the reveal; a mouse drag (or the arrow keys on the handle) overrides
 *    it. The `data-parallax` idea drives the marquee behind it.
 *  - `BeforeAfterWipe` — the clip-path seam from
 *    `components/Home/BeforAfterScrollSlider.tsx`, reduced to a
 *    drag-only card so it can live in a grid without pinning the page.
 *
 * Both write to the DOM from a rAF loop (never React state), so a
 * mid-reveal render can't make the two photos flicker.
 */

/* ------------------------------------------------------------------ */
/*  Mask geometry — one 356×356 silhouette per shape, fed to CSS       */
/*  `mask-image` as an SVG data-URI (mask-image masks on alpha, so the  */
/*  path is filled white).                                             */
/* ------------------------------------------------------------------ */

const VB = 356

const STAR_D =
  'M178 0s-2.346 100.135 37.76 140.24S356 178 356 178s-100.135-2.346-140.24 37.76S178 356 178 356s2.346-100.135-37.76-140.24S0 178 0 178s100.135 2.346 140.24-37.76S178 0 178 0Z'
const CIRCLE_D = 'M0 178a178 178 0 1 0 356 0a178 178 0 1 0-356 0Z'
const SPARKLE_D =
  'M178 0L214.77 141.23L356 178L214.77 214.77L178 356L141.23 214.77L0 178L141.23 141.23Z'
const ARCH_D = 'M8 348V186A170 170 0 0 1 348 186V348Z'
const SQUIRCLE_D =
  'M68 8H288A60 60 0 0 1 348 68V288A60 60 0 0 1 288 348H68A60 60 0 0 1 8 288V68A60 60 0 0 1 68 8Z'

export const COMPARE_SHAPES = {
  star: STAR_D,
  circle: CIRCLE_D,
  sparkle: SPARKLE_D,
  arch: ARCH_D,
  squircle: SQUIRCLE_D,
} as const

export type CompareShape = keyof typeof COMPARE_SHAPES

const svgMask = (d: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${VB} ${VB}'><path fill='white' d='${d}'/></svg>`,
  )}")`

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Eased tween helper for the one-shot intro sweep (no GSAP in this port). */
function tween(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void,
  onDone?: () => void,
) {
  const start = performance.now()
  let raf = 0
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    onUpdate(from + (to - from) * eased)
    if (t < 1) raf = requestAnimationFrame(step)
    else onDone?.()
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

/* ------------------------------------------------------------------ */
/*  Shared chrome                                                      */
/* ------------------------------------------------------------------ */

function CompareChips({
  beforeRef,
  afterRef,
  note,
}: {
  beforeRef: React.RefObject<HTMLSpanElement | null>
  afterRef: React.RefObject<HTMLSpanElement | null>
  note?: string
}) {
  return (
    <>
      <span className="v7-compare__chip v7-compare__chip--before" ref={beforeRef}>
        <i />
        قبل
      </span>
      <span className="v7-compare__chip v7-compare__chip--after" ref={afterRef}>
        <i />
        بعد
      </span>
      {note && <span className="v7-compare__note">{note}</span>}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  BeforeAfterCompare — star-mask reveal, scroll + drag                */
/* ------------------------------------------------------------------ */

const MASK_DEFAULTS = {
  start: 15,
  end: 320,
  holdAt: 0.7,
  solidAt: 0.84,
  smoothness: 0.085,
  dragSmoothing: 0.42,
  releaseDragHold: 0.015,
}

export function BeforeAfterCompare({
  shape = 'star',
  cases = comparisons,
  runway = 230,
  marquee = 'قبل و بعد',
  className = '',
}: {
  shape?: CompareShape
  cases?: Comparison[]
  /** Pinned scroll runway in viewport heights (halved on phones). */
  runway?: number
  marquee?: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const [compact, setCompact] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLDivElement>(null)
  const solidRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<SVGSVGElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const beforeChipRef = useRef<HTMLSpanElement>(null)
  const afterChipRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useReducedMotion()

  const item = cases[index]

  const pos = useRef({
    current: 0,
    target: 0,
    scrollProgress: 0,
    dragging: false,
    dragHold: false,
    progressAtDrag: 0,
  })

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  })

  // Phones: a 230vh scroll-jail reads as broken — halve the runway and
  // start the silhouette larger so it isn't a speck.
  const compactRef = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => {
      compactRef.current = mq.matches
      setCompact(mq.matches)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const effectiveRunway = compact ? Math.max(70, Math.round(runway * 0.5)) : runway
  const start = compact ? MASK_DEFAULTS.start * 1.9 : MASK_DEFAULTS.start
  const end = MASK_DEFAULTS.end

  /* --------------- render loop: scroll/drag → mask size --------------- */

  useEffect(() => {
    const apply = (p: number) => {
      const size = start + (end - start) * p
      if (afterRef.current) {
        afterRef.current.style.setProperty('mask-size', `${size}%`)
        afterRef.current.style.setProperty('-webkit-mask-size', `${size}%`)
      }
      if (solidRef.current) {
        solidRef.current.style.opacity = String(
          clamp01((p - MASK_DEFAULTS.solidAt) / (1 - MASK_DEFAULTS.solidAt)),
        )
      }
      if (outlineRef.current) {
        outlineRef.current.style.transform = `translate(-50%,-50%) scale(${size / end})`
        outlineRef.current.style.opacity = String(clamp01((1 - p) / 0.16))
      }
      if (marqueeRef.current && !reducedMotion) {
        marqueeRef.current.style.transform = `translate3d(${(0.5 - p) * 12}%,0,0)`
      }
      if (afterChipRef.current) {
        afterChipRef.current.style.opacity = String(clamp01((p - 0.05) / 0.2))
      }
      if (beforeChipRef.current) {
        beforeChipRef.current.style.opacity = String(clamp01((0.95 - p) / 0.2))
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${pos.current.scrollProgress})`
      }
      if (handleRef.current) {
        handleRef.current.setAttribute(
          'aria-valuenow',
          String(Math.round(p * 100)),
        )
      }
    }

    let raf = 0
    let last = -1
    const loop = () => {
      const s = reducedMotion
        ? 1
        : pos.current.dragging
          ? MASK_DEFAULTS.dragSmoothing
          : MASK_DEFAULTS.smoothness
      const st = pos.current
      st.current += (st.target - st.current) * s
      if (Math.abs(st.target - st.current) < 0.0004) st.current = st.target
      if (Math.abs(st.current - last) > 0.00005) {
        last = st.current
        apply(st.current)
      }
      raf = requestAnimationFrame(loop)
    }
    apply(pos.current.current)
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [start, end, reducedMotion])

  /* -------------------- scroll → reveal target -------------------- */

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    pos.current.scrollProgress = value
    if (pos.current.dragging) return
    if (pos.current.dragHold) {
      if (
        Math.abs(value - pos.current.progressAtDrag) <
        MASK_DEFAULTS.releaseDragHold
      )
        return
      pos.current.dragHold = false
    }
    pos.current.target = clamp01(value / MASK_DEFAULTS.holdAt)
  })

  /* ----------------------- drag + keyboard ----------------------- */

  const setFromClientX = useCallback((clientX: number) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    if (!rect.width) return
    pos.current.target = clamp01((clientX - rect.left) / rect.width)
  }, [])

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
      pos.current.dragging = true
      pos.current.progressAtDrag = pos.current.scrollProgress
      setFromClientX(event.clientX)
    },
    [setFromClientX],
  )

  /**
   * Card body: mouse only. Touch never grabs it — that would turn the
   * pinned stage into a scroll trap, so touch users scrub with the page
   * scroll or the handle. Controls inside the stage (the case tabs, the
   * prev/next buttons) are left alone: preventDefault on pointerdown
   * suppresses the compatibility `click` event, which made them
   * unclickable with a mouse.
   */
  const onStagePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      if (event.button !== 0) return
      const el = event.target as HTMLElement | null
      if (el?.closest('button, a, input, select, textarea, [role="slider"]'))
        return
      event.preventDefault()
      startDrag(event)
    },
    [startDrag],
  )

  /** Handle: the explicit affordance, so it grabs on touch too. */
  const onHandlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      startDrag(event)
    },
    [startDrag],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!pos.current.dragging) return
      setFromClientX(event.clientX)
    },
    [setFromClientX],
  )

  const endDrag = useCallback(() => {
    if (!pos.current.dragging) return
    pos.current.dragging = false
    pos.current.dragHold = true
  }, [])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const step = 0.05
    let next: number | null = null
    if (event.key === 'ArrowLeft') next = pos.current.target - step
    else if (event.key === 'ArrowRight') next = pos.current.target + step
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 1
    if (next === null) return
    event.preventDefault()
    pos.current.target = clamp01(next)
  }, [])

  const maskImage = svgMask(COMPARE_SHAPES[shape])

  return (
    <section
      ref={wrapRef}
      className={`v7-compare ${className}`}
      style={{ height: `${effectiveRunway}svh` }}
      aria-label="مقایسه قبل و بعد نتیجه درمان"
    >
      <div
        ref={stageRef}
        className="v7-compare__stage"
        onPointerDown={onStagePointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Typographic backdrop — the reference's marquee layer */}
        <div ref={marqueeRef} className="v7-compare__marquee" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, row) => (
            <div key={row} className="v7-compare__marquee-row">
              <span>{marquee}</span>
              <i />
              <span>{marquee}</span>
            </div>
          ))}
        </div>

        <div className="v7-compare__card" ref={cardRef}>
          {/* BEFORE — base layer, always full frame */}
          <div className="v7-compare__layer">
            <Image
              src={item.before}
              alt={`${item.title} — قبل`}
              fill
              sizes="(max-width: 767px) 88vw, 42vw"
              style={{ objectPosition: item.position }}
              draggable={false}
            />
          </div>

          {/* AFTER — clipped by the growing silhouette */}
          <div
            ref={afterRef}
            className="v7-compare__layer v7-compare__layer--after"
            style={{
              maskImage,
              WebkitMaskImage: maskImage,
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              maskSize: `${start}%`,
              WebkitMaskSize: `${start}%`,
            }}
          >
            <Image
              src={item.after}
              alt={`${item.title} — بعد`}
              fill
              sizes="(max-width: 767px) 88vw, 42vw"
              style={{ objectPosition: item.position }}
              draggable={false}
            />
          </div>

          {/* Unmasked AFTER twin — guarantees a full-frame finish for
              silhouettes whose corners can never reach the card edges. */}
          <div ref={solidRef} className="v7-compare__layer v7-compare__solid" aria-hidden="true">
            <Image
              src={item.after}
              alt=""
              fill
              sizes="(max-width: 767px) 88vw, 42vw"
              style={{ objectPosition: item.position }}
              draggable={false}
            />
          </div>

          {/* Leading edge — same geometry as the mask */}
          <svg
            ref={outlineRef}
            aria-hidden="true"
            viewBox={`0 0 ${VB} ${VB}`}
            className="v7-compare__outline"
            style={{ width: `${end}%` }}
          >
            <path
              d={COMPARE_SHAPES[shape]}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="v7-compare__vignette" aria-hidden="true" />

          <CompareChips
            beforeRef={beforeChipRef}
            afterRef={afterChipRef}
            note={item.note}
          />

          {/* Drag handle — the only touch affordance on the pinned stage */}
          <button
            type="button"
            role="slider"
            ref={handleRef}
            className="v7-compare__handle"
            aria-label="مقایسه قبل و بعد"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            onKeyDown={onKeyDown}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <MoveHorizontal size={18} strokeWidth={1.2} />
          </button>
        </div>

        {/* Case switcher */}
        <div className="v7-compare__switcher">
          <div className="v7-compare__meta" aria-live="polite">
            <span className="eyebrow">{item.area}</span>
            <AnimatePresence mode="wait">
              <motion.h3
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {item.title}
              </motion.h3>
            </AnimatePresence>
          </div>
          <div className="v7-compare__cases" role="tablist" aria-label="انتخاب نمونه">
            {cases.map((entry, entryIndex) => (
              <button
                key={entry.id}
                role="tab"
                aria-selected={entryIndex === index}
                className={entryIndex === index ? 'active' : ''}
                onClick={() => setIndex(entryIndex)}
              >
                <span className="eyebrow">{entry.index}</span>
                <span>{entry.title}</span>
              </button>
            ))}
          </div>
          <div className="v7-compare__nav">
            <button
              className="circle-button"
              aria-label="نمونه قبلی"
              onClick={() =>
                setIndex((current) => (current - 1 + cases.length) % cases.length)
              }
            >
              <ArrowRight size={18} strokeWidth={1} />
            </button>
            <button
              className="circle-button"
              aria-label="نمونه بعدی"
              onClick={() => setIndex((current) => (current + 1) % cases.length)}
            >
              <ArrowLeft size={18} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* Progress + hint */}
        <div className="v7-compare__foot">
          <span className="v7-compare__hint">
            برای دیدن نتیجه اسکرول کنید یا بکشید
            <i className="v7-compare__pulse" />
          </span>
          <span className="v7-compare__track">
            <span ref={progressRef} />
          </span>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  BeforeAfterWipe — clip-path seam card, drag + one-shot intro        */
/* ------------------------------------------------------------------ */

export function BeforeAfterWipe({
  item,
  className = '',
  priority = false,
}: {
  item: Comparison
  className?: string
  priority?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLSpanElement>(null)
  const beforeChipRef = useRef<HTMLSpanElement>(null)
  const afterChipRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotion()
  const inView = useInView(cardRef, { once: true, amount: 0.4 })
  const playedRef = useRef(false)
  const cancelRef = useRef<null | (() => void)>(null)

  const pos = useRef({
    current: 0.5,
    target: 0.5,
    width: 0,
    dragging: false,
  })

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      pos.current.width = stage.clientWidth
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)

    const apply = (p: number) => {
      if (afterRef.current) {
        afterRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`
      }
      if (dividerRef.current) {
        dividerRef.current.style.transform = `translate3d(${p * pos.current.width}px,0,0)`
      }
      if (afterChipRef.current) {
        afterChipRef.current.style.opacity = String(clamp01((p - 0.08) / 0.2))
      }
      if (beforeChipRef.current) {
        beforeChipRef.current.style.opacity = String(clamp01((0.92 - p) / 0.2))
      }
    }

    let raf = 0
    let last = -1
    let lastWidth = -1
    const loop = () => {
      const s = reducedMotion ? 1 : pos.current.dragging ? 0.4 : 0.11
      const st = pos.current
      st.current += (st.target - st.current) * s
      if (Math.abs(st.target - st.current) < 0.0005) st.current = st.target
      if (Math.abs(st.current - last) > 0.00005 || st.width !== lastWidth) {
        last = st.current
        lastWidth = st.width
        apply(st.current)
      }
      raf = requestAnimationFrame(loop)
    }
    apply(pos.current.current)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reducedMotion])

  // One-shot demo sweep the first time the card is seen — mirrors the
  // home slider's intro so the interaction is discovered, not guessed.
  useEffect(() => {
    if (!inView || playedRef.current || reducedMotion) return
    playedRef.current = true
    const timer = window.setTimeout(() => {
      cancelRef.current = tween(
        pos.current.target,
        1,
        900,
        (v) => {
          pos.current.target = v
        },
        () => {
          cancelRef.current = tween(
            pos.current.target,
            0.5,
            700,
            (v) => {
              pos.current.target = v
            },
          )
        },
      )
    }, 350)
    return () => {
      window.clearTimeout(timer)
      cancelRef.current?.()
    }
  }, [inView, reducedMotion])

  const setFromClientX = useCallback((clientX: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    if (!rect.width) return
    pos.current.target = clamp01((clientX - rect.left) / rect.width)
  }, [])

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      cancelRef.current?.()
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
      pos.current.dragging = true
      setFromClientX(event.clientX)
    },
    [setFromClientX],
  )

  // Grabbing anywhere on the card drags the seam, but the drag must never
  // swallow a click aimed at a control inside the card (the handle), and it
  // must not fight text selection or right-click menus.
  const onStagePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      const el = event.target as HTMLElement | null
      if (el?.closest('button, a, input, select, textarea, [role="slider"]')) return
      event.preventDefault()
      startDrag(event)
    },
    [startDrag],
  )

  const onHandlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      startDrag(event)
    },
    [startDrag],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!pos.current.dragging) return
      setFromClientX(event.clientX)
    },
    [setFromClientX],
  )

  const endDrag = useCallback(() => {
    pos.current.dragging = false
  }, [])

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    let next: number | null = null
    if (event.key === 'ArrowLeft') next = pos.current.target - 0.05
    else if (event.key === 'ArrowRight') next = pos.current.target + 0.05
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = 1
    if (next === null) return
    event.preventDefault()
    pos.current.target = clamp01(next)
  }, [])

  return (
    <div className={`v7-wipe ${className}`} ref={cardRef}>
      <div
        ref={stageRef}
        className="v7-wipe__stage"
        onPointerDown={onStagePointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Image
          src={item.before}
          alt={`${item.title} — قبل`}
          fill
          priority={priority}
          sizes="(max-width: 767px) 90vw, 30vw"
          style={{ objectPosition: item.position }}
          draggable={false}
        />
        <div ref={afterRef} className="v7-wipe__after">
          <Image
            src={item.after}
            alt={`${item.title} — بعد`}
            fill
            sizes="(max-width: 767px) 90vw, 30vw"
            style={{ objectPosition: item.position }}
            draggable={false}
          />
        </div>

        <div className="v7-wipe__vignette" aria-hidden="true" />

        <span className="v7-compare__chip v7-compare__chip--before" ref={beforeChipRef}>
          <i />
          قبل
        </span>
        <span className="v7-compare__chip v7-compare__chip--after" ref={afterChipRef}>
          <i />
          بعد
        </span>

        <span ref={dividerRef} className="v7-wipe__divider">
          <span className="v7-wipe__seam" aria-hidden="true" />
          <button
            type="button"
            role="slider"
            className="v7-wipe__handle"
            aria-label={`مقایسه ${item.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={50}
            onKeyDown={onKeyDown}
            onPointerDown={onHandlePointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <MoveHorizontal size={15} strokeWidth={1.4} />
          </button>
        </span>
      </div>
      <div className="v7-wipe__caption">
        <span className="eyebrow">{item.area}</span>
        <strong>{item.title}</strong>
        <span className="v7-wipe__note">{item.note}</span>
      </div>
    </div>
  )
}
