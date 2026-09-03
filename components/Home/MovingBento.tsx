'use client'
import { useRef, useState, useEffect, useLayoutEffect, memo } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import Link from 'next/link'

gsap.registerPlugin(Flip)

export interface MovingBentoItem {
  id: string
  title: string
  description?: string
  image: string
  href?: string // Added for Next.js Link
}

export interface MovingBentoProps {
  items: MovingBentoItem[]
  swapInterval?: number
  gap?: number
  autoPlay?: boolean
}

interface SlotDef {
  gridColumn: string
  gridRow: string
}

// 10 slots for Desktop (5 cols, 3 rows)
const DESKTOP_SLOTS: SlotDef[] = [
  { gridColumn: '2 / 4', gridRow: '2 / 4' }, // Center (2x2)
  { gridColumn: '1 / 2', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '1 / 2' },
  { gridColumn: '3 / 4', gridRow: '1 / 2' },
  { gridColumn: '4 / 5', gridRow: '1 / 2' },
  { gridColumn: '1 / 2', gridRow: '2 / 3' },
  { gridColumn: '4 / 5', gridRow: '2 / 3' },
  { gridColumn: '5 / 6', gridRow: '1 / 3' }, // 1x2 right
  { gridColumn: '1 / 2', gridRow: '3 / 4' },
  { gridColumn: '4 / 5', gridRow: '3 / 4' },
]

// 8 slots for Tablet (4 cols, 3 rows)
const TABLET_SLOTS: SlotDef[] = [
  { gridColumn: '2 / 4', gridRow: '2 / 4' }, // Center (2x2)
  { gridColumn: '1 / 2', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '1 / 2' },
  { gridColumn: '3 / 4', gridRow: '1 / 2' },
  { gridColumn: '4 / 5', gridRow: '1 / 2' },
  { gridColumn: '1 / 2', gridRow: '2 / 3' },
  { gridColumn: '4 / 5', gridRow: '2 / 3' },
  { gridColumn: '1 / 2', gridRow: '3 / 4' },
]

// 6 slots for Mobile (3 cols, 3 rows)
const MOBILE_SLOTS: SlotDef[] = [
  { gridColumn: '1 / 2', gridRow: '2 / 4' }, // Center (1x2)
  { gridColumn: '1 / 2', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '1 / 2' },
  { gridColumn: '3 / 4', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '2 / 3' },
  { gridColumn: '3 / 4', gridRow: '2 / 3' },
]

const SLOT_COUNTS = { mobile: 6, tablet: 8, desktop: 10 } as const
type Breakpoint = keyof typeof SLOT_COUNTS

const SLOTS: Record<Breakpoint, SlotDef[]> = {
  mobile: MOBILE_SLOTS,
  tablet: TABLET_SLOTS,
  desktop: DESKTOP_SLOTS,
}

const GRID_COLS: Record<Breakpoint, number> = {
  mobile: 3,
  tablet: 4,
  desktop: 5,
}
const ASPECT_RATIOS: Record<Breakpoint, string> = {
  mobile: '3 / 4',
  tablet: '4 / 3',
  desktop: '16 / 9', // Adjusted for the 5-column layout
}

const CENTER_SLOT = 0
const DATA_ATTR = 'data-moving-id'
const DATA_SELECTOR = `[${DATA_ATTR}]`

function pickPeripheral(count: number): number {
  return 1 + Math.floor(Math.random() * (count - 1))
}

const BentoCard = memo(function BentoCard({ item }: { item: MovingBentoItem }) {
  return (
    <Link
      href={item.href || `#${item.id}`}
      className="block size-full rounded-2xl overflow-hidden select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="relative size-full">
        {/* Next/Image for automatic optimization and lazy loading */}
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent"
          aria-hidden="true"
        />
        <div className="relative size-full flex flex-col justify-end p-3 md:p-4">
<h3 className="text-xs md:text-sm font-semibold text-white leading-snug drop-shadow-sm">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs md:text-[13px] text-white/80 mt-0.5 leading-relaxed line-clamp-2 drop-shadow-sm">
            {item.description}
          </p>
        )}
        </div>
      </div>
    </Link>
  )
})

