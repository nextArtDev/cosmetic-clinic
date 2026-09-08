'use client'

import { useLayoutEffect, useRef } from 'react'
import { BOOK_LINK, SOLUTIONS } from '../lib/content'
import { gsap } from '../lib/gsap'
import WordReveal from './word-reveal'
import PlusIcon from './plus-icon'

export default function Solutions() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.solution-card')
      const n = cards.length
      const slot = 0.16

      gsap.set(cards, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        transformPerspective: 1400,
        transformStyle: 'preserve-3d',
        rotate: (i: number) => (i % 2 === 0 ? -1 : 1) * Math.min(i * 0.8, 3.2),
        y: (i: number) => i * 4,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.solutions-wrap',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      cards.forEach((card, i) => {
        const at = i * slot
        tl.to(
          card,
          {
            rotateY: 180,
            duration: slot * 0.45,
            ease: 'power2.inOut',
          },
          at,
        )

        // the last card stays on screen
        if (i === n - 1) return

        tl.to(
          card,
          {
            x: () => window.innerWidth * (i % 2 === 0 ? 0.75 : -0.75),
            rotate: i % 2 === 0 ? 8 : -8,
            duration: slot * 0.32,
            ease: 'power2.in',
          },
          at + slot * 0.5,
        ).to(
          card,
          { opacity: 0, duration: slot * 0.18 },
          at + slot * 0.68,
        )
      })

      // keep the timeline length consistent
      tl.to({}, { duration: 0.02 })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="solutions" className="scmd:relative scmd:w-full" ref={root}>
      <div className="container scmd:relative">
        <div
          className="solutions-wrap scmd:relative scmd:w-full"
          style={{ height: '720vh', paddingTop: '10em', paddingBottom: '10em' }}
        >
          <div className="side-lines">
            <span className="line-vertical beige scmd:block" />
            <span className="line-vertical beige scmd:block" />
          </div>
          <div className="bg-lines">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="line-vertical beige scmd:block" />
            ))}
          </div>

          <div
            className="scmd:relative scmd:z-[4] scmd:flex scmd:flex-col scmd:items-center scmd:py-[4em]"
            style={{ gap: '2.5em' }}
          >
            <div className="scmd:flex scmd:flex-col scmd:items-center" style={{ gap: '0.63em' }}>
              <WordReveal
                as="h2"
                className="h2-style black"
                parts={SOLUTIONS.title}
              />
              <WordReveal
                className="solutions-description text-14-regular center"
                parts={SOLUTIONS.description}
                stagger={0.014}
              />
            </div>
            <a href={BOOK_LINK} className="btn-black">
              <span>رزرو دمو</span>
              <PlusIcon />
            </a>
          </div>

          <div
            className="scmd:sticky scmd:top-0 scmd:z-[4] scmd:flex scmd:h-[100svh] scmd:w-full scmd:items-center scmd:justify-center scmd:overflow-hidden"
            style={{ perspective: '1400px' }}
          >
            {SOLUTIONS.cards.map((c, i) => (
              <div
                key={c.problemText}
                className="solution-card"
                style={{ zIndex: 6 - i }}
              >
                <div className="solution-front">
                  <div className="solution-heading-wrap">
                    <div className="text-14-regular">مشکل</div>
                    <div className="solution-heading">
                      <h3 className="h3-style">
                        {c.problem.map((p, pi) => (
                          <span key={pi} className={p.className}>
                            {p.text}{' '}
                          </span>
                        ))}
                      </h3>
                    </div>
                  </div>
                  <div className="text-14-regular">{c.problemText}</div>
                </div>

                <div className="solution-back">
                  <div className="solution-heading-wrap">
                    <div className="text-14-regular white">راه‌حل</div>
                    <div className="solution-heading">
                      <h3 className="h3-style white">
                        {c.solution.map((p, pi) => (
                          <span key={pi} className={p.className}>
                            {p.text}{' '}
                          </span>
                        ))}
                      </h3>
                    </div>
                  </div>
                  <div className="text-14-regular white">{c.solutionText}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
