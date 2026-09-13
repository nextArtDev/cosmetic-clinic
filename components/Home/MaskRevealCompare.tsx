'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react'
// import Image from 'next/image'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/* ------------------------------------------------------------------ */
/*  Mask shapes                                                        */
/* ------------------------------------------------------------------ */

/**
 * Every shape is a single path on a 356×356 canvas, so `mask-size` can be
 * expressed as one percentage of the stage width and the browser derives
 * the height from the intrinsic ratio. They are inlined as SVG data-URIs
 * because `mask-image` wants an image, not DOM — and an SVG *image* masks
 * on alpha, hence `fill="white"`.
 *
 * `STAR_D` is verbatim the four-point flower from
 * `app/v2/components/shanina-site.tsx` (`.holistic-image`), so `star` is
 * the exact HolisticScene silhouette.
 */
const VB = 356
const C = VB / 2
const R = C

const f = (v: number) => Number(v.toFixed(2))
const pt = (r: number, a: number): [number, number] => [
  C + r * Math.cos(a),
  C + r * Math.sin(a),
]

/** Regular polygon, first vertex at 12 o'clock. */
const polygon = (sides: number, r = R, rot = -Math.PI / 2) =>
  Array.from({ length: sides }, (_, i) =>
    pt(r, rot + (i * 2 * Math.PI) / sides),
  )
    .map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`)
    .join('') + 'Z'

/** Spiky star: `points` tips, with a valley between each pair. */
const spiky = (points: number, outer = R, inner = R * 0.34) =>
  Array.from({ length: points * 2 }, (_, i) =>
    pt(i % 2 ? inner : outer, -Math.PI / 2 + (i * Math.PI) / points),
  )
    .map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`)
    .join('') + 'Z'

/** Soft rosette — one quadratic per petal, pinched toward the centre. */
const rosette = (petals: number, outer = R, inner = 12) => {
  const step = (Math.PI * 2) / petals
  let d = ''
  for (let i = 0; i < petals; i++) {
    const tip = pt(outer, -Math.PI / 2 + i * step)
    const next = pt(outer, -Math.PI / 2 + (i + 1) * step)
    const ctrl = pt(inner, -Math.PI / 2 + (i + 0.5) * step)
    if (i === 0) d += `M${f(tip[0])} ${f(tip[1])}`
    d += `Q${f(ctrl[0])} ${f(ctrl[1])} ${f(next[0])} ${f(next[1])}`
  }
  return d + 'Z'
}

/** Closed curve through points, smoothed by quadratics at the midpoints. */
const smoothClosed = (pts: [number, number][]) => {
  const mid = (a: [number, number], b: [number, number]) =>
    [f((a[0] + b[0]) / 2), f((a[1] + b[1]) / 2)] as const
  let d = `M${mid(pts[pts.length - 1], pts[0])[0]} ${mid(pts[pts.length - 1], pts[0])[1]}`
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length])
    d += `Q${f(p[0])} ${f(p[1])} ${m[0]} ${m[1]}`
  })
  return d + 'Z'
}

const blob = (radii: number[]) =>
  smoothClosed(
    radii.map((r, i) => pt(r, -Math.PI / 2 + (i * 2 * Math.PI) / radii.length)),
  )

const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
  const k = Math.min(r, w / 2, h / 2)
  return [
    `M${f(x + k)} ${f(y)}`,
    `H${f(x + w - k)}`,
    `A${f(k)} ${f(k)} 0 0 1 ${f(x + w)} ${f(y + k)}`,
    `V${f(y + h - k)}`,
    `A${f(k)} ${f(k)} 0 0 1 ${f(x + w - k)} ${f(y + h)}`,
    `H${f(x + k)}`,
    `A${f(k)} ${f(k)} 0 0 1 ${f(x)} ${f(y + h - k)}`,
    `V${f(y + k)}`,
    `A${f(k)} ${f(k)} 0 0 1 ${f(x + k)} ${f(y)}`,
    'Z',
  ].join('')
}

