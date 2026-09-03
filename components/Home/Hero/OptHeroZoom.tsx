'use client'

/**
 * HeroZoom
 * --------
 * Window-zoom rig, rebuilt:
 *   - the "window" layer  ->  your full <Hero /> section (scales 1 -> 6 and dissolves)
 *   - the "sky" layer     ->  TeamScrollVideos content (masked video track + expanding team circle)
 *
 * Important: TeamScrollVideos cannot keep its own scroll listener / sticky / fixed layers
 * inside a pinned+transformed parent (position: fixed and sticky both die in there).
 * So its animation is driven by this component's scrubbed timeline instead.
 */

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import ReactLenis, { LenisRef } from 'lenis/react'
import Hero from './Hero'

// your existing hero, untouched — fix the path to match your project

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

/* ------------------------------------------------------------------ data */

type TeamMember = { alt: string; src: string }

type VideoConfig = {
  src: string
  clip: string
  align: 'justify-start' | 'justify-center' | 'justify-end'
}

const TEAM: TeamMember[] = [
  {
    alt: 'Profile 1',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/103a4a8da-344c-4fcd-b588-00302b16d8c3.png',
  },
  {
    alt: 'Profile 2',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1c8b64082-40da-41cc-b68e-d0b2f3e50641.png',
  },
  {
    alt: 'Profile 3',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1cb27e14d-99ac-41ff-98a7-516b85e7314c.png',
  },
  {
    alt: 'Profile 4',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/171fa5f30-5da2-465a-abac-32e6f48901a5.png',
  },
  {
    alt: 'Profile 5',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1a151d5fb-d445-4b2e-8508-b3f08ab8ae40.png',
  },
  {
    alt: 'Profile 6',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/17f181797-8e67-46b5-a655-d0eaa0f5fddd.png',
  },
  {
    alt: 'Profile 7',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1c69caca2-f270-4be6-b64b-25ad0f2ba0ce.png',
  },
  {
    alt: 'Profile 8',
    src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/18a5fb232-ca74-401d-99ce-dcc99dd405f3.png',
  },
]

const VIDEOS: VideoConfig[] = [
  {
    src: 'https://videos.pexels.com/video-files/8810993/8810993-hd_1080_1920_25fps.mp4',
    clip: 'inset(0% 5% 0% 5% round 10px)',
    align: 'justify-start',
  },
  {
    src: 'https://videos.pexels.com/video-files/7184232/7184232-uhd_1440_2560_25fps.mp4',
    clip: 'inset(0% 5% 0% 5% round 100px 10px 10px 10px)',
    align: 'justify-end',
  },
  {
    src: 'https://videos.pexels.com/video-files/10982929/10982929-hd_1080_1920_25fps.mp4',
    clip: 'inset(0% 5% 0% 5% round 150px 10px 150px 10px)',
    align: 'justify-center',
  },
]

/* ------------------------------------------------------------------ props */

type HeroZoomProps = {
  /** pin length as a multiple of viewport height. 5 = 500vh of scroll */
  scrollLength?: number
  /** where the camera pushes through the hero */
  zoomOrigin?: string
  /** how far the hero blows up before it dissolves */
  zoomScale?: number
}

/* ------------------------------------------------------------------ component */

