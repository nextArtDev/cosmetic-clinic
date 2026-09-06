'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'
import Button from '../ui/Button'
import { faq } from '../../lib/site'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="nc:relative nc:bg-paper nc:py-24 nc:sm:py-32">
      <div className="nc:mx-auto nc:max-w-7xl nc:px-5 nc:sm:px-8">
        <div className="nc:grid nc:gap-12 nc:lg:grid-cols-12">
          <div className="nc:lg:col-span-5">
            <SectionHeading
              eyebrow="Après l'intervention"
              title={"Tout ce qu'il faut savoir\naprès votre *greffe*"}
              description="Les questions que l'on nous pose le plus souvent dans les jours qui suivent. Le reste, vous pouvez nous le demander sur la ligne WhatsApp dédiée."
            />
            <Reveal delay={3} className="nc:mt-8 nc:flex nc:flex-wrap nc:gap-3">
              <Button href="/v5/diagnostic">Poser ma question</Button>
              <Button href="/v5/#contact" variant="outline">
                Recevoir le guide
              </Button>
            </Reveal>
          </div>

          <div className="nc:lg:col-span-7">
            <ul className="nc:divide-y nc:divide-ink/10 nc:border-y nc:border-ink/10">
              {faq.map((item, i) => {
                const isOpen = open === i
                return (
                  <motion.li
                    key={item.q}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                    transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      className="nc:group nc:flex nc:w-full nc:items-start nc:justify-between nc:gap-6 nc:py-6 nc:text-left"
                    >
                      <span className="nc:flex nc:items-start nc:gap-4">
                        <span className="nc:mt-1.5 nc:text-[11px] nc:font-bold nc:tracking-[0.2em] nc:text-sage">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`nc:text-[1.05rem] nc:font-semibold nc:leading-snug nc:tracking-[-0.01em] nc:transition-colors nc:sm:text-[1.15rem] ${
                            isOpen
                              ? 'nc:text-ink'
                              : 'nc:text-ink/80 nc:group-hover:text-ink'
                          }`}
                        >
                          {item.q}
                        </span>
                      </span>
                      <span
                        className={`nc:grid nc:size-9 nc:shrink-0 nc:place-items-center nc:rounded-full nc:border nc:transition-all nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] ${
                          isOpen
                            ? 'nc:rotate-45 nc:border-ink nc:bg-ink nc:text-white'
                            : 'nc:border-ink/15 nc:text-ink nc:group-hover:border-ink'
                        }`}
                      >
                        <Plus className="nc:size-4" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-${i}`}
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="nc:overflow-hidden"
                        >
                          <p className="nc:pb-7 nc:pl-9 nc:pr-4 nc:text-[15px] nc:leading-relaxed nc:text-graphite nc:sm:pl-10">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
