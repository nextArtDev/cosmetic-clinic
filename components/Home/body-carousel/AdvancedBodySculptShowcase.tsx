'use client'

/* ============================================================================
   BodySculptShowcase — v5
   Fixes:
   1. SCALE MISMATCH: the blurred base no longer uses scale-[1.07]; both the
      blurred layer and the sharp shield window now render the image at the
      SAME 1:1 scale, so body parts inside/outside the shield match exactly.
      The blur edge-fringe is hidden by the vignette + inset edge shadow.
   2. RESPONSIVENESS:
      • card + root are CSS containers → all inner typography/sizes use cqi
        (container-query) units instead of vw, so the component adapts to ANY
        column width, not just the viewport.
      • card width also capped by viewport height (min(640px, 92svh * 3/4)).
      • shield radius now scales with the card (cqi units).
      • on mobile the before/after panel docks centered under the shield and
        pointer lines/dots hide; desktop keeps the side layout.
      • chips row gets edge fade + snap scrolling.
============================================================================ */

import { motion, AnimatePresence, useInView, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/* ------------------------------- types ------------------------------- */

export interface ShieldGeometry {
  left: number
  top: number
  width: number
  height: number
  /** corner radius in cqi (1cqi = 1% of card width) → scales responsively */
  radius: number
}
export interface ShieldLine {
  x1: number
  y1: number
  x2: number
  y2: number
  origin?: 'left' | 'right' | 'top' | 'bottom'
}
export interface ShieldDot {
  x: number
  y: number
}

export interface SurgerySlide {
  id: string
  title: string
  subtitle?: string
  imageSrc?: string // optional per-slide main image
  beforeImage?: string
  afterImage?: string
  panelClassName?: string // desktop position of the before/after panel
  lines?: ShieldLine[]
  dots?: ShieldDot[]
  shield: ShieldGeometry
  menuSide: 'left' | 'right'
}

export interface BodySculptShowcaseProps {
  imageSrc: string
  imageAlt?: string
  slides: SurgerySlide[]
  autoplayMs?: number
  idleResumeMs?: number
  className?: string
}

/* ----------------------------- constants ----------------------------- */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const MORPH: [number, number, number, number] = [0.65, 0, 0.35, 1]
const MORPH_S = 0.9
const A_PANEL = MORPH_S + 0.05
const A_LINE = MORPH_S + 0.2
const A_DOT = MORPH_S + 0.55
const VIEWPORT = { once: true, amount: 0.25 }

const clipFrom = (s: ShieldGeometry) =>
  `inset(${s.top}% ${100 - s.left - s.width}% ${100 - s.top - s.height}% ${s.left}% round ${s.radius}cqi)`

function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>(undefined)
  // adjust-during-render: React discards this output and re-renders before committing
  if (previous !== value) {
    setPrevious(value)
  }
  return previous
}

/* ------------------------------- pieces ------------------------------- */

function PointerLine({ line, delay }: { line: ShieldLine; delay: number }) {
  const horizontal = line.y1 === line.y2
  const style: CSSProperties = horizontal
    ? {
        left: `${line.x1}%`,
        top: `${line.y1}%`,
        width: `${line.x2 - line.x1}%`,
        height: 1,
        transformOrigin: line.origin === 'right' ? '100% 50%' : '0% 50%',
      }
    : {
        left: `${line.x1}%`,
        top: `${line.y1}%`,
        width: 1,
        height: `${line.y2 - line.y1}%`,
        transformOrigin: '50% 0%',
      }
  return (
    <motion.span
      aria-hidden
      initial={horizontal ? { scaleX: 0 } : { scaleY: 0 }}
      animate={horizontal ? { scaleX: 1 } : { scaleY: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className="absolute bg-white/80 max-md:hidden"
      style={style}
    />
  )
}

function PointerDot({ dot, delay }: { dot: ShieldDot; delay: number }) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay, duration: 0.45, ease: 'backOut' }}
      className="absolute h-[9px] w-[9px] rounded-full border-2 border-white bg-[#2a150c]/50 shadow-[0_0_8px_rgba(255,255,255,0.55)] max-md:hidden"
      style={{ left: `${dot.x}%`, top: `${dot.y}%`, x: '-50%', y: '-50%' }}
    />
  )
}

