'use client'

/* ============================================================================
   BodySculptShowcase — v6  (+ RadialSelect dial integration)
   Changes:
   1. RADIAL DIAL AS MENU/SELECTOR: the radial snap-picker now lives under the
      card and drives the whole showcase (slides, morphing title, side lists,
      counter). Side lists + dial + swipe + keys all stay in sync via one
      controlled index.
   2. TEXT ROTATION FIX: vertical mode now cancels the wheel spin with a single
      shared transform (own = -90 - rot), so labels are truly upright; radial
      (spoke) mode uses theta + flip per item.
   3. SOFTER SNAP: detent drag resistance removed; gentle spring settle
      (240/26), natural inertia (power .8, τ 350), subtle marker pulse.
   4. RadialSelect upgrades: `variant: "dock" | "inline"`, `tone`,
      controlled `value` + `onIndexChange`, adaptive diameter for few options,
      clipped wheel layer so inline dials never leak outside their strip.
   5. Mobile chips removed — the dial is the touch selector on small screens.
============================================================================ */

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties } from 'react'
import type { AnimationPlaybackControls, MotionValue } from 'framer-motion'

/* ══════════════════════════════════════════════════════════════════════════
   RadialSelect — reusable radial snap-picker
══════════════════════════════════════════════════════════════════════════ */

export type RadialPosition = 'bottom' | 'top' | 'left' | 'right'
export type TextOrientation = 'vertical' | 'radial'
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
  orientation?: TextOrientation
  variant?: RadialVariant // dock = fixed to viewport edge, inline = in-flow strip
  tone?: RadialTone
  value?: number // controlled selected index
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onSelect?: (index: number, option: RadialOption) => void
  ariaLabel?: string
  className?: string
  showReadout?: boolean
}

interface Geo {
  D: number
  wheelLeft: number
  wheelTop: number
  itemSize: number
}

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
const RADIAL_FLIP: Record<RadialPosition, number> = {
  bottom: 0,
  top: -180,
  left: 0,
  right: -180,
}

const EDGE_CLASS: Record<RadialPosition, string> = {
  bottom: 'left-0 right-0 bottom-0',
  top: 'left-0 right-0 top-0',
  left: 'top-0 bottom-0 left-0',
  right: 'top-0 bottom-0 right-0',
}
const CHIP_POS: Record<RadialPosition, string> = {
  bottom: 'bottom-3 left-1/2 -translate-x-1/2',
  top: 'top-3 left-1/2 -translate-x-1/2',
  left: 'left-3 top-1/2 -translate-y-1/2',
  right: 'right-3 top-1/2 -translate-y-1/2',
}
const GLOW_POS: Record<RadialPosition, string> = {
  bottom: '-top-28 left-1/2 -translate-x-1/2',
  top: '-bottom-28 left-1/2 -translate-x-1/2',
  left: '-right-28 top-1/2 -translate-y-1/2',
  right: '-left-28 top-1/2 -translate-y-1/2',
}
const MARKER_POS: Record<RadialPosition, string> = {
  bottom: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
  top: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2',
  left: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
  right: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
}
const EDGE_LINE: Record<RadialPosition, string> = {
  bottom: 'top-0 left-[12%] right-[12%] h-px bg-gradient-to-r',
  top: 'bottom-0 left-[12%] right-[12%] h-px bg-gradient-to-r',
  left: 'right-0 top-[12%] bottom-[12%] w-px bg-gradient-to-b',
  right: 'left-0 top-[12%] bottom-[12%] w-px bg-gradient-to-b',
}

interface ToneSpec {
  glow: string
  edgeLine: string
  markerBg: string
  markerShadow: string
  chipDot: string
  chipDotShadow: string
  activeLabel: string
  activeHint: string
  idleLabel: string
  labelGlow: string
  focusRing: string
  tick: string
}

