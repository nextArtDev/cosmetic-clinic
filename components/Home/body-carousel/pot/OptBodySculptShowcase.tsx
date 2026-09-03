'use client'

/* ============================================================================
   BodySculptShowcase — v8

   v8 — mobile touch + "what's active" pass
   -----------------------------------------
   • FIX (the big one): autoplay pause was effectively permanent on touch.
     `onMouseEnter/Leave` + `onFocus/Blur` on the card meant a single tap on a
     touchscreen set `hoverPaused` true and it never cleared — there's no
     "mouse leave" on touch, and focus rarely blurs just from tapping.
     Hover-pause now only fires for a real mouse (`pointerType === 'mouse'`),
     focus-pause only fires when the last input was actually the keyboard
     (tracked via a Tab/pointerdown flag), and a plain touch tap gets the
     same short `poke()` — pause, then auto-resume — that swiping already
     used, instead of getting stuck.
   • FIX: the swipe surface had no `touch-action`, so a vertical scroll that
     started on the card could get captured as a drag attempt instead of
     scrolling the page. It's now `pan-y`: horizontal swipe still works,
     vertical scroll passes straight through to the page.
   • FIX: visibility-based autoplay pause used one IntersectionObserver
     threshold, so scrolling past ~35% visible flickered pause/resume on the
     way by. Replaced with a small hysteresis hook — pauses under 10% visible,
     resumes at 40%+ — so a normal scroll-through doesn't fight itself.
   • CHANGED: the large serif title/subtitle that sat over the bottom quarter
     of the photo is gone. In its place is a small pill — index + active
     procedure name — the same "status badge" idea the dial's own readout
     chip uses, so it reads as "here's what's active," not a headline
     competing with the before/after photo for space. The old duplicate
     top-right counter is folded into the same pill.
   • ADDED: a visually-hidden `aria-live` announcement on slide change, since
     removing the on-image heading also removed the obvious visual cue that
     screen-reader users would otherwise get from a focus/DOM change.

   v9 — the pause bug wasn't fully dead, and the swipe felt heavy
   -----------------------------------------------------------------
   • FIX: a touch tap still paused autoplay, because the card's own
     `onPointerDown` called `poke()` on *every* touch contact — including the
     first instant of a scroll gesture, since `pointerdown` fires as soon as
     a finger lands, before the browser knows whether it'll become a scroll
     or a tap. That handler is gone. The drag surface's own `onDragStart`
     (which only fires once an actual horizontal drag is underway) is
     enough on its own, and it doesn't fire for a vertical scroll.
   • CHANGED: swiping the photo to move between cases needed a fairly
      committed flick before anything happened. The trigger threshold is
      lower now, so a normal, unhurried swipe reliably moves exactly one
      case — see also `RadialSelect` v9 for the same tuning on the dial.

   v10 — no more "sleep" after a touch
   -----------------------------------
   • REMOVED: the idle "poke" system is gone. Until now, every touch-driven
     interaction — a drag start on the photo (which tap jitter could trigger
     on its own), a completed swipe, a press on the dial's labels, a tap on
     a rail dot — paused autoplay for `idleResumeMs` (5–8s), and dragging
     the dial re-poked on every detent crossing. On phones that read as
     "one touch and the carousel went to sleep". Every advance now simply
     restarts a full autoplay cycle; there is no lingering pause.
   • REPLACED WITH: hold-to-pause. Autoplay pauses only while a pointer is
     physically held down on the photo surface, and resumes the moment it's
     released (`pointerup`) or the browser takes the gesture over for
     vertical scrolling (`pointercancel`) — tracked with window-level
     listeners while a hold is active, so a release that lands outside the
     card still resumes. Mouse hover-pause and keyboard focus-pause are
     unchanged. The `idleResumeMs` prop was removed with the system.
============================================================================ */

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PanInfo } from 'framer-motion'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react'
import { RadialSelect } from './RadialSelect'

export * from './RadialSelect'

/* ── types ──────────────────────────────────────────────────────────────── */

export interface ShieldGeometry {
  left: number
  top: number
  width: number
  height: number
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
  imageSrc?: string
  beforeImage?: string
  afterImage?: string
  panelClassName?: string
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
  className?: string
}

/* ── tokens + motion ────────────────────────────────────────────────────── */

