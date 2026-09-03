'use client'

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  memo,
} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(Flip)

export interface MovingBentoItem {
  id: string
  title: string
  description?: string
  image: string
  href: string
}

export interface MovingBentoProps {
  items: MovingBentoItem[]
  swapInterval?: number
  gap?: number
  autoPlay?: boolean
  /** Cap on how many items participate in the rotation pool. Default 11. */
  maxItems?: number
  /** Force the desktop layout (11 items) on all screen sizes regardless of breakpoints. */
  forceDesktop?: boolean
  /** Fill the entire viewport height (100dvh). Best used with forceDesktop={true} for a hero section. */
  fillHeight?: boolean
  /** Show all items in a scrollable 2-column layout on mobile instead of hiding the overflow. */
  showAllOnMobile?: boolean
}

interface SlotDef {
  gridColumn: string
  gridRow: string
}

// Desktop is a 4x4 grid hosting 11 items with zero dead cells.
const DESKTOP_SLOTS: SlotDef[] = [
  { gridColumn: '2 / 4', gridRow: '2 / 4' }, // 0 center
  { gridColumn: '1 / 2', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '1 / 2' },
  { gridColumn: '3 / 4', gridRow: '1 / 2' },
  { gridColumn: '4 / 5', gridRow: '1 / 2' },
  { gridColumn: '1 / 2', gridRow: '2 / 3' },
  { gridColumn: '4 / 5', gridRow: '2 / 3' },
  { gridColumn: '1 / 2', gridRow: '3 / 4' },
  { gridColumn: '4 / 5', gridRow: '3 / 4' },
  { gridColumn: '1 / 3', gridRow: '4 / 5' }, // 9 left banner half
  { gridColumn: '3 / 5', gridRow: '4 / 5' }, // 10 right banner half
]

const TABLET_SLOTS: SlotDef[] = [
  { gridColumn: '2 / 4', gridRow: '2 / 4' },
  { gridColumn: '1 / 2', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '1 / 2' },
  { gridColumn: '3 / 4', gridRow: '1 / 2' },
  { gridColumn: '1 / 2', gridRow: '2 / 3' },
  { gridColumn: '1 / 2', gridRow: '3 / 4' },
]

const MOBILE_SLOTS: SlotDef[] = [
  { gridColumn: '1 / 3', gridRow: '2 / 3' }, // 0: 2 cols, 1 row (large)
  { gridColumn: '1 / 2', gridRow: '1 / 2' },
  { gridColumn: '2 / 3', gridRow: '1 / 2' },
  { gridColumn: '1 / 2', gridRow: '3 / 4' },
  { gridColumn: '2 / 3', gridRow: '3 / 4' },
]

// Expands mobile to 6 rows to show all 11 items when showAllOnMobile is true
const MOBILE_ALL_SLOTS: SlotDef[] = [
  ...MOBILE_SLOTS,
  { gridColumn: '1 / 2', gridRow: '4 / 5' },
  { gridColumn: '2 / 3', gridRow: '4 / 5' },
  { gridColumn: '1 / 2', gridRow: '5 / 6' },
  { gridColumn: '2 / 3', gridRow: '5 / 6' },
  { gridColumn: '1 / 2', gridRow: '6 / 7' },
  { gridColumn: '2 / 3', gridRow: '6 / 7' },
]

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

// Centralized configuration mapping
const SLOTS_CONFIG = {
  mobile: { slots: MOBILE_SLOTS, rows: 3, maxVisible: 5 },
  mobileAll: { slots: MOBILE_ALL_SLOTS, rows: 6, maxVisible: 11 },
  tablet: { slots: TABLET_SLOTS, rows: 3, maxVisible: 6 },
  desktop: { slots: DESKTOP_SLOTS, rows: 4, maxVisible: 11 },
}

const ASPECT_RATIOS: Record<Breakpoint, string> = {
  mobile: '3 / 4',
  tablet: '4 / 3',
  desktop: '16 / 12',
}

const CENTER_SLOT = 0
const DATA_ATTR = 'data-moving-id'
const DATA_SELECTOR = `[${DATA_ATTR}]`
const DEFAULT_MAX_ITEMS = 11

/** Pick a random index in [1, poolSize) — anything but the center. */
function pickPeripheral(poolSize: number): number {
  return 1 + Math.floor(Math.random() * (poolSize - 1))
}

const BentoCard = memo(function BentoCard({
  item,
  priority,
}: {
  item: MovingBentoItem
  priority: boolean
}) {
  return (
    <Link
      href={item.href}
      className="group relative block size-full rounded-2xl overflow-clip select-none"
      aria-label={item.title}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
        aria-hidden="true"
      />
      <div className="relative size-full flex flex-col justify-end p-3 md:p-4">
        <h3 className="text-xs md:text-sm font-semibold text-white leading-snug">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs md:text-[13px] text-white/60 mt-0.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  )
})

