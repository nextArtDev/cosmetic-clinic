import {
  memo,
  useMemo,
  useRef,
  useLayoutEffect,
  type CSSProperties,
  type ReactNode,
} from 'react'

/* ─────────────────────────────── Types ─────────────────────────────── */

export type OrbitShape =
  | 'ellipse'
  | 'circle'
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'infinity'
  | 'wave'
  | 'custom'

export type OrbitEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'

export interface OrbitProps {
  /** Any React elements to place on the orbit — icons, logos, avatars, custom markup. */
  items?: ReactNode[]
  shape?: OrbitShape
  customPath?: string
  /** Design-space canvas size. The path is built inside a `baseWidth × baseWidth` box. */
  baseWidth?: number
  radiusX?: number
  radiusY?: number
  radius?: number
  starPoints?: number
  starInnerRatio?: number
  /** Static tilt of the whole orbit, in degrees. */
  rotation?: number
  /** Seconds for one full revolution. */
  duration?: number
  itemSize?: number | 'auto'
  direction?: 'normal' | 'reverse'
  /** Evenly distribute items around the path (via negative animation delays). */
  fill?: boolean
  width?: number | string
  height?: number | string
  className?: string
  showPath?: boolean
  pathColor?: string
  pathWidth?: number
  easing?: OrbitEasing
  paused?: boolean
  centerContent?: ReactNode
  /** Scale a fixed `baseWidth` canvas to fit the container width. */
  responsive?: boolean
}

/* ─────────────────────────── Path generation ───────────────────────── */

const round = (n: number, p = 2): number => {
  const f = 10 ** p
  return Math.round(n * f) / f
}

type PathArgs = {
  cx: number
  cy: number
  radiusX: number
  radiusY: number
  radius: number
  starPoints: number
  starInnerRatio: number
}

