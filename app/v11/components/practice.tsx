/* eslint-disable @next/next/no-img-element */
'use client'

import { useLayoutEffect, useRef } from 'react'
import { PRACTICE } from '../lib/content'
import { gsap } from '../lib/gsap'
import WordReveal from './word-reveal'

export default function Practice() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.practice-image',
        { yPercent: -6, scale: 1.14 },
        {
          yPercent: 6,
          scale: 1.14,
          ease: 'none',
          scrollTrigger: {
            trigger: '.practice-img-wrap',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
      gsap.fromTo(
        '.practice-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.practice-img-wrap',
            start: 'top 90%',
            end: 'bottom 60%',
            scrub: true,
          },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="practice" className="scmd:relative scmd:w-full" ref={root}>
      <div className="side-lines">
        <span className="line-vertical beige scmd:block" />
        <span className="line-vertical beige scmd:block" />
      </div>

      <div className="practice-title-wrap">
        <div className="practice-title">
          <WordReveal as="h2" className="h2-style black" parts={PRACTICE.title} />
        </div>
        <WordReveal
          className="practice-description text-16-regular black"
          parts={PRACTICE.description}
          stagger={0.012}
        />
      </div>

      <div className="practice-img-wrap scmd:relative scmd:overflow-hidden">
        <img
          src={PRACTICE.image}
          alt="مانیتور مدنما در اتاق انتظار مطب"
          className="practice-image scmd:w-full"
          style={{ height: '45em', objectFit: 'cover' }}
        />
        <div className="side-lines">
          <span
            className="practice-line line-vertical scmd:block"
            style={{ transformOrigin: 'top center' }}
          />
          <span
            className="practice-line line-vertical scmd:block"
            style={{ transformOrigin: 'top center' }}
          />
        </div>
      </div>
    </section>
  )
}
