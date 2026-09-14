'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

/**
 * /v10 motion primitives.
 *
 * The NERVANA port shipped the scroll-scrubbed timelines (GSAP + sticky
 * stages) but not the *entrance* vocabulary the original leans on between
 * those stages: masked line reveals, word-by-word blur reveals, magnetic
 * buttons, rotating word tickers and marquees. These are ported from the
 * sibling routes that already solved them — `app/v12/components/Reveal.tsx`
 * and `Magnetic.tsx` — and re-authored against the `.v10` CSS scope (this
 * route's Tailwind utilities are nv:-prefixed, so the design system lives in
 * globals.css instead).
 *
 * Persian is cursive, so every split unit is a whole line or a whole word —
 * never a letter — otherwise the joining strokes break mid-word.
 *
 * Reduced motion is handled globally by `MotionConfig reducedMotion="user"`
 * in v10-shell (transforms dropped, opacity kept) plus the static overrides
 * in the `prefers-reduced-motion` block of globals.css. Nothing here branches
 * on `useReducedMotion` during render, because that value is `null` on the
 * server and a boolean on the client — branching on it would desync
 * hydration.
 */

const EASE = [0.16, 1, 0.3, 1] as const

/* --------------------------- Hydration probe --------------------------- */

const subscribeNoop = () => () => {}

/**
 * `false` during SSR and on the first client render, `true` afterwards.
 * The supported alternative to `useState(false)` + `setState(true)` in an
 * effect, which the react-hooks lint rule (correctly) rejects.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

/* ------------------------------- FadeUp -------------------------------- */

export function FadeUp({
  children,
  delay = 0,
  y = 40,
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      className={`fade-up ${className}`}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* ----------------------------- LineReveal ------------------------------ */
/* Masked slide-up for one line of display type. The outer span clips, the
   inner span travels from 112% with a small rotate so it reads as a wipe. */

export function LineReveal({
  children,
  delay = 0,
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  className?: string
  once?: boolean
}) {
  return (
    <span className={`line-reveal ${className}`}>
      <motion.span
        className="line-reveal-inner"
        initial={{ y: '112%', rotate: 2.5 }}
        whileInView={{ y: '0%', rotate: 0 }}
        viewport={{ once, margin: '-10% 0px' }}
        transition={{ duration: 0.95, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* ----------------------------- WordReveal ------------------------------ */
/* Word-by-word stagger with a blur lift — the original's paragraph reveal. */

const wordContainer: Variants = {
  hidden: {},
  visible: (stagger: number = 0.045) => ({
    transition: { staggerChildren: stagger },
  }),
}

const wordChild: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE },
  },
}

export function WordReveal({
  text,
  className = '',
  stagger = 0.045,
  once = true,
}: {
  text: string
  className?: string
  stagger?: number
  once?: boolean
}) {
  const words = text.split(' ')
  return (
    <motion.span
      className={className}
      variants={wordContainer}
      custom={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-15% 0px' }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordChild} className="word-reveal-unit" aria-hidden>
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  )
}

/* ------------------------------ Magnetic ------------------------------- */
/* Pointer-magnetised wrapper for CTAs — the button leans toward the cursor
   and springs back on leave. Disabled for touch and reduced-motion. */

export function Magnetic({
  children,
  strength = 0.3,
  className = '',
  cursor,
}: {
  children: ReactNode
  strength?: number
  className?: string
  /** Sets `data-cursor` on the wrapper so the custom cursor reacts to it. */
  cursor?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  function onMove(event: React.MouseEvent) {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    setPos({
      x: (event.clientX - (left + width / 2)) * strength,
      y: (event.clientY - (top + height / 2)) * strength,
    })
  }

  return (
    <motion.span
      ref={ref}
      className={`magnetic ${className}`}
      data-cursor={cursor}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 190, damping: 16, mass: 0.22 }}
    >
      {children}
    </motion.span>
  )
}

/* ---------------------------- RotatingText ----------------------------- */
/* Cycles one word at a time inside a fixed-height mask — the original's
   "Improving Pain Management" ticker in the hero. The full list is exposed
   to assistive tech through the wrapper's aria-label. */

export function RotatingText({
  words,
  interval = 2200,
  className = '',
}: {
  words: string[]
  interval?: number
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || words.length < 2) return
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      interval,
    )
    return () => window.clearInterval(id)
  }, [interval, reduced, words.length])

  return (
    <span className={`rotating-text ${className}`} aria-label={words.join('، ')}>
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="rotating-text-word"
          aria-hidden
          initial={false}
          animate={
            i === index
              ? { y: '0%', opacity: 1, filter: 'blur(0px)' }
              : { y: i < index ? '-105%' : '105%', opacity: 0, filter: 'blur(5px)' }
          }
          transition={{ duration: 0.7, ease: EASE }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

/* ------------------------------ Marquee -------------------------------- */
/* CSS-driven infinite strip (no JS per frame). The content is rendered
   twice so a 50% translate loops seamlessly; direction flips via
   `animationDirection` for mirrored rows. */

export function Marquee({
  children,
  speed = 38,
  reverse = false,
  className = '',
}: {
  children: ReactNode
  speed?: number
  reverse?: boolean
  className?: string
}) {
  return (
    <div className={`v10-marquee ${className}`} aria-hidden="true">
      <div
        className="v10-marquee-track"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        <div className="v10-marquee-group">{children}</div>
        <div className="v10-marquee-group">{children}</div>
      </div>
    </div>
  )
}

/* --------------------------- CountUp number ---------------------------- */
/* Persian-digit counter that animates once when scrolled into view. The
   rendered value starts at the target so SSR/HTML carries the real number;
   the count-up only begins once the element is actually on screen. */

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const toFa = (input: string | number) =>
  String(input).replace(/\d/g, (d) => faDigits[Number(d)])

export function CountUp({
  value,
  duration = 1400,
  className = '',
}: {
  value: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  const reduced = useReducedMotion()

  useEffect(() => {
    const target = Number(value.replace(/[^\d]/g, ''))
    if (reduced || !Number.isFinite(target) || target === 0) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let start = 0
    let running = false

    const step = (time: number) => {
      if (!start) start = time
      const progress = Math.min((time - start) / duration, 1)
      // easeOutExpo, matching the site's reveal easing family.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplay(toFa(Math.round(target * eased)))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !running) {
          running = true
          raf = requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [duration, reduced, value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
