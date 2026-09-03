'use client'

/* ============================================================================
   RadialSelect — v8
   A radial snap-picker that behaves like a real control.

   v8 — "make it actually look like a dial"
   -----------------------------------------
   • The old radius formula optimized purely for label spacing, which meant
     on anything wider than a phone the circle it rode on was so large the
     arc read as a nearly-straight line of rotating text — not a dial.
     Radius is now also capped as a fraction of the container's own extent,
     so the curve stays visible at every width instead of flattening out.
   • Added a static SVG arc — the actual rim the ticks and labels travel
     along — drawn once per layout, independent of rotation. Before, the only
     "track" was a thin straight rail; now there's a real curved line under
     the ticks, which is most of what reads as "this is a dial" at a glance.
   • Ticks went from a single major/minor pair per slice to three tiers
     (major / mid / minor), closer to a protractor than a sparse row of dashes.
   • The wheel gets a small scale-up while a drag is active, as tactile
     confirmation that a touch actually grabbed the dial (helps most on
     touchscreens, where there's no hover state to hint at that already).
   Everything else — gesture handling, keyboard support, wheel/trackpad
   input, the readout chip, reduced-motion handling — is unchanged from v7.

   v9 — drag felt heavy, the snap felt weak
   ------------------------------------------
   • Finger-drag rotation was a literal 1:1 mapping of the angle subtended at
     the wheel's actual center — which, because the wheel is mostly rotated
     off-screen, sits far enough away that a normal swipe barely nudged the
     rotation. A gain multiplier (`DRAG_GAIN`) now scales that angle up, so
     an ordinary swipe reliably carries you from one case to the next instead
     of needing an oversized gesture.
   • The settle spring is stiffer and the release inertia settles faster, so
     landing on a case reads as a clear, quick commit rather than a slow
     drift into place.
   • The detent's per-selection pulse now overshoots slightly before
     settling (scale up, then back to rest) instead of a flat fade-in, so a
     case change is something you can actually see happen, not just infer.
============================================================================ */

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  AnimationPlaybackControls,
  MotionStyle,
  MotionValue,
} from 'framer-motion'
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'

/* ── public API ─────────────────────────────────────────────────────────── */

export type RadialPosition = 'bottom' | 'top' | 'left' | 'right'
/** 'vertical' kept as a deprecated alias of 'upright'. */
export type RadialTextOrientation =
  | 'upright'
  | 'tangential'
  | 'radial'
  | 'vertical'
export type RadialVariant = 'dock' | 'inline'
export type RadialTone = 'amber' | 'ivory'

export interface RadialOption {
  id: string
  label: string
  hint?: string
}

export interface RadialSelectProps {
  options: RadialOption[]
  position?: RadialPosition
  orientation?: RadialTextOrientation
  /** dock = pinned to a viewport edge · inline = in-flow strip */
  variant?: RadialVariant
  tone?: RadialTone
  /** controlled index */
  value?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onSelect?: (index: number, option: RadialOption) => void
  ariaLabel?: string
  className?: string
  showReadout?: boolean
}

/* ── math + tables ──────────────────────────────────────────────────────── */

const wrap180 = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180
const mod = (v: number, n: number) => ((v % n) + n) % n
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))
/** Raw 1:1 angle-at-center felt heavy — the wheel's true center sits mostly
 *  off-screen, far from the finger, so a normal swipe barely rotated it.
 *  This scales the felt rotation up so a normal swipe moves a full case. */
const DRAG_GAIN = 1.55

/** angle (deg) at which an item sits under the detent, per edge */
const ALPHA: Record<RadialPosition, number> = {
  bottom: -90,
  top: 90,
  left: 0,
  right: 180,
}
const AXIS: Record<RadialPosition, 'x' | 'y'> = {
  bottom: 'x',
  top: 'x',
  left: 'y',
  right: 'y',
}
/** extra half-turn so radial/tangential labels never read upside down */
const FLIP: Record<RadialPosition, number> = {
  bottom: 0,
  top: 180,
  left: 0,
  right: 180,
}
/** where the label line sits across the strip (fraction of cross-axis) */
const APEX: Record<RadialPosition, number> = {
  bottom: 0.44,
  top: 0.56,
  left: 0.56,
  right: 0.44,
}
const EDGE_CLASS: Record<RadialPosition, string> = {
  bottom: 'left-0 right-0 bottom-0',
  top: 'left-0 right-0 top-0',
  left: 'top-0 bottom-0 left-0',
  right: 'top-0 bottom-0 right-0',
}

