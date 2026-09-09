'use client'

import { useRef } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  animate,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useState } from 'react'
import { FadeUp } from './Reveal'
import { INTRO, toFa } from '../lib/content'

/**
 * Intro — faithful port of the grind Intro.tsx (scroll-scrub paragraph
 * + counters). RTL: scrub words are inline-blocks (joining-safe because
 * spaces live between spans), counters render Persian digits.
 */

/* Single word that lights up based on scroll progress */
function ScrubWord({
  word,
  index,
  total,
  progress,
}: {
  word: string
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const start = index / total
  const end = start + 1 / total
  const opacity = useTransform(progress, [start, end], [0.15, 1])
  const color = useTransform(progress, [start, end], ['#4b4b47', '#f2f0eb'])

  return (
    <motion.span style={{ opacity, color }} className="tg:inline-block">
      {word}&nbsp;
    </motion.span>
  )
}

function Counter({
  to,
  suffix,
  label,
}: {
  to: number
  suffix: string
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <div ref={ref} className="group tg:border-r tg:border-white/10 tg:pr-5 tg:md:pr-8">
      <div className="tg:font-display tg:text-5xl tg:text-[#d7fe45] tg:transition-transform tg:duration-500 group-hover:tg:-translate-y-1 tg:md:text-7xl">
        {toFa(value.toLocaleString('en-US'))}
        {suffix}
      </div>
      <div className="tg:mt-2 tg:text-xs tg:text-[#f2f0eb]/50 tg:md:text-sm">
        {label}
      </div>
    </div>
  )
}

export default function Intro() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'start 0.25'],
  })

  const words = INTRO.paragraph.split(' ')

  return (
    <section className="tg:relative tg:bg-[#0a0a0a] tg:py-24 tg:md:py-40">
      <div className="tg:mx-auto tg:max-w-7xl tg:px-5 tg:md:px-10">
        <FadeUp>
          <span className="tg:mb-8 tg:inline-flex tg:items-center tg:gap-3 tg:text-xs tg:font-bold tg:text-[#d7fe45]">
            <span className="tg:h-px tg:w-10 tg:bg-[#d7fe45]" />
            {INTRO.eyebrow}
          </span>
        </FadeUp>

        <p
          ref={ref}
          className="tg:max-w-4xl tg:font-display tg:text-3xl tg:leading-[1.35] tg:md:text-5xl tg:lg:text-6xl"
        >
          {words.map((word, i) => (
            <ScrubWord
              key={i}
              word={word}
              index={i}
              total={words.length}
              progress={scrollYProgress}
            />
          ))}
        </p>

        <div className="tg:mt-20 tg:grid tg:grid-cols-1 tg:gap-10 tg:sm:grid-cols-3 tg:md:mt-28">
          {INTRO.stats.map((stat, i) => (
            <FadeUp key={stat.label} delay={i * 0.12}>
              <Counter to={stat.to} suffix={stat.suffix} label={stat.label} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
