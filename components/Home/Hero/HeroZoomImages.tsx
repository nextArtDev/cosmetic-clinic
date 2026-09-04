'use client'

/**
 * HeroZoom — Framer Motion build (no GSAP, no ScrollTrigger, no pin).
 *
 * Why this is actually better here:
 *  - `position: sticky` replaces ScrollTrigger.pin, so there's no pin-spacer,
 *    no layout shift on refresh, no `invalidateOnRefresh` dance.
 *  - Every animated value is a MotionValue driven off one scroll progress:
 *    zero React re-renders during scroll, values written straight to the
 *    compositor (transform / opacity only).
 *  - Lenis already smooths the scroll, so no ticker/clock sync hack is needed.
 *
 * Panels: the three videos are now fixed images. They keep the original
 * clip-paths and the panning track, and each one zooms in as you scroll
 * (swap the scale range inside PanelCard if you want to zoom out instead).
 *
 * Type fixes:
 *  - `as const` timing tuples were readonly and could not be assigned to
 *    framer-motion's mutable `InputRange` (number[]). T is now explicitly
 *    typed as `[number, number]` ranges.
 *  - `React.ReactNode` was used without importing React; now uses the
 *    `ReactNode` type import.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  cubicBezier,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import ReactLenis from 'lenis/react'
import Image, { type StaticImageData } from 'next/image'
import Hero from './Hero'

import doctor1 from '@/public/images/doctors/1.jpeg'
import doctor2 from '@/public/images/doctors/2.jpeg'
import doctor3 from '@/public/images/doctors/3.jpg'
import doctor4 from '@/public/images/doctors/4.jpeg'
import doctor5 from '@/public/images/doctors/5.jpeg'

/* ------------------------------------------------------------------ data */

type TeamMember = {
  id: string
  name: string
  role: string
  profile: StaticImageData
}

type PanelConfig = {
  src: string
  clip: string
  align: 'justify-start' | 'justify-center' | 'justify-end'
}

const TEAM: TeamMember[] = [
  { id: '1', name: 'لیلا حسینی', role: 'دستیار', profile: doctor1 },
  { id: '2', name: 'محسن احمدی', role: 'منشی', profile: doctor3 },
  { id: '3', name: 'زهره محمدی', role: 'دستیار', profile: doctor2 },
  { id: '4', name: 'یوسف خوشنام', role: 'دستیار', profile: doctor5 },
  { id: '5', name: 'شبنم رمضانی', role: 'دستیار', profile: doctor4 },
]

/* swap these paths for your own artwork in /public */
const PANELS: PanelConfig[] = [
  {
    src: '/images/doctors/1.jpeg',
    clip: 'inset(0% 5% 0% 5% round 10px)',
    align: 'justify-start',
  },
  {
    src: '/images/doctors/2.jpeg',
    clip: 'inset(0% 5% 0% 5% round 100px 10px 10px 10px)',
    align: 'justify-end',
  },
  {
    src: '/images/doctors/4.jpeg',
    clip: 'inset(0% 5% 0% 5% round 150px 10px 150px 10px)',
    align: 'justify-center',
  },
]

/* --------------------------------------------------------------- timing map
 * One normalized 0..1 scroll timeline. Edit these, not the components.
 * Explicit mutable `[number, number]` tuples so they satisfy framer-motion's
 * `InputRange` (number[]) without the readonly `as const` mismatch.
 */
type ScrollRange = [number, number]

const T: {
  heroZoom: ScrollRange
  heroFade: ScrollRange
  teamIn: ScrollRange
  panelPan: ScrollRange
  rings: ScrollRange
  photos: ScrollRange
  copy: ScrollRange
} = {
  heroZoom: [0, 0.46],
  heroFade: [0.28, 0.47],
  teamIn: [0.16, 0.5],
  panelPan: [0.44, 0.92],
  rings: [0.44, 0.64],
  photos: [0.48, 0.8],
  copy: [0.72, 0.88],
}

const expoOut = cubicBezier(0.16, 1, 0.3, 1)
const softIn = cubicBezier(0.55, 0, 1, 0.45)

/* ------------------------------------------------------------------ pieces */