export function MovingBento({
  items,
  swapInterval = 3000,
  gap = 10,
  autoPlay = true,
  maxItems = DEFAULT_MAX_ITEMS,
  forceDesktop = false,
  fillHeight = false,
  showAllOnMobile = false,
}: MovingBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [bp, setBp] = useState<Breakpoint>('desktop')
  const isHovered = useRef(false)
  const isOffScreen = useRef(false)
  const isHidden = useRef(false)
  const isAnimating = useRef(false)
  const hasEntered = useRef(false)
  const prefersReducedMotion = useRef(false)
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const flipTweenRef = useRef<gsap.core.Timeline | null>(null)

  const pool = useMemo(() => items.slice(0, maxItems), [items, maxItems])
  const [order, setOrder] = useState<number[]>(() => pool.map((_, i) => i))
  const [prevPool, setPrevPool] = useState(pool)
  if (prevPool !== pool) {
    setPrevPool(pool)
    setOrder(pool.map((_, i) => i))
  }

  // Dynamically resolve configuration based on breakpoints and props
  const currentConfig = useMemo(() => {
    if (forceDesktop) return SLOTS_CONFIG.desktop
    if (bp === 'mobile')
      return showAllOnMobile ? SLOTS_CONFIG.mobileAll : SLOTS_CONFIG.mobile
    if (bp === 'tablet') return SLOTS_CONFIG.tablet
    return SLOTS_CONFIG.desktop
  }, [forceDesktop, bp, showAllOnMobile])

  const slots = currentConfig.slots
  const visibleCount = Math.min(
    currentConfig.maxVisible,
    pool.length,
    slots.length,
  )

  const gridCols = useMemo(() => {
    if (forceDesktop) return 4
    if (bp === 'desktop') return 4
    if (bp === 'tablet') return 3
    return 2 // mobile and mobileAll
  }, [forceDesktop, bp])

  const aspectRatio = useMemo(() => {
    if (fillHeight) return undefined
    if (forceDesktop) return '16 / 12'
    return ASPECT_RATIOS[bp]
  }, [fillHeight, forceDesktop, bp])

  useEffect(() => {
    if (forceDesktop) return

    const mqMobile = window.matchMedia('(max-width: 639px)')
    const mqTablet = window.matchMedia(
      '(min-width: 640px) and (max-width: 1023px)',
    )
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      if (mqMobile.matches) setBp('mobile')
      else if (mqTablet.matches) setBp('tablet')
      else setBp('desktop')
    }

    prefersReducedMotion.current = mqReduced.matches
    const updateReduced = () => {
      prefersReducedMotion.current = mqReduced.matches
    }

    update()
    mqMobile.addEventListener('change', update)
    mqTablet.addEventListener('change', update)
    mqReduced.addEventListener('change', updateReduced)

    return () => {
      mqMobile.removeEventListener('change', update)
      mqTablet.removeEventListener('change', update)
      mqReduced.removeEventListener('change', updateReduced)
    }
  }, [forceDesktop])

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

  useEffect(() => {
    const onVisibility = () => {
      isHidden.current = document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
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
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.5 },
        ),
      onLeave: (els) =>
        gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
      onComplete: () => {
        isAnimating.current = false
      },
    })
  }, [order])

  const swap = useCallback(() => {
    if (
      isHovered.current ||
      isOffScreen.current ||
      isHidden.current ||
      isAnimating.current ||
      !gridRef.current ||
      pool.length < 2
    ) {
      return
    }

    flipStateRef.current = Flip.getState(
      gridRef.current.querySelectorAll(DATA_SELECTOR),
    )

    setOrder((prev) => {
      const next = [...prev]
      const p = pickPeripheral(pool.length)
      ;[next[CENTER_SLOT], next[p]] = [next[p], next[CENTER_SLOT]]
      return next
    })
  }, [pool.length])

  useEffect(() => {
    if (!autoPlay || prefersReducedMotion.current) return
    const id = setInterval(swap, swapInterval)
    return () => clearInterval(id)
  }, [autoPlay, swapInterval, swap])

  useGSAP(
    () => {
      if (hasEntered.current || !gridRef.current) return
      hasEntered.current = true
      if (prefersReducedMotion.current) return
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
    { scope: gridRef, dependencies: [pool.length] },
  )

  useEffect(
    () => () => {
      flipTweenRef.current?.kill()
    },
    [],
  )

  const handlePointerEnter = useCallback(() => {
    isHovered.current = true
  }, [])
  const handlePointerLeave = useCallback(() => {
    isHovered.current = false
  }, [])

  const visible = order.slice(0, visibleCount)

  return (
    <div
      ref={gridRef}
      className="w-full max-w-4xl mx-auto relative overflow-hidden"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="region"
      aria-label="Moving bento grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${currentConfig.rows}, 1fr)`,
        gap: `${gap}px`,
        aspectRatio: aspectRatio,
        height: fillHeight ? '100dvh' : undefined,
      }}
    >
      {visible.map((itemIdx, slotIdx) => {
        const item = pool[itemIdx]
        return (
          <div
            key={item.id}
            {...{ [DATA_ATTR]: item.id }}
            style={{
              position: 'relative',
              gridColumn: slots[slotIdx].gridColumn,
              gridRow: slots[slotIdx].gridRow,
            }}
          >
            <BentoCard item={item} priority={slotIdx === CENTER_SLOT} />
          </div>
        )
      })}
    </div>
  )
}