/** Tiled grid of rounded cells — one gap value used for both axes. */
const tiled = (cols: number, rows: number, gap: number, radius: number) => {
  const cw = (VB - (cols + 1) * gap) / cols
  const ch = (VB - (rows + 1) * gap) / rows
  let d = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      d += roundedRect(
        gap + c * (cw + gap),
        gap + r * (ch + gap),
        cw,
        ch,
        radius,
      )
    }
  }
  return d
}

const STAR_D =
  'M178 0s-2.346 100.135 37.76 140.24S356 178 356 178s-100.135-2.346-140.24 37.76S178 356 178 356s2.346-100.135-37.76-140.24S0 178 0 178s100.135 2.346 140.24-37.76S178 0 178 0Z'

const CIRCLE_D = `M${C} 0 A${R} ${R} 0 0 1 ${C} ${VB} A${R} ${R} 0 0 1 ${C} 0 Z`

const LEAF_D = `M${C} 0 C 300 80 300 276 ${C} ${VB} C 56 276 56 80 ${C} 0 Z`

const ARCH_D = `M8 ${VB - 8} V186 A170 170 0 0 1 ${VB - 8} 186 V${VB - 8} Z`

const CROSS_D = 'M132 0 H224 V132 H356 V224 H224 V356 H132 V224 H0 V132 H132 Z'

const HEART_D =
  `M${C} 340 C 60 262 8 198 8 136 C 8 74 54 30 108 30 C 146 30 166 52 ${C} 74` +
  ` C 190 52 210 30 248 30 C 302 30 348 74 348 136 C 348 198 296 262 ${C} 340 Z`

export const MASK_SHAPES = {
  /* --- the v2 HolisticScene family ------------------------------- */
  /** The exact HolisticScene flower. The default. */
  star: STAR_D,
  /** Sharper, thinner 4-point star. */
  sparkle: spiky(4, R, 52),
  /** 12-point sunburst — reads as an expanding flash. */
  burst: spiky(12, R, 96),
  /** Soft 8-petal rosette. */
  petals: rosette(8, R, 10),
  /** Organic, asymmetric pebble. */
  blob: blob([178, 152, 170, 138, 176, 146, 162, 140]),
  /* --- geometric -------------------------------------------------- */
  circle: CIRCLE_D,
  /** Rounded square. */
  squircle: roundedRect(8, 8, 340, 340, 60),
  diamond: polygon(4),
  hexagon: polygon(6),
  /** Almond / eye — good for periorbital work. */
  leaf: LEAF_D,
  /** Tombstone arch — frames a portrait crop. */
  arch: ARCH_D,
  cross: CROSS_D,
  heart: HEART_D,
  /* --- comparator-specific ---------------------------------------- */
  /** 3×3 tiles that swell and bleed together. */
  mosaic: tiled(3, 3, 16, 16),
  /** Horizontal slats opening like venetian blinds. */
  blinds: tiled(1, 5, 11, 22),
} as const satisfies Record<string, string>

export type MaskShape = keyof typeof MASK_SHAPES

/** All keys, for a shape picker UI. */
export const MASK_SHAPE_LIST = Object.keys(MASK_SHAPES) as MaskShape[]

const svgMask = (d: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${VB} ${VB}'><path fill='white' d='${d}'/></svg>`,
  )}")`

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MaskRevealImage {
  src: string
  alt: string
}