const HeroZoom = ({
  scrollLength = 5,
  zoomOrigin = '50% 45%',
  zoomScale = 6,
}: HeroZoomProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<LenisRef | null>(null)

  const heroLayer = useRef<HTMLDivElement>(null)
  const teamLayer = useRef<HTMLDivElement>(null)
  const videoTrack = useRef<HTMLDivElement>(null)
  const circleScaler = useRef<HTMLDivElement>(null)
  const centerCopy = useRef<HTMLDivElement>(null)
  const ringRefs = useRef<HTMLDivElement[]>([])
  const photoRefs = useRef<HTMLDivElement[]>([])

  /* --- Lenis <-> ScrollTrigger sync (your original version had them running
         on separate clocks, which is why scrub felt mushy) --- */
  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
    }
  }, [])

  /* --- responsive scale for the whole circle system --- */
  useEffect(() => {
    const fit = () => {
      const s = Math.min(1, window.innerWidth / 780, window.innerHeight / 780)
      gsap.set(circleScaler.current, { scale: s })
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useGSAP(
    () => {
      if (!containerRef.current || !heroLayer.current || !teamLayer.current)
        return

      const count = TEAM.length
      // ring radius grows with headcount so cards never overlap
      const radius = Math.max(280, (count * 110) / (2 * Math.PI) + 40)
      const angleOf = (i: number) => (i * 2 * Math.PI) / count

      // initial states
      gsap.set(heroLayer.current, { scale: 1, z: 0, autoAlpha: 1 })
      gsap.set(teamLayer.current, { autoAlpha: 0, scale: 1.25 })
      gsap.set(videoTrack.current, { y: 0 })
      gsap.set(photoRefs.current, { x: 0, y: 0, autoAlpha: 0, scale: 0.6 })
      gsap.set(ringRefs.current, { autoAlpha: 0 })
      gsap.set(centerCopy.current, { autoAlpha: 0, y: 40 })

      const trackTravel = () => {
        const track = videoTrack.current
        if (!track) return 0
        return Math.max(0, track.offsetHeight - window.innerHeight)
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * scrollLength}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      /* ---- act 1: push through the hero ---- */
      tl.to(heroLayer.current, { scale: zoomScale, z: 500, duration: 2 }, 0)
        .to(
          heroLayer.current,
          { autoAlpha: 0, duration: 0.85, ease: 'power2.in' },
          1.2,
        )
        .to(
          teamLayer.current,
          { autoAlpha: 1, scale: 1, duration: 1.5, ease: 'power2.out' },
          0.65,
        )

      /* ---- act 2: video track pans, team circle opens ---- */
      tl.to(
        videoTrack.current,
        { y: () => -trackTravel(), duration: 2.6 },
        1.95,
      )
        .to(
          ringRefs.current,
          { autoAlpha: 1, duration: 0.7, stagger: 0.18, ease: 'power1.out' },
          2.0,
        )
        .to(
          photoRefs.current,
          {
            x: (i: number) => radius * Math.cos(angleOf(i)),
            y: (i: number) => radius * Math.sin(angleOf(i)),
            autoAlpha: 1,
            scale: 1,
            duration: 1.3,
            stagger: 0.07,
            ease: 'power3.out',
          },
          2.05,
        )
        .to(
          centerCopy.current,
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          2.9,
        )

      /* ---- act 3: breathing room before the pin releases ---- */
      tl.to({}, { duration: 0.6 })
    },
    { scope: containerRef, dependencies: [scrollLength, zoomScale] },
  )

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      <div ref={containerRef} className="relative">
        <section
          className="relative h-svh w-full overflow-hidden bg-white dark:bg-black"
          style={{ perspective: '1200px' }}
        >
          {/* ============ layer 1: team + videos (was the sky) ============ */}
          <div
            ref={teamLayer}
            className="absolute inset-0 z-10 will-change-transform"
          >
            {/* masked video track, pans upward like the old sky image */}
            <div
              ref={videoTrack}
              className="pointer-events-none absolute left-0 top-0 h-[280svh] w-full will-change-transform"
            >
              <div className="mx-auto grid h-full max-w-[80rem] grid-rows-3 px-5 md:px-10">
                {VIDEOS.map((video, idx) => (
                  <div key={idx} className={`flex items-center ${video.align}`}>
                    <div
                      className="relative h-[22rem] w-[min(22rem,86vw)] overflow-hidden bg-white/50 md:h-[28rem] md:w-96 dark:bg-black/50"
                      style={{ clipPath: video.clip }}
                    >
                      <video
                        className="absolute inset-0 h-full w-full object-cover"
                        src={video.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* expanding team circle, parked in the middle of the viewport */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div ref={circleScaler} className="will-change-transform">
                <div
                  ref={(el) => {
                    if (el) ringRefs.current[0] = el
                  }}
                  className="flex h-[600px] w-[600px] items-center justify-center rounded-full border-2 border-[#e9e9e9] dark:border-gray-700"
                >
                  <div
                    ref={(el) => {
                      if (el) ringRefs.current[1] = el
                    }}
                    className="relative flex h-[500px] w-[500px] items-center justify-center rounded-full border-2 border-blue-100 dark:border-blue-800"
                  >
                    <div className="relative flex h-[400px] w-[400px] items-center justify-center rounded-full border-2 border-[#e9e9e9] dark:border-gray-700">
                      {/* glass center: video reads through behind the copy */}
                      <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/40 bg-white/25 backdrop-blur-xl dark:border-white/10 dark:bg-black/25">
                        {TEAM.map((member, idx) => (
                          <div
                            key={member.alt}
                            ref={(el) => {
                              if (el) photoRefs.current[idx] = el
                            }}
                            className="absolute z-0 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg will-change-transform dark:border-gray-800"
                          >
                            <img
                              src={member.src}
                              alt={member.alt}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}

                        <div
                          ref={centerCopy}
                          className="relative z-20 flex flex-col items-center justify-center will-change-transform"
                        >
                          <h2 className="mb-2 text-center text-4xl font-bold text-gray-800 drop-shadow-sm dark:text-white">
                            Empowering
                          </h2>
                          <h2 className="mb-4 text-center text-4xl font-bold text-gray-800 drop-shadow-sm dark:text-white">
                            Every User
                          </h2>
                          <p className="max-w-xs text-center text-gray-600 dark:text-gray-300">
                            From entrepreneurs to educators, Gen AI provides
                            tools to simplify work.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ layer 2: the hero (was the window) ============ */}
          <div
            ref={heroLayer}
            className="absolute inset-0 z-20 will-change-transform"
            style={{
              transformOrigin: zoomOrigin,
              transformStyle: 'preserve-3d',
            }}
          >
            <Hero />
          </div>
        </section>

        <section className="relative flex h-svh w-full items-center justify-center overflow-hidden p-8 text-center">
          <h2 className="text-3xl">End of view</h2>
        </section>
      </div>
    </ReactLenis>
  )
}

export default HeroZoom
