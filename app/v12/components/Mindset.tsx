'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FadeUp, LineReveal, WordReveal } from './Reveal'
import Marquee from './Marquee'
import { MINDSET } from '../lib/content'

/**
 * Mindset — faithful port of the grind Mindset.tsx. RTL: the reverse
 * marquee reads correctly mirrored; the CTA arrow points left.
 */
export default function Mindset() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%'])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 0.55, 0.85])

  return (
    <section id="mindset" ref={ref} className="tg:relative tg:overflow-hidden tg:bg-[#0a0a0a]">
      {/* Marquee divider */}
      <div className="tg:border-y tg:border-white/10 tg:py-5">
        <Marquee duration={22} reverse>
          {MINDSET.marqueeWords.map((w) => (
            <span
              key={w}
              className="text-stroke tg:mx-8 tg:flex tg:items-center tg:gap-8 tg:font-display tg:text-2xl tg:md:text-4xl"
            >
              {w}
              <span className="tg:text-[#d7fe45]" style={{ WebkitTextStroke: 0 }}>
                ✦
              </span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="tg:relative tg:flex tg:min-h-[85svh] tg:items-center tg:justify-center tg:overflow-hidden">
        <motion.img
          src={MINDSET.image}
          alt={MINDSET.imageAlt}
          style={{ y: imgY }}
          className="tg:absolute tg:inset-0 tg:h-[130%] tg:w-full tg:object-cover"
        />
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="tg:absolute tg:inset-0 tg:bg-[#0a0a0a]"
        />

        <div className="tg:relative tg:z-10 tg:mx-auto tg:max-w-5xl tg:px-5 tg:py-28 tg:text-center tg:md:px-10">
          <FadeUp>
            <span className="tg:mb-8 tg:inline-block tg:rounded-full tg:border tg:border-[#d7fe45]/40 tg:px-5 tg:py-2 tg:text-xs tg:font-bold tg:text-[#d7fe45]">
              {MINDSET.eyebrow}
            </span>
          </FadeUp>

          <h2 className="tg:font-display tg:text-4xl tg:leading-[1.2] tg:md:text-7xl">
            <LineReveal>{MINDSET.title[0].text}</LineReveal>
            <LineReveal delay={0.1}>
              <span className="tg:text-[#d7fe45]">{MINDSET.title[1].text}</span>
            </LineReveal>
          </h2>

          <p className="tg:mx-auto tg:mt-8 tg:max-w-2xl tg:text-base tg:leading-loose tg:text-[#f2f0eb]/70 tg:md:text-lg">
            <WordReveal stagger={0.015} text={MINDSET.body} />
          </p>

          <FadeUp delay={0.35}>
            <a
              href="#start"
              className="group tg:mt-10 tg:inline-flex tg:items-center tg:gap-3 tg:rounded-full tg:border tg:border-[#f2f0eb]/30 tg:px-8 tg:py-4 tg:font-bold tg:text-[#f2f0eb] tg:transition-all tg:duration-300 hover:tg:border-[#d7fe45] hover:tg:bg-[#d7fe45] hover:tg:text-[#0a0a0a]"
            >
              {MINDSET.cta}
              <span className="tg:transition-transform tg:duration-300 group-hover:tg:-translate-x-1.5">
                →
              </span>
            </a>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
