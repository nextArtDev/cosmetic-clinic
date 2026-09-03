'use client'

import React, { useCallback } from 'react'
import {
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

/* ---------------------------------- icons --------------------------------- */

const ic = 'h-[15px] w-[15px] stroke-cyan-100/90'
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const IconGear = () => (
  <svg viewBox="0 0 24 24" className={ic} {...stroke}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 5V3M12 21v-2M19 12h2M3 12h2M16.9 7.1l1.4-1.4M5.7 18.3l1.4-1.4M16.9 16.9l1.4 1.4M5.7 5.7l1.4 1.4" />
  </svg>
)
const IconSliders = () => (
  <svg viewBox="0 0 24 24" className={ic} {...stroke}>
    <path d="M4 7h16M4 12h16M4 17h16" />
    <circle cx="9" cy="7" r="2" />
    <circle cx="15" cy="12" r="2" />
    <circle cx="7" cy="17" r="2" />
  </svg>
)
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" className={ic} {...stroke}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4h-4" />
  </svg>
)
const IconList = () => (
  <svg viewBox="0 0 24 24" className={ic} {...stroke}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <circle cx="4.5" cy="6" r="0.8" />
    <circle cx="4.5" cy="12" r="0.8" />
    <circle cx="4.5" cy="18" r="0.8" />
  </svg>
)
const IconWifi = () => (
  <svg viewBox="0 0 24 24" className={ic} {...stroke}>
    <path d="M4 10a12 12 0 0 1 16 0M7 13.5a8 8 0 0 1 10 0M10 17a4 4 0 0 1 4 0" />
    <circle cx="12" cy="19.2" r="0.9" />
  </svg>
)
const IconLips = ({ className = ic }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M3 11c3-4 6.5-4 9-1 2.5-3 6-3 9 1-3 4.5-15 4.5-18 0Z" />
    <path d="M3 11h18" />
  </svg>
)
const IconSnow = () => (
  <svg viewBox="0 0 24 24" className={ic} {...stroke}>
    <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
  </svg>
)
const HexLips = () => (
  <svg viewBox="0 0 40 40" className="h-9 w-9">
    <path
      d="M20 3 34 11v18L20 37 6 29V11Z"
      fill="rgba(6,42,58,0.6)"
      stroke="rgba(190,245,255,0.9)"
      strokeWidth="1.6"
    />
    <path
      d="M11 20c2.5-3.5 5.5-3.5 9-1 3.5-2.5 6.5-2.5 9 1-2.5 4-15.5 4-18 0Z"
      fill="none"
      stroke="rgba(220,250,255,0.95)"
      strokeWidth="1.4"
    />
  </svg>
)

