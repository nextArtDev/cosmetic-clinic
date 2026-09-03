'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP)

const GREETINGS = ['زیبایی', 'اعتماد', 'دقت', 'هنر', 'سلامت']
const WORD_HOLD_MS = 600
const WORD_FADE_MS = 350

interface PreloaderProps {
  progress: number
  isReady: boolean
  greetings?: string[]
}

export function Preloader({
  progress,
  isReady,
  greetings = GREETINGS,
}: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLDivElement>(null)
  const counterNumRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [wordIndex, setWordIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const revealedRef = useRef(false)

  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // While the preloader covers the screen, suppress route-transition snapshot
  // animations (see globals.css): on first load of a dynamic route the
  // streamed content reveal would otherwise play underneath/against the
  // curtain-lift. Keyed to `visible`, NOT to mount/unmount: after the exit
  // timeline the component renders null but stays mounted inside the
  // persistent (home) layout, so an unmount-keyed cleanup never ran and the
  // attribute stuck on <html> forever — every hero remounted afterwards
  // (route re-entry, streamed swap) had its `hero-copy-rise` animation born
  // paused at its opacity-0 from-frame, making the hero title disappear.
  useEffect(() => {
    if (!visible) return
    document.documentElement.dataset.preloaderActive = 'true'
    return () => {
      delete document.documentElement.dataset.preloaderActive
    }
  }, [visible])

  // ── Greeting word loop ────────────────────────────────────────────────────
  // State-driven, interruptible: the interval keeps cycling until the exit
  // effect clears it. On reduced motion, show the first word statically.
  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % greetings.length)
    }, WORD_HOLD_MS)
    return () => clearInterval(id)
  }, [greetings, reducedMotion])

  // ── Entrance: counter fade-in ─────────────────────────────────────────────
  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set(counterRef.current, { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        counterRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 },
      )
    },
    { scope: containerRef },
  )

  // ── Live progress → counter + bar ────────────────────────────────────────
  useEffect(() => {
    if (counterNumRef.current) {
      counterNumRef.current.textContent = String(Math.round(progress))
    }
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: progress / 100,
        duration: 0.25,
        ease: 'power2.out',
      })
    }
  }, [progress])

  // ── Exit: clean current-word fade → curtain → unmount ────────────────────
  useEffect(() => {
    if (!isReady || revealedRef.current) return
    revealedRef.current = true

    if (reducedMotion) {
      queueMicrotask(() => {
        setVisible(false)
      })
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false)
      },
    })

    if (counterNumRef.current) counterNumRef.current.textContent = '100'
    if (progressRef.current) {
      tl.to(
        progressRef.current,
        { scaleX: 1, duration: 0.4, ease: 'power2.out' },
        0,
      )
    }

    // Finish the current greeting word cleanly before the curtain lifts
    tl.to(
      textRef.current,
      { opacity: 0, y: -20, duration: 0.28, ease: 'power2.in' },
      '+=0.1',
    )
    tl.to(
      counterRef.current,
      { opacity: 0, y: -30, duration: 0.28, ease: 'power3.in' },
      '<',
    )
    tl.to(
      loadingRef.current,
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.9,
        ease: 'expo.inOut',
      },
      '-=0.15',
    ).to(
      curtainRef.current,
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.7,
        ease: 'expo.inOut',
      },
      '-=0.6',
    )

    return () => {
      tl.kill()
    }
  }, [isReady, reducedMotion])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200]"
      aria-hidden="true"
      // Give the preloader its own view-transition name. During the
      // loading.tsx→page.tsx swap React's <ViewTransition name="page">
      // suppresses the default root snapshot, which would make this layout-level
      // overlay vanish and expose the hero. As a named group it is captured in
      // both old and new snapshots and stays put (see globals.css:
      // ::view-transition-group(preloader)), so the hero never flashes over it.
      style={{ viewTransitionName: 'preloader' }}
    >
      {/* Offset curtain — cream stage, revealed as the dark panel lifts */}
      <div
        ref={curtainRef}
        className="absolute inset-0 z-40"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 0%, #FDFBF7 0%, #F6EDE2 45%, #EFE1D3 100%)',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* Loading panel — dark stage */}
      <div
        ref={loadingRef}
        className="absolute inset-0 z-50 flex flex-col justify-between p-8 md:p-14"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 28%, oklch(21% 0.03 50) 0%, oklch(12% 0.012 44) 70%)',
          backgroundColor: 'oklch(13% 0.014 46)',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-light uppercase tracking-[0.3em] text-[#c9a667]">
            در حال بارگذاری
          </span>
          <span className="text-[0.7rem] font-light uppercase tracking-[0.3em] text-[#c9a667]">
            کلینیک دکتر فضلی
          </span>
        </div>

        {/* Center greeting — state-driven loop, CSS transitions */}
        <div
          ref={textRef}
          className="relative flex items-center justify-center"
          style={{ minHeight: '10rem' }}
        >
          {greetings.map((word, i) => {
            const active = i === wordIndex
            return (
              <div
                key={word + i}
                className="absolute flex flex-col items-center"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateY(0)' : 'translateY(18px)',
                  transition: `opacity ${WORD_FADE_MS}ms ease, transform ${WORD_FADE_MS}ms ease`,
                }}
              >
                <h2
                  className="whitespace-nowrap font-bold text-white"
                  style={{
                    fontSize: 'clamp(2.5rem, 9vw, 6rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {word}
                </h2>
              </div>
            )
          })}
        </div>

        {/* Bottom: counter + progress */}
        <div
          ref={counterRef}
          className="flex flex-col gap-3"
          style={{ opacity: 0 }}
        >
          <div className="flex items-end justify-between">
            <span className="text-[0.7rem] font-light uppercase tracking-[0.3em] text-[#c9a667]/80">
              آماده‌سازی تجربه
            </span>
            <div
              className="text-white"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', lineHeight: 1 }}
            >
              <span ref={counterNumRef}>0</span>
              <span className="text-[#c9a667]" style={{ fontSize: '1.1rem' }}>
                ٪
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: '1px',
              width: '100%',
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              ref={progressRef}
              style={{
                height: '100%',
                width: '100%',
                background: '#c9a667',
                transform: 'scaleX(0)',
                transformOrigin: 'left center',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