export const MovingBento = memo(function MovingBento({
  items,
  swapInterval = 3000,
  gap = 10,
  autoPlay = true,
}: MovingBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [bp, setBp] = useState<Breakpoint>('desktop')
  const isHovered = useRef(false)
  const isOffScreen = useRef(false)
  const isAnimating = useRef(false)
  const hasEntered = useRef(false)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const flipTweenRef = useRef<gsap.core.Timeline | null>(null)

  const slots = SLOTS[bp]
  const slotCount = SLOT_COUNTS[bp]

  // Initialize assignment safely based on items length
  const [assignment, setAssignment] = useState<number[]>(() =>
    Array.from({ length: slotCount }, (_, i) => i % items.length),
  )

  // Update assignment if slotCount changes (e.g., on window resize)
  useEffect(() => {
    setAssignment((prev) => {
      if (prev.length === slotCount) return prev
      return Array.from(
        { length: slotCount },
        (_, i) => prev[i] ?? i % items.length,
      )
    })
  }, [slotCount, items.length])

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 639px)')
    const mqTablet = window.matchMedia(
      '(min-width: 640px) and (max-width: 1023px)',
    )
    const update = () => {
      if (mqMobile.matches) setBp('mobile')
      else if (mqTablet.matches) setBp('tablet')
      else setBp('desktop')
    }
    update()
    mqMobile.addEventListener('change', update)
    mqTablet.addEventListener('change', update)
    return () => {
      mqMobile.removeEventListener('change', update)
      mqTablet.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    if (!gridRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        isOffScreen.current = !entry.isIntersecting
      },
      { threshold: 0.1 },
    )
    observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!flipStateRef.current || !hasEntered.current) return
    const state = flipStateRef.current
    flipStateRef.current = null

    flipTweenRef.current?.kill()
    isAnimating.current = true

    flipTweenRef.current = Flip.from(state, {
      duration: 1.0,
      ease: 'power2.inOut',
      absolute: true,
      zIndex: 10,
      onComplete: () => {
        isAnimating.current = false
      },
    })
  }, [assignment])

  useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(() => {
      if (isHovered.current || isOffScreen.current || isAnimating.current)
        return
      if (!gridRef.current) return

      flipStateRef.current = Flip.getState(
        gridRef.current.querySelectorAll(DATA_SELECTOR),
      )

      setAssignment((prev) => {
        const next = [...prev]
        const p = pickPeripheral(slotCount)
        ;[next[CENTER_SLOT], next[p]] = [next[p], next[CENTER_SLOT]]
        return next
      })
    }, swapInterval)
    return () => clearInterval(id)
  }, [autoPlay, swapInterval, slotCount])

  useGSAP(
    () => {
      if (hasEntered.current || !gridRef.current) return
      hasEntered.current = true
      gsap.fromTo(
        gridRef.current.querySelectorAll(DATA_SELECTOR),
        { opacity: 0, y: 24, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        },
      )
    },
    { scope: gridRef },
  )

  useEffect(
    () => () => {
      flipTweenRef.current?.kill()
    },
    [],
  )

  return (
    <div
      ref={gridRef}
      className="w-full max-w-5xl mx-auto relative" // Increased max-w for 5 cols
      onPointerEnter={() => {
        isHovered.current = true
      }}
      onPointerLeave={() => {
        isHovered.current = false
      }}
      role="region"
      aria-label="Moving bento grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS[bp]}, 1fr)`,
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: `${gap}px`,
        aspectRatio: ASPECT_RATIOS[bp],
      }}
    >
      {/* Mapped by slotIdx to keep DOM nodes stable for GSAP Flip */}
      {slots.map((slot, slotIdx) => {
        const itemIdx = assignment[slotIdx]
        const item = items[itemIdx]
        if (!item) return null

        return (
          <div
            key={slotIdx}
            {...{ [DATA_ATTR]: item.id }}
            style={{
              gridColumn: slot.gridColumn,
              gridRow: slot.gridRow,
              contain: 'layout style paint', // Performance optimization
            }}
          >
            <BentoCard item={item} />
          </div>
        )
      })}
    </div>
  )
})