export interface MaskRevealCompareProps {
  /** Base layer — the frame you start on. */
  before: MaskRevealImage
  /** Top layer — clipped by the growing mask, so it "opens" over `before`. */
  after: MaskRevealImage
  /** Giant typographic backdrop (the HolisticScene signature). */
  marqueeText?: string
  marqueeRows?: number
  marquee?: boolean
  /**
   * Silhouette of the opening. Pick from `MASK_SHAPE_LIST`:
   * `star` (the v2 HolisticScene flower), `sparkle`, `burst`, `petals`,
   * `blob`, `circle`, `squircle`, `diamond`, `hexagon`, `leaf`, `arch`,
   * `cross`, `heart`, `mosaic`, `blinds`.
   */
  shape?: MaskShape
  /**
   * Override the mask entirely — any `mask-image` value (a url, a
   * gradient…). Takes precedence over `shape`; the outline is disabled
   * because it can no longer be matched to the mask.
   */
  maskSrc?: string
  /** Draw a hairline outline that tracks the opening edge. */
  outline?: boolean
  /** Mask size at scroll start / end, in % of the stage width. */
  startMask?: number
  endMask?: number
  /**
   * From this reveal value onward a second, unmasked copy of the AFTER
   * photo fades in on top. Guarantees a truly full-frame finish: pointy
   * shapes (and tiled ones like `mosaic`) can't cover a tall viewport's
   * corners at any sane `endMask`, but a short cross-fade between two
   * pixel-identical layers is invisible.
   */
  solidAt?: number
  title?: string
  tags?: string[]
  accent?: string
  link?: string
  linkLabel?: string
  /** Pinned scroll runway, in viewport heights (halved under 768px). */
  scrollVh?: number
  /** Fraction of the runway spent opening; the rest is a still hold. */
  revealHoldAt?: number
  /** Shared object-position so a face lines up across the reveal. */
  imgPosition?: string
  /** Mouse users can drag horizontally to open/close the reveal. */
  interactive?: boolean
  priority?: boolean
  className?: string
}