const TOKENS: Record<string, string> = {
  '--bs-card': 'oklch(16% 0.016 48)',
  '--bs-scrim': 'oklch(22% 0.02 50 / 0.66)',
  '--bs-ink': 'oklch(97% 0.008 70)',
  '--bs-ink-2': 'oklch(84% 0.012 70)',
  '--bs-ink-3': 'oklch(62% 0.014 62)',
  '--bs-ink-4': 'oklch(48% 0.014 58)',
  '--bs-line': 'oklch(96% 0.01 70 / 0.72)',
  '--bs-line-soft': 'oklch(96% 0.01 70 / 0.22)',
  '--bs-accent': 'oklch(87% 0.1 82)',
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_MORPH: [number, number, number, number] = [0.65, 0, 0.35, 1]
const MORPH_S = 0.82
const D_PANEL = MORPH_S + 0.04
const D_LINE = MORPH_S + 0.16
const D_DOT = MORPH_S + 0.4

const FALLBACK_SHIELD: ShieldGeometry = {
  left: 12,
  top: 20,
  width: 76,
  height: 60,
  radius: 5,
}

const mod = (v: number, n: number) => ((v % n) + n) % n

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

/** Tracks whether the *last* input was a keyboard (Tab) vs a pointer, so
 *  focus-driven pause only kicks in for keyboard users — a tap shouldn't be
 *  treated the same as tabbing in. */
function useKeyboardModality(): RefObject<boolean> {
  const usingKeyboard = useRef(false)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') usingKeyboard.current = true
    }
    const onPointerDown = () => {
      usingKeyboard.current = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])
  return usingKeyboard
}

/** Visibility with hysteresis: enters "visible" at `enterAt`, only leaves at
 *  `exitAt`. A single-threshold observer flickers on/off while the user is
 *  mid-scroll past that line; this gives it a dead zone instead. */
function useHysteresisInView(
  ref: RefObject<HTMLElement | null>,
  enterAt = 0.4,
  exitAt = 0.1,
): boolean {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    let current = false
    const io = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        if (!current && ratio >= enterAt) {
          current = true
          setVisible(true)
        } else if (current && ratio <= exitAt) {
          current = false
          setVisible(false)
        }
      },
      { threshold: [0, exitAt, enterAt, 1] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, enterAt, exitAt])
  return visible
}

/* ── annotations ────────────────────────────────────────────────────────── */

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
        transformOrigin: line.origin === 'bottom' ? '50% 100%' : '50% 0%',
      }
  return (
    <motion.span
      aria-hidden
      initial={horizontal ? { scaleX: 0 } : { scaleY: 0 }}
      animate={horizontal ? { scaleX: 1 } : { scaleY: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.62, ease: EASE_OUT, delay }}
      className="absolute bg-[color:var(--bs-line)] max-md:hidden"
      style={style}
    />
  )
}

