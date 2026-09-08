'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { ArrowDown } from './Icons'
import BlobCanvas from './BlobCanvas'
import { useScrollTo } from './SmoothScroll'
import { hero } from '../lib/data'

const EASE = [0.76, 0, 0.24, 1] as const

export default function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const reduced = useReducedMotion()
  const scrollTo = useScrollTo()

  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 })
  const mx = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 })
  const my = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 })

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (reduced) return
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const nx = (e.clientX - cx) / cx
      const ny = (e.clientY - cy) / cy
      ry.set(nx * 9)
      rx.set(-ny * 7)
      mx.set(nx * 18)
      my.set(ny * -12)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced, rx, ry, mx, my])

  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-[12rem] pt-[16rem] md:pb-[8rem]"
      style={{ perspective: '1200px' }}
    >
      {/* soft background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[10%] h-[52rem] w-[52rem] opacity-60 blur-[2px]"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, rgba(234,160,152,.28), rgba(253,252,252,0) 62%)',
        }}
        animate={{ scale: [1, 1.12, 1], x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[0%] left-[-8%] h-[46rem] w-[46rem] opacity-60"
        style={{
          background:
            'radial-gradient(circle at 60% 60%, rgba(177,223,237,.35), rgba(253,252,252,0) 65%)',
        }}
        animate={{ scale: [1, 1.15, 1], x: [0, 25, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        ref={wrapRef}
        className="container-wondr relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className="relative mx-auto w-full max-w-[120rem]"
          style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        >
          {/* Award badges — desktop (RTL: the right title sits physically right) */}
          <motion.a
            href="#awards"
            data-cursor="view"
            className="absolute left-[2%] top-[-4rem] z-[6] hidden w-[11rem] md:block lg:w-[13rem]"
            initial={{ opacity: 0, x: -80, y: -40 }}
            animate={ready ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.45, ease: EASE }}
            whileHover={{ scale: 1.06, rotate: -4 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img-v6/aestheic-Award-clinic-168.png"
              alt="برگزیده‌ی کلینیک سال"
              className="w-full object-contain"
            />
          </motion.a>

          <motion.a
            href="#awards"
            data-cursor="view"
            className="absolute bottom-[-2rem] right-[2%] z-[6] hidden w-[11rem] md:block lg:w-[13rem]"
            initial={{ opacity: 0, x: 80, y: 40 }}
            animate={ready ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.55, ease: EASE }}
            whileHover={{ scale: 1.06, rotate: 4 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img-v6/2025-Patient-Winner.png"
              alt="برگزیده‌ی رضایت بیماران"
              className="w-full object-contain"
            />
          </motion.a>

          {/* Hero image */}
          <motion.div
            className="relative mx-auto h-[26rem] w-[26rem] sm:h-[32rem] sm:w-[32rem] lg:h-[49.6rem] lg:w-[49.6rem]"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, scale: 0.86 }}
            animate={ready ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
          >
            {/* soft rose wash behind everything (original blob layers) */}
            <span
              aria-hidden
              className="blob-shape pointer-events-none absolute -inset-[8%] lk:bg-gradient-to-br lk:from-rose/70 lk:via-blush/40 lk:to-transparent opacity-70"
              style={{ animationDuration: '34s' }}
            />
            {/* mouse-reactive morphing ring — port of the paper.js canvas */}
            <BlobCanvas className="!h-[110rem] !w-[110rem] max-lg:!hidden" />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
              style={{ x: mx, y: my }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img-v6/home-hero.png"
                alt=""
                className="h-full w-full scale-[1.08] object-cover object-top"
              />
            </motion.span>
            <a
              href="#treatments"
              aria-label="مشاهده خدمات"
              data-cursor="discover"
              className="absolute inset-0 z-[4] rounded-full"
            />
          </motion.div>

          {/* Titles — RTL: inline-start is physical right */}
          <motion.h1
            className="hero-title right-[2%] top-[50%] lk:text-right"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, x: 100, y: '-40%', rotateY: 45 }}
            animate={ready ? { opacity: 1, x: 0, y: '-100%', rotateY: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
          >
            {hero.titleRightTop}
            <br />
            {hero.titleRightBottom}
          </motion.h1>

          <motion.h1
            className="hero-title left-[2%] top-[50%] lk:text-left"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, x: -100, y: '40%', rotateY: -45 }}
            animate={ready ? { opacity: 1, x: 0, y: '0%', rotateY: 0 } : {}}
            transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
          >
            {hero.titleLeftTop}
            <br />
            {hero.titleLeftBottom}
          </motion.h1>
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <button
        type="button"
        aria-label="رفتن به بخش بعد"
        onClick={() => scrollTo('#quicklinks')}
        className="absolute bottom-[5rem] left-1/2 z-[6] -translate-x-1/2 appearance-none border-none bg-transparent outline-none md:bottom-[4rem] max-md:left-auto max-md:right-[2.6rem] max-md:translate-x-0"
      >
        <ArrowDown />
      </button>

      {/* Awards strip — mobile */}
      <div
        id="awards"
        className="mt-[4rem] flex w-full items-center justify-between gap-[2rem] lk:bg-blush px-[2.4rem] py-[2rem] md:hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img-v6/aestheic-Award-clinic-168.png"
          alt="برگزیده‌ی کلینیک سال"
          className="h-[8rem] w-auto object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img-v6/2025-Patient-Winner.png"
          alt="برگزیده‌ی رضایت بیماران"
          className="h-[8rem] w-auto object-contain"
        />
      </div>
    </section>
  )
}