const TONES: Record<RadialTone, ToneSpec> = {
  amber: {
    glow: 'bg-amber-400/10',
    edgeLine: 'via-amber-300/40',
    markerBg: 'bg-amber-300',
    markerShadow: '0 0 16px 2px rgba(252,211,77,0.55)',
    chipDot: 'bg-amber-300',
    chipDotShadow: '0 0 8px rgba(252,211,77,0.9)',
    activeLabel: 'text-amber-200',
    activeHint: 'text-amber-300/80',
    idleLabel: 'text-zinc-500 hover:text-zinc-300',
    labelGlow: '0 0 22px rgba(252,211,77,0.55)',
    focusRing: 'focus-visible:ring-amber-300/40',
    tick: 'bg-zinc-400',
  },
  ivory: {
    glow: 'bg-white/10',
    edgeLine: 'via-white/40',
    markerBg: 'bg-white',
    markerShadow: '0 0 16px 2px rgba(255,255,255,0.5)',
    chipDot: 'bg-white',
    chipDotShadow: '0 0 8px rgba(255,255,255,0.8)',
    activeLabel: 'text-white',
    activeHint: 'text-white/70',
    idleLabel: 'text-white/40 hover:text-white/75',
    labelGlow: '0 0 22px rgba(255,255,255,0.45)',
    focusRing: 'focus-visible:ring-white/40',
    tick: 'bg-white/60',
  },
}

const wrap180 = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180

function dockBox(position: RadialPosition) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return AXIS[position] === 'x'
    ? { w: vw, h: Math.round(Math.min(320, Math.max(190, vh * 0.26))) }
    : { w: Math.round(Math.min(340, Math.max(210, vw * 0.26))), h: vh }
}

/* adaptive diameter: keeps neighbours visible even with few options */
function computeGeo(
  position: RadialPosition,
  cw: number,
  ch: number,
  n: number,
): Geo {
  const slice = 360 / Math.max(1, n)
  const fit = (Math.min(slice, 60) * Math.PI) / 180
  if (AXIS[position] === 'x') {
    const R = (cw * 0.5 * 0.94) / Math.sin(fit)
    const D = Math.round(Math.min(3000, Math.max(560, 2 * R)))
    return {
      D,
      wheelLeft: (cw - D) / 2,
      wheelTop: position === 'bottom' ? 0 : ch - D,
      itemSize: Math.round(Math.min(150, Math.max(76, D * 0.075))),
    }
  }
  const R = (ch * 0.5 * 0.94) / Math.sin(fit)
  const D = Math.round(Math.min(3000, Math.max(560, 2 * R)))
  return {
    D,
    wheelTop: (ch - D) / 2,
    wheelLeft: position === 'left' ? cw - D : 0,
    itemSize: Math.round(Math.min(132, Math.max(70, D * 0.066))),
  }
}

/* ------------------------------ tick line ------------------------------ */

interface TickProps {
  rot: MotionValue<number>
  thetaDeg: number
  alphaDeg: number
  sliceDeg: number
  major: boolean
  R: number
  tickClass: string
}

function Tick({
  rot,
  thetaDeg,
  alphaDeg,
  sliceDeg,
  major,
  R,
  tickClass,
}: TickProps) {
  const rad = (thetaDeg * Math.PI) / 180
  const x = R + R * Math.cos(rad)
  const y = R + R * Math.sin(rad)
  const opacity = useTransform(rot, (r) => {
    const d = Math.abs(wrap180(thetaDeg + r - alphaDeg))
    const t = Math.min(d / (sliceDeg * 2.8), 1)
    return (major ? 0.55 : 0.28) * (1 - t * 0.9)
  })
  return (
    <motion.span
      aria-hidden
      className={`absolute rounded-full ${tickClass}`}
      style={{
        left: x,
        top: y,
        x: "-50%",
        y: "-50%",
        width: major ? 2 : 1.5,
        height: major ? 16 : 8,
        rotate: thetaDeg,
        opacity,
      }}
    />
  )
}

