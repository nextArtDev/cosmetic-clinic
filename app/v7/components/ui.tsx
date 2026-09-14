'use client'

import {
  Fragment,
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { X } from 'lucide-react'
import { getLenis } from '../lib/lenis'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * `useReducedMotion` resolves from `matchMedia` during the very first client
 * render, so it already disagrees with the server (where `matchMedia` is
 * absent and the value stays false). Every place it feeds into render output —
 * an `initial` prop (framer bakes those into the SSR style attribute), a
 * className, a branch — then trips hydration.
 *
 * `useSyncExternalStore` is the sanctioned way to read a client-only value:
 * React is required to use `getServerSnapshot` for both the server render and
 * hydration, so the markup always agrees, and it swaps to the client snapshot
 * in the same commit as hydration with no extra render. Effects that only read
 * the preference at runtime can keep calling `useReducedMotion` directly.
 */
const subscribeHydration = () => () => {}
const getHydrated = () => true
const getServerHydrated = () => false

export function useReducedMotionSettled() {
  const prefersReducedMotion = useReducedMotion()
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrated,
    getServerHydrated,
  )
  return hydrated && !!prefersReducedMotion
}

export function Logo({ className = '' }: { className?: string }) {
  return <span className={`wordmark ${className}`}>حسینی</span>
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reducedMotion = useReducedMotionSettled()
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Line-mask text reveal — the reference site's data-reveal="title"/"text":
 * content slides up from inside an overflow-hidden mask. Persian
 * descenders are protected by the mask's negative-margin padding.
 * Pass `play` to drive it from the preloader instead of scroll position.
 */
export function MaskReveal({
  children,
  className = '',
  delay = 0,
  play,
}: {
  children: ReactNode
  className?: string
  delay?: number
  play?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reducedMotion = useReducedMotionSettled()
  const show = play !== undefined ? play : inView
  return (
    <div ref={ref} className={`mask-reveal ${className}`}>
      <motion.span
        className="mask-reveal__inner"
        initial={reducedMotion ? false : { y: '115%' }}
        animate={show || reducedMotion ? { y: '0%' } : { y: '115%' }}
        transition={{ duration: 1.05, ease, delay: show ? delay : 0 }}
      >
        {children}
      </motion.span>
    </div>
  )
}

/**
 * Image reveal — the reference's image-zoom-in / image-parallax-in:
 * the photo settles from a slight zoom and soft inset clip as it enters.
 */
export function ImageReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reducedMotion = useReducedMotionSettled()
  return (
    <motion.div
      ref={ref}
      className={`v7-image-reveal ${className}`}
      initial={
        reducedMotion
          ? false
          : { opacity: 0, scale: 1.07, clipPath: 'inset(6% 5% 6% 5%)' }
      }
      animate={
        inView || reducedMotion
          ? { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }
          : { opacity: 0, scale: 1.07, clipPath: 'inset(6% 5% 6% 5%)' }
      }
      transition={{ duration: 1.15, ease, delay: inView ? delay : 0 }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scroll parallax — the reference's data-plugin="parallax" drifts content
 * between +d and -d across the viewport traversal, optionally settling a
 * scale (parallax-image-scale 1.11→1) or drifting horizontally
 * (parallax-image-move--horizontal). Clamped and spring-free (direct
 * mapping keeps it firmly attached to the scrollbar).
 */
export type ParallaxKeyframe = {
  /** Scroll progress stop, 0 → 1 across the element's traversal. */
  at: number
  x?: number
  y?: number
  scale?: number
  opacity?: number
  rotate?: number
}

export function Parallax({
  children,
  className = '',
  distance = 32,
  axis = 'y',
  scale = false,
  keyframes,
}: {
  children: ReactNode
  className?: string
  distance?: number
  axis?: 'x' | 'y'
  scale?: boolean
  /**
   * The reference's `data-parallax-0-20='{"opacity":"0","transform":"scale(0.87)
   * translateY(-5vh)"}'` pattern: an explicit keyframe list mapped onto scroll
   * progress instead of a single linear drift. Stops must ascend.
   */
  keyframes?: ParallaxKeyframe[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotionSettled()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const kf = keyframes && keyframes.length > 1 ? keyframes : null
  const stops = kf ? kf.map((k) => k.at) : [0, 1]
  const xOut = kf
    ? kf.map((k) => k.x ?? 0)
    : axis === 'x'
      ? [-distance * 1.2, distance * 1.2]
      : [0, 0]
  const yOut = kf
    ? kf.map((k) => k.y ?? 0)
    : axis === 'y'
      ? [distance, -distance]
      : [0, 0]
  const sOut = kf
    ? kf.map((k) => k.scale ?? 1)
    : scale
      ? [1.1, 1]
      : axis === 'x'
        ? [1.08, 1.08]
        : [1, 1]
  const oOut = kf ? kf.map((k) => k.opacity ?? 1) : [1, 1]
  const rOut = kf ? kf.map((k) => k.rotate ?? 0) : [0, 0]
  const x = useTransform(scrollYProgress, stops, xOut)
  const y = useTransform(scrollYProgress, stops, yOut)
  const scaleValue = useTransform(scrollYProgress, stops, sOut)
  const opacity = useTransform(scrollYProgress, stops, oOut)
  const rotate = useTransform(scrollYProgress, stops, rOut)
  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        reducedMotion
          ? undefined
          : { x, y, scale: scaleValue, opacity, rotate, willChange: 'transform, opacity' }
      }
    >
      {children}
    </motion.div>
  )
}

/**
 * svgLength — the reference's outlined buttons draw their rounded-rect
 * stroke on entry and re-draw it on hover. A single `<rect>` with
 * `pathLength="1"` lets the dash maths run in normalised units, so the
 * same rule works for every button size (`.btn--outline .btn__outline
 * rect` in the source). `radius` is in viewBox units (0–100): pass 49
 * for a circle/pill, 0 for a square.
 */
export function DrawOutline({
  className = '',
  radius = 0,
  play,
}: {
  className?: string
  radius?: number
  play?: boolean
}) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reducedMotion = useReducedMotionSettled()
  const show = play !== undefined ? play : inView
  return (
    <svg
      ref={ref}
      className={`v7-outline-svg ${show || reducedMotion ? 'is-drawn' : ''} ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="99"
        height="99"
        rx={radius}
        ry={radius}
        pathLength={1}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        className="v7-outline-svg__echo"
        x="0.5"
        y="0.5"
        width="99"
        height="99"
        rx={radius}
        ry={radius}
        pathLength={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/**
 * text--animation — the reference's line/word rise. Each word starts
 * below its own mask at `translateY(230%) rotate(-2deg) scale(1.47)`
 * and settles with a long 2.4s ease. Split by WORD, never by character:
 * Persian is a connected script and per-char spans break the joining.
 * `\n` starts a new masked line.
 */
export function SplitText({
  text,
  className = '',
  delay = 0,
  stagger = 0.07,
  play,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  play?: boolean
  as?: 'span' | 'p' | 'div'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reducedMotion = useReducedMotionSettled()
  const show = play !== undefined ? play : inView
  const lines = text.split('\n')
  let order = 0
  return (
    <Tag ref={ref as never} className={`v7-split ${className}`}>
      {lines.map((line, lineIndex) => (
        <span className="v7-split__line" key={lineIndex}>
          {line.split(' ').map((word, wordIndex, words) => {
            const index = order++
            return (
              <Fragment key={wordIndex}>
                <span className="v7-split__word">
                  <motion.span
                    className="v7-split__word-inner"
                    initial={
                      reducedMotion
                        ? false
                        : { y: '230%', rotate: -2, scale: 1.47 }
                    }
                    animate={
                      show || reducedMotion
                        ? { y: '0%', rotate: 0, scale: 1 }
                        : { y: '230%', rotate: -2, scale: 1.47 }
                    }
                    transition={{
                      duration: 1.5,
                      ease: [0.7, 0, 0.3, 1],
                      delay: show ? delay + index * stagger : 0,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
                {wordIndex < words.length - 1 ? ' ' : null}
              </Fragment>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

/**
 * title--preloader — the reference's entrance headline settles from
 * `translateY(100%) scale(1.5)` (`.title--preloader`) into place. Driven
 * off the preloader rather than scroll, like the original's
 * `data-reveal-delay-preloader`.
 */
export function TitleSettle({
  children,
  className = '',
  delay = 0,
  play,
}: {
  children: ReactNode
  className?: string
  delay?: number
  play?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reducedMotion = useReducedMotionSettled()
  const show = play !== undefined ? play : inView
  return (
    <span ref={ref} className={`v7-title-settle ${className}`}>
      <motion.span
        className="v7-title-settle__inner"
        initial={reducedMotion ? false : { y: '100%', scale: 1.5 }}
        animate={
          show || reducedMotion
            ? { y: '0%', scale: 1 }
            : { y: '100%', scale: 1.5 }
        }
        transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1], delay: show ? delay : 0 }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/**
 * mouseAnimation — the reference binds the pointer to `--mouse-x` /
 * `--mouse-y` custom properties (0…1) that descendants consume in
 * `calc()`, e.g. `.services__list{transform:translateX(calc(var(--mouse-x)
 * * ...))}`. This port exposes them centred on the middle of the element
 * (−1…1) and lerps them on rAF, writing straight to the DOM so drifting
 * never re-renders React.
 */
export function MouseField({
  children,
  className = '',
  strength = 1,
  smoothness = 0.075,
}: {
  children: ReactNode
  className?: string
  strength?: number
  smoothness?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let targetX = 0.5
    let targetY = 0.5
    let currentX = 0.5
    let currentY = 0.5
    let raf = 0
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      targetY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    }
    const loop = () => {
      currentX += (targetX - currentX) * smoothness
      currentY += (targetY - currentY) * smoothness
      el.style.setProperty(
        '--mouse-x',
        ((currentX - 0.5) * 2 * strength).toFixed(4),
      )
      el.style.setProperty(
        '--mouse-y',
        ((currentY - 0.5) * 2 * strength).toFixed(4),
      )
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    el.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
    }
  }, [strength, smoothness])
  return (
    <div ref={ref} className={`v7-mouse-field ${className}`}>
      {children}
    </div>
  )
}

/**
 * btn--clone — the reference duplicates the button label and rolls the
 * two copies past each other with a per-unit stagger
 * (`transition-delay: calc((var(--char-total) - var(--char-index)) * 4ms)`).
 * The original staggers per CHARACTER; this port staggers per WORD
 * because Persian is a connected script — a per-char split would tear
 * every joined letterform apart.
 */
export function SwapText({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <span className="swap-text">
      {words.map((word, index) => (
        <Fragment key={index}>
          <span
            className="swap-word"
            style={{ '--word-index': index } as CSSProperties}
          >
            <span>{word}</span>
            <span aria-hidden="true">{word}</span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}

export function Dialog({
  children,
  kind,
  title,
  onClose,
}: {
  children: ReactNode
  kind: string
  title: string
  onClose: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotionSettled()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    const originalPadding = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`
    // Pause virtual scrolling while the overlay owns the page.
    getLenis()?.stop()
    // Inert only the page content, NOT the shell that hosts the dialogs
    // themselves (inert on an ancestor of the dialog would make the
    // dialog itself unclickable).
    const root = document.getElementById('v7-content')
    root?.setAttribute('inert', '')
    const timer = window.setTimeout(() => ref.current?.focus(), 30)

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !ref.current) return
      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length > 0)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first) {
        event.preventDefault()
        return
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current)
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', keydown)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPadding
      getLenis()?.start()
      root?.removeAttribute('inert')
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [onClose])

  return (
    <motion.div
      className={`modal-backdrop modal-backdrop--${kind}`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.section
        ref={ref}
        className={`dialog dialog--${kind}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        initial={
          reducedMotion ? false : { opacity: 0, y: kind === 'menu' ? -20 : 35 }
        }
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease }}
      >
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label={`بستن ${kind === 'menu' ? 'منو' : 'پنجره'}`}
        >
          <span>{kind === 'menu' ? 'بستن' : ''}</span>
          <X size={23} strokeWidth={1.2} />
        </button>
        {children}
      </motion.section>
    </motion.div>
  )
}
