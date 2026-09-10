'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ERAS } from '../_lib/data'
import { faDigits } from '../_lib/format'
import { WordsReveal, FadeUp, DrawnLine } from './Reveal'

/**
 * House chronicle — sticky chapter title beside a scrolling timeline.
 * The giant year markers drift at their own parallax pace.
 */
export default function Heritage() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const yearsY = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section id="heritage" ref={ref} className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="grid grid-cols-1 gap-14 md:grid-cols-[0.42fr_0.58fr] md:gap-10">
        {/* sticky title */}
        <div className="md:sticky md:top-28 md:h-fit">
          <FadeUp>
            <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.2em] opacity-70">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
              خانه‌ی راگا
              <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-60">
                Since 1304 SH
              </span>
            </p>
          </FadeUp>
          <WordsReveal
            as="h2"
            text="صد سال، یک دوخت"
            className="text-4xl font-extralight leading-[1.5] md:text-6xl md:leading-[1.4]"
          />
          <FadeUp delay={0.15}>
            <p className="v15-ink2 mt-6 max-w-sm text-sm font-light leading-8">
              چهار نسل، یک نیمکتِ چرم‌دوزی. روایتِ خانه‌ای که هنوز با همان نخِ
              موم‌زده‌ی روزِ اول می‌دُورد.{' '}
              <span className="opacity-60">(داده‌ی نمایشی — Mock)</span>
            </p>
          </FadeUp>
        </div>

        {/* timeline */}
        <motion.div style={{ y: yearsY }} className="flex flex-col">
          {ERAS.map((era, i) => (
            <div key={era.year} className="relative pb-14 md:pb-20">
              <DrawnLine className="mb-8" />
              <FadeUp>
                <div className="flex items-start gap-6 md:gap-10">
                  <span
                    className={`select-none text-[17vw] font-thin leading-none md:text-[7.5vw] ${
                      i % 2 ? 'v15-caramel' : 'v15-ink'
                    }`}
                  >
                    {faDigits(era.year)}
                  </span>
                  <div className="pt-3 md:pt-5">
                    <h3 className="text-lg font-light md:text-2xl">{era.title}</h3>
                    <p className="v15-ink2 mt-3 max-w-md text-sm font-light leading-8">
                      {era.body}
                    </p>
                  </div>
                </div>
              </FadeUp>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}