/* ------------------------------ text label ------------------------------ */

interface RadialItemProps {
  uid: string
  index: number
  label: string
  hint?: string
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
  label,
  hint,
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
    const t = Math.min(distOf(r) / (sliceDeg * 2.8), 1)
    return 1 - t * 0.92
  })
  const scale = useTransform(rot, (r) => {
    const d = distOf(r)
    const t = Math.min(d / (sliceDeg * 2.8), 1)
    const near = Math.max(0, 1 - d / (sliceDeg * 0.62))
    return (1 - t * 0.18) * (1 + 0.2 * near * near)
  })

  return (
    <motion.div
      id={`${uid}-${index}`}
      role="option"
      aria-selected={active}
      onPointerDown={() => onPress(index)}
      className={`absolute flex cursor-pointer select-none items-center gap-1.5 px-3 py-2 transition-colors duration-300 ${
        active ? tone.activeLabel : tone.idleLabel
      }`}
      style={{
        left: x,
        top: y,
        x: "-50%",
        y: "-50%",
        rotate: spin,
        opacity,
        scale,
        zIndex: active ? 30 : 10,
      }}
    >
      <span
        className="whitespace-nowrap font-semibold leading-none"
        style={{
          fontSize: fs,
          letterSpacing: '0.05em',
          textShadow: active ? tone.labelGlow : 'none',
        }}
      >
        {label}
      </span>
      {hint && (
        <span
          className={`whitespace-nowrap font-medium uppercase leading-none ${
            active ? tone.activeHint : 'opacity-50'
          }`}
          style={{ fontSize: Math.max(8, fs * 0.55), letterSpacing: '0.18em' }}
        >
          {hint}
        </span>
      )}
    </motion.div>
  )
}

/* ------------------------------ component ------------------------------ */

