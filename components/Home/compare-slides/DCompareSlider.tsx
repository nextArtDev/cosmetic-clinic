'use client'

import { useCallback, useRef, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { cn } from '@/lib/utils'

type ImageSource = StaticImageData | string

interface CompareSliderProps {
  before: ImageSource
  after: ImageSource
  disease?: string
  beforeLabel?: string
  afterLabel?: string
  index?: number
  disableHandle?: boolean
  initialPosition?: number
  aspectRatio?: string
  onPositionChange?: (value: number) => void
  className?: string
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

function Chevrons() {
  return (
    <span className="flex items-center gap-[2px] text-zinc-900">
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 6l-6 6 6 6" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </span>
  )
}

function Label({
  className,
  dot,
  children,
}: {
  className?: string
  dot?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute z-[5] flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-md',
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" />
      )}
      <span className="text-[11px] font-medium tracking-[0.18em] text-white/90">
        {children}
      </span>
    </div>
  )
}

const CompareSlider = ({
  before,
  after,
  disease,
  beforeLabel,
  afterLabel,
  index = 1,
  disableHandle = false,
  initialPosition = 50,
  aspectRatio = '4 / 3',
  onPositionChange,
  className,
}: CompareSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const isReversed = index % 2 !== 0
  const startPosition = disableHandle ? (isReversed ? 100 : 0) : initialPosition

  const [ariaValue, setAriaValue] = useState(Math.round(startPosition))

  const position = useMotionValue(startPosition)
  const display = useSpring(position, {
    stiffness: 260,
    damping: 30,
    mass: 0.7,
    restDelta: 0.1,
  })

  const clipPath = useTransform(
    display,
    (value) => `inset(0 ${100 - value}% 0 0)`,
  )
  const handleLeft = useTransform(display, (value) => `${value}%`)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const scrollPosition = useTransform(
    scrollYProgress,
    [0.25, 0.75],
    isReversed ? [100, 0] : [0, 100],
  )

  useMotionValueEvent(scrollPosition, 'change', (value) => {
    if (!disableHandle) return
    const next = clamp(value, 0, 100)
    position.set(next)
    setAriaValue(Math.round(next))
  })

  const applyPosition = useCallback(
    (next: number) => {
      position.set(next)
      display.jump(next)
      setAriaValue(Math.round(next))
      onPositionChange?.(next)
    },
    [position, display, onPositionChange],
  )

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const element = containerRef.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      if (rect.width <= 0) return
      applyPosition(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100))
    },
    [applyPosition],
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disableHandle) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    updateFromClientX(event.clientX)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disableHandle || !dragging) return
    updateFromClientX(event.clientX)
  }

  const handlePointerUp = () => setDragging(false)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disableHandle) return
    const step = event.shiftKey ? 10 : 3
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      applyPosition(
        clamp(
          position.get() + (event.key === 'ArrowLeft' ? -step : step),
          0,
          100,
        ),
      )
    }
  }

  const beforeAlt = beforeLabel ?? (disease ? `پیش از ${disease}` : 'قبل')
  const afterAlt = afterLabel ?? (disease ? `پس از ${disease}` : 'بعد')

  return (
    <div dir="ltr" className={cn('w-full select-none', className)}>
      <div
        ref={containerRef}
        role="slider"
        aria-label={
          disease ? `مقایسه قبل و بعد ${disease}` : 'مقایسه قبل و بعد'
        }
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValue}
        tabIndex={disableHandle ? -1 : 0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn(
          'group relative w-full touch-pan-y overflow-hidden rounded-[1.75rem] bg-zinc-950',
          'shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/15',
          disableHandle
            ? 'cursor-default'
            : 'cursor-ew-resize focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none',
        )}
        style={{ aspectRatio }}
      >
        <Image
          fill
          priority={false}
          sizes="(max-width: 1024px) 96vw, 896px"
          src={after}
          alt={afterAlt}
          className="object-cover"
        />

        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <Image
            fill
            priority={false}
            sizes="(max-width: 1024px) 96vw, 896px"
            src={before}
            alt={beforeAlt}
            className="object-cover"
          />
        </motion.div>

        <Label className="bottom-4 left-4" dot>
          {beforeAlt}
        </Label>
        <Label className="bottom-4 right-4">{afterAlt}</Label>

        <motion.div
          className="pointer-events-none absolute inset-y-0 z-10"
          style={{ left: handleLeft }}
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/80 to-transparent" />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="absolute -inset-3 rounded-full bg-gradient-to-br from-amber-200/60 via-white/40 to-white/10 blur-xl"
              animate={{
                opacity: dragging ? 0.8 : 0.35,
                scale: dragging ? 1.15 : 1,
              }}
              transition={{ duration: 0.35 }}
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-[calc(100%-8px)] w-[calc(100%-8px)] items-center justify-center rounded-full bg-gradient-to-br from-white via-zinc-100 to-zinc-300 shadow-inner">
                <Chevrons />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-[6] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.25)_100%)]" />

        {disableHandle && <div className="absolute inset-0 z-20" />}
      </div>
    </div>
  )
}

export default CompareSlider
