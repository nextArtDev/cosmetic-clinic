'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { shabnamV2 } from '../fonts'

/**
 * Marks <html> with data-v2-active while any /v2 page is mounted. The
 * attribute gates every html/body-level rule in v2/globals.css, so those
 * styles exist only while a /v2 route is on screen and are gone the moment
 * the user navigates away. The wrapper carries the Persian font variable
 * and the fa-IR/rtl context for the whole port.
 */
export function ShaninaShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-v2-active', '')
    return () => {
      html.removeAttribute('data-v2-active')
      window.scrollTo(0, 0)
    }
  }, [])
  return (
    <div className={`v2 ${shabnamV2.variable}`} lang="fa-IR" dir="rtl">
      {children}
    </div>
  )
}

export function MotionSystem({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let context: gsap.Context | undefined
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: !reduced.matches,
      anchors: { duration: 1.3 },
      prevent: (node) => node.hasAttribute('data-lenis-prevent'),
    })
    const tick = (time: number) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    const refresh = () => ScrollTrigger.refresh()
    const lock = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('layout:changed', refresh)
    window.addEventListener('scroll:lock', lock)

    document.fonts.ready.then(() => {
      if (disposed || !root.current || reduced.matches) return
      context = gsap.context(() => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro.fromTo(
          '.hero-title .title-word',
          { yPercent: 110, rotate: 3, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 1.3, stagger: 0.1 },
          0,
        )
        intro.fromTo(
          '.hero-nav a',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.055 },
          0.35,
        )
        intro.fromTo(
          '.hero-copy > *',
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12 },
          0.5,
        )
        intro.fromTo(
          '.hero-facts',
          { opacity: 0 },
          { opacity: 0.4, duration: 1 },
          0.8,
        )
        intro.fromTo(
          '.hero-background img',
          { scale: 1.04 },
          { scale: 1, duration: 1.8, ease: 'power2.out' },
          0,
        )

        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
          gsap.fromTo(
            element,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 94%',
                toggleActions: 'play none none none',
              },
            },
          )
        })

        gsap.utils
          .toArray<HTMLElement>('[data-parallax]')
          .forEach((element) => {
            element.querySelectorAll('img').forEach((image) => {
              gsap.fromTo(
                image,
                { yPercent: -3, scale: 1.09 },
                {
                  yPercent: 3,
                  scale: 1.03,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.8,
                  },
                },
              )
            })
          })

        gsap.utils
          .toArray<HTMLElement>('[data-word-reveal]')
          .forEach((element) => {
            gsap.fromTo(
              element.querySelectorAll('.word'),
              { opacity: 0.22 },
              {
                opacity: 1,
                stagger: 0.08,
                ease: 'none',
                scrollTrigger: {
                  trigger: element,
                  start: 'top 78%',
                  end: 'bottom 42%',
                  scrub: 0.5,
                },
              },
            )
          })

        gsap.to('.holistic-image', {
          maskSize: '340%',
          WebkitMaskSize: '340%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.holistic-scene',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        })
        gsap.to('.holistic-marquee', {
          xPercent: 22,
          ease: 'none',
          scrollTrigger: {
            trigger: '.holistic-scene',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        })
        gsap.to('.process-flower', {
          rotation: 160,
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-timeline',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
        gsap.fromTo(
          '.timeline-progress',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top',
            scrollTrigger: {
              trigger: '.process-timeline',
              start: 'top center',
              end: 'bottom center',
              scrub: 0.5,
            },
          },
        )
        gsap.fromTo(
          '.map-image',
          { scale: 0.94, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.map-panel',
              start: 'top 85%',
              end: 'center center',
              scrub: 0.7,
            },
          },
        )
      }, root)
      ScrollTrigger.refresh()
    })

    return () => {
      disposed = true
      context?.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
      window.removeEventListener('layout:changed', refresh)
      window.removeEventListener('scroll:lock', lock)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root}>{children}</div>
    </MotionConfig>
  )
}

export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <span className="word" key={`${word}-${index}`}>
          {word}{' '}
        </span>
      ))}
    </>
  )
}
