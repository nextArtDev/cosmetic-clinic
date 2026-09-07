'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Logo, Arrow, OvalButton, ease } from './primitives'

export function PlayMark() {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true">
      <path
        d="M7.7 4.1c-1.9-1.4-4.2-.2-4.2 2.2v15.4c0 2.4 2.3 3.6 4.2 2.2l10.8-7.7c1.6-1.1 1.6-3.3 0-4.4L7.7 4.1Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  )
}

export function Hero({
  onMenu,
  onBuy,
  onVideo,
}: {
  onMenu: () => void
  onBuy: () => void
  onVideo: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const video = ref.current?.querySelector('video')
    if (!video) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePlayback = () => {
      if (preference.matches) video.pause()
      else void video.play().catch(() => {})
    }
    updatePlayback()
    preference.addEventListener('change', updatePlayback)
    return () => {
      video.pause()
      preference.removeEventListener('change', updatePlayback)
    }
  }, [])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 130])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0])
  const videoY = useTransform(scrollYProgress, [0, 1], [0, -85])
  const headline = ['قلبی آرام،', 'بدنی بدون درد،', 'ذهنی آسوده']

  return (
    <section ref={ref} id="top" className="hero">
      <motion.div className="hero-background" style={{ y: reduced ? 0 : backgroundY }}>
        <picture>
          <source media="(max-width: 600px)" srcSet="/v8/media/hero-mobile.webp" />
          <img
            src="/v8/media/hero.webp"
            alt="فضای آرام و حرفه‌ای کلینیک تخصصی مهر"
            fetchPriority="high"
            loading="eager"
          />
        </picture>
      </motion.div>
      <img className="hero-linework" src="/v8/media/hero-lines.svg" alt="" aria-hidden="true" />
      <header className="site-header shell">
        <a href="#top" className="logo-link" aria-label="کلینیک مهر — خانه">
          <Logo />
        </a>
        <div className="header-actions">
          <OvalButton onClick={onBuy} className="header-buy">
            دریافت نوبت
          </OvalButton>
          <button
            className="menu-toggle"
            type="button"
            onClick={onMenu}
            aria-label="باز کردن منو"
            aria-haspopup="dialog"
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className="hero-content shell">
        <div className="hero-heading-position">
          <motion.h1
            className="hero-title"
            style={{ y: reduced ? 0 : titleY, opacity: reduced ? 1 : titleOpacity }}
          >
            {headline.map((line, index) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: reduced ? 0 : 38 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.16 + index * 0.13, ease }}
              >
                {line}
              </motion.span>
            ))}
          </motion.h1>
        </div>
        <motion.button
          type="button"
          className="hero-video"
          onClick={onVideo}
          aria-label="تماشای معرفی کلینیک"
          style={{ y: reduced ? 0 : videoY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease }}
          whileHover={{ scale: reduced ? 1 : 1.025 }}
        >
          <video
            src="/videos/fv.mp4"
            poster="/v8/media/intro-poster.webp"
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
          <span className="video-play">
            <PlayMark />
          </span>
          <span className="video-hover-label">تماشای ویدیو</span>
        </motion.button>
        <a href="#about" className="hero-scroll round-button" aria-label="آشنایی با کلینیک مهر">
          <Arrow direction="down" size={19} />
        </a>
      </div>
    </section>
  )
}