function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`
}

const PATH_BUILDERS: Record<
  Exclude<OrbitShape, 'custom'>,
  (a: PathArgs) => string
> = {
  ellipse: ({ cx, cy, radiusX, radiusY }) => ellipse(cx, cy, radiusX, radiusY),
  circle: ({ cx, cy, radius }) => ellipse(cx, cy, radius, radius),
  square: ({ cx, cy, radius }) => {
    const h = radius
    return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`
  },
  rectangle: ({ cx, cy, radiusX, radiusY }) => {
    const hw = radiusX
    const hh = radiusY
    return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`
  },
  triangle: ({ cx, cy, radius }) => {
    const s = radius * 2
    return `M ${cx} ${cy - s / 1.5} L ${cx + s / 2} ${cy + s / 3} L ${cx - s / 2} ${cy + s / 3} Z`
  },
  star: ({ cx, cy, radius, starPoints, starInnerRatio }) => {
    const step = Math.PI / starPoints
    const parts: string[] = []
    for (let i = 0; i < starPoints * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * starInnerRatio
      const a = i * step - Math.PI / 2
      parts.push(
        `${i === 0 ? 'M' : 'L'} ${round(cx + r * Math.cos(a))} ${round(cy + r * Math.sin(a))}`,
      )
    }
    return `${parts.join(' ')} Z`
  },
  heart: ({ cx, cy, radius }) => {
    const s = (radius * 2) / 30
    return [
      `M ${cx} ${round(cy + 12 * s)}`,
      `C ${round(cx - 20 * s)} ${round(cy - 5 * s)}, ${round(cx - 12 * s)} ${round(cy - 18 * s)}, ${cx} ${round(cy - 8 * s)}`,
      `C ${round(cx + 12 * s)} ${round(cy - 18 * s)}, ${round(cx + 20 * s)} ${round(cy - 5 * s)}, ${cx} ${round(cy + 12 * s)}`,
    ].join(' ')
  },
  infinity: ({ cx, cy, radiusX, radiusY }) => {
    const hw = radiusX
    const hh = radiusY
    return [
      `M ${cx} ${cy}`,
      `C ${round(cx + hw * 0.5)} ${round(cy - hh)}, ${cx + hw} ${round(cy - hh)}, ${cx + hw} ${cy}`,
      `C ${cx + hw} ${round(cy + hh)}, ${round(cx + hw * 0.5)} ${round(cy + hh)}, ${cx} ${cy}`,
      `C ${round(cx - hw * 0.5)} ${round(cy + hh)}, ${cx - hw} ${round(cy + hh)}, ${cx - hw} ${cy}`,
      `C ${cx - hw} ${round(cy - hh)}, ${round(cx - hw * 0.5)} ${round(cy - hh)}, ${cx} ${cy}`,
    ].join(' ')
  },
  wave: ({ cx, cy, radiusX, radiusY }) => {
    const w = radiusX * 2
    const waves = 3
    const segs = waves * 20
    const pts: string[] = []
    for (let side = 0; side < 2; side++) {
      const sign = side === 0 ? 1 : -1
      for (
        let i = side === 0 ? 0 : segs;
        side === 0 ? i <= segs : i >= 0;
        side === 0 ? i++ : i--
      ) {
        const x = round(cx - radiusX + (w * i) / segs)
        const y = round(
          cy + sign * Math.sin((i / segs) * waves * 2 * Math.PI) * radiusY,
        )
        pts.push(`${x === null ? '' : pts.length === 0 ? 'M' : 'L'} ${x} ${y}`)
      }
    }
    return `${pts.join(' ')} Z`
  },
}

/** Builds the motion path for the given configuration, in design-space coordinates. */
function buildOrbitPath(
  shape: OrbitShape,
  customPath: string | undefined,
  args: PathArgs,
): string {
  if (shape === 'custom') {
    return customPath ?? PATH_BUILDERS.circle(args)
  }
  return PATH_BUILDERS[shape](args)
}

/* ──────────────────────────── Animation CSS ────────────────────────── */

const ANIM_NAME = 'orbit-travel-9f3a'
const ITEM_CLASS = 'orbit-ring__item'

// Rendered once per instance; identical duplicates across instances are harmless.
const ORBIT_CSS = `
@keyframes ${ANIM_NAME} {
  from { offset-distance: 0%; }
  to   { offset-distance: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .${ITEM_CLASS} { animation-play-state: paused !important; }
}`

const EASING_TO_CSS: Record<OrbitEasing, string> = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
}

/* ──────────────────────────── Sub-components ───────────────────────── */

interface OrbitItemProps {
  children: ReactNode
  index: number
  total: number
  path: string
  itemSize?: number | 'auto'
  counterRotation: number
  duration: number
  easing: string
  reversed: boolean
  paused: boolean
  distributed: boolean
}

/**
 * Renders one element pinned to the motion path. Pure CSS drives its position,
 * so this component never re-renders due to the animation progressing.
 */
const OrbitItem = memo(function OrbitItem({
  children,
  index,
  total,
  path,
  itemSize,
  counterRotation,
  duration,
  easing,
  reversed,
  paused,
  distributed,
}: OrbitItemProps) {
  const delay = distributed ? -(index / total) * duration : 0
  const sizeStyle: CSSProperties =
    itemSize === 'auto'
      ? { width: 'max-content' } // shrink-wrap the card
      : { width: itemSize, height: itemSize }

  const style: CSSProperties = {
    ...sizeStyle,
    offsetAnchor: 'center center',
    offsetPath: `path("${path}")`,
    offsetRotate: '0deg',
    animation: `${ANIM_NAME} ${duration}s ${easing} infinite ${reversed ? 'reverse' : 'normal'}`,
    animationDelay: `${delay}s`,
    animationPlayState: paused ? 'paused' : 'running',
  }

  return (
    <div
      className={`${ITEM_CLASS} pointer-events-none absolute select-none`}
      style={style}
    >
      {/* Counter-rotate so items stay upright despite the tilted orbit plane. */}
      <div
        className="h-full w-full"
        style={{ transform: `rotate(${counterRotation}deg)` }}
      >
        {children}
      </div>
    </div>
  )
})

interface PathPreviewProps {
  path: string
  color: string
  strokeWidth: number
  baseWidth: number
}

/** Optional stroked outline of the orbit path. */
function PathPreview({
  path,
  color,
  strokeWidth,
  baseWidth,
}: PathPreviewProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      viewBox={`0 0 ${baseWidth} ${baseWidth}`}
      aria-hidden="true"
    >
      {/* Stays the authored width regardless of responsive scaling. */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ────────────────────────────── Hooks ──────────────────────────────── */

/**
 * Scales a fixed-size canvas to its container width by writing the transform
 * straight to the DOM — resizes never trigger a React re-render.
 */
function useResponsiveScale(designWidth: number, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!enabled || !el) return

    let raf = 0
    const apply = () => {
      el.style.transform = `translate(-50%, -50%) scale(${el.clientWidth / designWidth})`
    }

    apply() // synchronous, pre-paint: no layout flash
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(apply) // coalesce rapid resize events
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [enabled, designWidth])

  return ref
}

/* ─────────────────────────── Main component ────────────────────────── */

export default function Orbit({
  items = [],
  shape = 'ellipse',
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = '100%',
  height = '100%',
  className = '',
  showPath = false,
  pathColor = 'rgba(0, 0, 0, 0.1)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false,
}: OrbitProps) {
  const centerX = baseWidth / 2
  const centerY = baseWidth / 2

  const path = useMemo(
    () =>
      buildOrbitPath(shape, customPath, {
        cx: centerX,
        cy: centerY,
        radiusX,
        radiusY,
        radius,
        starPoints,
        starInnerRatio,
      }),
    [
      shape,
      customPath,
      centerX,
      centerY,
      radiusX,
      radiusY,
      radius,
      starPoints,
      starInnerRatio,
    ],
  )

  const canvasRef = useResponsiveScale(baseWidth, responsive)

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      width: responsive ? '100%' : width,
      height: responsive ? undefined : height,
      ...(responsive && { aspectRatio: '1 / 1' }),
    }),
    [responsive, width, height],
  )

  const renderedItems = useMemo(
    () =>
      items.map((item, index) => (
        <OrbitItem
          key={index}
          index={index}
          total={items.length}
          path={path}
          itemSize={itemSize}
          counterRotation={-rotation}
          duration={Math.max(duration, 0.001)}
          easing={EASING_TO_CSS[easing]}
          reversed={direction === 'reverse'}
          paused={paused}
          distributed={fill}
        >
          {item}
        </OrbitItem>
      )),
    [
      items,
      path,
      itemSize,
      rotation,
      duration,
      easing,
      direction,
      paused,
      fill,
    ],
  )

  return (
    <div className={`relative mx-auto ${className}`} style={containerStyle}>
      {/*
        All sizes below live in design space. The outer div above holds layout;
        this layer holds geometry, so responsive scaling never disturbs siblings.
      */}
      {responsive ? (
        <div
          ref={canvasRef}
          className="absolute left-1/2 top-1/2 origin-center"
          style={{ width: baseWidth, height: baseWidth }}
        >
          <OrbitLayer
            path={path}
            rotation={rotation}
            showPath={showPath}
            pathColor={pathColor}
            pathWidth={pathWidth}
            baseWidth={baseWidth}
          >
            {renderedItems}
          </OrbitLayer>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <OrbitLayer
            path={path}
            rotation={rotation}
            showPath={showPath}
            pathColor={pathColor}
            pathWidth={pathWidth}
            baseWidth={baseWidth}
          >
            {renderedItems}
          </OrbitLayer>
        </div>
      )}

      {/* Real content lives outside the hidden decorative layer. */}
      {centerContent != null && (
        <div className="absolute inset-0 z-10 grid place-items-center">
          {centerContent}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: ORBIT_CSS }} />
    </div>
  )
}

/* ─────────────────────────── Internal layout ───────────────────────── */

function OrbitLayer({
  children,
  path,
  rotation,
  showPath,
  pathColor,
  pathWidth,
  baseWidth,
}: {
  children: ReactNode
  path: string
  rotation: number
  showPath: boolean
  pathColor: string
  pathWidth: number
  baseWidth: number
}) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="relative h-full w-full"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {showPath && (
        <PathPreview
          path={path}
          color={pathColor}
          strokeWidth={pathWidth}
          baseWidth={baseWidth}
        />
      )}
      {children}
    </div>
  )
}
