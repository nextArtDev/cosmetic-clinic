'use client'

/* ============================================================================
   YES — fully possible & responsive.
   The shield is just percentage-based geometry + an animatable clip-path, so
   both the shield window and the annotations can MORPH from one body part to
   the next on the same image. Everything is %-positioned, so it scales with
   the container (responsive by design).

   BodySculptShowcase:
   • one constant blurred image + one sharp layer whose clip-path morphs
   • shield outline (motion.div) morphs left/top/width/height/radius
   • annotations (text + lines + dots) crossfade per slide via AnimatePresence
   • arrows / dots / keyboard / swipe / autoplay
   • initial entrance still uses whileInView; slide morphs are state-driven
============================================================================ */

import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

/* ------------------------------- types ------------------------------- */

export interface ShieldGeometry {
  left: number // % from left
  top: number // % from top
  width: number // % of width
  height: number // % of height
  radius: number // px
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
  annotation: string // \n for breaks
  textClassName?: string
  lines?: ShieldLine[]
  dots?: ShieldDot[]
  shield: ShieldGeometry
}

export interface BodySculptShowcaseProps {
  imageSrc: string
  imageAlt?: string
  slides: SurgerySlide[]
  handle?: string // optional pill
  badge?: string // optional boxed badge
  autoplayMs?: number // 0 = off
  className?: string
}

/* ----------------------------- constants ----------------------------- */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const MORPH: [number, number, number, number] = [0.65, 0, 0.35, 1]
const VIEWPORT = { once: true, amount: 0.3 }

const clipFrom = (s: ShieldGeometry) =>
  `inset(${s.top}% ${100 - s.left - s.width}% ${100 - s.top - s.height}% ${s.left}% round ${s.radius}px)`

/* ------------------------------- pieces ------------------------------- */

function PointerLine({ line, exit }: { line: ShieldLine; exit: boolean }) {
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
      initial={
        horizontal ? { scaleX: 0, opacity: 1 } : { scaleY: 0, opacity: 1 }
      }
      animate={
        horizontal ? { scaleX: 1, opacity: 1 } : { scaleY: 1, opacity: 1 }
      }
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.7, ease: EASE, delay: exit ? 0 : 0.25 }}
      className="absolute bg-white/80"
      style={style}
    />
  )
}

function PointerDot({ dot }: { dot: ShieldDot }) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ delay: 0.6, duration: 0.45, ease: 'backOut' }}
      className="absolute h-[9px] w-[9px] rounded-full border-2 border-white bg-[#2a150c]/50 shadow-[0_0_8px_rgba(255,255,255,0.55)]"
      style={{ left: `${dot.x}%`, top: `${dot.y}%`, x: '-50%', y: '-50%' }}
    />
  )
}

/* ------------------------------ component ------------------------------ */

