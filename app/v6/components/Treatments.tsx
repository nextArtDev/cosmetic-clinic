'use client'

import { motion } from 'framer-motion'
import DragScroller from './DragScroller'
import Reveal from './Reveal'
import { ArrowLeft } from './Icons'
import BlobCta from './BlobCta'
import type { Treatment } from '../lib/data'

const DURATIONS = ['5s', '6.5s', '8s', '5s', '4.5s', '7s', '6s', '4s']
const DELAYS = ['0s', '0s', '.1s', '.2s', '.1s', '.7s', '.5s', '.6s']

export default function Treatments({ items }: { items: Treatment[] }) {
  return (
    <section id="treatments" className="component overflow-hidden">
      <div className="container-wondr">
        <Reveal>
          <h2 className="title-xl text-center">خدمات تخصصی</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-[0.8rem] w-[30rem] max-w-full text-center text-[1.4rem] font-bold leading-[2.2rem] lk:text-pink">
            ساده، شفاف و مهم‌تر از همه، ایمن
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-[8rem]" y={40} x={0} skew={2} duration={1}>
        <DragScroller
          padClass="drag-pad"
          className="flex items-start gap-[4rem] py-[3rem] lg:gap-[6rem]"
        >
          {items.map((t, i) => (
            <motion.a
              key={t.id}
              href="#enquire"
              data-cursor="view"
              data-blob-cta-card
              className="cards-item group relative flex w-[24rem] shrink-0 flex-col items-center text-center lg:w-[28rem]"
              style={{
                animation: `v6-floatcard ${DURATIONS[i % DURATIONS.length]} ease ${
                  DELAYS[i % DELAYS.length]
                } infinite`,
              }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.5, ease: [0.15, 0.9, 0.34, 0.95] }}
            >
              {/* gooey magnetic canvas — port of the original blob-cta */}
              <BlobCta />
              {/* ring */}
              <span
                aria-hidden
                className="blob-shape absolute right-1/2 top-0 h-[20rem] w-[20rem] translate-x-1/2 lk:bg-gradient-to-br lk:from-rose/80 lk:via-blush lk:to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:h-[24rem] lg:w-[24rem]"
              />
              <div className="relative flex h-[26rem] w-full items-center justify-center lg:h-[30rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.icon}
                  alt=""
                  className="relative z-[2] h-[12.7rem] w-[12.7rem] object-contain transition-transform duration-700 ease-[cubic-bezier(.15,.9,.34,.95)] group-hover:scale-110 lg:h-[15rem] lg:w-[15rem]"
                />
              </div>
              <p className="relative z-[2] mt-[2rem] text-[2rem] font-bold leading-[3rem] lk:text-pink">
                {t.title}
              </p>
              {t.blurb && (
                <p className="body-sm relative z-[2] mx-auto mt-[1.2rem] max-w-[26rem] lk:text-ink/55">
                  {t.blurb}
                </p>
              )}
              <div className="relative z-[2] mt-[1.6rem] flex items-center gap-[1.6rem] text-[1.2rem] font-bold lk:text-ink/45">
                {t.priceFrom}
                <span className="h-px w-[2rem] lk:bg-ink/20" />
                {t.duration}
              </div>
            </motion.a>
          ))}

          <div className="hidden w-[6rem] shrink-0 lg:block" />
        </DragScroller>
      </Reveal>

      <div className="container-wondr mt-[4rem]">
        <Reveal delay={0.2} y={30} x={0} skew={2}>
          <div className="mx-auto flex w-fit flex-col items-center gap-[1.6rem]">
            <a href="#enquire" className="btn-secondary" data-cursor="cta">
              <span>مشاهده همه</span>
              <ArrowLeft color="#231F20" />
            </a>
            <span className="body-sm lk:text-ink/40">
              برای کاوش بکشید · {items.length} خدمت تخصصی
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
