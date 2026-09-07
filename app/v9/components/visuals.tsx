'use client'

import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import { useBooking } from './booking-provider'

export function Arrow({
  diagonal = false,
  className = '',
}: {
  diagonal?: boolean
  className?: string
}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* RTL: the diagonal arrow points left-up to feel "forward" in Persian layout */}
      <path
        d={diagonal ? 'M18 18 6 6M18 6v12H6' : 'M20 12H5m6-6-6 6 6 6'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Words({
  text,
  wordClass = 'reveal-word',
}: {
  text: string
  wordClass?: string
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="word-wrap">
            <span className={wordClass}>{word}</span>
          </span>
          {index < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </>
  )
}

export function SectionTitle({ text, className = '' }: { text: string; className?: string }) {
  return (
    <h2 className={`section-title ${className}`} data-word-reveal>
      <Words text={text} />
    </h2>
  )
}

export function GlowButton({
  label = 'نوبت خود را رزرو کنید',
  interest,
  className = '',
}: {
  label?: string
  interest?: string
  className?: string
}) {
  const { openBooking } = useBooking()
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 240, damping: 20 })
  const y = useSpring(0, { stiffness: 240, damping: 20 })
  function move(event: MouseEvent<HTMLDivElement>) {
    if (reduce) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.05)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.08)
  }
  return (
    <div
      className={`glow-cta ${className}`}
      onMouseMove={move}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <div className="button-glow" aria-hidden="true" />
      <motion.button
        style={{ x, y }}
        whileTap={{ scale: 0.97 }}
        onClick={() => openBooking(interest)}
        type="button"
        className="glow-button"
      >
        {label}
      </motion.button>
    </div>
  )
}

export function AmbientVideo({
  src,
  poster,
  className = '',
  label = '',
  controllable = false,
}: {
  src: string
  poster: string
  className?: string
  label?: string
  controllable?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const manualPause = useRef(false)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduced.matches && !manualPause.current) {
          if (!video.getAttribute('src')) video.src = src
          video.play().catch(() => {})
        } else video.pause()
      },
      { rootMargin: '100px', threshold: 0.1 },
    )
    observer.observe(video)
    const onMotionChange = () => {
      if (reduced.matches) video.pause()
    }
    reduced.addEventListener('change', onMotionChange)
    return () => {
      observer.disconnect()
      reduced.removeEventListener('change', onMotionChange)
      video.pause()
    }
  }, [src])
  return (
    <div className={`ambient-media ${className}`}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        poster={poster}
        aria-label={label || undefined}
        aria-hidden={!label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {controllable && (
        <button
          type="button"
          className="video-toggle"
          aria-label={playing ? 'توقف ویدیو' : 'پخش ویدیو'}
          onClick={() => {
            const video = ref.current
            if (!video) return
            if (playing) {
              manualPause.current = true
              video.pause()
            } else {
              manualPause.current = false
              if (!video.getAttribute('src')) video.src = src
              video.play().catch(() => {})
            }
          }}
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M6 4v12M14 4v12" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="m6 3 11 7-11 7Z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