export function BodySculptShowcase({
  imageSrc,
  imageAlt = '',
  slides,
  handle,
  badge = 'TEAM',
  autoplayMs = 5200,
  className = '',
}: BodySculptShowcaseProps) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 1])
  const [paused, setPaused] = useState(false)
  const slide = slides[index]

  const go = useCallback(
    (dir: number) =>
      setIndex(([i]) => [(i + dir + slides.length) % slides.length, dir]),
    [slides.length],
  )

  /* autoplay */
  useEffect(() => {
    if (!autoplayMs || paused) return
    const t = setInterval(() => go(1), autoplayMs)
    return () => clearInterval(t)
  }, [autoplayMs, paused, go, index])

  /* keyboard */
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }

  /* swipe */
  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -60) go(1)
    if (info.offset.x > 60) go(-1)
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`relative w-full max-w-[680px] select-none overflow-hidden rounded-[22px] bg-[#14100d] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.9)] outline-none ${className}`}
      style={{
        aspectRatio: '3 / 4',
        fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
      }}
    >
      {/* 1 — constant blurred base */}
      <motion.img
        src={imageSrc}
        alt={imageAlt}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full scale-[1.07] object-cover blur-[7px] brightness-[0.6] saturate-[0.9]"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_42%,transparent_38%,rgba(12,5,2,0.45)_75%,rgba(4,1,0,0.8)_100%)]" />

      {/* 2 — sharp layer with MORPHING clip-path window */}
      {/* @ts-expect-error — framer-motion drag props on a plain div */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
      >
        <motion.img
          src={imageSrc}
          alt={imageAlt}
          initial={false}
          animate={{ clipPath: clipFrom(slide.shield) }}
          transition={{ duration: 0.9, ease: MORPH }}
          className="absolute inset-0 h-full w-full object-cover brightness-[1.02]"
          draggable={false}
        />

        {/* morphing shield outline */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{
            left: `${slide.shield.left}%`,
            top: `${slide.shield.top}%`,
            width: `${slide.shield.width}%`,
            height: `${slide.shield.height}%`,
            borderRadius: slide.shield.radius,
          }}
          transition={{ duration: 0.9, ease: MORPH }}
          className="pointer-events-none absolute border border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_0_30px_rgba(255,255,255,0.12)]"
        />

        {/* morphing annotations */}
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            {slide.lines?.map((l, i) => (
              <PointerLine key={`l${i}`} line={l} exit={false} />
            ))}
            {slide.dots?.map((d, i) => (
              <PointerDot key={`d${i}`} dot={d} />
            ))}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
              transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
              className={`absolute whitespace-pre-line text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] text-[clamp(13px,3.2vw,21px)] leading-[1.15] ${slide.textClassName ?? ''}`}
            >
              {slide.annotation}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* counter */}
      <div className="absolute right-[4%] top-[3%] z-20 text-[clamp(11px,2.4vw,14px)] tracking-[0.2em] text-white/70">
        {String(index + 1).padStart(2, '0')} /{' '}
        {String(slides.length).padStart(2, '0')}
      </div>

      {/* optional handle pill */}
      {handle && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
          className="absolute left-1/2 top-[3%] z-20"
          style={{ x: '-50%' }}
        >
          <span className="block whitespace-nowrap rounded-full border border-white/80 px-5 py-1.5 text-[clamp(11px,2.6vw,15px)] tracking-[0.04em] text-white/95">
            {handle}
          </span>
        </motion.div>
      )}

      {/* arrows */}
      {(['prev', 'next'] as const).map((dir) => (
        <motion.button
          key={dir}
          whileInView={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.5, duration: 0.6 }}
          onClick={() => go(dir === 'next' ? 1 : -1)}
          aria-label={dir === 'next' ? 'Next procedure' : 'Previous procedure'}
          className={`absolute top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/30 text-white/90 backdrop-blur-sm transition hover:bg-black/55 md:h-11 md:w-11 ${
            dir === 'next' ? 'right-3 md:right-4' : 'left-3 md:left-4'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            {dir === 'next' ? (
              <path d="M9 5l7 7-7 7" />
            ) : (
              <path d="M15 5l-7 7 7 7" />
            )}
          </svg>
        </motion.button>
      ))}

      {/* bottom: badge + morphing title */}
      <div className="pointer-events-none absolute inset-x-0 top-[80.5%] z-20 flex flex-col items-center gap-3">
        {badge && (
          <div className="border border-white/90 px-6 py-1 text-[clamp(12px,3vw,19px)] tracking-[0.22em] text-white">
            {badge}
          </div>
        )}
        <div className="relative h-[clamp(52px,12vw,86px)] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24, letterSpacing: '0.18em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.06em' }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
              transition={{ duration: 0.7, ease: EASE }}
              className="absolute inset-x-0 top-0 text-center"
            >
              <h2 className="text-[clamp(24px,7.4vw,50px)] font-medium uppercase text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-1 text-[clamp(11px,2.8vw,17px)] italic text-white/75">
                  {slide.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* dots */}
      <div className="absolute inset-x-0 bottom-[2%] z-30 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            aria-label={`Go to ${s.title}`}
            className={`h-[6px] rounded-full transition-all duration-500 ${
              i === index
                ? 'w-7 bg-white'
                : 'w-[6px] bg-white/35 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
