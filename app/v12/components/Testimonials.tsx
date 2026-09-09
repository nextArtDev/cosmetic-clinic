'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FadeUp, LineReveal } from './Reveal'
import { REVIEWS, REVIEWS_HEADLINE } from '../lib/content'

/**
 * Testimonials — faithful port of the grind Testimonials.tsx. The
 * drag-to-browse track is direction-agnostic (framer-motion drag="x").
 * RTL: the drag hint arrow pair stays ←→; the rating card sits at the
 * inline end of the header row.
 */

function ReviewCard({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <div className="group tg:flex tg:h-full tg:w-[85vw] tg:shrink-0 tg:select-none tg:flex-col tg:justify-between tg:rounded-2xl tg:border tg:border-white/10 tg:bg-[#141414] tg:p-7 tg:transition-colors tg:duration-500 hover:tg:border-[#d7fe45]/50 tg:sm:w-[420px] tg:md:p-9">
      <div>
        <div className="tg:mb-5 tg:flex tg:gap-1 tg:text-[#d7fe45]">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="tg:transition-transform tg:duration-300 group-hover:tg:scale-110"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              ★
            </span>
          ))}
        </div>
        <h3 className="tg:font-display tg:text-2xl tg:leading-[1.3] tg:md:text-3xl">
          {review.title}
        </h3>
        <p className="tg:mt-4 tg:text-sm tg:leading-loose tg:text-[#f2f0eb]/60 tg:md:text-base">
          {review.body}
        </p>
      </div>
      <div className="tg:mt-8 tg:flex tg:items-center tg:justify-between tg:border-t tg:border-white/10 tg:pt-5">
        <div className="tg:flex tg:items-center tg:gap-3">
          <div className="tg:flex tg:h-10 tg:w-10 tg:items-center tg:justify-center tg:rounded-full tg:bg-[#d7fe45] tg:font-display tg:text-[#0a0a0a]">
            {review.name[0]}
          </div>
          <span className="tg:font-medium">{review.name}</span>
        </div>
        <span className="tg:rounded-full tg:bg-white/5 tg:px-3 tg:py-1 tg:text-xs tg:text-[#d7fe45]">
          {review.result}
        </span>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <section id="reviews" className="tg:relative tg:overflow-hidden tg:bg-[#0a0a0a] tg:py-24 tg:md:py-36">
      <div className="tg:mx-auto tg:max-w-7xl tg:px-5 tg:md:px-10">
        <div className="tg:flex tg:flex-col tg:justify-between tg:gap-8 tg:md:flex-row tg:md:items-end">
          <div>
            <FadeUp>
              <span className="tg:mb-6 tg:inline-flex tg:items-center tg:gap-3 tg:text-xs tg:font-bold tg:text-[#d7fe45]">
                <span className="tg:h-px tg:w-10 tg:bg-[#d7fe45]" />
                {REVIEWS_HEADLINE.eyebrow}
              </span>
            </FadeUp>
            <h2 className="tg:font-display tg:text-5xl tg:leading-[1.1] tg:md:text-8xl">
              <LineReveal>{REVIEWS_HEADLINE.lines[0].text}</LineReveal>
              <LineReveal delay={0.1}>
                <span className="tg:text-[#d7fe45]">{REVIEWS_HEADLINE.lines[1].text}</span>
              </LineReveal>
              <LineReveal delay={0.2}>
                <span className="text-stroke">{REVIEWS_HEADLINE.lines[2].text}</span>
              </LineReveal>
            </h2>
          </div>
          <FadeUp delay={0.2} className="tg:flex tg:items-center tg:gap-4">
            <div className="tg:rounded-xl tg:border tg:border-white/10 tg:bg-[#141414] tg:px-5 tg:py-4">
              <div className="tg:flex tg:items-center tg:gap-2">
                <span className="tg:text-[#d7fe45]">★★★★★</span>
                <span className="tg:font-display tg:text-2xl">{REVIEWS_HEADLINE.rating}</span>
              </div>
              <p className="tg:mt-1 tg:text-xs tg:text-[#f2f0eb]/50">
                {REVIEWS_HEADLINE.ratingLabel}
              </p>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Draggable carousel */}
      <div ref={constraintsRef} className="tg:mt-14 tg:overflow-hidden tg:md:mt-20">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.08}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          className={`tg:flex tg:gap-5 tg:px-5 tg:md:gap-7 tg:md:px-10 ${
            dragging ? 'tg:cursor-grabbing' : 'tg:cursor-grab'
          }`}
          whileTap={{ scale: 0.995 }}
        >
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} review={r} />
          ))}
        </motion.div>
      </div>

      <FadeUp delay={0.15} className="tg:mt-8 tg:px-5 tg:md:px-10">
        <p className="tg:flex tg:items-center tg:gap-3 tg:text-xs tg:text-[#f2f0eb]/40">
          <span className="tg:inline-block tg:animate-pulse tg:text-[#d7fe45]">←→</span>
          {REVIEWS_HEADLINE.dragHint}
        </p>
      </FadeUp>
    </section>
  )
}