function TeamPhoto({
  member,
  index,
  count,
  radius,
  progress,
}: {
  member: TeamMember
  index: number
  count: number
  radius: number
  progress: MotionValue<number>
}) {
  const angle = (index * 2 * Math.PI) / count - Math.PI / 2

  // per-card stagger, folded into the shared photos window
  const [from, to] = T.photos
  const step = (to - from) * 0.35
  const start = from + (index / Math.max(count - 1, 1)) * step
  const end = start + (to - from - step)

  const x = useTransform(
    progress,
    [start, end],
    [0, radius * Math.cos(angle)],
    {
      ease: expoOut,
    },
  )
  const y = useTransform(
    progress,
    [start, end],
    [0, radius * Math.sin(angle)],
    {
      ease: expoOut,
    },
  )
  const scale = useTransform(progress, [start, end], [0.55, 1], {
    ease: expoOut,
  })
  const opacity = useTransform(
    progress,
    [start, start + (end - start) * 0.4],
    [0, 1],
  )

  return (
    <motion.figure
      style={{ x, y, scale, opacity }}
      className="absolute z-10 m-0 flex w-24 flex-col items-center gap-2"
    >
      <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg dark:border-gray-800">
        <Image
          src={member.profile}
          alt={member.name}
          width={96}
          height={96}
          sizes="96px"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption dir="rtl" className="text-center leading-tight">
        <span className="block text-[13px] font-semibold text-gray-900 dark:text-white">
          {member.name}
        </span>
        <span className="block text-[11px] text-gray-500 dark:text-gray-400">
          {member.role}
        </span>
      </figcaption>
    </motion.figure>
  )
}

/* Fixed image panel: keeps the old clip-path + panning track, and zooms
 * in/out purely from scroll progress (no video decoding at all). */
