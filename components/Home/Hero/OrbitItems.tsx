import {
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  memo,
  type ReactNode,
} from 'react'

type OrbitShape =
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

interface OrbitItemsProps {
  items?: ReactNode[]
  shape?: OrbitShape
  customPath?: string
  baseWidth?: number
  radiusX?: number
  radiusY?: number
  radius?: number
  starPoints?: number
  starInnerRatio?: number
  rotation?: number
  duration?: number
  itemSize?: number
  direction?: 'normal' | 'reverse'
  fill?: boolean
  width?: number | '100%'
  height?: number | 'auto'
  className?: string
  showPath?: boolean
  pathColor?: string
  pathWidth?: number
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  paused?: boolean
  centerContent?: ReactNode
  responsive?: boolean
}

interface OrbitItemProps {
  item: ReactNode
  index: number
  totalItems: number
  path: string
  itemSize: number
  rotation: number
  duration: number
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  direction: 'normal' | 'reverse'
  fill: boolean
  paused: boolean
}

// Map JS easing names to CSS timing functions
const easingMap = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const

function generateEllipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`
}

function generateCirclePath(cx: number, cy: number, r: number): string {
  return generateEllipsePath(cx, cy, r, r)
}

function generateSquarePath(cx: number, cy: number, size: number): string {
  const h = size / 2
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`
}

function generateRectanglePath(
  cx: number,
  cy: number,
  w: number,
  h: number,
): string {
  const hw = w / 2
  const hh = h / 2
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`
}

function generateTrianglePath(cx: number, cy: number, size: number): string {
  const height = (size * Math.sqrt(3)) / 2
  const hs = size / 2
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`
}

function generateStarPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
): string {
  const step = Math.PI / points
  let path = ''
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = i * step - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return path + ' Z'
}

function generateHeartPath(cx: number, cy: number, size: number): string {
  const s = size / 30
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`
}

function generateInfinityPath(
  cx: number,
  cy: number,
  w: number,
  h: number,
): string {
  const hw = w / 2
  const hh = h / 2
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`
}

function generateWavePath(
  cx: number,
  cy: number,
  w: number,
  amplitude: number,
  waves: number,
): string {
  const pts: string[] = []
  const segs = waves * 20
  const hw = w / 2
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude
    pts.push(`L ${x} ${y}`)
  }
  return pts.join(' ') + ' Z'
}

// Memoized to prevent re-renders when parent state (like scale) changes
const OrbitItem = memo(function OrbitItem({
  item,
  index,
  totalItems,
  path,
  itemSize,
  rotation,
  duration,
  easing,
  direction,
  fill,
  paused,
}: OrbitItemProps) {
  const itemOffset = fill && totalItems > 0 ? (index / totalItems) * 100 : 0
  // Calculate negative delay to stagger items seamlessly
  const delay = (itemOffset / 100) * duration

  return (
    <div
      className="absolute will-change-transform select-none"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance: '0%',
        animationName: 'orbit-progress',
        animationDuration: `${duration}s`,
        animationTimingFunction: easingMap[easing],
        animationIterationCount: 'infinite',
        animationDirection: direction === 'reverse' ? 'reverse' : 'normal',
        animationDelay: `-${delay}s`,
        animationPlayState: paused ? 'paused' : 'running',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center "
        style={{ transform: `rotate(${-rotation}deg)` }}
      >
        {item}
      </div>
    </div>
  )
})

