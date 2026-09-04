'use client'

// framer-motion 12.43's WAAPI ScrollTimeline acceleration for opacity
// animations reverts in Chrome after the scroll range passes. Falling back
// to JS scroll tracking fixes this across all browsers.
if (typeof window !== 'undefined') {
  // @ts-expect-error — ViewTimeline is newer than the DOM lib typings here
  window.ViewTimeline = undefined
  // @ts-expect-error — ScrollTimeline is newer than the DOM lib typings here
  window.ScrollTimeline = undefined
}

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  cubicBezier,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import ReactLenis, { useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image, { type StaticImageData } from 'next/image'
import Hero, { AmbientBackground } from './Hero'

gsap.registerPlugin(ScrollTrigger)

/**
 * awwwards-animations Lenis <-> ScrollTrigger integration: Lenis animates
 * scroll position every frame, so ScrollTrigger must be told to re-read it
 * (native scroll events alone can lag one frame behind the smoothed value).
 * Lives inside <ReactLenis> because useLenis() needs the provider context.
 */
function LenisScrollSync() {
  const lenis = useLenis()
  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', ScrollTrigger.update)
    return () => {
      lenis.off('scroll', ScrollTrigger.update)
    }
  }, [lenis])
  return null
}

import doctor1 from '@/public/images/doctors/1.jpeg'
import doctor2 from '@/public/images/doctors/2.jpeg'
import doctor3 from '@/public/images/doctors/3.jpg'
import doctor4 from '@/public/images/doctors/4.jpeg'
import doctor5 from '@/public/images/doctors/5.jpeg'

// Mobile stand-ins: phones get a still frame instead of streaming video.
import personnel1 from '@/public/images/personels1.jpg'
import personnel2 from '@/public/images/personels2.jpg'
import personnel3 from '@/public/images/personels3.jpg'

/* ------------------------------------------------------------------ data */

type TeamMember = {
  id: string
  name: string
  role: string
  profile: StaticImageData
}

