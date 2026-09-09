'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Magnetic from './Magnetic'
import Marquee from './Marquee'
import { HERO } from '../lib/content'

/**
 * Hero — faithful port of the grind Hero.tsx. RTL: the parallax image,
 * badge, bottom marquee and gradient stack are direction-agnostic; the
 * scroll-arrow and button arrows point left (RTL "forward"); title lines
 * keep the original's staggered accent/stroke pattern.
 */
export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const opacity = useTransform(scrollYProgress, [0.5, 0.95], [1, 0])

  const ease = [0.16, 1, 0.3, 1] as const

  return (
    <section
      id="top"
      ref={ref}
      className="grain tg:relative tg:flex tg:min-h-[100svh] tg:flex-col tg:justify-end tg:overflow-hidden tg:bg-[#0a0a0a]"
    >
      {/* Background image with parallax */}
      <motion.div
        style={{ y: imgY, scale: imgScale }}
        className="tg:absolute tg:inset-0 tg:will-change-transform"
      >
        <motion.img
          src={HERO.image}
          alt={HERO.imageAlt}
          className="tg:h-full tg:w-full tg:object-cover tg:object-center tg:opacity-60"
          initial={{ scale: 1.3, filter: 'blur(8px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, delay: 1.2, ease }}
        />
        <div className="tg:absolute tg:inset-0 tg:bg-gradient-to-t tg:from-[#0a0a0a] tg:via-[#0a0a0a]/30 tg:to-[#0a0a0a]/60" />
      </motion.div>

      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.7, ease }}
        className="tg:absolute tg:left-1/2 tg:top-24 tg:z-10 tg:-translate-x-1/2 tg:md:top-28"
      >
        <div className="tg:flex tg:items-center tg:gap-2 tg:rounded-full tg:border tg:border-white/15 tg:bg-white/5 tg:px-4 tg:py-2 tg:backdrop-blur-sm">
          <span className="pulse-dot tg:h-2 tg:w-2 tg:rounded-full tg:bg-[#d7fe45]" />
          <span className="tg:text-xs tg:font-medium tg:text-[#f2f0eb]/80">
            {HERO.badge}
          </span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        style={{ y: textY, opacity }}
        className="tg:relative tg:z-10 tg:mx-auto tg:w-full tg:max-w-7xl tg:px-5 tg:pb-28 tg:md:px-10 tg:md:pb-32"
      >
        <h1 className="tg:font-display tg:leading-[1.05]">
          {HERO.title.map((line, i) => (
            <span key={i} className="tg:block tg:overflow-hidden">
              <motion.span
                className={`tg:block tg:text-[11vw] tg:md:text-[6.5rem] tg:lg:text-[7.5rem] ${
                  line.accent
                    ? 'tg:text-[#d7fe45]'
                    : line.stroke
                      ? 'text-stroke'
                      : 'tg:text-[#f2f0eb]'
                }`}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, delay: 1.35 + i * 0.15, ease }}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="tg:mt-8 tg:flex tg:flex-col tg:items-start tg:gap-6 tg:md:flex-row tg:md:items-end tg:md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.8, ease }}
            className="tg:max-w-md tg:text-base tg:leading-loose tg:text-[#f2f0eb]/70 tg:md:text-lg"
          >
            {HERO.lead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.05, duration: 0.8, ease }}
            className="tg:flex tg:items-center tg:gap-4"
          >
            <Magnetic>
              <a
                href="#start"
                className="group tg:relative tg:inline-flex tg:items-center tg:gap-3 tg:overflow-hidden tg:rounded-full tg:bg-[#d7fe45] tg:px-8 tg:py-4 tg:font-bold tg:text-[#0a0a0a]"
              >
                <span className="tg:absolute tg:inset-0 tg:-translate-x-full tg:bg-[#f2f0eb] tg:transition-transform tg:duration-500 tg:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:tg:translate-x-0" />
                <span className="tg:relative">{HERO.ctaPrimary}</span>
                <span className="tg:relative tg:transition-transform tg:duration-300 group-hover:tg:-translate-x-1.5">
                  →
                </span>
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#treatment"
                className="tg:inline-flex tg:h-14 tg:w-14 tg:items-center tg:justify-center tg:rounded-full tg:border tg:border-white/25 tg:text-[#f2f0eb] tg:transition-colors tg:duration-300 hover:tg:border-[#d7fe45] hover:tg:text-[#d7fe45]"
                aria-label="رفتن به بخش درمان"
              >
                ↓
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3, duration: 1 }}
        className="tg:relative tg:z-10 tg:border-t tg:border-white/10 tg:bg-[#0a0a0a]/70 tg:py-4 tg:backdrop-blur-sm"
      >
        <Marquee duration={26}>
          {HERO.marqueeWords.map((word) => (
            <span
              key={word}
              className="tg:mx-6 tg:flex tg:items-center tg:gap-6 tg:font-display tg:text-xl tg:text-[#f2f0eb]/60"
            >
              {word}
              <span className="tg:text-[#d7fe45]">✦</span>
            </span>
          ))}
        </Marquee>
      </motion.div>
    </section>
  )
}
