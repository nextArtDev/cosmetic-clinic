/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { REVIEWS } from '../lib/content'
import WordReveal from './word-reveal'

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="scmd:relative scmd:w-full"
      style={{
        backgroundColor: '#c4957a',
        backgroundImage: 'url(/v11/img/reviews-bg.avif)',
        backgroundPosition: '100% 0',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="side-lines">
        <span className="line-vertical scmd:block" />
        <span className="line-vertical scmd:block" />
      </div>

      <div className="scmd:relative scmd:w-full">
        <div className="reviews-title">
          <WordReveal
            as="h2"
            className="h2-style"
            parts={[
              { text: 'مراجعانِ ما' },
              { text: '<br/>' },
              { text: 'چه می‌گویند', className: 'h2-awesome' },
            ]}
          />
        </div>

        <div className="reviews-grid no-scrollbar">
          {REVIEWS.items.map((r, i) => (
            <motion.article
              key={r.name}
              className={`review-item rev-card scmd:relative scmd:flex scmd:flex-col scmd:justify-between ${
                i === REVIEWS.items.length - 1 ? 'last' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="hover-veil" aria-hidden />
              <div
                className="scmd:relative scmd:flex scmd:items-start scmd:justify-between scmd:p-[1em]"
              >
                <img
                  src={r.photo}
                  alt={r.name}
                  className="review-photo"
                  style={{ borderRadius: '0.2em' }}
                />
                <div
                  className="scmd:flex scmd:flex-col scmd:items-end"
                  style={{ gap: '0.63em', paddingTop: '1em', paddingLeft: '0.2em', textAlign: 'left' }}
                >
                  <div className="text-18-regular white">{r.name}</div>
                  <div className="text-14-regular" style={{ opacity: 0.8, color: '#fff' }}>
                    {r.role}
                  </div>
                </div>
              </div>
              <div className="review-text text-16-regular scmd:relative" style={{ color: '#fff' }}>
                {r.text}
              </div>
            </motion.article>
          ))}
        </div>

        <img
          src="/v11/img/decor/decor-3.svg"
          alt=""
          className="scmd:absolute"
          style={{ width: '0.88em', height: '0.88em', left: '0.6em', top: '-0.45em' }}
        />
        <img
          src="/v11/img/decor/decor-1.svg"
          alt=""
          className="scmd:absolute"
          style={{ width: '0.88em', height: '0.88em', right: '0.6em', top: '-0.5em' }}
        />
      </div>
    </section>
  )
}