export function RadialSelect({
  options,
  position = 'bottom',
  orientation = 'vertical',
  variant = 'dock',
  tone: toneName = 'amber',
  value,
  defaultIndex = 0,
  onIndexChange,
  onSelect,
  ariaLabel = 'Radial menu',
  className = '',
  showReadout = true,
}: RadialSelectProps) {
  const tone = TONES[toneName]
  const n = options.length
  const sliceDeg = n > 0 ? 360 / n : 360
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  const rot = useMotionValue(defaultIndex * sliceDeg)
  const uprightRot = useTransform(rot, (r) => -90 - r) // truly vertical text

  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  const [index, setIndex] = useState(((defaultIndex % n) + n) % n)
  const [dragging, setDragging] = useState(false)

  const indexRef = useRef(index)
  const settledRef = useRef(false)
  const animRef = useRef<AnimationPlaybackControls | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wheelRef = useRef<HTMLDivElement | null>(null)
  const centerRef = useRef({ x: 0, y: 0 })
  const pressedRef = useRef(-1)
  const dragRef = useRef({
    active: false,
    lastA: 0,
    lastT: 0,
    vel: 0,
    moved: 0,
  })
  const wheelEvRef = useRef({ acc: 0, t: 0 })
  const onIndexChangeRef = useRef(onIndexChange)
  const onSelectRef = useRef(onSelect)
  useLayoutEffect(() => {
    onIndexChangeRef.current = onIndexChange
    onSelectRef.current = onSelect
  })

  /* measure (viewport for dock, element for inline) */
  useLayoutEffect(() => {
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
    () => (box ? computeGeo(position, box.w, box.h, n) : null),
    [box, position, n],
  )

  const positions = useMemo(() => {
    if (!geo) return [] as { x: number; y: number }[]
    const R = geo.D / 2
    const inset = Math.max(30, geo.itemSize * 0.3)
    const rr = R - inset
    const aRad = (ALPHA[position] * Math.PI) / 180
    const sRad = (2 * Math.PI) / Math.max(1, n)
    return Array.from({ length: n }, (_, i) => {
      const th = aRad - i * sRad
      return { x: R + rr * Math.cos(th), y: R + rr * Math.sin(th) }
    })
  }, [geo, position, n])

  /* selection tracking → notify parent live */
  useMotionValueEvent(rot, 'change', (r) => {
    const i = ((Math.round(r / sliceDeg) % n) + n) % n
    if (i !== indexRef.current) {
      indexRef.current = i
      setIndex(i)
      if (settledRef.current) {
        onIndexChangeRef.current?.(i)
        const opt = options[i]
        if (opt) onSelectRef.current?.(i, opt)
      }
    }
  })

  /* controlled value sync */
  useEffect(() => {
    if (value === undefined) return
    const v = ((value % n) + n) % n
    if (v !== indexRef.current) {
      settledRef.current = true
      selectIndex(v)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, n])

  /* entrance flourish */
  useEffect(() => {
    const target = indexRef.current * sliceDeg
    rot.set(target - sliceDeg * 3.25)
    animRef.current = animate(rot, target, {
      type: 'spring',
      stiffness: 110,
      damping: 19,
      mass: 1,
    })
    const tm = window.setTimeout(() => {
      settledRef.current = true
    }, 1000)
    return () => {
      window.clearTimeout(tm)
      animRef.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* soft animation helpers */
  const stopAnim = () => {
    animRef.current?.stop()
    animRef.current = null
  }
  const snapDeg = (r: number) => Math.round(r / sliceDeg) * sliceDeg
  const springTo = (target: number) => {
    stopAnim()
    animRef.current = animate(rot, target, {
      type: 'spring',
      stiffness: 240,
      damping: 26,
      mass: 1,
      restDelta: 0.01,
    })
  }
  function selectIndex(i: number) {
    settledRef.current = true
    const target = (((i % n) + n) % n) * sliceDeg
    const cur = rot.get()
    const curMod = ((cur % 360) + 360) % 360
    springTo(cur + wrap180(target - curMod))
  }
  const release = (vel: number) => {
    stopAnim()
    if (Math.abs(vel) < 50) {
      springTo(snapDeg(rot.get()))
      return
    }
    const v = Math.max(-1400, Math.min(1400, vel))
    animRef.current = animate(rot, rot.get(), {
      type: 'inertia',
      velocity: v,
      power: 0.8,
      timeConstant: 350,
      modifyTarget: (t: number) => Math.round(t / sliceDeg) * sliceDeg,
      restDelta: 0.1,
    })
  }
  const stepBy = (dir: 1 | -1) => {
    settledRef.current = true
    stopAnim()
    springTo(snapDeg(rot.get()) + dir * sliceDeg)
  }

  /* drag (angle-based, centre read from the wheel's bounding rect) */
  const angleOf = (cx: number, cy: number) =>
    Math.atan2(cy - centerRef.current.y, cx - centerRef.current.x)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wheelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
    settledRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    stopAnim()
    setDragging(true)
    dragRef.current = {
      active: true,
      lastA: angleOf(e.clientX, e.clientY),
      lastT: performance.now(),
      vel: 0,
      moved: 0,
    }
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d.active) return
    const a = angleOf(e.clientX, e.clientY)
    const now = performance.now()
    let dRad = a - d.lastA
    dRad = Math.atan2(Math.sin(dRad), Math.cos(dRad))
    const dDeg = (dRad * 180) / Math.PI
    const dt = Math.max(1, now - d.lastT)
    d.vel = d.vel * 0.65 + (dDeg / dt) * 1000 * 0.35
    d.lastA = a
    d.lastT = now
    d.moved += Math.abs(dDeg)
    rot.set(rot.get() + dDeg)
  }
  const handlePointerUp = () => {
    const d = dragRef.current
    if (!d.active) return
    d.active = false
    setDragging(false)
    const pressed = pressedRef.current
    pressedRef.current = -1
    if (d.moved < 0.9 && pressed >= 0) {
      selectIndex(pressed)
      return
    }
    release(d.vel)
  }
  const pressItem = (i: number) => {
    pressedRef.current = i
  }

  /* wheel stepping */
  const ready = !!geo
  useEffect(() => {
    const el = containerRef.current
    if (!el || !ready) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      settledRef.current = true
      stopAnim()
      const now = performance.now()
      const w = wheelEvRef.current
      if (now - w.t > 180) w.acc = 0
      w.t = now
      w.acc += e.deltaY
      if (Math.abs(w.acc) > 18) {
        const dir = w.acc > 0 ? 1 : -1
        w.acc = 0
        springTo(snapDeg(rot.get()) + dir * sliceDeg)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sliceDeg])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      stepBy(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      stepBy(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      selectIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      selectIndex(n - 1)
    }
  }

  const horizontal = AXIS[position] === 'x'
  const sizeDefault =
    variant === 'inline' && !className
      ? horizontal
        ? 'h-[clamp(150px,26vh,220px)]'
        : 'h-full w-[clamp(180px,24vw,280px)]'
      : ''

  const cur = options[index]
  const fs = Math.max(12, Math.min(18, geo ? geo.itemSize * 0.115 : 14))

  return (
    <div
      ref={containerRef}
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-activedescendant={cur ? `${uid}-${index}` : undefined}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      className={[
        variant === 'dock' ? `fixed z-50 ${EDGE_CLASS[position]}` : 'relative',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        'select-none outline-none focus-visible:ring-1',
        tone.focusRing,
        sizeDefault,
        className,
      ].join(' ')}
      style={{
        touchAction: 'none',
        ...(variant === 'dock' && box
          ? horizontal
            ? { height: box.h }
            : { width: box.w }
          : null),
      }}
    >
      {geo && box && n > 0 && (
        <>
          {/* clipped wheel layer */}
          <div className="absolute inset-0 overflow-hidden">
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
            >
              {Array.from({ length: n }, (_, j) => (
                <Fragment key={`tick-${j}`}>
                  <Tick
                    rot={rot}
                    thetaDeg={ALPHA[position] - j * sliceDeg}
                    alphaDeg={ALPHA[position]}
                    sliceDeg={sliceDeg}
                    major
                    R={geo.D / 2}
                    tickClass={tone.tick}
                  />
                  <Tick
                    rot={rot}
                    thetaDeg={ALPHA[position] - (j + 0.5) * sliceDeg}
                    alphaDeg={ALPHA[position]}
                    sliceDeg={sliceDeg}
                    major={false}
                    R={geo.D / 2}
                    tickClass={tone.tick}
                  />
                </Fragment>
              ))}
              {options.map((o, i) => (
                <RadialItem
                  key={`${o.id}-${i}`}
                  uid={uid}
                  index={i}
                  label={o.label}
                  hint={o.hint}
                  x={positions[i]?.x ?? 0}
                  y={positions[i]?.y ?? 0}
                  spin={
                    orientation === 'vertical'
                      ? uprightRot
                      : ALPHA[position] - i * sliceDeg + RADIAL_FLIP[position]
                  }
                  fs={fs}
                  sliceDeg={sliceDeg}
                  rot={rot}
                  active={i === index}
                  tone={tone}
                  onPress={pressItem}
                />
              ))}
            </motion.div>
          </div>

          {/* glow + rim line + soft marker */}
          <div
            aria-hidden
            className={`pointer-events-none absolute h-48 w-48 rounded-full blur-3xl ${tone.glow} ${GLOW_POS[position]}`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute from-transparent to-transparent ${tone.edgeLine} ${EDGE_LINE[position]}`}
          />
          <div
            className={`pointer-events-none absolute z-40 ${MARKER_POS[position]}`}
          >
            <motion.div
              key={index}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`rounded-full ${tone.markerBg}`}
              style={{
                width: horizontal ? 2.5 : 26,
                height: horizontal ? 26 : 2.5,
                boxShadow: tone.markerShadow,
              }}
            />
          </div>

          {/* readout chip */}
          {showReadout && cur && (
            <div
              className={`pointer-events-none absolute z-40 ${CHIP_POS[position]}`}
            >
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 backdrop-blur-md">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${tone.chipDot}`}
                  style={{ boxShadow: tone.chipDotShadow }}
                />
                <span className="relative overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={index}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="block whitespace-nowrap text-[11px] font-medium tracking-wider text-zinc-200"
                    >
                      {cur.label}
                      {cur.hint && (
                        <span className="text-zinc-500"> · {cur.hint}</span>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   BodySculptShowcase — v6
══════════════════════════════════════════════════════════════════════════ */

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
  idleResumeMs?: number
  className?: string
}

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

  /* v6: dial options derived from slides */
  const dialOptions = useMemo(
    () =>
      slides.map((s, i) => ({
        id: s.id,
        label: s.title,
        hint: String(i + 1).padStart(2, '0'),
      })),
    [slides],
  )

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
        className={`group flex w-full items-center gap-2 outline-none ${
          side === 'left' ? 'justify-end text-right' : 'justify-start text-left'
        }`}
      >
        {side === 'left' ? (
          <>
            <span
              className={`hidden text-[clamp(8px,1cqi,11px)] tracking-[0.2em] transition lg:block ${
                active ? 'text-white/80' : 'text-white/30'
              }`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`truncate text-[clamp(10px,1.4cqi,15px)] uppercase leading-tight tracking-[0.12em] transition ${
                active
                  ? 'text-white'
                  : 'text-white/40 group-hover:text-white/75'
              }`}
            >
              {s.title}
            </span>
            <span
              className={`h-[5px] w-[5px] shrink-0 rounded-full transition ${
                active
                  ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'bg-white/30'
              }`}
            />
            <span
              className={`h-px shrink-0 transition-all duration-500 ${
                active
                  ? 'w-7 bg-white'
                  : 'w-3.5 bg-white/25 group-hover:bg-white/50'
              }`}
            />
          </>
        ) : (
          <>
            <span
              className={`h-px shrink-0 transition-all duration-500 ${
                active
                  ? 'w-7 bg-white'
                  : 'w-3.5 bg-white/25 group-hover:bg-white/50'
              }`}
            />
            <span
              className={`h-[5px] w-[5px] shrink-0 rounded-full transition ${
                active
                  ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : 'bg-white/30'
              }`}
            />
            <span
              className={`truncate text-[clamp(10px,1.4cqi,15px)] uppercase leading-tight tracking-[0.12em] transition ${
                active
                  ? 'text-white'
                  : 'text-white/40 group-hover:text-white/75'
              }`}
            >
              {s.title}
            </span>
            <span
              className={`hidden text-[clamp(8px,1cqi,11px)] tracking-[0.2em] transition lg:block ${
                active ? 'text-white/80' : 'text-white/30'
              }`}
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

        {/* the card */}
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

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_42%,transparent_38%,rgba(12,5,2,0.45)_75%,rgba(4,1,0,0.8)_100%)]" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(5,2,0,0.85)]" />

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
          <div className="pointer-events-none absolute inset-x-0 top-[75%] z-20 md:top-[84%]">
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

      {/* v6: radial procedure dial — the menu/selector, synced with everything */}
      <div className="flex w-full flex-col items-center">
        <RadialSelect
          variant="inline"
          position="bottom"
          orientation="vertical"
          tone="ivory"
          value={index}
          onIndexChange={select}
          options={dialOptions}
          showReadout={false}
          ariaLabel="Select procedure"
          className="h-[clamp(150px,26vh,220px)] w-full"
        />
      </div>
    </div>
  )
}