interface ToneSpec {
  ink: string
  inkSoft: string
  inkIdle: string
  inkHover: string
  marker: string
  markerGlow: string
  tick: string
  halo: string
  rail: string
  ring: string
  labelGlow: string
  chipBg: string
  chipLine: string
  chipInk: string
}

/* Tinted neutrals, OKLCH, no pure white/black anywhere. */
const TONES: Record<RadialTone, ToneSpec> = {
  amber: {
    ink: 'oklch(93% 0.055 84)',
    inkSoft: 'oklch(82% 0.075 80)',
    inkIdle: 'oklch(57% 0.018 72)',
    inkHover: 'oklch(78% 0.03 76)',
    marker: 'oklch(87% 0.125 84)',
    markerGlow: '0 0 14px 1px oklch(82% 0.13 84 / 0.5)',
    tick: 'oklch(70% 0.025 76)',
    halo: 'oklch(80% 0.12 82 / 0.14)',
    rail: 'oklch(84% 0.07 84 / 0.34)',
    ring: 'oklch(86% 0.09 84 / 0.6)',
    labelGlow: '0 0 20px oklch(84% 0.11 84 / 0.42)',
    chipBg: 'oklch(19% 0.018 60 / 0.72)',
    chipLine: 'oklch(96% 0.01 84 / 0.12)',
    chipInk: 'oklch(88% 0.02 80)',
  },
  ivory: {
    ink: 'oklch(97% 0.008 70)',
    inkSoft: 'oklch(86% 0.012 70)',
    inkIdle: 'oklch(60% 0.012 66)',
    inkHover: 'oklch(82% 0.012 68)',
    marker: 'oklch(97% 0.01 70)',
    markerGlow: '0 0 14px 1px oklch(95% 0.02 70 / 0.45)',
    tick: 'oklch(74% 0.012 68)',
    halo: 'oklch(96% 0.015 70 / 0.1)',
    rail: 'oklch(96% 0.01 70 / 0.3)',
    ring: 'oklch(96% 0.012 70 / 0.55)',
    labelGlow: '0 0 20px oklch(96% 0.015 70 / 0.35)',
    chipBg: 'oklch(18% 0.014 60 / 0.7)',
    chipLine: 'oklch(96% 0.01 70 / 0.12)',
    chipInk: 'oklch(90% 0.01 70)',
  },
}

/* ── geometry ───────────────────────────────────────────────────────────── */

interface Geo {
  D: number
  R: number
  wheelLeft: number
  wheelTop: number
  labelInset: number
  railGap: number
  fs: number
  apex: number
}

function dockBox(position: RadialPosition) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return AXIS[position] === 'x'
    ? { w: vw, h: Math.round(clamp(vh * 0.24, 132, 240)) }
    : { w: Math.round(clamp(vw * 0.24, 170, 300)), h: vh }
}

/**
 * Adaptive radius: the arc is flattened until neighbours sit roughly one
 * "slice" apart on screen, so 3 options don't render as a tiny carousel and
 * 20 options don't collapse into each other — but it's now also capped as a
 * share of the container's own size, so the curve stays visibly a curve
 * (not a near-straight line) at every viewport width.
 */
