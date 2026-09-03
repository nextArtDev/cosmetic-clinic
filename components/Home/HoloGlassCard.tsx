'use client'

import React, { useCallback } from 'react'
import {
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'

/* ---------------------------------- types --------------------------------- */

export interface HoloGlassCardProps {
  imageSrc: string
  imageAlt?: string
  badgeText?: string
  sideLines?: string[]
  infoLines?: string[]
  footerText?: string
  brandText?: string
  brandLines?: string[]
  showStand?: boolean
  className?: string
}

/* --------------------------------- helpers -------------------------------- */

const TEXT_GLOW =
  '[text-shadow:0_1px_2px_rgba(2,24,38,0.85),0_0_10px_rgba(150,235,255,0.7)]'

const hexPath = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(1)} ${(
      cy +
      r * Math.sin(a)
    ).toFixed(1)}`
  }).join(' ') + ' Z'

const draw = (delay: number, duration = 1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { delay, duration, ease: 'easeInOut' as const },
})

const DOTS = [
  { x: 108, y: 372, d: 0.0 },
  { x: 176, y: 380, d: 0.3 },
  { x: 312, y: 372, d: 0.6 },
  { x: 244, y: 380, d: 0.9 },
  { x: 82, y: 380, d: 1.2 },
  { x: 158, y: 462, d: 1.5 },
  { x: 338, y: 380, d: 1.8 },
  { x: 262, y: 462, d: 2.1 },
  { x: 70, y: 372, d: 2.4 },
  { x: 76, y: 398, d: 2.7 },
]

/* -------------------------------- component ------------------------------- */

export function HoloGlassCard({
  imageSrc,
  imageAlt = 'Holographic scan',
  badgeText = 'SCAN 04',
  sideLines = ['Patient:', 'Tx Oncology'],
  infoLines = [
    'Tomography of dermal layers for phase lift with',
    '& sub-dermal tissue refresh.',
    'Mapping of displacement 0.4 mm lateral drift,',
    'symmetry within clinical norm.',
    'Region 02: ocular vectors within parameters,',
    'tissue elasticity nominal grade.',
    'Incision paths locked: trace loyalty.',
  ],
  footerText = 'Biotechnology',
  brandText = 'ADERTI ADLAB',
  brandLines = ['Dermal scan unit', 'Biometric field v2.1'],
  showStand = true,
  className = '',
}: HoloGlassCardProps) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [5, -5]), {
    stiffness: 140,
    damping: 18,
  })
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), {
    stiffness: 140,
    damping: 18,
  })
  const glare = useTransform(
    [px, py],
    ([x, y]) =>
      `radial-gradient(320px circle at ${(x as number) * 100}% ${
        (y as number) * 100
      }%, rgba(255,255,255,0.28), transparent 65%)`,
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

  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative flex w-fit flex-col items-center ${className}`}>
        <motion.div
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          /* 👇 height-aware sizing: 2:1 panel + stand always fits < 100svh */
          className="relative z-10 w-[min(88vw,42svh,420px)]"
        >
          <motion.div
            initial={{ opacity: 0, y: 46, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* ============================ GLASS SLAB ============================ */}
              <div
                className="relative aspect-[1/2] w-full overflow-hidden rounded-[30px]
                           border border-white/70
                           bg-gradient-to-b from-white/25 via-white/10 to-white/20
                           backdrop-blur-sm
                           shadow-[0_0_70px_rgba(140,220,255,0.5),0_35px_70px_-25px_rgba(110,170,220,0.55),inset_0_0_30px_rgba(255,255,255,0.28)]"
              >
                {/* portrait */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,rgba(0,0,0,0.35)_82%,transparent_97%)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    draggable={false}
                    className="h-full w-full select-none object-cover object-top brightness-[1.04] saturate-[0.92]"
                  />
                </div>

                {/* ---- GLASS BODY: tints, edge-frost, hotspots, grain ---- */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-cyan-100/15" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-200/15 via-transparent to-cyan-200/15" />

                {/* frosted thick edges (left / right / top) */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-7 backdrop-blur-[4px] [mask-image:linear-gradient(to_right,black,transparent)]" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-7 backdrop-blur-[4px] [mask-image:linear-gradient(to_left,black,transparent)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-6 backdrop-blur-[3px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

                {/* frosted bottom — shoulders dissolve into glass */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-white/30 via-white/10 to-transparent backdrop-blur-[7px] [mask-image:linear-gradient(to_top,black_55%,transparent)]" />

                {/* corner light hotspots + cool bottom glow */}
                <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-white/60 blur-2xl" />
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/50 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />

                {/* micro grain = real glass texture */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
                  <filter id="holo-grain">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.9"
                      numOctaves="2"
                    />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#holo-grain)" />
                </svg>

                {/* mouse glare */}
                <motion.div
                  style={{ background: glare }}
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                />

                {/* ---- GLASS EDGES: double rim = visible thickness ---- */}
                <div className="pointer-events-none absolute inset-0 rounded-[30px] border-[1.5px] border-white/80" />
                <div className="pointer-events-none absolute inset-[3px] rounded-[27px] border border-white/40 [box-shadow:inset_0_0_6px_rgba(255,255,255,0.35)]" />
                <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                {/* glowing inner frame */}
                <div className="pointer-events-none absolute inset-[10px] rounded-[24px] border border-white/80 [box-shadow:0_0_16px_rgba(255,255,255,0.6),inset_0_0_16px_rgba(255,255,255,0.3)]" />

                {/* scan-line sweep */}
                <motion.div
                  className="pointer-events-none absolute left-3 right-3 h-10"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent, rgba(190,240,255,0.16) 45%, rgba(240,252,255,0.9) 50%, rgba(190,240,255,0.16) 55%, transparent)',
                  }}
                  initial={{ top: '6%', opacity: 0 }}
                  animate={{ top: ['6%', '90%'], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: 'easeInOut',
                  }}
                />

                {/* ============================ HUD MARKINGS ============================ */}
                <svg
                  viewBox="0 0 420 840"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <defs>
                    <filter
                      id="holo-glow"
                      x="-40%"
                      y="-40%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="2.4" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient
                      id="holo-stroke"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                      <stop offset="100%" stopColor="rgba(170,235,255,0.8)" />
                    </linearGradient>
                  </defs>

                  <g
                    fill="none"
                    stroke="url(#holo-stroke)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    filter="url(#holo-glow)"
                  >
                    <motion.circle cx="54" cy="188" r="24" {...draw(0.5)} />
                    <motion.path
                      d="M54 158v-8 M54 218v8 M24 188h-8 M84 188h8"
                      strokeWidth="1.1"
                      {...draw(0.9, 0.6)}
                    />
                    <motion.path
                      d="M84 196 L112 182 L128 166 L214 164"
                      {...draw(0.8)}
                    />
                    <motion.path
                      d="M92 208 L122 194 L138 178 L224 176"
                      {...draw(1.0)}
                    />
                    <motion.path
                      d="M116 340 Q146 326 176 338"
                      {...draw(1.2, 0.8)}
                    />
                    <motion.path
                      d="M108 372 Q140 398 176 380"
                      {...draw(1.35, 0.8)}
                    />
                    <motion.path
                      d="M304 340 Q274 326 244 338"
                      {...draw(1.5, 0.8)}
                    />
                    <motion.path
                      d="M312 372 Q280 398 244 380"
                      {...draw(1.65, 0.8)}
                    />
                    <motion.path d="M210 352 V384" {...draw(1.8, 0.6)} />
                    <motion.path d="M82 380 Q96 452 158 462" {...draw(1.9)} />
                    <motion.path
                      d="M338 380 Q324 452 262 462"
                      {...draw(2.05)}
                    />
                    <motion.path
                      d="M40 616 L148 616 L166 632 L268 632"
                      strokeWidth="1.1"
                      {...draw(2.2)}
                    />
                    <motion.path
                      d="M329 622 L337 636 L321 636 Z"
                      strokeWidth="1.3"
                      {...draw(2.35, 0.6)}
                    />
                    <motion.path
                      d={hexPath(272, 700, 13)}
                      strokeWidth="1.2"
                      {...draw(2.5, 0.7)}
                    />
                    <motion.path
                      d={hexPath(300, 716, 9)}
                      strokeWidth="1.2"
                      {...draw(2.65, 0.7)}
                    />
                  </g>

                  <g fill="#F4FCFF" filter="url(#holo-glow)">
                    {DOTS.map((p, i) => (
                      <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="2.6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{
                          duration: 2.6,
                          repeat: Infinity,
                          delay: p.d,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                    <motion.circle
                      cx="272"
                      cy="700"
                      r="3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        delay: 2.8,
                        ease: 'easeInOut',
                      }}
                    />
                  </g>

                  {/* badge: dark backing + bright text = readable on any photo */}
                  <circle cx="54" cy="188" r="24" fill="rgba(4,30,44,0.45)" />
                  <motion.text
                    x="54"
                    y="191"
                    textAnchor="middle"
                    fontSize="8"
                    letterSpacing="2"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                    fill="rgba(240,252,255,0.95)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    {badgeText}
                  </motion.text>
                </svg>

                {/* ---- CONTRAST: teal scrim behind all text zones ---- */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#062a3a]/60 via-[#062a3a]/25 to-transparent" />

                {/* ============================ TEXT LAYERS ============================ */}
                <div
                  className={`pointer-events-none absolute inset-0 font-mono font-medium uppercase text-white ${TEXT_GLOW}`}
                >
                  {/* left-middle pill */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="absolute left-5 top-[64%] rounded-md bg-[#062a3a]/45 px-2.5 py-1.5 ring-1 ring-white/25 backdrop-blur-[2px]"
                  >
                    {sideLines.map((l, i) => (
                      <p
                        key={i}
                        className="text-[8px] leading-relaxed tracking-[0.2em]"
                      >
                        {l}
                      </p>
                    ))}
                  </motion.div>

                  {/* bottom-left paragraph */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.9 }}
                    className="absolute bottom-[9%] left-5 w-[72%] space-y-1"
                  >
                    {infoLines.map((l, i) => (
                      <p
                        key={i}
                        className="text-[8px] leading-relaxed tracking-[0.14em]"
                      >
                        {l}
                      </p>
                    ))}
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.9 }}
                    className="absolute bottom-[4.5%] left-5 text-[10px] tracking-[0.35em]"
                  >
                    {footerText}
                  </motion.p>

                  {/* brand pill right */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.8, 1, 0.85, 1] }}
                    transition={{
                      delay: 2.1,
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute bottom-[15%] right-5 rounded-md bg-[#062a3a]/45 px-2.5 py-1.5 text-right ring-1 ring-white/25 backdrop-blur-[2px]"
                  >
                    <p className="text-[11px] tracking-[0.3em]">{brandText}</p>
                    {brandLines.map((l, i) => (
                      <p
                        key={i}
                        className="mt-1 text-[7px] tracking-[0.22em] text-cyan-100/80"
                      >
                        {l}
                      </p>
                    ))}
                  </motion.div>
                </div>
              </div>
              {/* ========================== /GLASS SLAB ========================== */}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ------------------------------- chrome stand ------------------------------ */}
        {showStand && (
          <div className="relative z-0 -mt-7 flex flex-col items-center">
            <div className="h-9 w-2.5 rounded-b-sm bg-gradient-to-b from-slate-200 via-white to-slate-400 shadow-[0_2px_6px_rgba(0,0,0,0.25)]" />
            <div className="-mt-1 h-2.5 w-24 rounded-full bg-gradient-to-b from-white via-slate-200 to-slate-400 shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
            <div className="mt-2 h-3 w-44 rounded-[100%] bg-slate-400/25 blur-md" />
          </div>
        )}
      </div>
    </MotionConfig>
  )
}