function BeforeAfterPanel({
  slide,
  delay,
}: {
  slide: SurgerySlide
  delay: number
}) {
  const items = [
    { src: slide.beforeImage, label: 'Before' },
    { src: slide.afterImage, label: 'After' },
  ].filter((x): x is { src: string; label: string } => !!x.src)
  if (items.length === 0) return null
  return (
    /* static positioning wrapper (responsive), motion on the inside */
    <div
      className={`absolute ${slide.panelClassName ?? 'left-[68%] top-[8%]'} max-md:left-1/2 max-md:top-[58%] max-md:-translate-x-1/2`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        transition={{ delay, duration: 0.6, ease: EASE }}
        className="flex gap-2"
      >
        {items.map((it) => (
          <figure key={it.label} className="m-0">
            <img
              src={it.src}
              alt={it.label}
              draggable={false}
              className="h-[clamp(44px,12cqi,78px)] w-[clamp(44px,12cqi,78px)] rounded-[1.8cqi] border border-white/50 object-cover shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
            />
            <figcaption className="mt-1 text-center text-[clamp(7px,1.8cqi,10px)] uppercase tracking-[0.2em] text-white/75">
              {it.label}
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  )
}

/* ------------------------------ component ------------------------------ */

export function BodySculptShowcase({
  imageSrc,
  imageAlt = '',
  slides,
  autoplayMs = 5200,
  idleResumeMs = 8000,
  className = '',
}: BodySculptShowcaseProps) {
  const [[index], setIndex] = useState<[number, number]>([0, 1])
  const [autoActive, setAutoActive] = useState(true)
  const [hoverPaused, setHoverPaused] = useState(false)
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, VIEWPORT)

  const slide = slides[index]
  const effectiveSrc = slide.imageSrc ?? imageSrc
  const prevSlide = usePrevious(slide)
  const prevClip = clipFrom((prevSlide ?? slide).shield)

  const poke = useCallback(() => {
    setAutoActive(false)
    if (idleRef.current) clearTimeout(idleRef.current)
    idleRef.current = setTimeout(() => setAutoActive(true), idleResumeMs)
  }, [idleResumeMs])

  const select = useCallback(
    (i: number) => {
      if (i === index) return
      setIndex(([cur]) => [i, i > cur ? 1 : -1])
      poke()
    },
    [index, poke],
  )

  const go = useCallback(
    (dir: number) =>
      setIndex(([i]) => [(i + dir + slides.length) % slides.length, dir]),
    [slides.length],
  )

  useEffect(() => {
    if (!autoActive || hoverPaused || !inView) return
    const t = setInterval(() => go(1), autoplayMs)
    return () => clearInterval(t)
  }, [autoActive, hoverPaused, inView, autoplayMs, go, index])

  useEffect(
    () => () => {
      if (idleRef.current) clearTimeout(idleRef.current)
    },
    [],
  )

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -60) {
      go(1)
      poke()
    }
    if (info.offset.x > 60) {
      go(-1)
      poke()
    }
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      go(1)
      poke()
    }
    if (e.key === 'ArrowLeft') {
      go(-1)
      poke()
    }
  }

  const leftSlides = slides
    .map((s, i) => ({ s, i }))
    .filter((x) => x.s.menuSide === 'left')
  const rightSlides = slides
    .map((s, i) => ({ s, i }))
    .filter((x) => x.s.menuSide === 'right')

  const MenuButton = ({
    s,
    i,
    side,
  }: {
    s: SurgerySlide
    i: number
    side: 'left' | 'right'
  }) => {
    const active = i === index
    return (
      <button
        onClick={() => select(i)}
        className={`group flex w-full items-center gap-2 outline-none ${side === 'left' ? 'justify-end text-right' : 'justify-start text-left'}`}
      >
        {side === 'left' && (
          <>
            <span
              className={`hidden text-[clamp(8px,1cqi,11px)] tracking-[0.2em] transition lg:block ${active ? 'text-white/80' : 'text-white/30'}`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`truncate text-[clamp(10px,1.4cqi,15px)] uppercase leading-tight tracking-[0.12em] transition ${active ? 'text-white' : 'text-white/40 group-hover:text-white/75'}`}
            >
              {s.title}
            </span>
            <span
              className={`h-[5px] w-[5px] shrink-0 rounded-full transition ${active ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`}
            />
            <span
              className={`h-px shrink-0 transition-all duration-500 ${active ? 'w-7 bg-white' : 'w-3.5 bg-white/25 group-hover:bg-white/50'}`}
            />
          </>
        )}
        {side === 'right' && (
          <>
            <span
              className={`h-px shrink-0 transition-all duration-500 ${active ? 'w-7 bg-white' : 'w-3.5 bg-white/25 group-hover:bg-white/50'}`}
            />
            <span
              className={`h-[5px] w-[5px] shrink-0 rounded-full transition ${active ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`}
            />
            <span
              className={`truncate text-[clamp(10px,1.4cqi,15px)] uppercase leading-tight tracking-[0.12em] transition ${active ? 'text-white' : 'text-white/40 group-hover:text-white/75'}`}
            >
              {s.title}
            </span>
            <span
              className={`hidden text-[clamp(8px,1cqi,11px)] tracking-[0.2em] transition lg:block ${active ? 'text-white/80' : 'text-white/30'}`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          </>
        )}
      </button>
    )
  }

  return (
    <div
      ref={rootRef}
      className={`flex w-full max-w-[1120px] flex-col items-center gap-5 ${className}`}
      style={
        {
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          containerType: 'inline-size',
        } as CSSProperties
      }
    >
      <div className="flex w-full items-stretch justify-center gap-3 lg:gap-8">
        {/* left case list */}
        <nav
          className="hidden w-[clamp(140px,20cqi,230px)] shrink-0 flex-col justify-between py-[6%] md:flex"
          aria-label="Procedures left"
        >
          {leftSlides.map(({ s, i }) => (
            <MenuButton key={s.id} s={s} i={i} side="left" />
          ))}
        </nav>

        {/* the card — also a container so inner sizes use cqi */}
        <div
          tabIndex={0}
          onKeyDown={onKey}
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          className="relative w-full max-w-[min(640px,calc(92svh*0.75))] select-none overflow-hidden rounded-[22px] bg-[#14100d] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.9)] outline-none"
          style={
            {
              aspectRatio: '3 / 4',
              containerType: 'inline-size',
            } as CSSProperties
          }
        >
          {/* crossfading scenes — BOTH layers at identical 1:1 scale */}
          {inView && (
            <AnimatePresence initial={true}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.45 } }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <img
                  src={effectiveSrc}
                  alt={imageAlt}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover blur-[7px] brightness-[0.6] saturate-[0.9]"
                />
                <motion.img
                  src={effectiveSrc}
                  alt={imageAlt}
                  initial={{ clipPath: prevClip }}
                  animate={{ clipPath: clipFrom(slide.shield) }}
                  transition={{ duration: MORPH_S, ease: MORPH }}
                  className="absolute inset-0 h-full w-full object-cover brightness-[1.02]"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* vignette + inset edge shadow (hides blur fringe, no scaling needed) */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_42%,transparent_38%,rgba(12,5,2,0.45)_75%,rgba(4,1,0,0.8)_100%)]" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(5,2,0,0.85)]" />

          {/* swipe layer + morphing outline + panel/lines/dots */}
          {/* @ts-expect-error — framer-motion drag props on a plain div */}
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
          >
            <motion.div
              aria-hidden
              initial={false}
              animate={{
                left: `${slide.shield.left}%`,
                top: `${slide.shield.top}%`,
                width: `${slide.shield.width}%`,
                height: `${slide.shield.height}%`,
                borderRadius: `${slide.shield.radius}cqi`,
              }}
              transition={{ duration: MORPH_S, ease: MORPH }}
              className="pointer-events-none absolute border border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_0_30px_rgba(255,255,255,0.12)]"
            />

            {inView && (
              <AnimatePresence initial={true}>
                <motion.div
                  key={slide.id}
                  className="pointer-events-none absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                >
                  <BeforeAfterPanel slide={slide} delay={A_PANEL} />
                  {slide.lines?.map((l, i) => (
                    <PointerLine key={`l${i}`} line={l} delay={A_LINE} />
                  ))}
                  {slide.dots?.map((d, i) => (
                    <PointerDot key={`d${i}`} dot={d} delay={A_DOT} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* counter + autoplay state */}
          <div className="absolute right-[4%] top-[3%] z-20 flex items-center gap-2 text-[clamp(9px,2.2cqi,13px)] tracking-[0.2em] text-white/70">
            <span
              className={`h-[6px] w-[6px] rounded-full ${autoActive ? 'animate-pulse bg-white' : 'bg-white/30'}`}
            />
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(slides.length).padStart(2, '0')}
          </div>

          {/* morphing title */}
          <div className="pointer-events-none absolute inset-x-0 top-[75%] md:top-[84%] z-20">
            <div className="relative h-[clamp(44px,15cqi,80px)] w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 24, letterSpacing: '0.18em' }}
                  animate={{ opacity: 1, y: 0, letterSpacing: '0.06em' }}
                  exit={{ opacity: 0, y: -16, transition: { duration: 0.22 } }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="absolute inset-x-0 top-0 px-3 text-center"
                >
                  <h2 className="truncate text-[clamp(20px,7.2cqi,46px)] font-medium uppercase text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-1 truncate text-[clamp(9px,2.6cqi,16px)] italic text-white/75">
                      {slide.subtitle}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* right case list */}
        <nav
          className="hidden w-[clamp(140px,20cqi,230px)] shrink-0 flex-col justify-between py-[6%] md:flex"
          aria-label="Procedures right"
        >
          {rightSlides.map(({ s, i }) => (
            <MenuButton key={s.id} s={s} i={i} side="right" />
          ))}
        </nav>
      </div>

      {/* mobile case chips */}
      <nav
        className="flex w-full max-w-[640px] snap-x snap-mandatory gap-2 overflow-x-auto pb-2 md:hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] [scrollbar-width:none]"
        aria-label="Procedures"
      >
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => select(i)}
            className={`shrink-0 snap-center whitespace-nowrap rounded-full border px-4 py-1.5 text-[12px] uppercase tracking-[0.12em] transition ${
              i === index
                ? 'border-white bg-white text-[#1a0f0a]'
                : 'border-white/25 text-white/60'
            }`}
          >
            {s.title}
          </button>
        ))}
      </nav>
    </div>
  )
}
