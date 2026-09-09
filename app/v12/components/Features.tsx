'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FadeUp, LineReveal } from './Reveal'
import { FEATURES, FEATURES_HEADLINE } from '../lib/content'

/**
 * Features — faithful port of the grind Features.tsx. RTL: the reversed
 * row flips via lg:[&>*:first-child]:order-2 exactly as the original
 * (grid order is direction-agnostic); image tag badge sits bottom-right.
 */

function FeatureRow({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  const reversed = index % 2 === 1

  return (
    <div
      id={feature.id}
      ref={ref}
      className={`tg:grid tg:scroll-mt-28 tg:grid-cols-1 tg:items-center tg:gap-10 tg:lg:grid-cols-2 tg:lg:gap-20 ${
        reversed ? 'tg:lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Image with parallax + hover zoom */}
      <FadeUp className="group tg:relative tg:overflow-hidden tg:rounded-2xl">
        <div className="tg:relative tg:aspect-[4/5] tg:overflow-hidden tg:rounded-2xl tg:sm:aspect-[4/3] tg:lg:aspect-[4/5]">
          <motion.img
            src={feature.img}
            alt={feature.alt}
            style={{ y: imgY }}
            className="tg:absolute tg:inset-0 tg:h-[120%] tg:w-full tg:scale-105 tg:object-cover tg:transition-transform tg:duration-700 tg:ease-out group-hover:tg:scale-110"
          />
          <div className="tg:absolute tg:inset-0 tg:bg-gradient-to-t tg:from-[#0a0a0a]/60 tg:to-transparent tg:opacity-60 tg:transition-opacity tg:duration-500 group-hover:tg:opacity-30" />
          <div className="tg:absolute tg:bottom-4 tg:right-4 tg:rounded-full tg:bg-[#0a0a0a]/70 tg:px-4 tg:py-2 tg:text-xs tg:font-bold tg:text-[#d7fe45] tg:backdrop-blur-sm">
            {feature.tag}
          </div>
        </div>
      </FadeUp>

      {/* Copy */}
      <div>
        <h3 className="tg:font-display tg:text-4xl tg:leading-[1.15] tg:md:text-6xl">
          {feature.title.map((line, i) => (
            <LineReveal key={i} delay={i * 0.1}>
              {i === feature.title.length - 1 ? (
                <span className="tg:text-[#d7fe45]">{line}</span>
              ) : (
                line
              )}
            </LineReveal>
          ))}
        </h3>
        <FadeUp delay={0.2}>
          <p className="tg:mt-6 tg:max-w-md tg:text-base tg:leading-loose tg:text-[#f2f0eb]/65 tg:md:text-lg">
            {feature.body}
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <ul className="tg:mt-8 tg:flex tg:flex-wrap tg:gap-3">
            {feature.points.map((p) => (
              <li
                key={p}
                className="tg:cursor-default tg:rounded-full tg:border tg:border-white/15 tg:px-4 tg:py-2 tg:text-xs tg:font-medium tg:text-[#f2f0eb]/70 tg:transition-all tg:duration-300 hover:tg:border-[#d7fe45] hover:tg:bg-[#d7fe45] hover:tg:text-[#0a0a0a]"
              >
                {p}
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section className="tg:relative tg:bg-[#0a0a0a] tg:py-24 tg:md:py-36">
      <div className="tg:mx-auto tg:max-w-7xl tg:px-5 tg:md:px-10">
        <div className="tg:mb-20 tg:md:mb-32">
          <FadeUp>
            <span className="tg:mb-6 tg:inline-flex tg:items-center tg:gap-3 tg:text-xs tg:font-bold tg:text-[#d7fe45]">
              <span className="tg:h-px tg:w-10 tg:bg-[#d7fe45]" />
              {FEATURES_HEADLINE.eyebrow}
            </span>
          </FadeUp>
          <h2 className="tg:font-display tg:text-5xl tg:leading-[1.1] tg:md:text-8xl">
            {FEATURES_HEADLINE.lines.map((line, i) => (
              <LineReveal key={i} delay={i * 0.1}>
                {line.stroke ? <span className="text-stroke">{line.text}</span> : line.text}
              </LineReveal>
            ))}
          </h2>
        </div>

        <div className="tg:space-y-28 tg:md:space-y-44">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.id} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