function computeGeo(
  position: RadialPosition,
  cw: number,
  ch: number,
  n: number,
): Geo {
  const horizontal = AXIS[position] === 'x'
  const extent = horizontal ? cw : ch
  const cross = horizontal ? ch : cw
  const slice = 360 / Math.max(1, n)
  const fit = (Math.min(slice, 52) * Math.PI) / 180
  const R = clamp((extent * 0.5 * 0.92) / Math.sin(fit), 210, extent * 0.8)
  const D = Math.round(R * 2)
  const fs = clamp(Math.round(extent * 0.015), 11, 15)
  const labelInset = Math.max(30, Math.round(fs * 2.6))
  const railGap = Math.max(18, Math.round(fs * 1.9))
  const apex = Math.round(cross * APEX[position])

  if (horizontal) {
    return {
      D,
      R,
      labelInset,
      railGap,
      fs,
      apex,
      wheelLeft: Math.round((cw - D) / 2),
      wheelTop: Math.round(
        position === 'bottom' ? apex - labelInset : apex - D + labelInset,
      ),
    }
  }
  return {
    D,
    R,
    labelInset,
    railGap,
    fs,
    apex,
    wheelTop: Math.round((ch - D) / 2),
    wheelLeft: Math.round(
      position === 'right' ? apex - labelInset : apex - D + labelInset,
    ),
  }
}

const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/* ── tick ───────────────────────────────────────────────────────────────── */

interface TickProps {
  rot: MotionValue<number>
  thetaDeg: number
  alphaDeg: number
  sliceDeg: number
  /** 2 = major (once per option), 1 = mid, 0 = minor */
  tier: number
  R: number
  radius: number
  color: string
}

function Tick({
  rot,
  thetaDeg,
  alphaDeg,
  sliceDeg,
  tier,
  R,
  radius,
  color,
}: TickProps) {
  const rad = (thetaDeg * Math.PI) / 180
  const left = R + radius * Math.cos(rad)
  const top = R + radius * Math.sin(rad)
  const base = tier === 2 ? 0.55 : tier === 1 ? 0.32 : 0.16
  const length = tier === 2 ? 14 : tier === 1 ? 9 : 5
  const width = tier === 2 ? 1.6 : 1
  const opacity = useTransform(rot, (r) => {
    const d = Math.abs(wrap180(thetaDeg + r - alphaDeg))
    const t = Math.min(d / (sliceDeg * 2.4), 1)
    return base * Math.pow(1 - t, 1.4)
  })
  return (
    <motion.span
      aria-hidden
      className="absolute rounded-full "
      style={{
        left,
        top,
        x: '-50%',
        y: '-50%',
        width,
        height: length,
        rotate: thetaDeg + 90, // perpendicular to the rim
        background: color,
        opacity,
      }}
    />
  )
}

/* ── label ──────────────────────────────────────────────────────────────── */

interface RadialItemProps {
  uid: string
  index: number
  option: RadialOption
  x: number
  y: number
  spin: MotionValue<number> | number
  fs: number
  sliceDeg: number
  rot: MotionValue<number>
  active: boolean
  tone: ToneSpec
  onPress: (index: number) => void
}

function RadialItem({
  uid,
  index,
  option,
  x,
  y,
  spin,
  fs,
  sliceDeg,
  rot,
  active,
  tone,
  onPress,
}: RadialItemProps) {
  const distOf = (r: number) => Math.abs(wrap180(r - index * sliceDeg))
  const opacity = useTransform(rot, (r) => {
    const t = Math.min(distOf(r) / (sliceDeg * 2.4), 1)
    return 1 - Math.pow(t, 0.85) * 0.94
  })
  const scale = useTransform(rot, (r) => {
    const d = distOf(r)
    const far = Math.min(d / (sliceDeg * 2.4), 1)
    const near = Math.max(0, 1 - d / (sliceDeg * 0.6))
    return (1 - far * 0.14) * (1 + 0.16 * near * near)
  })

  const style = {
    left: x,
    top: y,
    x: '-50%',
    y: '-50%',
    rotate: spin,
    opacity,
    scale,
    zIndex: active ? 30 : 10,
    '--ri-color': active ? tone.ink : tone.inkIdle,
    '--ri-hover': active ? tone.ink : tone.inkHover,
  } as MotionStyle

  return (
    <motion.div
      id={`${uid}-opt-${index}`}
      role="option"
      aria-selected={active}
      onPointerDown={() => onPress(index)}
      className="absolute cursor-pointer select-none px-3 py-2 text-[color:var(--ri-color)] transition-colors duration-300 hover:text-[color:var(--ri-hover)]"
      style={style}
    >
      <span className="relative block">
        <span
          className="block whitespace-nowrap font-bold text-xl! uppercase leading-none"
          style={{
            fontSize: fs,
            letterSpacing: '0.11em',
            textShadow: active ? tone.labelGlow : 'none',
          }}
        >
          {option.label}
        </span>
        {option.hint && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full block -translate-x-1/2 whitespace-nowrap pt-1.5 font-medium uppercase leading-none transition-opacity duration-300"
            style={{
              fontSize: Math.max(8, Math.round(fs * 0.6)),
              letterSpacing: '0.22em',
              color: tone.inkSoft,
              opacity: active ? 1 : 0,
            }}
          >
            {option.hint}
          </span>
        )}
      </span>
    </motion.div>
  )
}

