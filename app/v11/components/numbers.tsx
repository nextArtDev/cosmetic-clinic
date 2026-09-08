/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { BOOK_LINK, NUMBERS } from '../lib/content'
import WordReveal from './word-reveal'
import PlusIcon from './plus-icon'

export default function Numbers() {
  return (
    <section
      className="scmd:relative scmd:w-full"
      style={{ backgroundColor: '#cea17f', marginTop: '-15em' }}
    >
      <div
        className="scmd:relative scmd:flex scmd:w-full scmd:flex-col"
        style={{
          paddingTop: '2em',
          paddingLeft: 'var(--web-padding)',
          paddingRight: 'var(--web-padding)',
          gap: '1.88em',
        }}
      >
        <div className="side-lines">
          <span className="line-vertical scmd:block" />
          <span className="line-vertical scmd:block" />
        </div>

        <div className="numbers-title">
          <WordReveal as="h2" className="h2-style" parts={NUMBERS.title} />
        </div>

        <div className="scmd:relative scmd:z-[3] scmd:flex scmd:w-full scmd:flex-col scmd:items-end">
          <a href={BOOK_LINK} className="btn-white absolute">
            <span>رزرو دمو</span>
            <PlusIcon />
          </a>

          <div className="numbers-grid">
            {NUMBERS.items.map((item, i) => (
              <motion.div
                key={item.heading}
                className={`number-grid-item num-card scmd:overflow-hidden ${
                  i === NUMBERS.items.length - 1 ? 'last' : ''
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="hover-veil" aria-hidden />
                <img
                  src={item.icon}
                  alt=""
                  className="grid-icon"
                  style={{ height: '2.69em', width: 'auto' }}
                />
                <div
                  className="scmd:relative scmd:flex scmd:flex-col"
                  style={{ gap: '0.88em' }}
                >
                  <div style={{ maxWidth: '16em' }}>
                    <h3 className="number-grid-item-heading">{item.heading}</h3>
                  </div>
                  <div className="text-18-regular opacity-80" style={{ width: '22em', maxWidth: '100%' }}>
                    {item.description.map((p, pi) => (
                      <span key={pi} className={p.className}>
                        {p.text}{' '}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <img
        src="/v11/img/decor/decor-1.svg"
        alt=""
        className="scmd:absolute"
        style={{ width: '0.88em', height: '0.88em', right: '0.6em', top: '-0.4em' }}
      />
    </section>
  )
}
