/* eslint-disable @next/next/no-img-element */
'use client'

import { useLayoutEffect, useRef } from 'react'
import { STEPS } from '../lib/content'
import { gsap } from '../lib/gsap'
import WordReveal from './word-reveal'

export default function Steps() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.step-item')
      const n = items.length
      const slot = 1 / n

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.steps-animation-main-wrap',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })

      gsap.set(items, {
        xPercent: -50,
        yPercent: -50,
        y: 90,
        opacity: 0,
        color: '#d2a285',
      })

      items.forEach((item, i) => {
        const at = i * slot
        tl.to(item, { y: 0, opacity: 1, duration: slot * 0.45 }, at)
          .to(item, { color: '#db2993', duration: slot * 0.45 }, at)
          .to(
            item,
            { y: -90, opacity: 0, duration: slot * 0.4 },
            at + slot * 0.6,
          )
      })

      tl.fromTo(
        '.step-gradient',
        { yPercent: 0 },
        { yPercent: -68, duration: 1, ease: 'none' },
        0,
      )
        .fromTo(
          '.fire-icon',
          { y: 0 },
          {
            y: () => {
              const wrap = el.querySelector<HTMLElement>(
                '.step-progress-bar-wrap',
              )
              const icon = el.querySelector<HTMLElement>('.fire-icon')
              if (!wrap || !icon) return 0
              return Math.max(wrap.offsetHeight - icon.offsetHeight, 0)
            },
            duration: 1,
            ease: 'none',
          },
          0,
        )
        .to({}, { duration: 0.001 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="how-it-works"
      className="scmd:relative scmd:w-full"
      style={{
        borderBottom: '0.5px solid rgba(205,160,127,0.5)',
        paddingBottom: '5em',
      }}
      ref={root}
    >
      <div className="side-lines">
        <span className="line-vertical beige scmd:block" />
        <span className="line-vertical beige scmd:block" />
      </div>

      <div className="container scmd:relative">
        <div className="scmd:relative scmd:w-full" style={{ paddingTop: '8em' }}>
          <div className="brand-title">
            <WordReveal
              as="h2"
              className="h2-style black"
              parts={STEPS.title}
            />
          </div>

          <div className="steps-title-wrap">
            <WordReveal
              className="steps-description text-14-regular"
              parts={STEPS.description}
              stagger={0.01}
            />
          </div>

          <div
            className="steps-animation-main-wrap scmd:relative"
            style={{ height: '300vh' }}
          >
            <div className="scmd:sticky scmd:top-0 scmd:flex scmd:h-[100svh] scmd:w-full scmd:items-center scmd:justify-center">
              {/* live DOM: texts layer absolute, bar flows centered over it */}
              <div className="steps-texts-wrap">
                {STEPS.items.map((s) => (
                  <div
                    key={s}
                    className="step-item scmd:pointer-events-none scmd:absolute scmd:left-1/2 scmd:top-1/2 scmd:w-full scmd:px-[0.5em] scmd:text-center text-146-regular"
                  >
                    {s}
                  </div>
                ))}
              </div>

              <div className="step-progress-bar-wrap">
                <div className="step-progress-bar">
                  <div className="step-gradient" />
                </div>
                <img src="/v11/img/icons/fire.svg" alt="" className="fire-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