/* ── component ──────────────────────────────────────────────────────────── */

export function RadialSelect({
  options,
  position = 'bottom',
  orientation = 'upright',
  variant = 'dock',
  tone: toneName = 'amber',
  value,
  defaultIndex = 0,
  onIndexChange,
  onSelect,
  ariaLabel = 'انتخابگر دایره‌ای',
  className = '',
  showReadout = true,
}: RadialSelectProps) {
  const tone = TONES[toneName]
  const n = options.length
  const sliceDeg = n > 0 ? 360 / n : 360
  const horizontal = AXIS[position] === 'x'
  const textMode = orientation === 'vertical' ? 'upright' : orientation
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const reduce = useReducedMotion() ?? false

  const start = n > 0 ? mod(defaultIndex, n) : 0
  const rot = useMotionValue(start * sliceDeg)
  const upright = useTransform(rot, (r) => -r)

  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  const [index, setIndex] = useState(start)
  const [dragging, setDragging] = useState(false)

  const indexRef = useRef(start)
  /* emit only for user-driven motion — this is what killed the v6 feedback
     loop between the dial and its controlled parent */
  const emitRef = useRef(false)
  const animRef = useRef<AnimationPlaybackControls | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wheelRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef({ x: 0, y: 0 })
  const pressedRef = useRef(-1)
  const dragRef = useRef({ active: false, ang: 0, t: 0, vel: 0, px: 0 })
  const wheelAccRef = useRef({ acc: 0, t: 0 })
  const onIndexChangeRef = useRef(onIndexChange)
  const onSelectRef = useRef(onSelect)
  useIsoLayoutEffect(() => {
    onIndexChangeRef.current = onIndexChange
    onSelectRef.current = onSelect
  })

  /* measure: viewport for dock, element for inline */
  useIsoLayoutEffect(() => {
    if (variant === 'dock') {
      const update = () => setBox(dockBox(position))
      update()
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
    const el = containerRef.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [variant, position])

  const geo = useMemo(
    () => (box && n > 0 ? computeGeo(position, box.w, box.h, n) : null),
    [box, position, n],
  )

  const positions = useMemo(() => {
    if (!geo) return [] as { x: number; y: number }[]
    const rr = geo.R - geo.labelInset
    const a = (ALPHA[position] * Math.PI) / 180
    const s = (2 * Math.PI) / Math.max(1, n)
    return Array.from({ length: n }, (_, i) => {
      const th = a - i * s
      return { x: geo.R + rr * Math.cos(th), y: geo.R + rr * Math.sin(th) }
    })
  }, [geo, position, n])

  /* three tiers per slice — major (once per option), mid, minor — so the
     ring reads as graduated marks, not a sparse row of dashes */
  const ticks = useMemo(
    () =>
      Array.from({ length: n * 4 }, (_, k) => ({
        theta: ALPHA[position] - (k / 4) * sliceDeg,
        tier: k % 4 === 0 ? 2 : k % 2 === 0 ? 1 : 0,
      })),
    [n, position, sliceDeg],
  )

  /* the static arc "rim" the ticks and labels ride along, independent of
     rotation — this is most of what makes it read as a dial at a glance */
  const arc = useMemo(() => {
    if (!geo) return null
    const radius = geo.R - geo.labelInset - geo.railGap + 2
    const cx = geo.wheelLeft + geo.R
    const cy = geo.wheelTop + geo.R
    const span = clamp(sliceDeg * 3.2, 46, 130)
    const a0 = ((ALPHA[position] - span / 2) * Math.PI) / 180
    const a1 = ((ALPHA[position] + span / 2) * Math.PI) / 180
    const p0 = { x: cx + radius * Math.cos(a0), y: cy + radius * Math.sin(a0) }
    const p1 = { x: cx + radius * Math.cos(a1), y: cy + radius * Math.sin(a1) }
    const largeArc = span > 180 ? 1 : 0
    return {
      radius,
      d: `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p1.x} ${p1.y}`,
    }
  }, [geo, position, sliceDeg])

  /* ── motion helpers (declared before every consumer) ── */

  const stopAnim = useCallback(() => {
    animRef.current?.stop()
    animRef.current = null
  }, [])

  const springTo = useCallback(
    (target: number) => {
      stopAnim()
      if (reduce) {
        rot.set(target)
        return
      }
      animRef.current = animate(rot, target, {
        type: 'spring',
        stiffness: 280,
        damping: 24,
        mass: 1,
        restDelta: 0.01,
      })
    },
    [reduce, rot, stopAnim],
  )

  const goToIndex = useCallback(
    (i: number, emit = true) => {
      if (n === 0) return
      emitRef.current = emit
      const target = mod(i, n) * sliceDeg
      const cur = rot.get()
      springTo(cur + wrap180(target - mod(cur, 360)))
    },
    [n, rot, sliceDeg, springTo],
  )

  const stepBy = useCallback(
    (dir: 1 | -1) => {
      emitRef.current = true
      const snapped = Math.round(rot.get() / sliceDeg) * sliceDeg
      springTo(snapped + dir * sliceDeg)
    },
    [rot, sliceDeg, springTo],
  )

  const release = useCallback(
    (vel: number) => {
      stopAnim()
      const snap = (t: number) => Math.round(t / sliceDeg) * sliceDeg
      if (reduce || Math.abs(vel) < 60) {
        springTo(snap(rot.get()))
        return
      }
      animRef.current = animate(rot, rot.get(), {
        type: 'inertia',
        velocity: clamp(vel, -1500, 1500),
        power: 0.75,
        timeConstant: 260,
        modifyTarget: snap,
        restDelta: 0.1,
      })
    },
    [reduce, rot, sliceDeg, springTo, stopAnim],
  )

  /* selection derived from rotation */
  useMotionValueEvent(rot, 'change', (r) => {
    if (n === 0) return
    const i = mod(Math.round(r / sliceDeg), n)
    if (i === indexRef.current) return
    indexRef.current = i
    setIndex(i)
    if (!emitRef.current) return
    onIndexChangeRef.current?.(i)
    const opt = options[i]
    if (opt) onSelectRef.current?.(i, opt)
  })

  /* controlled sync — silent, and never fights an active drag */
  useEffect(() => {
    if (value === undefined || n === 0) return
    const v = mod(value, n)
    if (v === indexRef.current || dragRef.current.active) return
    goToIndex(v, false)
  }, [value, n, goToIndex])

  /* entrance: a single settling turn, skipped when motion is reduced */
  useEffect(() => {
    if (reduce || n === 0) return
    const target = indexRef.current * sliceDeg
    rot.set(target - sliceDeg * 2.4)
    animRef.current = animate(rot, target, {
      type: 'spring',
      stiffness: 120,
      damping: 21,
      mass: 1,
    })
    return () => animRef.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── pointer drag ── */

  const angleOf = (cx: number, cy: number) =>
    Math.atan2(cy - centerRef.current.y, cx - centerRef.current.x)

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (n < 2) return
    const el = wheelRef.current
    if (!el) return
    /* a rotated square's bounding box shares its centre, so this stays exact */
    const rect = el.getBoundingClientRect()
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    emitRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    stopAnim()
    setDragging(true)
    dragRef.current = {
      active: true,
      ang: angleOf(e.clientX, e.clientY),
      t: performance.now(),
      vel: 0,
      px: 0,
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d.active) return
    const a = angleOf(e.clientX, e.clientY)
    const now = performance.now()
    const dRad = Math.atan2(Math.sin(a - d.ang), Math.cos(a - d.ang))
    const gained = ((dRad * 180) / Math.PI) * DRAG_GAIN
    const dt = Math.max(1, now - d.t)
    d.vel = d.vel * 0.62 + (gained / dt) * 1000 * 0.38
    d.ang = a
    d.t = now
    d.px += Math.abs(e.movementX) + Math.abs(e.movementY)
    rot.set(rot.get() + gained)
  }

  const handlePointerUp = () => {
    const d = dragRef.current
    if (!d.active) return
    d.active = false
    setDragging(false)
    const pressed = pressedRef.current
    pressedRef.current = -1
    /* tap measured in pixels, not degrees */
    if (d.px < 6 && pressed >= 0) {
      goToIndex(pressed, true)
      return
    }
    release(d.vel)
  }

  const pressItem = useCallback((i: number) => {
    pressedRef.current = i
  }, [])

  /* ── wheel / trackpad: never steal the page scroll ── */
  const ready = !!geo
  useEffect(() => {
    const el = containerRef.current
    if (!el || !ready || n < 2) return
    const onWheel = (e: WheelEvent) => {
      const main = horizontal ? e.deltaX : e.deltaY
      const cross = horizontal ? e.deltaY : e.deltaX
      const engaged =
        el === document.activeElement || el.contains(document.activeElement)
      const delta =
        Math.abs(main) >= Math.abs(cross)
          ? main
          : engaged || e.shiftKey
            ? cross
            : 0
      if (!delta) return // let the document scroll
      e.preventDefault()
      emitRef.current = true
      const now = performance.now()
      const w = wheelAccRef.current
      if (now - w.t > 160) w.acc = 0
      w.t = now
      w.acc += delta
      if (Math.abs(w.acc) > 22) {
        const dir = w.acc > 0 ? 1 : -1
        w.acc = 0
        stepBy(dir)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [ready, horizontal, n, stepBy])

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (n < 2) return
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        stepBy(1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        stepBy(-1)
        break
      case 'Home':
        e.preventDefault()
        goToIndex(0, true)
        break
      case 'End':
        e.preventDefault()
        goToIndex(n - 1, true)
        break
      default:
        break
    }
  }

  const current = options[index]
  const sizeDefault =
    variant === 'inline' && !className
      ? horizontal
        ? 'h-[clamp(124px,20vh,168px)] w-full'
        : 'h-full w-[clamp(170px,22vw,260px)]'
      : ''

  const rootStyle = {
    touchAction: horizontal ? 'pan-y' : 'pan-x',
    ...(variant === 'dock' && box
      ? horizontal
        ? { height: box.h }
        : { width: box.w }
      : null),
    ['--rs-ring' as string]: tone.ring,
  } as CSSProperties

  /* rail + detent live in container space, aligned to the tick ring */
  const railStyle: CSSProperties = geo
    ? horizontal
      ? {
          left: '8%',
          right: '8%',
          height: 1,
          top:
            position === 'bottom'
              ? geo.apex + geo.railGap
              : geo.apex - geo.railGap,
          backgroundImage: `linear-gradient(to right, transparent, ${tone.rail} 22%, ${tone.rail} 78%, transparent)`,
        }
      : {
          top: '8%',
          bottom: '8%',
          width: 1,
          left:
            position === 'right'
              ? geo.apex + geo.railGap
              : geo.apex - geo.railGap,
          backgroundImage: `linear-gradient(to bottom, transparent, ${tone.rail} 22%, ${tone.rail} 78%, transparent)`,
        }
    : {}

  const detentStyle: CSSProperties = geo
    ? horizontal
      ? {
          left: '50%',
          top:
            position === 'bottom'
              ? geo.apex + geo.railGap
              : geo.apex - geo.railGap,
          width: 2,
          height: 18,
          transform: 'translate(-50%, -50%)',
        }
      : {
          top: '50%',
          left:
            position === 'right'
              ? geo.apex + geo.railGap
              : geo.apex - geo.railGap,
          width: 18,
          height: 2,
          transform: 'translate(-50%, -50%)',
        }
    : {}

  const haloStyle: CSSProperties = geo
    ? {
        left: horizontal ? '50%' : geo.apex,
        top: horizontal ? geo.apex : '50%',
        width: horizontal ? '46%' : 190,
        height: horizontal ? 132 : '38%',
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(closest-side, ${tone.halo}, transparent)`,
      }
    : {}

  return (
    <div
      ref={containerRef}
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation={horizontal ? 'horizontal' : 'vertical'}
      aria-activedescendant={current ? `${uid}-opt-${index}` : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      className={[
        variant === 'dock' ? `fixed z-40 ${EDGE_CLASS[position]}` : 'relative',
        n > 1
          ? dragging
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : 'cursor-default',
        'select-none overflow-hidden outline-none',
        'focus-visible:ring-1 focus-visible:ring-[color:var(--rs-ring)]',
        sizeDefault,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
    >
      <span aria-live="polite" className="sr-only">
        {current ? `${current.label}، ${index + 1} از ${n}` : ''}
      </span>

      {geo && n > 0 && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute transition-opacity duration-300"
            style={{ ...haloStyle, opacity: dragging ? 1 : 0.72 }}
          />

          {arc && (
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-visible"
              width={box?.w ?? 0}
              height={box?.h ?? 0}
            >
              <path
                d={arc.d}
                fill="none"
                stroke={tone.rail}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          )}

          <motion.div
            ref={wheelRef}
            className="absolute will-change-transform"
            style={{
              width: geo.D,
              height: geo.D,
              left: geo.wheelLeft,
              top: geo.wheelTop,
              rotate: rot,
            }}
            animate={{ scale: dragging ? 1.015 : 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {ticks.map((t, k) => (
              <Tick
                key={`t${k}`}
                rot={rot}
                thetaDeg={t.theta}
                alphaDeg={ALPHA[position]}
                sliceDeg={sliceDeg}
                tier={t.tier}
                R={geo.R}
                radius={geo.R - geo.labelInset - geo.railGap}
                color={tone.tick}
              />
            ))}
            {options.map((o, i) => (
              <RadialItem
                key={o.id}
                uid={uid}
                index={i}
                option={o}
                x={positions[i]?.x ?? 0}
                y={positions[i]?.y ?? 0}
                spin={
                  textMode === 'upright'
                    ? upright
                    : ALPHA[position] -
                      i * sliceDeg +
                      FLIP[position] +
                      (textMode === 'tangential' ? 90 : 0)
                }
                fs={geo.fs}
                sliceDeg={sliceDeg}
                rot={rot}
                active={i === index}
                tone={tone}
                onPress={pressItem}
              />
            ))}
          </motion.div>

          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={railStyle}
          />
          <motion.div
            aria-hidden
            key={index}
            initial={reduce ? false : { scaleY: 0.5, opacity: 0.3 }}
            animate={
              reduce
                ? { scaleY: 1, opacity: 1 }
                : { scaleY: [0.25, 1.3, 1], opacity: 1 }
            }
            transition={{
              duration: 0.32,
              times: reduce ? undefined : [0, 0.55, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute z-20 rounded-full"
            style={{
              ...detentStyle,
              background: tone.marker,
              boxShadow: tone.markerGlow,
            }}
          />

          {showReadout && current && (
            <div
              className={`pointer-events-none absolute z-30 ${
                horizontal
                  ? position === 'bottom'
                    ? 'bottom-3 left-1/2 -translate-x-1/2'
                    : 'top-3 left-1/2 -translate-x-1/2'
                  : position === 'left'
                    ? 'left-3 top-1/2 -translate-y-1/2'
                    : 'right-3 top-1/2 -translate-y-1/2'
              }`}
            >
              <div
                className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-sm"
                style={{
                  background: tone.chipBg,
                  borderColor: tone.chipLine,
                  color: tone.chipInk,
                }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: tone.marker }}
                />
                <span className="whitespace-nowrap text-xs  font-medium uppercase tracking-[0.16em] tabular-nums">
                  {String(index + 1).padStart(2, '0')} · {current.label}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {n === 0 && (
        <p
          className="absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.2em]"
          style={{ color: tone.inkIdle }}
        >
          Nothing to select
        </p>
      )}
    </div>
  )
}
