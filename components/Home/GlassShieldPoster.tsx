'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

/* ============================================================================
   GlassShieldShowcase — standalone Next.js + TS + framer-motion component.
   • The "glass shield" (sharp rounded-rect window over a blurred/dimmed copy
     of the SAME image) is built-in; its geometry can be overridden via the
     optional `shield` prop (Partial, merged with defaults).
   • All entrance animations use whileInView (once).
   • `handle`, `badge`, `title` are optional — omitted props are not rendered.
============================================================================ */

export interface ShieldGeometry {
  left: number // % from left
  top: number // % from top
  width: number // % of container width
  height: number // % of container height
  radius: number // px corner radius
}

export interface ShieldLine {
  x1: number // % from left
  y1: number // % from top
  x2: number
  y2: number
  origin?: 'left' | 'right' | 'top' | 'bottom'
}

export interface ShieldDot {
  x: number // %
  y: number // %
}

export interface ShieldAnnotation {
  id: string
  text: string // use \n for line breaks
  textClassName?: string // tailwind classes for the text block
  lines?: ShieldLine[]
  dots?: ShieldDot[]
  delay?: number
}

export interface GlassShieldShowcaseProps {
  imageSrc: string
  imageAlt?: string
  /** optional — top pill, hidden when omitted */
  handle?: string
  /** optional — boxed badge, hidden when omitted */
  badge?: string
  /** optional — big bottom title, hidden when omitted */
  title?: string
  annotations?: ShieldAnnotation[]
  /** optional — override any shield geometry value */
  shield?: Partial<ShieldGeometry>
  className?: string
}

/* ------------------------------ constants ------------------------------ */

const DEFAULT_SHIELD: ShieldGeometry = {
  left: 25,
  top: 27,
  width: 46.2,
  height: 33.8,
  radius: 48,
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const VIEWPORT = { once: true, amount: 0.35 }

const DEFAULT_ANNOTATIONS: ShieldAnnotation[] = [
  {
    id: 'contour',
    text: 'آبرسانی و\nبرجسته‌سازی\nخط لب',
    textClassName: 'left-[4.5%] top-[37%] w-[24%] text-left',
    lines: [{ x1: 5, y1: 51, x2: 41, y2: 51, origin: 'left' }],
    dots: [{ x: 5, y: 51 }],
    delay: 0.7,
  },
  {
    id: 'volume',
    text: 'حجم‌دهی\nبه اندازهٔ کافی',
    textClassName: 'left-[73.5%] top-[36.5%] w-[23%] text-left',
    lines: [{ x1: 61, y1: 45.5, x2: 95, y2: 45.5, origin: 'right' }],
    dots: [{ x: 95, y: 45.5 }],
    delay: 0.95,
  },
  {
    id: 'symmetry',
    text: 'متقارن‌تر،\nهماهنگ‌تر از همیشه',
    textClassName: 'left-[26%] top-[65.5%] w-[30%] text-center',
    lines: [{ x1: 57.6, y1: 58, x2: 57.6, y2: 68, origin: 'top' }],
    dots: [{ x: 57.6, y: 68 }],
    delay: 1.2,
  },
]

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
      whileInView={horizontal ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={VIEWPORT}
      transition={{ delay, duration: 0.7, ease: EASE }}
      className="absolute bg-white/80"
      style={style}
    />
  )
}

function PointerDot({ dot, delay }: { dot: ShieldDot; delay: number }) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={VIEWPORT}
      transition={{ delay, duration: 0.45, ease: 'backOut' }}
      className="absolute h-[9px] w-[9px] rounded-full border-2 border-white bg-[#2a150c]/50 shadow-[0_0_8px_rgba(255,255,255,0.55)]"
      style={{ left: `${dot.x}%`, top: `${dot.y}%`, x: '-50%', y: '-50%' }}
    />
  )
}