const DEFAULTS = {
  accent: '#e3c98f',
  startMask: 16,
  endMask: 340,
  scrollVh: 240,
  revealHoldAt: 0.72,
  solidAt: 0.86,
  smoothness: 0.085,
  dragSmoothing: 0.4,
  releaseDragHold: 0.015,
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MaskRevealCompare({
  before,
  after,
  marqueeText = 'قبل و بعد',
  marqueeRows = 3,
  marquee = true,
  shape = 'star',
  maskSrc,
  outline = true,
  startMask = DEFAULTS.startMask,
  endMask = DEFAULTS.endMask,
  solidAt = DEFAULTS.solidAt,
  title,
  tags,
  accent = DEFAULTS.accent,
  link,
  linkLabel = 'مشاهدهٔ پروندهٔ کامل',
  scrollVh = DEFAULTS.scrollVh,
  revealHoldAt = DEFAULTS.revealHoldAt,
  imgPosition = 'center',
  interactive = true,
  priority = false,
  className,
}: MaskRevealCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const beforeWrapRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLDivElement>(null)
  const afterSolidRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<SVGSVGElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const beforeChipRef = useRef<HTMLDivElement>(null)
  const afterChipRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isCompact = useMediaQuery('(max-width: 767px)')

  // Touch: a 240vh scroll-jail reads as broken, so halve the runway there.
  // Small screens also need a bigger starting window or the star is a dot.
  const effectiveScrollVh = isCompact
    ? Math.max(60, Math.round(scrollVh * 0.5))
    : scrollVh
  const effectiveStart = isCompact ? startMask * 1.8 : startMask

  /** Per-frame state — deliberately outside React so animating never
   *  re-renders (the images physically cannot flicker mid-reveal).
   *    0 → mask closed → whole frame is BEFORE
   *    1 → mask covers the stage → whole frame is AFTER */
  const pos = useRef({
    current: 0,
    target: 0,
    scrollProgress: 0,
    dragging: false,
    dragHold: false,
    progressAtDrag: 0,
  })

  /* ------------------- render loop ------------------- */

  useEffect(() => {
    const apply = (p: number) => {
      const size = effectiveStart + (endMask - effectiveStart) * p

      if (afterRef.current) {
        afterRef.current.style.setProperty('mask-size', `${size}%`)
        afterRef.current.style.setProperty('-webkit-mask-size', `${size}%`)
      }

      // Unmasked AFTER twin: guarantees a full-frame finish for shapes
      // whose corners can never reach a tall viewport's edges.
      if (afterSolidRef.current) {
        afterSolidRef.current.style.opacity = String(
          clamp01((p - solidAt) / (1 - solidAt)),
        )
      }

      if (outlineRef.current) {
        outlineRef.current.style.transform = `translate(-50%,-50%) scale(${size / endMask})`
        // fade the edge out once it has run off the frame
        outlineRef.current.style.opacity = String(clamp01((1 - p) / 0.18))
      }

      if (beforeWrapRef.current) {
        const settle = reduceMotion ? 0 : (1 - p) * 0.05
        beforeWrapRef.current.style.transform = `scale(${1 + settle})`
      }

      if (marqueeRef.current && !reduceMotion) {
        marqueeRef.current.style.transform = `translate3d(${(0.5 - p) * 10}%,0,0)`
      }

      if (afterChipRef.current) {
        afterChipRef.current.style.opacity = String(clamp01((p - 0.04) / 0.2))
      }
      if (beforeChipRef.current) {
        beforeChipRef.current.style.opacity = String(clamp01((0.96 - p) / 0.2))
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${pos.current.scrollProgress})`
      }
    }

    let rafId = 0
    let last = -1
    const loop = () => {
      const s = reduceMotion
        ? 1
        : pos.current.dragging
          ? DEFAULTS.dragSmoothing
          : DEFAULTS.smoothness
      const st = pos.current
      st.current += (st.target - st.current) * s
      if (Math.abs(st.target - st.current) < 0.0005) st.current = st.target
      if (Math.abs(st.current - last) > 0.00005) {
        last = st.current
        apply(st.current)
      }
      rafId = requestAnimationFrame(loop)
    }
    apply(pos.current.current)
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [effectiveStart, endMask, solidAt, reduceMotion])

  /* ------------------- scroll → reveal ------------------- */

  useGSAP(
    () => {
      if (!containerRef.current) return
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          pos.current.scrollProgress = self.progress
          if (pos.current.dragging) return
          if (pos.current.dragHold) {
            if (
              Math.abs(self.progress - pos.current.progressAtDrag) <
              DEFAULTS.releaseDragHold
            )
              return
            pos.current.dragHold = false
          }
          pos.current.target = clamp01(self.progress / revealHoldAt)
        },
      })
      return () => st.kill()
    },
    { scope: containerRef, dependencies: [revealHoldAt] },
  )

  /* ------------------- mouse drag override ------------------- */

  const setFromClientX = useCallback((clientX: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    if (!rect.width) return
    pos.current.target = clamp01((clientX - rect.left) / rect.width)
  }, [])

  // Mouse grabs anywhere; touch never does (so mobile keeps native scroll).
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || e.pointerType !== 'mouse') return
      if (e.button !== 0) return
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      pos.current.dragging = true
      pos.current.progressAtDrag = pos.current.scrollProgress
      setFromClientX(e.clientX)
    },
    [interactive, setFromClientX],
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

  /* ------------------- markup ------------------- */

  // `maskSrc` bypasses the built-in library; only built-ins get an outline,
  // since that's the only case where we know the silhouette.
  const maskImage = maskSrc ?? svgMask(MASK_SHAPES[shape])
  const outlineD = maskSrc ? null : MASK_SHAPES[shape]

  return (
    <section
      ref={containerRef}
      dir="rtl"
      aria-label={title ? `مقایسهٔ قبل و بعد — ${title}` : 'مقایسهٔ قبل و بعد'}
      className={[
        'relative isolate w-full overflow-hidden rounded-[22px]',
        className ?? '',
      ].join(' ')}
      style={{ height: `${effectiveScrollVh}svh` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full select-none overflow-hidden rounded-[22px] bg-[#0b0d0f]"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Typographic backdrop — the v2 HolisticScene layer */}
        {marquee && (
          <div
            ref={marqueeRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex w-max flex-col justify-center whitespace-nowrap will-change-transform"
          >
            {Array.from({ length: marqueeRows }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-8 border-t border-white/10 py-1 text-[11vw] font-light leading-[1.15] tracking-tight md:text-[9vw]"
                style={{
                  color: accent,
                  opacity: 0.28,
                  marginInlineStart: i % 2 ? '-6vw' : '0',
                }}
              >
                <span>{marqueeText}</span>
                <span
                  className="inline-block h-[0.5em] w-[0.5em] shrink-0 rotate-45"
                  style={{ backgroundColor: accent, opacity: 0.5 }}
                />
                <span>{marqueeText}</span>
              </div>
            ))}
          </div>
        )}

        {/* BEFORE — base layer, always full frame */}
        <div
          ref={beforeWrapRef}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={before.src}
            alt={before.alt}
            // fill
            // priority={priority}
            sizes="100vw"
            draggable={false}
            className="object-cover w-full h-full"
            style={{ objectPosition: imgPosition }}
          />
        </div>

        {/* AFTER — clipped by the growing mask */}
        <div
          ref={afterRef}
          className="absolute inset-0 will-change-[mask-size]"
          style={{
            maskImage,
            WebkitMaskImage: maskImage,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: `${effectiveStart}%`,
            WebkitMaskSize: `${effectiveStart}%`,
          }}
        >
          <img
            src={after.src}
            alt={after.alt}
            // fill
            // priority={priority}
            sizes="100vw"
            draggable={false}
            className="object-cover w-full h-full"
            style={{ objectPosition: imgPosition }}
          />
        </div>

        {/* AFTER twin, no mask — fades in over the last stretch so the
            frame always lands 100% on the result, whatever the shape. */}
        <div
          ref={afterSolidRef}
          aria-hidden="true"
          className="absolute inset-0 opacity-0"
        >
          <img
            src={after.src}
            alt=""
            // fill
            // priority={priority}
            sizes="100vw"
            draggable={false}
            className="object-cover w-full h-full"
            style={{ objectPosition: imgPosition }}
          />
        </div>

        {/* Leading edge of the opening — same geometry as the mask */}
        {outline && outlineD && (
          <svg
            ref={outlineRef}
            aria-hidden="true"
            viewBox={`0 0 ${VB} ${VB}`}
            className="pointer-events-none absolute left-1/2 top-1/2 will-change-transform"
            style={{
              width: `${endMask}%`,
              height: 'auto',
              transform: `translate(-50%,-50%) scale(${effectiveStart / endMask})`,
            }}
          >
            <path
              d={outlineD}
              fill="none"
              stroke={accent}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              opacity={0.55}
            />
          </svg>
        )}

        {/* Shared vignette keeps both layers reading as one frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70"
        />

        {/* Chips */}
        <div
          ref={beforeChipRef}
          className="pointer-events-none absolute right-5 top-24 z-20 md:right-12 md:top-28"
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/80 backdrop-blur-md md:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            قبل
          </span>
        </div>
        <div
          ref={afterChipRef}
          className="pointer-events-none absolute left-5 top-24 z-20 opacity-0 md:left-12 md:top-28"
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white backdrop-blur-md md:text-sm">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            بعد
          </span>
        </div>

        {/* Caption */}
        {(title || tags?.length) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 z-40 flex flex-col items-center px-6 text-center md:bottom-24">
            {!!tags?.length && (
              <div className="mb-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 [text-shadow:0_2px_10px_rgba(0,0,0,0.6)] md:mb-6 md:text-sm">
                {tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    {i > 0 && <span className="opacity-50">•</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            {title && (
              <h2
                className="m-0 mb-5 text-[clamp(2.2rem,8vw,6.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] [text-shadow:0_4px_30px_rgba(0,0,0,0.65)] md:mb-7"
                style={{ color: accent }}
              >
                {title}
              </h2>
            )}
            {link && (
              <a
                href={link}
                className="pointer-events-auto border-b-2 pb-2 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-80 md:text-sm"
                style={{ color: accent, borderColor: accent }}
              >
                {linkLabel}
              </a>
            )}
          </div>
        )}

        {/* Hint + progress */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-end justify-between px-5 py-6 text-white md:px-12 md:py-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] opacity-80 md:gap-4 md:text-sm">
            <span className="hidden sm:inline">
              برای دیدن نتیجه اسکرول یا بکشید
            </span>
            <span className="sm:hidden">برای دیدن نتیجه بکشید</span>
            <div className="h-px w-8 animate-pulse bg-current md:w-10" />
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