type VideoConfig = {
  src: string
  /** Still shown on <sm screens in place of the video. */
  poster: StaticImageData
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

const VIDEOS: VideoConfig[] = [
  {
    src: '/videos/Plastic Surgery In Salt Lake City, UT - The Plastics Clinic + Spa(1).mp4',
    poster: personnel1,
    clip: 'inset(0% 5% 0% 5% round 150px 10px 150px 10px)',
    align: 'justify-start',
  },
  {
    src: '/videos/Plastic Surgery In Salt Lake City, UT - The Plastics Clinic + Spa(2).mp4',
    poster: personnel2,
    clip: 'inset(0% 5% 0% 5% round 100px 10px 10px 10px)',
    align: 'justify-end',
  },
  {
    src: '/videos/6998560-hd_720_1280_25fps.mp4',
    poster: personnel3,
    clip: 'circle(30% at 50% 50%)',
    align: 'justify-center',
  },
]

/* --------------------------------------------------------------- timing map */
type ScrollRange = [number, number]
type Timings = {
  heroZoom: ScrollRange
  heroFade: ScrollRange
  teamIn: ScrollRange
  rings: ScrollRange
  videoPan: ScrollRange
  photos: ScrollRange
  copy: ScrollRange
}

const T_DESKTOP: Timings = {
  heroZoom: [0, 0.46] as const,
  heroFade: [0.28, 0.47] as const,
  teamIn: [0.16, 0.5] as const,
  videoPan: [0.44, 0.92] as const,
  rings: [0.44, 0.64] as const,
  photos: [0.48, 0.8] as const,
  copy: [0.72, 0.88] as const,
}

// Without the hero zoom the first 46% of the desktop track would be dead
// scrolling, so phones (and reduced motion) use a shorter track with the
// hero crossfading out up front and the team/video effects remapped after.
const T_MOBILE: Timings = {
  heroZoom: [0, 0.46] as const,
  heroFade: [0, 0.3] as const,
  teamIn: [0.1, 0.42] as const,
  videoPan: [0.15, 0.92] as const,
  rings: [0.34, 0.58] as const,
  photos: [0.4, 0.78] as const,
  copy: [0.68, 0.88] as const,
}

/** Pinned-track length (in svh units) when the zoom is disabled. */
const FALLBACK_SCROLL_LENGTH = 3

const expoOut = cubicBezier(0.16, 1, 0.3, 1)

/* ------------------------------------------------------------ geometry map */
type Geometry = {
  outer: number
  middle: number
  inner: number
  card: number
  orbit: number
  figure: number
  name: number
  role: number
  title: number
  body: number
  copy: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function computeGeometry(vw: number, vh: number): Geometry {
  const unit = Math.max(300, Math.min(vw, vh) - 48)
  const outer = Math.min(640, unit * 0.98)
  const middle = outer * 0.84
  const inner = outer * 0.68
  const card = clamp(unit * 0.165, 62, 104)
  const orbit = inner / 2 + card * 0.32
  const figure = Math.max(card * 1.55, 88)
  const name = clamp(unit * 0.021, 10.5, 14)
  const role = clamp(unit * 0.0175, 9.5, 12)
  const title = clamp(unit * 0.048, 17, 32)
  const body = clamp(unit * 0.021, 10.5, 14)
  const copy = Math.max(inner * 0.82, 180)
  return {
    outer,
    middle,
    inner,
    card,
    orbit,
    figure,
    name,
    role,
    title,
    body,
    copy,
  }
}

/* --------------------------------------------------------- responsive split */

// The hero zoom is a worst case for phone GPUs: a full-screen layer scaled to
// 6x with perspective + preserve-3d, recomposited every scroll frame while the
// animated hero stream runs inside it. Only that layer is disabled below md
// (and for reduced motion) — the sticky track, video pan and photo/copy
// reveals are transform/opacity-only and stay on every breakpoint.
const ZOOM_QUERY = '(min-width: 768px)'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

function useGeometry() {
  const [geo, setGeo] = useState<Geometry>(() => computeGeometry(1280, 800))
  useEffect(() => {
    const measure = () =>
      setGeo(computeGeometry(window.innerWidth, window.innerHeight))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return geo
}

/* ------------------------------------------------------------------ pieces */
function TeamPhoto({
  member,
  index,
  count,
  radius,
  progress,
  tm,
  geo,
}: {
  member: TeamMember
  index: number
  count: number
  radius: number
  progress: MotionValue<number>
  tm: Timings
  geo: Geometry
}) {
  const angle = (index * 2 * Math.PI) / count - Math.PI / 2
  const [from, to] = tm.photos
  const step = (to - from) * 0.35
  const start = from + (index / Math.max(count - 1, 1)) * step
  const end = start + (to - from - step)

  const x = useTransform(
    progress,
    [start, end],
    [0, radius * Math.cos(angle)],
    { ease: expoOut },
  )
  const y = useTransform(
    progress,
    [start, end],
    [0, radius * Math.sin(angle)],
    { ease: expoOut },
  )
  const scale = useTransform(progress, [start, end], [0.55, 1], {
    ease: expoOut,
  })
  const opacity = useTransform(
    progress,
    [start, start + (end - start) * 0.4],
    [0, 1],
  )

  const cardPx = Math.round(geo.card)

  return (
    <motion.figure
      style={{ x, y, scale, opacity, width: geo.figure }}
      className="absolute z-10 m-0 flex flex-col items-center gap-1.5 sm:gap-2"
    >
      <div
        style={{ width: cardPx, height: cardPx }}
        // Luxury touch: Grayscale and contrast unify mismatched headshots for an editorial look
        className="overflow-hidden rounded-t-xl border-[3px] border-white/90 shadow-xl shadow-black/10 sm:border-4 dark:border-[#C5A059]/30 dark:bg-black"
      >
        <Image
          src={member.profile}
          alt={member.name}
          width={cardPx}
          height={cardPx}
          sizes={`${cardPx}px`}
          className="h-full w-full object-cover grayscale-[20%] contrast-[1.05]"
        />
      </div>
      <figcaption dir="rtl" className="text-center leading-tight">
        {/* <span className="block font-medium text-[#1A1A1A] dark:text-[#FDFBF7]">
          {member.name}
        </span>
        <span className="block text-[#666666] dark:text-[#A3A3A3]">
          {member.role}
        </span> */}

        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="px-1 text-xs md:text-sm truncate">
              {/* {img.procedure || 'Aesthetic Excellence'} */}
              {member.name}
            </p>
            {/* <p className="text-[0.85cqw] font-medium uppercase tracking-widest text-neutral-500 mt-[0.2cqw] truncate">
                                {img.stage || 'Before & After'}
                              </p> */}
          </div>

          {/* Clinical/Luxury Badge */}
          <div className="flex items-center gap-[0.6cqw] ml-[1cqw] flex-shrink-0">
            <div className="w-[0.2cqw] h-[2.5cqw] bg-gradient-to-b from-amber-300 to-amber-500 rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600/90">
              {member.role}
            </span>
          </div>
        </div>
      </figcaption>
    </motion.figure>
  )
}

function Ring({
  progress,
  index,
  size,
  tm,
  className,
  children,
}: {
  progress: MotionValue<number>
  index: number
  size: number
  tm: Timings
  className: string
  children: React.ReactNode
}) {
  const [from, to] = tm.rings
  const start = from + index * (to - from) * 0.3
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1])
  return (
    <motion.div
      style={{ opacity, width: size, height: size }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ props */
type HeroZoomProps = {
  scrollLength?: number
  zoomOrigin?: string
  zoomScale?: number
  /** Real review stats from the DB — renders in the hero's orbiting stat card. */
  ratingStats?: {
    avgLabel: string
    countLabel: string
  }
}

/**
 * Rings + orbiting team photos + center copy, driven by scroll progress.
 */
function TeamComposition({
  progress,
  tm,
  geo,
}: {
  progress: MotionValue<number>
  tm: Timings
  geo: Geometry
}) {
  const count = TEAM.length
  const copyOpacity = useTransform(progress, tm.copy, [0, 1])
  const copyY = useTransform(progress, tm.copy, [32, 0], {
    ease: expoOut,
  })

  return (
    <Ring
      progress={progress}
      index={0}
      size={geo.outer}
      tm={tm}
      className="flex shrink-0 items-center justify-center rounded-full border border-[#C5A059]/30 shadow-[0_0_90px_-30px_rgba(197,160,89,0.15)] dark:border-[#C5A059]/20"
    >
      <Ring
        progress={progress}
        index={1}
        size={geo.middle}
        tm={tm}
        className="flex items-center justify-center rounded-full border border-[#C5A059]/20 dark:border-[#C5A059]/15"
      >
        <div
          style={{ width: geo.inner, height: geo.inner }}
          className="relative flex items-center justify-center rounded-full border border-[#C5A059]/15 dark:border-[#C5A059]/10"
        >
          {/* Frosted Crystal Center Card */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/60 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_20px_40px_-10px_rgba(0,0,0,0.05)] backdrop-blur-[1px] dark:border-white/10 dark:bg-black/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {TEAM.map((member, idx) => (
              <TeamPhoto
                key={member.id}
                member={member}
                index={idx}
                count={count}
                radius={geo.orbit}
                progress={progress}
                tm={tm}
                geo={geo}
              />
            ))}

            <motion.div
              dir="rtl"
              style={{
                opacity: copyOpacity,
                y: copyY,
                maxWidth: geo.copy,
              }}
              className="mix-blend-difference relative z-20 flex flex-col items-center justify-center px-4"
            >
              <h2
                style={{ fontSize: geo.title }}
                className=" mb-3 text-center font-semibold tracking-tight text-balance text-[#1b1916] sm:mb-4 dark:text-[#D4B872]"
              >
                تیمی که همراه شماست
              </h2>
              {/* <p
                style={{ fontSize: geo.body }}
                className="max-w-[38ch] text-center leading-relaxed text-pretty text-[#4A4A4A] dark:text-[#D4D4D4]"
              >
                از اولین مشاوره تا آخرین جلسه پیگیری، همکاران کلینیک کنار شما
                هستند.
              </p> */}
            </motion.div>
          </div>
        </div>
      </Ring>
    </Ring>
  )
}

/* --------------------------------------------------------------- component */
const HeroZoom = ({
  scrollLength = 5,
  zoomOrigin = '50% 45%',
  zoomScale = 6,
  ratingStats,
}: HeroZoomProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const zoomEnabled = useMediaQuery(ZOOM_QUERY)
  const reduced = useReducedMotion() ?? false
  const zooming = zoomEnabled && !reduced
  const tm = zooming ? T_DESKTOP : T_MOBILE
  const length = zooming ? scrollLength : FALLBACK_SCROLL_LENGTH

  const geo = useGeometry()

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  })

  const [travel, setTravel] = useState(0)

  useEffect(() => {
    const measure = () => {
      const h = trackRef.current?.offsetHeight ?? 0
      setTravel(Math.max(0, h - window.innerHeight))
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

  /* --- act 1: the hero (zoom on md+, crossfade elsewhere) --- */
  const heroScale = useTransform(scrollYProgress, tm.heroZoom, [
    1,
    zooming ? zoomScale : 1,
  ])
  const heroZ = useTransform(scrollYProgress, tm.heroZoom, [
    0,
    zooming ? 500 : 0,
  ])
  const heroOpacity = useTransform(scrollYProgress, tm.heroFade, [1, 0])

  // Vignette opacity matches the hero handoff, hiding the harsh edges of the
  // scaling hero on md+ and washing the crossfade on smaller screens.
  const vignetteOpacity = useTransform(scrollYProgress, tm.heroFade, [0, 1])

  /* --- act 2: the team layer --- */
  const teamOpacity = useTransform(scrollYProgress, tm.teamIn, [0, 1])
  const teamScale = useTransform(scrollYProgress, tm.teamIn, [1.22, 1], {
    ease: expoOut,
  })
  const trackY = useTransform(scrollYProgress, tm.videoPan, [0, -travel])

  /* --- video lifecycle --- */
  const playing = useRef(false)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const shouldPlay = p > tm.teamIn[0] && p < 0.99
    if (shouldPlay === playing.current) return
    playing.current = shouldPlay
    // <sm screens render stills instead of videos — never spin up playback
    // (or battery/network drain) there, even if the elements stay in the DOM.
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(min-width: 640px)').matches
    ) {
      videoRefs.current.forEach((v) => v?.pause())
      return
    }
    videoRefs.current.forEach((v) => {
      if (!v) return
      if (shouldPlay) void v.play().catch(() => {})
      else v.pause()
    })
  })

  return (
    <ReactLenis root>
      <LenisScrollSync />
      <div
        ref={scrollRef}
        className="relative "
        style={{ height: `${length * 100}svh` }}
      >
        <div
          className="sticky top-0 h-svh w-full overflow-hidden"
          style={{ perspective: zooming ? '1200px' : undefined }}
        >
          {/* Layer 0: Ambient Luxury Mesh Background */}
          <AmbientBackground />

          {/* Layer 1: Team + Videos */}
          <motion.div
            style={{ opacity: teamOpacity, scale: teamScale }}
            className="absolute inset-0 z-10"
          >
            <motion.div
              ref={trackRef}
              style={{ y: trackY }}
              className="pointer-events-none absolute left-0 top-0 h-[280svh] w-full"
            >
              <div className="mx-auto grid h-full max-w-[80rem] grid-rows-3 px-5 md:px-10">
                {VIDEOS.map((video, idx) => (
                  <div key={idx} className={`flex items-center ${video.align}`}>
                    <div
                      className="relative h-56 w-[min(20rem,88vw)] overflow-hidden bg-black/5 shadow-2xl shadow-black/10 sm:h-80 sm:w-80 md:h-[28rem] md:w-96 dark:bg-white/5 dark:shadow-white/5"
                      style={{ clipPath: video.clip }}
                    >
                      {/* Lens polish overlay */}
                      <div className="absolute inset-0 z-10 pointer-events-none border border-white/20 dark:border-white/5" />
                      {/* Mobile: a still instead of streaming video */}
                      <Image
                        src={video.poster}
                        alt="همکاران کلینیک در محیط کار"
                        fill
                        sizes="(max-width: 639px) 88vw"
                        placeholder="blur"
                        className="absolute inset-0 h-full w-full object-cover sm:hidden"
                      />
                      <video
                        ref={(el) => {
                          videoRefs.current[idx] = el
                        }}
                        className="absolute inset-0 hidden h-full w-full object-cover sm:block"
                        src={video.src}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        disablePictureInPicture
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Expanding Team Composition */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
              <TeamComposition progress={scrollYProgress} tm={tm} geo={geo} />
            </div>
          </motion.div>

          {/* Layer 2: Vignette Transition Mask */}
          <motion.div
            style={{ opacity: vignetteOpacity }}
            className="pointer-events-none absolute inset-0 z-[25] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(253,251,247,0.95)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,rgba(10,10,10,0.95)_100%)]"
          />

          {/* Layer 3: The Hero (scaling window on md+, static layer below) */}
          <motion.div
            style={{
              scale: heroScale,
              z: heroZ,
              opacity: heroOpacity,
              transformOrigin: zoomOrigin,
              ...(zooming ? { transformStyle: 'preserve-3d' as const } : {}),
            }}
            className="absolute inset-0 z-20"
          >
            <Hero progress={scrollYProgress} ratingStats={ratingStats} />
          </motion.div>
        </div>
      </div>
    </ReactLenis>
  )
}

export default HeroZoom