export default function OrbitItems({
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
  width = 100,
  height = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(247, 221, 70, 0.774)',
  pathWidth = 3,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false,
}: OrbitItemsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerContainerRef = useRef<HTMLDivElement>(null)

  const designCenterX = baseWidth / 2
  const designCenterY = baseWidth / 2

  // Inject CSS keyframes once globally
  useEffect(() => {
    const styleId = 'orbit-items-keyframes'
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        @keyframes orbit-progress {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const path = useMemo(() => {
    switch (shape) {
      case 'circle':
        return generateCirclePath(designCenterX, designCenterY, radius)
      case 'ellipse':
        return generateEllipsePath(
          designCenterX,
          designCenterY,
          radiusX,
          radiusY,
        )
      case 'square':
        return generateSquarePath(designCenterX, designCenterY, radius * 2)
      case 'rectangle':
        return generateRectanglePath(
          designCenterX,
          designCenterY,
          radiusX * 2,
          radiusY * 2,
        )
      case 'triangle':
        return generateTrianglePath(designCenterX, designCenterY, radius * 2)
      case 'star':
        return generateStarPath(
          designCenterX,
          designCenterY,
          radius,
          radius * starInnerRatio,
          starPoints,
        )
      case 'heart':
        return generateHeartPath(designCenterX, designCenterY, radius * 2)
      case 'infinity':
        return generateInfinityPath(
          designCenterX,
          designCenterY,
          radiusX * 2,
          radiusY * 2,
        )
      case 'wave':
        return generateWavePath(
          designCenterX,
          designCenterY,
          radiusX * 2,
          radiusY,
          3,
        )
      case 'custom':
        return (
          customPath || generateCirclePath(designCenterX, designCenterY, radius)
        )
      default:
        return generateEllipsePath(
          designCenterX,
          designCenterY,
          radiusX,
          radiusY,
        )
    }
  }, [
    shape,
    customPath,
    designCenterX,
    designCenterY,
    radiusX,
    radiusY,
    radius,
    starPoints,
    starInnerRatio,
  ])

  // Direct DOM manipulation for scaling to prevent React re-renders on resize.
  // Runs in useLayoutEffect so it measures before first paint — but during
  // hydration the streamed hero subtree may not be laid out yet (clientWidth
  // reads 0). On some mobile browsers the ResizeObserver callback then never
  // fires until the first touch/scroll schedules a layout pass, which would
  // leave the stats hidden until then. So we retry on animation frames +
  // a bounded timer instead of depending on the observer alone.
  useLayoutEffect(() => {
    if (!responsive || !containerRef.current || !innerContainerRef.current)
      return

    let raf = 0
    let timer = 0
    let tries = 0
    const MAX_RETRIES = 300 // ~4s of retries (alternating rAF ~60/s + timeout)

    const scheduleRetry = () => {
      if (tries >= MAX_RETRIES) return
      tries++
      // Alternate rAF (fast, fires every frame while the tab is visible) and
      // setTimeout (backstop if frames are throttled) — one pending retry at
      // a time, so we never pile up forced-reflow `clientWidth` reads.
      if (tries % 2 === 1) {
        raf = requestAnimationFrame(applyScale)
      } else {
        timer = window.setTimeout(applyScale, 100)
      }
    }

    const applyScale = () => {
      const container = containerRef.current
      const inner = innerContainerRef.current
      if (!container || !inner) return
      // clientWidth can read 0 on some mobile browsers while the streamed
      // hero subtree hasn't had a layout pass yet; the rect read forces one.
      const cw =
        container.clientWidth || container.getBoundingClientRect().width
      if (cw > 0) {
        cancelAnimationFrame(raf)
        clearTimeout(timer)
        const newScale = cw / baseWidth
        inner.style.transform = `translate(-50%, -50%) scale(${newScale})`
        inner.style.visibility = 'visible'
        return
      }
      if (tries >= MAX_RETRIES) {
        // Fail open instead of staying hidden forever (the preloader's dark
        // stage hides any imprecision): approximate from the viewport — the
        // orbit column is full-width on phones — and let the ResizeObserver
        // snap to the exact container width whenever real layout lands.
        cancelAnimationFrame(raf)
        clearTimeout(timer)
        const approx = document.documentElement.clientWidth / baseWidth
        inner.style.transform = `translate(-50%, -50%) scale(${approx})`
        inner.style.visibility = 'visible'
        return
      }
      // Not laid out yet — keep trying. The preloader covers the screen
      // while it's hidden, so there's no flash to worry about.
      scheduleRetry()
    }

    applyScale()

    const observer = new ResizeObserver(applyScale)
    observer.observe(containerRef.current)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [responsive, baseWidth])

  const containerWidth = responsive
    ? '100%'
    : typeof width === 'number'
      ? width
      : '100%'
  const containerHeight = responsive
    ? 'auto'
    : typeof height === 'number'
      ? height
      : typeof width === 'number'
        ? width
        : 'auto'

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? '1 / 1' : undefined,
      }}
      aria-hidden="true"
    >
      <div
        ref={innerContainerRef}
        className={
          responsive ? 'absolute left-1/2 top-1/2' : 'relative w-full h-full'
        }
        style={{
          width: responsive ? baseWidth : '100%',
          height: responsive ? baseWidth : '100%',
          transformOrigin: 'center center',
          // Initial styles for responsive mode before JS calculates scale
          ...(responsive
            ? {
                transform: 'translate(-50%, -50%) scale(1)',
                visibility: 'hidden',
              }
            : {}),
        }}
      >
        <div
          className="relative w-full h-full "
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="absolute inset-0 pointer-events-none"
            >
              {/* vectorEffect keeps stroke width visually consistent regardless of CSS scaling */}
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}

          {items.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              duration={duration}
              easing={easing}
              direction={direction}
              fill={fill}
              paused={paused}
            />
          ))}
        </div>
      </div>

      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none ">
          <div className="pointer-events-auto ">{centerContent}</div>
        </div>
      )}
    </div>
  )
}
