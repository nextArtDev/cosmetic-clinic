'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/anim'
import type { IranfitContent } from '../data/types'
import Nav from './Nav'
import Hero from './Hero'
import Marquee from './Marquee'
import Plans from './Plans'
import Book from './Book'
import Pricing from './Pricing'
import AppSection from './AppSection'
import Testimonials from './Testimonials'
import Coach from './Coach'
import Programs from './Programs'
import BeforeAfter from './BeforeAfter'
import News from './News'
import CtaBand from './CtaBand'
import Footer from './Footer'
import ProgressRail from './ProgressRail'
import BackToTop from './BackToTop'
import VideoModal from './VideoModal'
import QuizModal from './QuizModal'

interface VideoSource {
  src: string
  poster: string
  caption: string
}

const HERO_VIDEO: VideoSource = {
  src: 'https://videos.pexels.com/video-files/6389576/6389576-uhd_3840_2160_25fps.mp4',
  poster: '/v20/media/hero.webp',
  caption: 'نمونه‌ای از یک جلسه تمرین — هر جلسه با نریشن فارسی و زیرنویس حرکات',
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Landing({ content }: { content: IranfitContent }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [video, setVideo] = useState<VideoSource | null>(null)
  const [quizOpen, setQuizOpen] = useState(false)
  // bumped on every open so the quiz dialog remounts with pristine state
  const [quizKey, setQuizKey] = useState(0)

  const openVideo = useCallback((v: VideoSource) => setVideo(v), [])
  const closeVideo = useCallback(() => setVideo(null), [])
  const openQuiz = useCallback(() => {
    setQuizKey((k) => k + 1)
    setQuizOpen(true)
  }, [])
  const closeQuiz = useCallback(() => setQuizOpen(false), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // All queries are scoped to `root` so nothing outside /v20 can ever be
    // picked up, even if another route happens to reuse an `if-*` class.
    const all = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel))

    const ctx = gsap.context(() => {
      /* ---- generic reveals ---- */
      all('[data-if-reveal]').forEach((el) => {
        const delay = Number(el.dataset.ifDelay ?? 0)
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.05,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      /* ---- giant ghost numbers: slow parallax drift ---- */
      all('.if-ghost').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 22 },
          {
            yPercent: -22,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          },
        )
      })

      /* ---- hero intro timeline ---- */
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo(
        '.if-hero h1 .if-line > span',
        { yPercent: 115 },
        { yPercent: 0, duration: 1.25, stagger: 0.14 },
        0.15,
      )
        .fromTo(
          '.if-hero .if-kicker',
          { opacity: 0, x: 26 },
          { opacity: 1, x: 0, duration: 0.9 },
          0.35,
        )
        .fromTo(
          '.if-hero-sub',
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.9 },
          0.65,
        )
        .fromTo(
          '.if-hero-actions > *',
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          0.8,
        )
        .fromTo(
          '.if-hero-stat',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          1.0,
        )
        .fromTo(
          '.if-hero-bg img',
          { scale: 1.18 },
          { scale: 1.02, duration: 2.4, ease: 'power2.out' },
          0,
        )

      /* ---- number counters ---- */
      all('[data-if-count]').forEach((el) => {
        const target = Number(el.dataset.ifCount ?? '0')
        const decimals = Number(el.dataset.ifDecimals ?? '0')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = obj.v
              .toFixed(decimals)
              .replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
          },
        })
      })

      /* ---- coach / book / programme image parallax ---- */
      all('[data-if-parallax]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 46 },
          {
            y: -46,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        )
      })

      /* ---- programme split cards: staggered lift-in ----
         Skipped when the visitor prefers reduced motion: the cards have no
         initial-hidden CSS, so simply not tweening them is the correct state. */
      if (!prefersReducedMotion()) {
        all('.if-program').forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: 8, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.1,
              delay: i * 0.12,
              ease: 'power3.out',
              scrollTrigger: { trigger: el.parentElement, start: 'top 85%' },
            },
          )
        })
      }

      /* NOTE: the gallery tiles are NOT tweened here on purpose — they carry
         `data-if-reveal` (+ per-tile `data-if-delay`) and are therefore already
         staggered by the generic reveal above. A second tween would fight it
         for the same `transform`. */
    }, root)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <div ref={rootRef} dir="rtl" className="iranfit-root">
      <a
        href="#if-main"
        style={{ position: 'absolute', insetInlineStart: '-9999px' }}
      >
        پرش به محتوا
      </a>

      <Nav onStart={openQuiz} />
      <ProgressRail />

      <main id="if-main">
        <Hero onPlay={() => openVideo(HERO_VIDEO)} onStart={openQuiz} />
        <section dir="ltr">
          <Marquee />
        </section>
        <Plans months={content.months} onSignup={openQuiz} />
        <Book />
        <Coach gallery={content.gallery} />
        <Programs
          programs={content.programs}
          onPlay={(p) => openVideo({ src: p.video, poster: p.poster, caption: `${p.title} — ${p.meta}` })}
        />
        <Pricing plans={content.plans} />
        <BeforeAfter items={content.beforeAfter} />
        <AppSection />
        <Testimonials items={content.testimonials} />
        <News posts={content.posts} />
        <CtaBand onStart={openQuiz} />
      </main>

      <Footer />
      <BackToTop />
      <VideoModal
        open={video !== null}
        onClose={closeVideo}
        src={video?.src ?? ''}
        poster={video?.poster ?? ''}
        caption={video?.caption}
      />
      <QuizModal key={quizKey} open={quizOpen} onClose={closeQuiz} />
      <div className="if-grain" aria-hidden />
    </div>
  )
}
