'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FadeUp, LineReveal } from './Reveal'
import { FAQS, FAQ_HEADLINE, toFa } from '../lib/content'

/**
 * FAQ — faithful port of the grind Faq.tsx. RTL: the index number sits
 * at the inline start (right) and the + toggle at the inline end.
 */

function FaqItem({
  item,
  index,
  open,
  onToggle,
}: {
  item: { q: string; a: string }
  index: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <FadeUp delay={index * 0.06}>
      <div
        className={`group tg:border-b tg:border-white/10 tg:transition-colors tg:duration-300 ${
          open ? 'tg:bg-white/[0.03]' : 'hover:tg:bg-white/[0.02]'
        }`}
      >
        <button
          onClick={onToggle}
          className="tg:flex tg:w-full tg:items-center tg:justify-between tg:gap-6 tg:px-2 tg:py-6 tg:text-right tg:md:px-6 tg:md:py-8"
          aria-expanded={open}
        >
          <span className="tg:flex tg:items-baseline tg:gap-4 tg:md:gap-8">
            <span className="tg:font-display tg:text-sm tg:text-[#d7fe45] tg:md:text-base">
              {toFa(String(index + 1).padStart(2, '0'))}
            </span>
            <span
              className={`tg:font-display tg:text-xl tg:leading-[1.4] tg:transition-colors tg:duration-300 tg:md:text-3xl ${
                open
                  ? 'tg:text-[#d7fe45]'
                  : 'tg:text-[#f2f0eb] group-hover:tg:text-[#d7fe45]'
              }`}
            >
              {item.q}
            </span>
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="tg:flex tg:h-10 tg:w-10 tg:shrink-0 tg:items-center tg:justify-center tg:rounded-full tg:border tg:border-white/20 tg:text-xl tg:text-[#f2f0eb] tg:transition-colors tg:duration-300 group-hover:tg:border-[#d7fe45] group-hover:tg:text-[#d7fe45]"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="tg:overflow-hidden"
            >
              <p className="tg:max-w-3xl tg:px-2 tg:pb-8 tg:pr-10 tg:text-sm tg:leading-loose tg:text-[#f2f0eb]/60 tg:md:px-6 tg:md:pr-[4.5rem] tg:md:text-base">
                {item.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeUp>
  )
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="tg:relative tg:scroll-mt-20 tg:bg-[#0a0a0a] tg:py-24 tg:md:py-36">
      <div className="tg:mx-auto tg:max-w-7xl tg:px-5 tg:md:px-10">
        <div className="tg:mb-14 tg:md:mb-20">
          <FadeUp>
            <span className="tg:mb-6 tg:inline-flex tg:items-center tg:gap-3 tg:text-xs tg:font-bold tg:text-[#d7fe45]">
              <span className="tg:h-px tg:w-10 tg:bg-[#d7fe45]" />
              {FAQ_HEADLINE.eyebrow}
            </span>
          </FadeUp>
          <h2 className="tg:font-display tg:text-5xl tg:leading-[1.1] tg:md:text-8xl">
            {FAQ_HEADLINE.lines.map((line, i) => (
              <LineReveal key={i} delay={i * 0.1}>
                {line.stroke ? (
                  <span className="text-stroke">{line.text}</span>
                ) : line.accent ? (
                  <span className="tg:text-[#d7fe45]">{line.text}</span>
                ) : (
                  line.text
                )}
              </LineReveal>
            ))}
          </h2>
        </div>

        <div className="tg:border-t tg:border-white/10">
          {FAQS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              index={i}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
