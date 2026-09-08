/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { BRANDS } from '../lib/content'
import { gsap, ScrollTrigger } from '../lib/gsap'
import WordReveal from './word-reveal'

function Row({ reverse = false, speed = 46 }: { reverse?: boolean; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = ref.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const from = reverse ? -50 : 0
    const to = reverse ? 0 : -50
    gsap.set(track, { xPercent: from })
    const tween = gsap.to(track, {
      xPercent: to,
      duration: speed,
      ease: 'none',
      repeat: -1,
    })

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity())
        tween.timeScale(gsap.utils.clamp(0.5, 4, 1 + v / 1400))
      },
    })

    return () => {
      st.kill()
      tween.kill()
    }
  }, [reverse, speed])

  return (
    <div className="scmd:w-full scmd:overflow-hidden">
      <div ref={ref} className="marquee-track">
        {[0, 1].map((dup) => (
          <div
            key={dup}
            className="scmd:flex scmd:shrink-0 scmd:items-center"
            style={{ gap: '3em', paddingLeft: '3em' }}
          >
            {BRANDS.logos.map((logo, i) => (
              <img
                key={`${dup}-${i}`}
                src={logo}
                alt=""
                className="scmd:shrink-0"
                style={{ height: '3.22em', width: 'auto', transition: 'transform 0.5s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Brands() {
  return (
    <section id="brands" className="scmd:relative scmd:w-full scmd:overflow-hidden">
      <div className="container scmd:relative">
        <div className="side-lines">
          <span className="line-vertical beige scmd:block" />
          <span className="line-vertical beige scmd:block" />
        </div>

        <div className="scmd:relative" style={{ paddingBottom: '9em' }}>
          <div className="brand-title brands scmd:flex-col scmd:md:flex-row" style={{ gap: '1.5em' }}>
            <WordReveal
              as="h2"
              className="h2-style black no-indent"
              parts={[
                { text: 'برندهای شما' },
                { text: '<br/>' },
                { text: 'روی مانیتورهای شما', className: 'h2-awesome' },
              ]}
            />
            <WordReveal
              className="brands-description text-14-regular"
              parts={BRANDS.description}
              stagger={0.014}
            />
          </div>

          <div className="scmd:relative scmd:flex scmd:flex-col scmd:overflow-hidden scmd:py-[1em]" style={{ gap: '1.5em' }}>
            <Row speed={52} />
            <Row reverse speed={58} />
          </div>
        </div>
      </div>
    </section>
  )
}