function PointerDot({ dot, delay }: { dot: ShieldDot; delay: number }) {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      transition={{ delay, duration: 0.4, ease: EASE_OUT }}
      className="absolute h-[9px] w-[9px] rounded-full border-2 border-[color:var(--bs-ink)] bg-[color:var(--bs-scrim)] max-md:hidden"
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
    { src: slide.beforeImage, label: '' },
    { src: slide.afterImage, label: '' },
  ].filter((x): x is { src: string; label: string } => !!x.src)
  if (items.length === 0) return null
  return (
    <div
      className={`absolute ${slide.panelClassName ?? 'left-[68%] top-[8%]'} max-md:left-1/2 max-md:top-[56%] max-md:-translate-x-1/2`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
        transition={{ delay, duration: 0.55, ease: EASE_OUT }}
        className="flex gap-2"
      >
        {items.map((it) => (
          <figure key={it.label} className="m-0">
            <img
              src={it.src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-[clamp(44px,12cqi,78px)] w-[clamp(44px,12cqi,78px)] rounded-[1.8cqi] border border-[color:var(--bs-line-soft)] object-cover"
            />
            <figcaption className="mt-1 text-center text-[clamp(9px,1.8cqi,12px)] uppercase tracking-[0.2em] text-[color:var(--bs-ink-2)]">
              {it.label}
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  )
}

/* ── side list item ─────────────────────────────────────────────────────── */

interface ProcedureButtonProps {
  slide: SurgerySlide
  index: number
  side: 'left' | 'right'
  active: boolean
  onPick: (index: number) => void
}

function ProcedureButton({
  slide,
  index,
  side,
  active,
  onPick,
}: ProcedureButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onPick(index)}
      aria-current={active ? 'true' : undefined}
      className={`group flex min-h-11 w-full items-center gap-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--bs-accent)] ${
        side === 'left'
          ? 'flex-row justify-end text-right'
          : 'flex-row-reverse justify-end text-left'
      }`}
    >
      <span
        className={`hidden shrink-0 text-[clamp(8px,1cqi,11px)] tabular-nums tracking-[0.2em] transition-colors duration-300 lg:block ${
          active
            ? 'text-[color:var(--bs-ink-2)]'
            : 'text-[color:var(--bs-ink-4)]'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className={`truncate text-[clamp(12px,1.4cqi,15px)] uppercase leading-tight tracking-[0.12em] transition-colors duration-300 ${
          active
            ? 'text-[color:var(--bs-ink)]'
            : 'text-[color:var(--bs-ink-3)] group-hover:text-[color:var(--bs-ink-2)]'
        }`}
      >
        {slide.title}
      </span>
      <span
        className={`h-[5px] w-[5px] shrink-0 rounded-full transition-colors duration-300 ${
          active
            ? 'bg-[color:var(--bs-ink)]'
            : 'bg-[color:var(--bs-ink-4)] group-hover:bg-[color:var(--bs-ink-3)]'
        }`}
      />
      <span
        className={`h-px shrink-0 origin-center transition-all duration-500 ${
          active
            ? 'w-7 bg-[color:var(--bs-ink)]'
            : 'w-3.5 bg-[color:var(--bs-line-soft)] group-hover:w-5'
        }`}
      />
    </button>
  )
}

/* ── icons ──────────────────────────────────────────────────────────────── */

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path
        d={dir === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── showcase ───────────────────────────────────────────────────────────── */

export function BodySculptShowcase({
  imageSrc,
  imageAlt = '',
  slides,
  autoplayMs = 5200,
  className = '',
}: BodySculptShowcaseProps) {
  const count = slides.length
  const [state, setState] = useState<{ index: number; dir: 1 | -1 }>({
    index: 0,
    dir: 1,
  })
  const [userPaused, setUserPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [holdPaused, setHoldPaused] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)

  const rootRef = useRef<HTMLDivElement>(null)
  const entered = useInView(rootRef, { once: true, amount: 0.2 })
  const onScreen = useHysteresisInView(rootRef, 0.4, 0.1)
  const usingKeyboard = useKeyboardModality()
  const reduce = useReducedMotion() ?? false
  const progress = useMotionValue(0)

  const index = count > 0 ? mod(state.index, count) : 0
  const dir = state.dir
  const slide = slides[index]
  const prevSlide = usePrevious(slide)
  const shield = slide?.shield ?? FALLBACK_SHIELD
  const prevClip = clipFrom(prevSlide?.shield ?? shield)
  const morph = reduce ? 0 : MORPH_S
  const stagger = (v: number) => (reduce ? 0 : v)

  const select = useCallback((i: number) => {
    setState((cur) =>
      i === cur.index ? cur : { index: i, dir: i > cur.index ? 1 : -1 },
    )
  }, [])

  const go = useCallback(
    (d: 1 | -1) => {
      setState((cur) => ({
        index: mod(cur.index + d, Math.max(1, count)),
        dir: d,
      }))
    },
    [count],
  )

  const nudge = useCallback((d: 1 | -1) => go(d), [go])

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === 'visible')
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  /* hold-to-pause: while a pointer is down on the photo surface autoplay
     waits; release (or the browser taking the gesture over for a vertical
     scroll) resumes. Window-level listeners make the release reliable even
     when the finger ends up outside the card. */
  useEffect(() => {
    if (!holdPaused) return
    const release = () => setHoldPaused(false)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [holdPaused])

  const playing =
    count > 1 &&
    !reduce &&
    !userPaused &&
    !hoverPaused &&
    !holdPaused &&
    onScreen &&
    tabVisible

  /* the progress line IS the timer — one source of truth */
  useEffect(() => {
    progress.set(0)
    if (!playing) return
    const controls = animate(progress, 1, {
      duration: autoplayMs / 1000,
      ease: 'linear',
      onComplete: () => go(1),
    })
    return () => controls.stop()
  }, [playing, index, autoplayMs, go, progress])

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    /* lower bar than before: an ordinary, unhurried swipe should reliably
       move exactly one case, not require a hard flick */
    const power =
      Math.abs(info.offset.x) * 0.7 + Math.abs(info.velocity.x) * 0.2
    if (power < 26) return
    nudge(info.offset.x < 0 ? 1 : -1)
  }

  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      nudge(1)
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      nudge(-1)
    }
  }

  const columns = useMemo(() => {
    const withIndex = slides.map((s, i) => ({ s, i }))
    return {
      left: withIndex.filter((x) => x.s.menuSide === 'left'),
      right: withIndex.filter((x) => x.s.menuSide === 'right'),
    }
  }, [slides])

  const dialOptions = useMemo(
    () =>
      slides.map((s, i) => ({
        id: s.id,
        label: s.title,
        hint: String(i + 1).padStart(2, '0'),
      })),
    [slides],
  )

  const rootStyle = {
    ...TOKENS,
    fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
    containerType: 'inline-size',
  } as CSSProperties

  if (!slide) {
    return (
      <div
        ref={rootRef}
        style={rootStyle}
        className={`grid min-h-[320px] w-full max-w-[1120px] place-items-center rounded-[22px] border border-[color:var(--bs-line-soft)] ${className}`}
      >
        <p className="text-[13px] uppercase tracking-[0.24em] text-[color:var(--bs-ink-3)]">
          هنوز عملی برای نمایش نیست
        </p>
      </div>
    )
  }

  const activeSrc = slide.imageSrc ?? imageSrc

  return (
    <div
      ref={rootRef}
      className={`flex w-full max-w-[1120px] flex-col items-center gap-6 ${className}`}
      style={rootStyle}
    >
      <div className="flex w-full items-stretch justify-center gap-3 lg:gap-8">
        <nav
          className="hidden w-[clamp(140px,20cqi,230px)] shrink-0 flex-col justify-center gap-[clamp(2px,1.4cqi,12px)] py-[6%] md:flex"
          aria-label="فهرست عمل‌ها، ستون اول"
        >
          {columns.left.map(({ s, i }) => (
            <ProcedureButton
              key={s.id}
              slide={s}
              index={i}
              side="left"
              active={i === index}
              onPick={select}
            />
          ))}
        </nav>

        {/* card */}
        <div
          tabIndex={0}
          role="group"
          aria-label={`${slide.title}، ${index + 1} از ${count}`}
          onKeyDown={onKey}
          onPointerEnter={(e: ReactPointerEvent<HTMLDivElement>) => {
            if (e.pointerType === 'mouse') setHoverPaused(true)
          }}
          onPointerLeave={(e: ReactPointerEvent<HTMLDivElement>) => {
            if (e.pointerType === 'mouse') setHoverPaused(false)
          }}
          onFocus={() => {
            if (usingKeyboard.current) setHoverPaused(true)
          }}
          onBlur={() => setHoverPaused(false)}
          className="group relative w-full max-w-[min(640px,calc(92svh*0.75))] select-none overflow-hidden rounded-[22px] bg-[color:var(--bs-card)] shadow-[0_40px_90px_-30px_oklch(8%_0.01_48_/_0.9)] outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--bs-accent)]"
          style={
            {
              aspectRatio: '3 / 4',
              containerType: 'inline-size',
            } as CSSProperties
          }
        >
          {entered && (
            <AnimatePresence initial>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.36 } }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <img
                  src={activeSrc}
                  alt=""
                  aria-hidden
                  draggable={false}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover blur-[7px] brightness-[0.58] saturate-[0.9]"
                />
                <motion.img
                  src={activeSrc}
                  alt={imageAlt || `${slide.title} — ناحیهٔ هدف`}
                  initial={{ clipPath: prevClip }}
                  animate={{ clipPath: clipFrom(slide.shield) }}
                  transition={{ duration: morph, ease: EASE_MORPH }}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          )}

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_42%,transparent_38%,oklch(14%_0.02_48_/_0.5)_74%,oklch(8%_0.012_44_/_0.86)_100%)]" />

          {/* swipe surface + annotations */}
          <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-y' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            onPointerDown={() => setHoldPaused(true)}
            onDragEnd={onDragEnd}
          >
            <motion.div
              aria-hidden
              initial={false}
              animate={{
                left: `${shield.left}%`,
                top: `${shield.top}%`,
                width: `${shield.width}%`,
                height: `${shield.height}%`,
                borderRadius: `${shield.radius}cqi`,
              }}
              transition={{ duration: morph, ease: EASE_MORPH }}
              className="pointer-events-none absolute border border-[color:var(--bs-line)]"
            />

            {entered && (
              <AnimatePresence initial>
                <motion.div
                  key={slide.id}
                  className="pointer-events-none absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  <BeforeAfterPanel slide={slide} delay={stagger(D_PANEL)} />
                  {slide.lines?.map((l, i) => (
                    <PointerLine
                      key={`l${i}`}
                      line={l}
                      delay={stagger(D_LINE)}
                    />
                  ))}
                  {slide.dots?.map((d, i) => (
                    <PointerDot key={`d${i}`} dot={d} delay={stagger(D_DOT)} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* autoplay progress */}
          {count > 1 && (
            <motion.div
              aria-hidden
              className="absolute left-0 top-0 z-30 h-[2px] w-full bg-[color:var(--bs-accent)]"
              style={{
                scaleX: progress,
                transformOrigin: '0% 50%',
                opacity: playing ? 0.85 : 0.28,
              }}
            />
          )}

          {/* pause / play */}
          {count > 1 && !reduce && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={playing ? 'توقف اسلایدشو' : 'پخش اسلایدشو'}
              className="absolute left-[3%] top-[2.5%] z-30 grid h-11 w-11 place-items-center rounded-full text-[color:var(--bs-ink-2)] outline-none transition-colors hover:bg-[color:var(--bs-scrim)] focus-visible:ring-1 focus-visible:ring-[color:var(--bs-accent)]"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
                {playing ? (
                  <path
                    d="M9 5v14M15 5v14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                )}
              </svg>
            </button>
          )}

          {/* edge navigation */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => nudge(-1)}
                aria-label="عمل قبلی"
                className="absolute left-1 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-[color:var(--bs-ink-2)] opacity-60 outline-none transition duration-200 hover:bg-[color:var(--bs-scrim)] hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-[color:var(--bs-accent)] md:opacity-0 md:group-hover:opacity-80"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                onClick={() => nudge(1)}
                aria-label="عمل بعدی"
                className="absolute right-1 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-[color:var(--bs-ink-2)] opacity-60 outline-none transition duration-200 hover:bg-[color:var(--bs-scrim)] hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-[color:var(--bs-accent)] md:opacity-0 md:group-hover:opacity-80"
              >
                <Chevron dir="right" />
              </button>
            </>
          )}

          {/* subtle bottom depth only — no longer anchoring a headline */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[16%] bg-[linear-gradient(to_top,oklch(10%_0.014_46_/_0.65),transparent)]" />

          {/* active-case indicator — replaces the old on-image title/subtitle */}
          {entered && (
            <div className="pointer-events-none absolute inset-x-0 top-[3%] z-20 flex justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: dir * 16, y: -4 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: dir * -12,
                    transition: { duration: 0.18 },
                  }}
                  transition={{ duration: reduce ? 0 : 0.42, ease: EASE_OUT }}
                  className="flex max-w-full items-center gap-2 rounded-full border border-[color:var(--bs-line-soft)] bg-[color:var(--bs-scrim)] px-3.5 py-1.5 backdrop-blur-sm"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[color:var(--bs-accent)]" />
                  <span className="truncate text-[clamp(12px,2.4cqi,13px)] font-medium uppercase tracking-[0.18em] text-[color:var(--bs-ink)]">
                    <span className="tabular-nums text-[color:var(--bs-ink-3)]">
                      {String(index + 1).padStart(2, '0')}/
                      {String(count).padStart(2, '0')}
                    </span>
                    <span className="mx-1.5 text-[color:var(--bs-ink-4)] ">
                      ·
                    </span>
                    <span className="text-4xl font-bold">{slide.title}</span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          <span aria-live="polite" className="sr-only">
            {slide.title}
            {slide.subtitle ? `, ${slide.subtitle}` : ''}
          </span>
        </div>

        <nav
          className="hidden w-[clamp(140px,20cqi,230px)] shrink-0 flex-col justify-center gap-[clamp(2px,1.4cqi,12px)] py-[6%] md:flex"
          aria-label="فهرست عمل‌ها، ستون دوم"
        >
          {columns.right.map(({ s, i }) => (
            <ProcedureButton
              key={s.id}
              slide={s}
              index={i}
              side="right"
              active={i === index}
              onPick={select}
            />
          ))}
        </nav>
      </div>

      {/* dial: the primary selector, gesture-first, synced both ways */}
      {count > 1 && (
        <RadialSelect
          variant="inline"
          position="bottom"
          orientation="upright"
          tone="ivory"
          value={index}
          onIndexChange={select}
          options={dialOptions}
          showReadout={false}
          ariaLabel="انتخاب عمل"
          className="h-[clamp(124px,20vh,168px)] w-full -mt-16"
        />
      )}

      {/* small screens: tappable position rail instead of the old chip row */}
      {count > 1 && (
        <div className="-mt-3 flex items-center justify-center gap-0.5 md:hidden">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => select(i)}
              aria-label={s.title}
              aria-current={i === index ? 'true' : undefined}
              className="grid h-11 w-4 place-items-center outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--bs-accent)]"
            >
              <span
                className={`rounded-full transition-all duration-300 ${
                  i === index
                    ? 'h-1.5 w-1.5 bg-[color:var(--bs-ink)]'
                    : 'h-1 w-1 bg-[color:var(--bs-ink-4)]'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
