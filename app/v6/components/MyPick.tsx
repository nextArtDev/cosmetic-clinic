'use client'

import { motion } from 'framer-motion'
import DragScroller from './DragScroller'
import Reveal from './Reveal'
import BlobCta from './BlobCta'
import type { Product } from '../lib/data'

export default function MyPick({ items }: { items: Product[] }) {
  return (
    <section id="my-pick" className="component overflow-hidden lk:bg-blush">
      <div className="container-wondr">
        <Reveal>
          <h2 className="title-xl text-center">متخصص‌های ما</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-[0.8rem] w-[34rem] max-w-full text-center text-[1.4rem] font-bold leading-[2.2rem] lk:text-pink">
            برگزیده‌ی کلینیک — مغز و اعصاب و روان در یک خانه
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-[8rem]" y={40} x={0} skew={2} duration={1}>
        <DragScroller
          padClass="drag-pad pb-[4rem]"
          className="flex items-start gap-[3.2rem] py-[3rem] lg:gap-[4rem]"
        >
          {items.map((p, i) => (
            <motion.a
              key={p.id}
              href="#enquire"
              data-cursor="view"
              data-blob-cta-card
              className="cards-item group relative w-[26rem] shrink-0 lg:w-[32rem]"
              whileHover={{ y: -12 }}
              transition={{ duration: 0.6, ease: [0.15, 0.9, 0.34, 0.95] }}
            >
              {/* gooey magnetic canvas — port of the original blob-cta */}
              <BlobCta />
              <span
                aria-hidden
                className="blob-shape absolute right-1/2 top-0 h-[24rem] w-[24rem] translate-x-1/2 lk:bg-gradient-to-br lk:from-rose lk:via-cream/40 lk:to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100 lg:h-[30rem] lg:w-[30rem]"
                style={{ animationDuration: `${22 + i * 3}s` }}
              />
              <div className="relative flex h-[24rem] items-center justify-center lg:h-[30rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="relative z-[2] max-h-[80%] w-auto max-w-[70%] object-contain transition-transform duration-700 ease-[cubic-bezier(.15,.9,.34,.95)] group-hover:scale-105"
                />
              </div>

              <div className="relative z-[2] mt-[2.4rem] min-h-[16rem]">
                <span className="num text-[1.1rem] font-bold lk:text-grey">
                  {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
                <h4 className="mt-[1rem] text-[1.8rem] leading-[3rem] lk:text-pink">
                  {p.title}
                </h4>
                <p className="body-sm mt-[1.2rem] lk:text-ink/60">{p.description}</p>
              </div>
            </motion.a>
          ))}
          <div className="hidden w-[6rem] shrink-0 lg:block" />
        </DragScroller>
      </Reveal>
    </section>
  )
}
