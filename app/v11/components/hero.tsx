/* eslint-disable @next/next/no-img-element */
'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { HERO } from '../lib/content'
import WordReveal from './word-reveal'

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [soundOn, setSoundOn] = useState(false)
  const [videoActive, setVideoActive] = useState(false)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const baseFont = () => parseFloat(getComputedStyle(el).fontSize) || 16

    // Live site curves (measured at 1440/768/390):
    //  desktop: TV 75.75em wide, scale .40 -> .82 (TV ends ~994px)
    //  tablet : TV 75em wide,    scale .50 -> .82
    //  mobile : TV 22.4em wide,  scale .65 -> 1.0 (TV ends ~92vw)
    const isMobile = () => window.matchMedia('(max-width: 479px)').matches
    const isTablet = () =>
      window.matchMedia('(min-width: 480px) and (max-width: 991px)').matches

    const restScale = () =>
      isMobile() ? 0.65 : isTablet() ? 0.5 : Math.min(0.4, (window.innerWidth * 0.9) / (75.75 * baseFont()))
    const endScale = () =>
      isMobile()
        ? Math.min(1, (window.innerWidth * 0.92) / (22.4 * baseFont()))
        : isTablet()
          ? Math.min(0.82, (window.innerWidth * 0.95) / (75 * baseFont()))
          : Math.min(0.82, (window.innerWidth * 0.95) / (75.75 * baseFont()))

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.hero__section-animation',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > 0.3) setVideoActive(true)
          },
        },
      })

      tl.fromTo(
        '.screen-inner',
        { scale: () => restScale(), y: 0 },
        {
          scale: () => endScale(),
          y: () => -window.innerHeight * 0.1,
          duration: 1,
        },
        0,
      )
        .fromTo('.hero-bg-img', { scale: 1.14 }, { scale: 1, duration: 1 }, 0)
        .fromTo(
          '.hero-content',
          { yPercent: 0 },
          { yPercent: 55, duration: 1 },
          0,
        )
        .fromTo(
          '.hero-title',
          { y: 0, opacity: 1 },
          { y: '-14vh', opacity: 0, duration: 0.5 },
          0,
        )
        .fromTo('.hero-line', { scaleY: 0 }, { scaleY: 1, duration: 0.45 }, 0)
        .fromTo(
          '.hero-gradient',
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          0.05,
        )
        .fromTo(
          '.video-wrap',
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 0.25 },
          0.45,
        )
        .fromTo(
          '.screen-description-wrap',
          { opacity: 0, y: '2em' },
          { opacity: 1, y: '0em', duration: 0.22 },
          0.55,
        )
        .fromTo(
          '.sound-btn-wrap',
          { opacity: 0, y: '1.5em' },
          { opacity: 1, y: '0em', duration: 0.15 },
          0.5,
        )
    }, el)

    return () => ctx.revert()
  }, [])

  // start loading / playing the (heavy) explainer video only once it's in view
  useLayoutEffect(() => {
    if (!videoActive) return
    const v = videoRef.current
    if (!v) return
    try {
      v.load()
      void v.play().catch(() => undefined)
    } catch {
      /* ignore */
    }
  }, [videoActive])

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    if (!soundOn) {
      v.muted = false
      v.volume = 1
      void v.play().catch(() => undefined)
    } else {
      v.muted = true
    }
    setSoundOn((s) => !s)
  }

  return (
    <section id="top" className="scmd:relative scmd:w-full" ref={root}>
      <div className="container">
        <div className="hero__wrapper">
          <div
            className="hero__section-animation scmd:relative scmd:w-full"
            style={{ height: '400vh', backgroundColor: '#cda07f' }}
          >
            <div className="side-lines">
              <span
                className="hero-line line-vertical scmd:block"
                style={{ transformOrigin: 'top center' }}
              />
              <span
                className="hero-line line-vertical scmd:block"
                style={{ transformOrigin: 'top center' }}
              />
            </div>

            <div className="scmd:sticky scmd:top-0 scmd:flex scmd:h-[100svh] scmd:w-full scmd:items-center scmd:justify-center scmd:overflow-hidden scmd:md:h-[125svh]">
              {/* ---- TV screen that scales up ---- */}
              <div className="screen-inner scmd:flex scmd:items-center scmd:justify-center">
                <img
                  src="/v11/img/tv.webp"
                  alt=""
                  className="scmd:pointer-events-none scmd:absolute scmd:inset-0 scmd:h-full scmd:w-full"
                  style={{ zIndex: 3 }}
                />
                <img
                  src="/v11/img/footer-tv.avif"
                  alt=""
                  className="scmd:pointer-events-none scmd:absolute scmd:left-0 scmd:w-full"
                  style={{ zIndex: 2, bottom: '-5.9em' }}
                />

                <div className="video-wrap">
                  <div className="scmd:absolute scmd:inset-0 scmd:overflow-hidden">
                    <video
                      ref={videoRef}
                      className="scmd:h-full scmd:w-full"
                      style={{ objectFit: 'cover' }}
                      poster="/v11/img/video-poster.webp"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="none"
                    >
                      {videoActive && (
                        <source src={HERO.video} type="video/mp4" />
                      )}
                    </video>
                  </div>
                </div>

                {/* big screen statement under the TV */}
                <div className="screen-description-wrap">
                  <p className="text-70-regular">
                    {HERO.screenText.map((p, i) => (
                      <span key={i} className={p.className}>
                        {p.text}{' '}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* enable sound */}
              <div
                className="sound-btn-wrap scmd:absolute scmd:z-[6]"
                style={{ right: '2.2em', bottom: '3em' }}
              >
                <button
                  type="button"
                  onClick={toggleSound}
                  className="scmd:inline-flex scmd:items-center"
                  style={{
                    gap: '0.63em',
                    backgroundColor: 'var(--pink)',
                    color: '#fff',
                    borderRadius: '0.13em',
                    padding: '0.69em 1.38em 0.69em 1.2em',
                    fontFamily: 'var(--scmd-font-sans)',
                    fontSize: '0.94em',
                    lineHeight: '120%',
                    display: soundOn ? 'none' : 'inline-flex',
                    transition: 'transform .3s, background-color .3s',
                  }}
                >
                  <img
                    src="/v11/img/icons/volume.svg"
                    alt=""
                    style={{ width: '1.2em', height: '1.2em' }}
                  />
                  <span>فعال‌سازی صدا</span>
                </button>
              </div>

              {/* tan gradient that fades in */}
              <div
                className="hero-gradient scmd:pointer-events-none scmd:absolute scmd:inset-0 scmd:z-[1]"
                style={{
                  backgroundImage: 'linear-gradient(#e0b496,#cea17f)',
                }}
              />

              {/* masked hero photo + title */}
              <div className="scmd:absolute scmd:inset-0 scmd:z-0 scmd:overflow-hidden">
                <div className="hero-content scmd:relative scmd:h-full scmd:w-full">
                  <div className="hero-title">
                    <WordReveal
                      as="h1"
                      className="h1-style"
                      parts={HERO.title}
                      delay={0.25}
                      stagger={0.06}
                      waitForBoot
                    />
                  </div>
                  <div className="scmd:absolute scmd:inset-0 scmd:flex scmd:h-full scmd:w-full scmd:items-center scmd:justify-center">
                    <picture>
                      <source
                        media="(max-width: 479px)"
                        srcSet="/v11/img/hero-bg-mobile.avif"
                      />
                      <source
                        media="(max-width: 991px)"
                        srcSet="/v11/img/hero-bg-tablet.avif"
                      />
                      <img
                        src="/v11/img/hero-bg.avif"
                        alt=""
                        className="hero-bg-img scmd:pointer-events-none scmd:h-full scmd:w-full"
                        style={{
                          objectFit: 'cover',
                          objectPosition: '50% 0%',
                        }}
                      />
                    </picture>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
