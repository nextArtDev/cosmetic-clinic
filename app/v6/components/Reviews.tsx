'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from './Reveal'
import { Star } from './Icons'
import type { Review } from '../lib/data'

export default function Reviews({ items }: { items: Review[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || items.length === 0) return
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [paused, items.length])

  if (items.length === 0) return null
  const active = items[index]

  return (
    <section
      id="reviews"
      className="component relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span
        aria-hidden
        className="blob-shape pointer-events-none absolute right-[-12rem] top-[10%] h-[46rem] w-[46rem] lk:bg-gradient-to-br lk:from-sky-pale lk:via-blush lk:to-transparent opacity-70"
        style={{ animationDuration: '30s' }}
      />

      <div className="container-wondr relative">
        <Reveal y={30} x={0} skew={2}>
          <span className="eyebrow block text-center">نظر بیماران</span>
        </Reveal>
        <Reveal delay={0.1} y={40} x={0} skew={3}>
          <h2 className="mt-[1.6rem] text-center text-[4rem] leading-[5.6rem] md:text-[5.6rem] md:leading-[8rem]">
            محبوبِ بیش از ۴٬۰۰۰ بیمار
          </h2>
        </Reveal>

        <div className="mx-auto mt-[6rem] max-w-[90rem]">
          <div className="relative min-h-[30rem] md:min-h-[26rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active.id}
                initial={{ opacity: 0, y: 30, skewY: 3 }}
                animate={{ opacity: 1, y: 0, skewY: 0 }}
                exit={{ opacity: 0, y: -20, skewY: -3 }}
                transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                className="text-center"
              >
                <div className="star-row justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} filled={i < active.rating} />
                  ))}
                </div>
                <p className="display mx-auto mt-[3.2rem] max-w-[80rem] text-[2.4rem] leading-[4.2rem] lk:text-ink md:text-[3.2rem] md:leading-[5.6rem]">
                  «{active.body}»
                </p>
                <footer className="mt-[3.2rem]">
                  <span className="block text-[1.4rem] font-bold lk:text-pink">
                    {active.author}
                  </span>
                  <span className="body-sm mt-[0.4rem] block lk:text-ink/50">
                    {active.location}
                  </span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-[2rem] flex items-center justify-center gap-[1.2rem]">
            {items.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-label={`نمایش نظر ${i + 1}`}
                onClick={() => setIndex(i)}
                data-cursor="view"
                className="group relative h-[1.2rem] w-[4.8rem] overflow-hidden rounded-full lk:bg-ink/10"
              >
                <motion.span
                  className="absolute inset-0 origin-right rounded-full lk:bg-pink"
                  animate={{ scaleX: i === index ? 1 : 0 }}
                  transition={
                    i === index
                      ? { duration: 6, ease: 'linear' }
                      : { duration: 0.3, ease: 'easeOut' }
                  }
                  key={`${r.id}-${index === i}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