function Sparkle({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      whileInView={{ scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
      viewport={VIEWPORT}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z" />
    </motion.svg>
  )
}

/* ------------------------------ component ------------------------------ */

export function GlassShieldShowcase({
  imageSrc,
  imageAlt = '',
  handle,
  badge,
  title,
  annotations = DEFAULT_ANNOTATIONS,
  shield,
  className = '',
}: GlassShieldShowcaseProps) {
  const s: ShieldGeometry = { ...DEFAULT_SHIELD, ...shield }
  const shieldClip = `inset(${s.top}% ${100 - s.left - s.width}% ${
    100 - s.top - s.height
  }% ${s.left}% round ${s.radius}px)`

  return (
    <div
      className={`relative w-full max-w-[640px] select-none overflow-hidden rounded-[22px] bg-[#160c07] shadow-[0_40px_90px_-25px_rgba(0,0,0,0.9)] ${className}`}
      style={{
        aspectRatio: '3 / 4',
        fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
      }}
    >
      {/* 1 — blurred + dimmed base layer (the "glass" area) */}
      <motion.img
        src={imageSrc}
        alt={imageAlt}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="absolute inset-0 h-full w-full scale-[1.07] object-cover blur-[7px] brightness-[0.55] saturate-[0.9]"
        draggable={false}
      />

      {/* warm vignette over the blurred zone only */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_42%,transparent_38%,rgba(12,5,2,0.5)_75%,rgba(4,1,0,0.85)_100%)]" />

      {/* 2 — sharp layer, clipped to the shield window */}
      <motion.img
        src={imageSrc}
        alt={imageAlt}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
        className="absolute inset-0 h-full w-full object-cover brightness-[1.02]"
        style={{ clipPath: shieldClip }}
        draggable={false}
      />

      {/* constant thin outline of the shield */}
      <div
        aria-hidden
        className="pointer-events-none absolute border border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_0_30px_rgba(255,255,255,0.12)]"
        style={{
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: `${s.width}%`,
          height: `${s.height}%`,
          borderRadius: s.radius,
        }}
      />

      {/* ------------------------- annotations ------------------------- */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {annotations.map((a) => (
          <div key={a.id} className="absolute inset-0">
            {a.lines?.map((l, i) => (
              <PointerLine
                key={`l${i}`}
                line={l}
                delay={(a.delay ?? 0.8) + 0.15}
              />
            ))}
            {a.dots?.map((d, i) => (
              <PointerDot
                key={`d${i}`}
                dot={d}
                delay={(a.delay ?? 0.8) + 0.5}
              />
            ))}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ delay: a.delay ?? 0.8, duration: 0.8, ease: EASE }}
              className={`absolute whitespace-pre-line text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] text-[clamp(15px,3.6vw,22px)] leading-[1.15] ${
                a.textClassName ?? ''
              }`}
            >
              {a.text}
            </motion.p>
          </div>
        ))}
      </div>

      {/* ------------------------- handle (optional) ------------------------- */}
      {handle && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
          className="absolute left-1/2 top-[6.8%] z-10"
          style={{ x: '-50%' }}
        >
          <span className="block whitespace-nowrap rounded-full border border-white/80 px-5 py-1.5 text-[clamp(12px,2.6vw,15px)] tracking-[0.04em] text-white/95">
            {handle}
          </span>
        </motion.div>
      )}

      {/* ------------------------- badge (optional) ------------------------- */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VIEWPORT}
          transition={{ delay: 1.5, duration: 0.7, ease: EASE }}
          className="absolute left-1/2 top-[78.4%] z-10"
          style={{ x: '-50%' }}
        >
          <div className="relative border border-white/90 px-7 py-1.5 text-[clamp(14px,3.2vw,20px)] tracking-[0.22em] text-white">
            {badge}
            <Sparkle className="absolute -right-2.5 -top-3 h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
          </div>
        </motion.div>
      )}

      {/* ------------------------- title (optional) ------------------------- */}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 22, letterSpacing: '0.2em' }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: '0.08em' }}
          viewport={VIEWPORT}
          transition={{ delay: 1.7, duration: 1, ease: EASE }}
          className="absolute inset-x-0 top-[84.8%] z-10 text-center text-[clamp(30px,9.2vw,58px)] font-medium text-balance text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]"
        >
          {title}
        </motion.h2>
      )}
    </div>
  )
}
