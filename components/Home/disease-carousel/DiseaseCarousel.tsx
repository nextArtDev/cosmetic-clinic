'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { NotchCard } from './NotchCard'

// ---- Types -------------------------------------------------

export interface DiseaseData {
  id: string
  title: string
  imageUrl: string
  /** Optional accent color for the card border (any CSS color). */
  accent?: string
}

export interface DiseaseCarouselProps {
  diseases: DiseaseData[]
  /** ms between step changes @default 5000 */
  autoPlayInterval?: number
  className?: string
}

// ---- Glass setup (shared by every card) --------------------

const glass = {
  borderWidth: 1,
  beamVariant: 'none',
  glowIntensity: 'none',
  hoverEffect: 'none',
  cardColor: 'rgba(255,255,255,0.06)',
} as const

const GLASS_BORDER = 'rgba(255,255,255,0.22)'

// ---- Fade variants (appear / disappear by fading) ----------

const stepVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.05 } },
}

const cellVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    filter: 'blur(8px)',
    transition: { duration: 0.45, ease: 'easeIn' },
  },
}

// ---- Cards --------------------------------------------------

const PictureCard: React.FC<{ disease: DiseaseData; className?: string }> = ({
  disease,
  className = '',
}) => (
  <NotchCard
    {...glass}
    size="sm"
    notchSize={5}
    // beamVariant="dual"
    // beamDurationB={3}
    // beamColor="cyan"
    // beamDuration={2}
    notchSides={['bottom', 'top', 'left', 'right']}
    borderColor={disease.accent ?? GLASS_BORDER}
    className={className}
    innerClassName="!p-0 relative overflow-hidden backdrop-blur-xl "
  >
    <img
      src={disease.imageUrl}
      alt={disease.title}
      draggable={false}
      className="absolute inset-1 h-full w-full object-contain  "
    />
    {/* glass label strip over the image */}
    {/* <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent px-3 pb-2 pt-8 backdrop-blur-sm">
      <span className="text-xs md:text-sm font-semibold tracking-wide text-white/90 drop-shadow">
        {disease.title}
      </span>
    </div> */}
  </NotchCard>
)

const TitleCard: React.FC<{ disease: DiseaseData; className?: string }> = ({
  disease,
  className = '',
}) => (
  <NotchCard
    {...glass}
    notchSize={7}
    notchSides={['bottom', 'top', 'left', 'right']}
    size="sm"
    align="center"
    borderColor={disease.accent ?? GLASS_BORDER}
    className={className}
    innerClassName="justify-center backdrop-blur-sm"
  >
    <h3 className="text-center text-sm md:text-lg lg:text-xl font-semibold tracking-wide text-white/90">
      {disease.title}
    </h3>
  </NotchCard>
)

// ---- One diagonal step --------------------------------------

const Step: React.FC<{ pair: DiseaseData[]; index: number }> = ({
  pair,
  index,
}) => {
  const [a, b] = pair
  // step 1 → picture of first disease on the RIGHT (like your schema),
  // step 2 → mirrored, and so on…
  const firstRight = index % 2 === 0

  return (
    <motion.div
      className="absolute inset-0 grid grid-cols-3 grid-rows-[1fr_auto_auto_1fr] gap-x-0! gap-y-3 md:gap-y-6 md:p-2 "
      variants={stepVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* picture A — top corner */}
      <motion.div
        variants={cellVariants}
        className={`min-h-0 row-start-1 row-span-2 ${
          firstRight ? 'col-start-3' : 'col-start-1'
        }`}
      >
        <PictureCard disease={a} className="h-full w-full " />
      </motion.div>

      {/* title A — middle */}
      <motion.div variants={cellVariants} className="col-start-2 row-start-2">
        <TitleCard disease={a} className="h-full w-full" />
      </motion.div>

      {b && (
        <>
          {/* title B — middle */}
          <motion.div
            variants={cellVariants}
            className="col-start-2 row-start-3"
          >
            <TitleCard disease={b} className="h-full w-full" />
          </motion.div>

          {/* picture B — bottom opposite corner */}
          <motion.div
            variants={cellVariants}
            className={`min-h-0 row-start-3 row-span-2 ${
              firstRight ? 'col-start-1' : 'col-start-3'
            }`}
          >
            <PictureCard disease={b} className="h-full w-full" />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

// ---- Carousel ------------------------------------------------

export const DiseaseCarousel: React.FC<DiseaseCarouselProps> = ({
  diseases,
  autoPlayInterval = 5000,
  className = '',
}) => {
  const [step, setStep] = useState(0)

  // chunk diseases into pairs → 12 diseases = 6 steps
  const steps = useMemo(() => {
    const chunks: DiseaseData[][] = []
    for (let i = 0; i < diseases.length; i += 2) {
      chunks.push(diseases.slice(i, i + 2))
    }
    return chunks
  }, [diseases])

  // infinite auto-play
  useEffect(() => {
    if (steps.length < 2) return
    const id = setInterval(
      () => setStep((s) => (s + 1) % steps.length),
      autoPlayInterval,
    )
    return () => clearInterval(id)
  }, [steps.length, autoPlayInterval])

  if (steps.length === 0) return null

  return (
    <section
      className={`relative h-[50vh] max-w-md mx-auto w-full overflow-hidden ${className}`}
      aria-roledescription="carousel"
    >
      {/* faint ambient glows so the glass has something to refract */}
      {/* <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-[10%] h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-24 left-[10%] h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div> */}

      <AnimatePresence>
        <Step key={step} pair={steps[step]} index={step} />
      </AnimatePresence>
    </section>
  )
}

export default DiseaseCarousel
