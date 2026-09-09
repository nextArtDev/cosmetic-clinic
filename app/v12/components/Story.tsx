'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FadeUp, LineReveal } from './Reveal'
import { STORY } from '../lib/content'

/**
 * Story — faithful port of the grind Story.tsx (the light "paper"
 * section). RTL: eyebrow rule sits right; the expandable story body
 * keeps the original height-collapse choreography.
 */
export default function Story() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="tg:relative tg:bg-[#f2f0eb] tg:py-24 tg:text-[#0a0a0a] tg:md:py-36">
      <div className="tg:mx-auto tg:grid tg:max-w-7xl tg:grid-cols-1 tg:gap-12 tg:px-5 tg:md:px-10 tg:lg:grid-cols-2 tg:lg:gap-20">
        {/* Portrait */}
        <FadeUp className="group tg:relative">
          <div className="tg:relative tg:overflow-hidden tg:rounded-2xl">
            <motion.img
              src={STORY.image}
              alt={STORY.imageAlt}
              className="tg:aspect-[4/5] tg:w-full tg:object-cover tg:transition-transform tg:duration-700 tg:ease-out group-hover:tg:scale-105"
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            />
            <div className="tg:absolute tg:bottom-5 tg:right-5 tg:rounded-full tg:bg-[#0a0a0a] tg:px-5 tg:py-2.5 tg:text-xs tg:font-bold tg:text-[#d7fe45]">
              {STORY.badge}
            </div>
          </div>
        </FadeUp>

        {/* Copy */}
        <div className="tg:flex tg:flex-col tg:justify-center">
          <FadeUp>
            <span className="tg:mb-6 tg:inline-flex tg:items-center tg:gap-3 tg:text-xs tg:font-bold tg:text-[#0a0a0a]/60">
              <span className="tg:h-px tg:w-10 tg:bg-[#0a0a0a]" />
              {STORY.eyebrow}
            </span>
          </FadeUp>

          <h2 className="tg:font-display tg:text-5xl tg:leading-[1.1] tg:md:text-7xl">
            <LineReveal>{STORY.title[0].text}</LineReveal>
            <LineReveal delay={0.1}>
              <span className="tg:bg-[#0a0a0a] tg:px-3 tg:text-[#d7fe45]">
                {STORY.title[1].text}
              </span>
            </LineReveal>
          </h2>

          <FadeUp delay={0.2}>
            <p className="tg:mt-8 tg:max-w-lg tg:text-base tg:leading-loose tg:text-[#0a0a0a]/70 tg:md:text-lg">
              {STORY.intro}
            </p>
          </FadeUp>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="full"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="tg:overflow-hidden"
              >
                <div className="tg:max-w-lg tg:space-y-4 tg:pt-4 tg:text-base tg:leading-loose tg:text-[#0a0a0a]/70 tg:md:text-lg">
                  {STORY.full.map((p, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <FadeUp delay={0.3}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="group tg:mt-8 tg:inline-flex tg:w-fit tg:items-center tg:gap-3 tg:rounded-full tg:bg-[#0a0a0a] tg:px-8 tg:py-4 tg:font-bold tg:text-[#f2f0eb] tg:transition-colors tg:duration-300 hover:tg:bg-[#d7fe45] hover:tg:text-[#0a0a0a]"
            >
              {expanded ? STORY.readLess : STORY.readMore}
              <motion.span
                animate={{ rotate: expanded ? 45 : 0 }}
                transition={{ duration: 0.3 }}
                className="tg:text-lg tg:leading-none"
              >
                +
              </motion.span>
            </button>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