function PanelCard({
  panel,
  index,
  progress,
  reduced,
}: {
  panel: PanelConfig
  index: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const [from, to] = T.panelPan
  const span = to - from

  // stagger each panel's zoom window slightly along the pan timeline
  const start = from + index * span * 0.16
  const end = Math.min(to, start + span * 0.72)

  // scroll-driven zoom: 1 -> 1.25 zooms IN. Swap the range ([1.25, 1])
  // if you prefer to zoom OUT while scrolling.
  const scale = useTransform(progress, [start, end], [1, reduced ? 1 : 1.25])

  return (
    <div className={`flex items-center ${panel.align}`}>
      <div
        className="relative h-[22rem] w-[min(22rem,86vw)] overflow-hidden bg-black/5 md:h-[28rem] md:w-96 dark:bg-white/5"
        style={{ clipPath: panel.clip }}
      >
        <motion.div
          style={{ scale }}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={panel.src}
            alt=""
            fill
            sizes="(max-width: 768px) 86vw, 24rem"
            className="object-cover"
          />
        </motion.div>
      </div>
    </div>
  )
}

function Ring({
  progress,
  index,
  className,
  children,
}: {
  progress: MotionValue<number>
  index: number
  className: string
  children: ReactNode
}) {
  const [from] = T.rings
  const start = from + index * (T.rings[1] - from) * 0.3
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1])
  return (
    <motion.div style={{ opacity }} className={className}>
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ props */

type HeroZoomProps = {
  /** total scroll length as a multiple of viewport height. 5 = 500vh */
  scrollLength?: number
  /** where the camera pushes through the hero */
  zoomOrigin?: string
  /** how far the hero blows up before it dissolves */
  zoomScale?: number
}

/* --------------------------------------------------------------- component */

const HeroZoom = ({
  scrollLength = 5,
  zoomOrigin = '50% 45%',
  zoomScale = 6,
}: HeroZoomProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const reduced = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  })

  /* --- measured geometry: track travel + circle fit (re-measured on resize) --- */
  const [travel, setTravel] = useState(0)
  const [fit, setFit] = useState(1)

  useEffect(() => {
    const measure = () => {
      const h = trackRef.current?.offsetHeight ?? 0
      setTravel(Math.max(0, h - window.innerHeight))
      setFit(Math.min(1, window.innerWidth / 860, window.innerHeight / 860))
    }
    measure()

    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { count, radius } = useMemo(() => {
    const c = TEAM.length
    return { count: c, radius: Math.max(230, (c * 132) / (2 * Math.PI) + 40) }
  }, [])

  /* --- act 1: the hero --- */
  const heroScale = useTransform(scrollYProgress, T.heroZoom, [
    1,
    reduced ? 1 : zoomScale,
  ])
  const heroZ = useTransform(scrollYProgress, T.heroZoom, [
    0,
    reduced ? 0 : 500,
  ])
  const heroOpacity = useTransform(scrollYProgress, T.heroFade, [1, 0], {
    ease: softIn,
  })

  /* --- act 2: the team layer --- */
  const teamOpacity = useTransform(scrollYProgress, T.teamIn, [0, 1])
  const teamScale = useTransform(scrollYProgress, T.teamIn, [1.22, 1], {
    ease: expoOut,
  })
  const trackY = useTransform(scrollYProgress, T.panelPan, [0, -travel])

  /* --- act 3: center copy --- */
  const copyOpacity = useTransform(scrollYProgress, T.copy, [0, 1])
  const copyY = useTransform(scrollYProgress, T.copy, [32, 0], {
    ease: expoOut,
  })

  return (
    <ReactLenis root>
      <div
        ref={scrollRef}
        className="relative"
        style={{ height: `${scrollLength * 100}svh` }}
      >
        <div
          className="sticky top-0 h-svh w-full overflow-hidden bg-white dark:bg-black"
          style={{ perspective: '1200px' }}
        >
          {/* ============ layer 1: team + image panels (was the sky) ============ */}
          <motion.div
            style={{ opacity: teamOpacity, scale: teamScale }}
            className="absolute inset-0 z-10"
          >
            {/* masked panel track: pans up like the old sky image */}
            <motion.div
              ref={trackRef}
              style={{ y: trackY }}
              className="pointer-events-none absolute left-0 top-0 h-[280svh] w-full"
            >
              <div className="mx-auto grid h-full max-w-[80rem] grid-rows-3 px-5 md:px-10">
                {PANELS.map((panel, idx) => (
                  <PanelCard
                    key={idx}
                    panel={panel}
                    index={idx}
                    progress={scrollYProgress}
                    reduced={reduced}
                  />
                ))}
              </div>
            </motion.div>

            {/* expanding team circle, parked mid-viewport */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div style={{ transform: `scale(${fit})` }}>
                <Ring
                  progress={scrollYProgress}
                  index={0}
                  className="flex h-[600px] w-[600px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-700"
                >
                  <Ring
                    progress={scrollYProgress}
                    index={1}
                    className="flex h-[500px] w-[500px] items-center justify-center rounded-full border border-[rebeccapurple]/20"
                  >
                    <div className="relative flex h-[400px] w-[400px] items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                      {/* glass center: panels read through behind the copy */}
                      <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/40 bg-white/25 backdrop-blur-xl dark:border-white/10 dark:bg-black/25">
                        {TEAM.map((member, idx) => (
                          <TeamPhoto
                            key={member.id}
                            member={member}
                            index={idx}
                            count={count}
                            radius={radius}
                            progress={scrollYProgress}
                          />
                        ))}

                        <motion.div
                          dir="rtl"
                          style={{ opacity: copyOpacity, y: copyY }}
                          className="relative z-20 flex flex-col items-center justify-center px-8"
                        >
                          <h2 className="mb-3 text-center text-3xl font-bold text-[rebeccapurple]">
                            تیمی که همراه شماست
                          </h2>
                          <p className="max-w-xs text-center text-sm leading-7 text-gray-600 dark:text-gray-300">
                            از اولین مشاوره تا آخرین جلسه پیگیری، همکاران کلینیک
                            کنار شما هستند.
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </Ring>
                </Ring>
              </div>
            </div>
          </motion.div>

          {/* ============ layer 2: the hero (was the window) ============ */}
          <motion.div
            style={{
              scale: heroScale,
              z: heroZ,
              opacity: heroOpacity,
              transformOrigin: zoomOrigin,
              transformStyle: 'preserve-3d',
            }}
            className="absolute inset-0 z-20"
          >
            <Hero />
          </motion.div>
        </div>
      </div>

      <section className="relative flex h-svh w-full items-center justify-center overflow-hidden p-8 text-center">
        <h2 className="text-3xl">End of view</h2>
      </section>
    </ReactLenis>
  )
}

export default HeroZoom