function GlitchText({ text }: { text: string }) {
  return (
    <span className="relative inline-block font-mono text-[10px] font-bold tracking-[0.22em] text-white [text-shadow:0_0_8px_rgba(160,240,255,0.9)]">
      <motion.span
        aria-hidden
        className="absolute inset-0 text-cyan-300"
        animate={{
          x: [-1, 1.5, -2, 1, 0],
          clipPath: [
            'inset(0 0 65% 0)',
            'inset(35% 0 20% 0)',
            'inset(65% 0 0 0)',
            'inset(10% 0 45% 0)',
            'inset(0 0 65% 0)',
          ],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute inset-0 text-fuchsia-300/70"
        animate={{
          x: [1, -1.5, 2, -1, 0],
          clipPath: [
            'inset(60% 0 0 0)',
            'inset(15% 0 55% 0)',
            'inset(40% 0 25% 0)',
            'inset(70% 0 5% 0)',
            'inset(60% 0 0 0)',
          ],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.span>
      <span className="relative">{text}</span>
    </span>
  )
}

/* ------------------------------ shared screen ------------------------------ */

interface ScreenPanelProps {
  beforeSrc: string
  afterSrc: string
  imageAlt?: string
  mainImage?: 'before' | 'after'
  headerText?: string
  beforeLabel?: string
  afterLabel?: string
  captionText?: string
  thumbCount?: number
  rippleLeft?: string
  rippleTop?: string
  /** sizing classes for the slab (width-based or height-based) */
  sizeClass?: string
}

function ScreenPanel({
  beforeSrc,
  afterSrc,
  imageAlt = 'Beauty surgery simulation',
  mainImage = 'after',
  headerText = 'SIM-09 // LIPO-SCAN',
  beforeLabel = 'Before',
  afterLabel = 'After',
  captionText = 'Beauty Surgery Simulation',
  thumbCount = 5,
  rippleLeft = '50%',
  rippleTop = '58%',
  sizeClass = 'w-[min(92vw,46svh,470px)]',
}: ScreenPanelProps) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(px, [0, 1], [-16, -7]), {
    stiffness: 120,
    damping: 16,
  })
  const rotateX = useSpring(useTransform(py, [0, 1], [5, -1]), {
    stiffness: 120,
    damping: 16,
  })
  const glare = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(340px circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(160,240,255,0.14), transparent 65%)`,
  )

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect()
      px.set((e.clientX - r.left) / r.width)
      py.set((e.clientY - r.top) / r.height)
    },
    [px, py],
  )
  const onLeave = useCallback(() => {
    px.set(0.5)
    py.set(0.5)
  }, [px, py])

  const mainSrc = mainImage === 'after' ? afterSrc : beforeSrc

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="relative w-fit"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* ============================ SCREEN SLAB ============================ */}
          <div
            className={`relative aspect-[1/1.9] overflow-hidden rounded-[26px] border-2 border-cyan-100/90
              bg-[linear-gradient(160deg,#0a3140_0%,#062430_45%,#04161f_100%)]
              shadow-[0_0_35px_rgba(120,240,255,0.75),0_0_110px_rgba(50,200,255,0.4),inset_0_0_30px_rgba(120,240,255,0.28)] ${sizeClass}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(190,245,255,0.05)_0px,rgba(190,245,255,0.05)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(2,10,16,0.75)_100%)]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 backdrop-blur-[4px] [mask-image:linear-gradient(to_right,black,transparent)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 backdrop-blur-[4px] [mask-image:linear-gradient(to_left,black,transparent)]" />
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-cyan-100/50 blur-2xl" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-100/40 blur-2xl" />
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-screen">
              <filter id="bc-grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves="2"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#bc-grain)" />
            </svg>
            <motion.div
              style={{ background: glare }}
              className="pointer-events-none absolute inset-0 mix-blend-screen"
            />
            <div className="pointer-events-none absolute inset-[7px] rounded-[20px] border border-cyan-200/40 [box-shadow:inset_0_0_14px_rgba(120,240,255,0.25)]" />
            <motion.div
              className="pointer-events-none absolute left-2 right-2 h-12"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(140,235,255,0.12) 45%, rgba(230,252,255,0.7) 50%, rgba(140,235,255,0.12) 55%, transparent)',
              }}
              initial={{ top: '4%', opacity: 0 }}
              animate={{ top: ['4%', '92%'], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: 'easeInOut',
              }}
            />

            {/* ============================ LAYOUT ============================ */}
            <div className="relative flex h-full flex-col font-mono text-cyan-50">
              <div className="flex h-10 items-center justify-between border-b border-cyan-200/25 px-4">
                <div className="flex items-center gap-3">
                  <IconGear />
                  <IconSliders />
                </div>
                <div className="flex items-center gap-3">
                  <IconRefresh />
                  <IconList />
                </div>
                <GlitchText text={headerText} />
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-14 right-14 [mask-image:linear-gradient(to_bottom,black_60%,rgba(0,0,0,0.4)_85%,transparent_99%)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainSrc}
                    alt={imageAlt}
                    draggable={false}
                    className="h-full w-full select-none object-cover object-top [filter:drop-shadow(0_0_26px_rgba(120,235,255,0.35))]"
                  />
                </div>

                {/* left rail = before thumbs */}
                <div className="absolute inset-y-2 left-2.5 flex w-11 flex-col justify-between">
                  <p className="text-center text-[7px] uppercase tracking-[0.25em] text-cyan-200/90 [text-shadow:0_0_6px_rgba(120,235,255,0.8)]">
                    {beforeLabel}
                  </p>
                  {Array.from({ length: thumbCount }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.12 }}
                      className="aspect-[3/4] overflow-hidden rounded-[4px] border border-cyan-200/80 shadow-[0_0_10px_rgba(120,240,255,0.5)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={beforeSrc}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* right rail = after thumbs */}
                <div className="absolute inset-y-2 right-2.5 flex w-11 flex-col justify-between">
                  <p className="text-center text-[7px] uppercase tracking-[0.25em] text-cyan-200/90 [text-shadow:0_0_6px_rgba(120,235,255,0.8)]">
                    {afterLabel}
                  </p>
                  {Array.from({ length: thumbCount }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.12 }}
                      className="aspect-[3/4] overflow-hidden rounded-[4px] border border-cyan-200/80 shadow-[0_0_10px_rgba(120,240,255,0.5)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={afterSrc}
                        alt=""
                        draggable={false}
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* touch ripple (positioned where the person "touches") */}
                <div
                  className="absolute"
                  style={{ left: rippleLeft, top: rippleTop }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="absolute h-24 w-24 rounded-full border-2 border-cyan-100/90"
                      style={{ x: '-50%', y: '-50%' }}
                      initial={{ scale: 0.25, opacity: 0.9 }}
                      animate={{ scale: [0.25, 1.5], opacity: [0.9, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        delay: i * 0.6,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                  <span className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-50 shadow-[0_0_14px_rgba(170,245,255,1)]" />
                </div>
              </div>

              <div className="flex h-12 items-center justify-between border-t border-cyan-200/25 px-4">
                <div className="flex items-center gap-4">
                  <IconSnow />
                  <IconGear />
                  <IconWifi />
                  <IconLips />
                </div>
                <p className="text-[8px] uppercase tracking-[0.3em] text-cyan-100/85 [text-shadow:0_0_8px_rgba(120,235,255,0.8)]">
                  {captionText}
                </p>
                <HexLips />
              </div>
            </div>
          </div>
          {/* ========================== /SCREEN SLAB ========================== */}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const Stand = () => (
  <div className="relative z-0 -mt-6 flex flex-col items-center">
    <div className="h-10 w-3 rounded-b-sm bg-gradient-to-b from-slate-300 via-white to-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
    <div className="-mt-1 h-3 w-28 rounded-full bg-gradient-to-b from-white via-slate-300 to-slate-600 shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
    <div className="mt-3 h-4 w-56 rounded-[100%] bg-cyan-400/25 blur-xl" />
  </div>
)

/* --------------------- standalone console (unchanged API) --------------------- */

export function HoloBeautyConsole(
  props: Omit<ScreenPanelProps, 'sizeClass' | 'rippleLeft' | 'rippleTop'> & {
    showStand?: boolean
    className?: string
  },
) {
  const { showStand = true, className = '', ...screen } = props
  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative flex w-fit flex-col items-center ${className}`}>
        <div className="pointer-events-none absolute inset-0 -m-14 rounded-full bg-cyan-500/20 blur-[90px]" />
        <div className="relative z-10">
          <ScreenPanel {...screen} />
        </div>
        {showStand && <Stand />}
      </div>
    </MotionConfig>
  )
}

/* ------------------- NEW: person(left=before) + screen(right=after) ------------------- */

export interface HoloBeforeAfterSceneProps extends Omit<
  ScreenPanelProps,
  'sizeClass'
> {
  showStand?: boolean
  className?: string
}

export function HoloBeforeAfterScene({
  beforeSrc,
  afterSrc,
  showStand = true,
  className = '',
  ...screen
}: HoloBeforeAfterSceneProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`relative aspect-[3/4] w-[min(96vw,66svh,720px)] sm:aspect-[4/3] sm:w-[min(96vw,118svh,1000px)] ${className}`}
      >
        {/* dark-room halo behind the screen */}
        <div className="pointer-events-none absolute right-0 top-0 h-[90%] w-[60%] rounded-full bg-cyan-500/20 blur-[90px]" />

        {/* floor */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* ============ RIGHT: the screen showing AFTER ============ */}
        <div className="absolute inset-y-0 right-0 flex w-[58%] flex-col items-center sm:w-[56%]">
          <div className="relative z-10 flex h-full flex-col items-center justify-start">
            <ScreenPanel
              beforeSrc={beforeSrc}
              afterSrc={afterSrc}
              sizeClass="h-[86%] w-auto"
              rippleLeft="22%"
              rippleTop="56%"
              {...screen}
            />
            {showStand && <Stand />}
          </div>
        </div>

        {/* ============ LEFT: standing person = BEFORE ============ */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 z-20 h-[94%] w-[48%]
                     [mask-image:linear-gradient(to_right,transparent_0%,black_24%,black_86%,transparent_100%)]"
        >
          <div className="relative h-full w-full [mask-image:linear-gradient(to_bottom,black_72%,transparent_99%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={beforeSrc}
              alt="Before"
              draggable={false}
              className="h-full w-full select-none object-cover object-top brightness-[0.72] saturate-[0.85]"
            />
            {/* screen light spilling onto her (cyan rim from the right) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-cyan-300/40 via-cyan-400/10 to-transparent mix-blend-screen" />
            <div className="pointer-events-none absolute inset-0 bg-[#031018]/35 mix-blend-multiply" />
          </div>
          {/* her floor shadow */}
          <div className="absolute -bottom-2 left-1/2 h-4 w-3/4 -translate-x-1/2 rounded-[100%] bg-black/70 blur-md" />
        </motion.div>
      </div>
    </MotionConfig>
  )
}
