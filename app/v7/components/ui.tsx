'use client'

import { useEffect, useRef, type ReactNode } from 'react'
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

export function Logo({ className = '' }: { className?: string }) {
  return <span className={`wordmark ${className}`}>گریگوری</span>
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
  const reducedMotion = useReducedMotion()
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
  const reducedMotion = useReducedMotion()
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
  const reducedMotion = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      className={`v7-image-reveal ${className}`}
      initial={reducedMotion ? false : { opacity: 0, scale: 1.07, clipPath: 'inset(6% 5% 6% 5%)' }}
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
export function Parallax({
  children,
  className = '',
  distance = 32,
  axis = 'y',
  scale = false,
}: {
  children: ReactNode
  className?: string
  distance?: number
  axis?: 'x' | 'y'
  scale?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const drift = useTransform(
    scrollYProgress,
    [0, 1],
    axis === 'y' ? [distance, -distance] : [-distance * 1.2, distance * 1.2],
  )
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [1.1, 1])
  const x = axis === 'x' ? drift : 0
  const y = axis === 'y' ? drift : 0
  const appliedScale = scale ? scaleProgress : axis === 'x' ? 1.08 : 1
  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        reducedMotion
          ? undefined
          : { x, y, scale: appliedScale, willChange: 'transform' }
      }
    >
      {children}
    </motion.div>
  )
}

/**
 * Button label swap — the reference's btn--clone hover: the label rolls
 * out upward while a duplicate rolls in from below. RTL-agnostic
 * (vertical motion).
 */
export function SwapText({ text }: { text: string }) {
  return (
    <span className="swap-text">
      <span>{text}</span>
      <span aria-hidden="true">{text}</span>
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
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    const originalPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
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
        (document.activeElement === first || document.activeElement === ref.current)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === ref.current)
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
        initial={reducedMotion ? false : { opacity: 0, y: kind === 'menu' ? -20 : 35 }}
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
