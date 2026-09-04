'use client'

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import ReactLenis, { LenisRef } from 'lenis/react'
import { motion } from 'framer-motion'
import Image from 'next/image'

import HeroImage from '../../../public/images/doctor-fr.webp'
import HeroWindowBG from '../../../public/images/back-hero.png'
import DiseaseCarousel, {
  DiseaseData,
} from '@/components/Home/disease-carousel/DiseaseCarousel'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

// ---------------------------------------------------------------------------
// Hero content (pinned zoom-out section)
// ---------------------------------------------------------------------------

const diseases: DiseaseData[] = [
  { id: '1', title: 'لیفت صورت', imageUrl: '/images/poses/2.webp' },
  { id: '2', title: 'بلفاپلاستی', imageUrl: '/images/poses/4.webp' },
  { id: '3', title: 'پروتز چانه', imageUrl: '/images/poses/3.webp' },
  { id: '4', title: 'عمل بینی', imageUrl: '/images/poses/5.webp' },
  { id: '5', title: 'عمل پلک ', imageUrl: '/images/poses/10.webp' },
  { id: '6', title: 'پروتز سینه', imageUrl: '/images/poses/1.webp' },
  { id: '7', title: 'لیپوساکشن', imageUrl: '/images/poses/6.webp' },
  { id: '8', title: 'لیفت ابرو', imageUrl: '/images/poses/7.webp' },
  { id: '9', title: 'عمل غبغب', imageUrl: '/images/poses/9.webp' },
  { id: '10', title: 'عمل پلک', imageUrl: '/images/poses/8.webp' },
]

const textVariants = {
  initial: { x: -500, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 1, staggerChildren: 0.1 },
  },
}

function HeroPanel() {
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!heroSectionRef.current || !heroContentRef.current) return

      ScrollTrigger.create({
        trigger: heroSectionRef.current,
        start: 'top top',
        end: `+=${window.innerHeight * 2}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress
          const scale = 1 + progress * 5 // 1 -> 6
          const opacity =
            progress <= 0.6 ? 1 : Math.max(0, 1 - (progress - 0.6) / 0.4)
          gsap.set(heroContentRef.current, { scale, opacity })
        },
      })
    },
    { scope: heroSectionRef },
  )

  return (
    <section
      ref={heroSectionRef}
      className="hero relative w-full h-svh overflow-hidden perspective-distant"
    >
      <div
        ref={heroContentRef}
        className="hero-content absolute top-0 left-0 h-full w-full overflow-hidden bg-opacity-35 will-change-transform"
      >
        <Image
          fill
          src={HeroWindowBG}
          alt="hero"
          className="object-cover -z-[1]"
        />
        <div className="grid h-full w-full max-w-screen-xl grid-cols-1 grid-rows-9 mx-auto md:grid-cols-2">
          <article className="row-span-2 flex h-full w-full flex-col items-center justify-center pt-16 text-center">
            <motion.div
              className="textContainer space-y-4"
              variants={textVariants}
              initial="initial"
              animate="animate"
            >
              <motion.h2
                style={{ color: 'rebeccapurple' }}
                className="pt-8 text-3xl font-bold"
                variants={textVariants}
              >
                دکتر شبنم فضلی
              </motion.h2>
              <motion.h1
                variants={textVariants}
                className="text-xl font-semibold text-[rebeccapurple]/70"
              >
                فوق تخصص جراحی پلاستیک، زیبایی و ترمیمی
              </motion.h1>
            </motion.div>
          </article>
          <article className="relative row-span-7">
            <figure className="relative flex h-full w-full flex-col">
              <Image
                fill
                src={HeroImage.src}
                alt=""
                className="z-[1] w-fit object-contain px-10"
              />
              <div className="z-2 mt-auto mb-16 opacity-90">
                <DiseaseCarousel diseases={diseases} autoPlayInterval={3000} />
              </div>
            </figure>
          </article>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Team video section — unchanged from your original, real `fixed` masks,
// its own 400vh scroll track. Lives OUTSIDE the pinned/scaled hero, so
// `position: fixed` resolves against the real viewport as intended.
// ---------------------------------------------------------------------------

type TeamMember = { alt: string; src: string }

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

type VideoConfig = {
  src: string
  clip: string
  align: 'justify-start' | 'justify-center' | 'justify-end'
}

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

function VideoMask({ src, clip, align }: VideoConfig) {
  return (
    <div
      className="relative h-[22rem] w-[min(22rem,86vw)] bg-white/50 dark:bg-black/50 md:h-[28rem] md:w-96"
      style={{ clipPath: clip }}
    >
      <div className="fixed inset-0 z-0">
        <div className="mx-auto h-full w-full max-w-[80rem] px-5 md:px-10">
          <div className={`flex h-full items-stretch ${align}`}>
            <div className="relative w-[min(25rem,92vw)]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                autoPlay
                muted
                loop
                crossOrigin="anonymous"
                src={src}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamScrollVideos() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [relY, setRelY] = useState<number>(0)
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: 1024,
    h: 800,
  })

  useEffect(() => {
    let raf = 0

    const update = (): void => {
      const el = sectionRef.current
      if (!el) return
      const sectionTop = el.getBoundingClientRect().top + window.scrollY
      setRelY(window.scrollY - sectionTop)
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    }

    const onScroll = (): void => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const memberCount: number = TEAM.length
  const animationProgress: number = Math.min(Math.max(relY / 500, 0), 1)
  const targetRadius: number = Math.max(
    280,
    (memberCount * 110) / (2 * Math.PI) + 40,
  )
  const expandRadius: number = animationProgress * targetRadius
  const photoOpacity: number = Math.min(animationProgress * 2, 1)
  const circleScale: number = Math.min(1, viewport.w / 780, viewport.h / 780)

  return (
    <div
      ref={sectionRef}
      className="relative min-h-[400vh] overflow-x-clip bg-white dark:bg-black"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="mx-auto h-full max-w-[80rem] px-5 py-14 md:px-10 md:py-20">
          <div className="grid h-full grid-rows-3">
            {VIDEOS.map((video, idx) => (
              <div key={idx} className={`flex items-center ${video.align}`}>
                <VideoMask {...video} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 flex h-screen items-center justify-center p-8">
        <div style={{ transform: `scale(${circleScale})` }}>
          <div
            className={`flex h-[600px] w-[600px] items-center justify-center rounded-full transition-all duration-500 ${
              relY > 300 ? 'border-2 border-[#e9e9e9] dark:border-gray-700' : ''
            }`}
          >
            <div
              className={`relative flex h-[500px] w-[500px] items-center justify-center rounded-full transition-all duration-500 ${
                relY > 100
                  ? 'border-2 border-blue-100 dark:border-blue-800'
                  : ''
              }`}
            >
              <div className="relative flex h-[400px] w-[400px] items-center justify-center rounded-full border-2 border-[#e9e9e9] dark:border-gray-700">
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/40 bg-white/25 backdrop-blur-xl dark:border-white/10 dark:bg-black/25">
                  {TEAM.map((member, idx) => {
                    const angle: number = (idx * 2 * Math.PI) / memberCount
                    return (
                      <div
                        key={member.alt}
                        className="absolute z-0 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg transition-transform duration-300 ease-out dark:border-gray-800"
                        style={{
                          transform: `translate(${expandRadius * Math.cos(angle)}px, ${
                            expandRadius * Math.sin(angle)
                          }px)`,
                          opacity: photoOpacity,
                        }}
                      >
                        <img
                          src={member.src}
                          alt={member.alt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )
                  })}

                  <div
                    className={`relative z-20 flex flex-col items-center justify-center transition-opacity duration-500 ${
                      relY > 250 ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <h1 className="mb-2 text-center text-4xl font-bold text-gray-800 drop-shadow-sm dark:text-white">
                      Empowering
                    </h1>
                    <h1 className="mb-4 text-center text-4xl font-bold text-gray-800 drop-shadow-sm dark:text-white">
                      Every User
                    </h1>
                    <p className="max-w-xs text-center text-gray-600 dark:text-gray-300">
                      From entrepreneurs to educators, Gen AI provides tools to
                      simplify work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HeroZoom — hero zoom-out, then straight into the real fixed-video section
// ---------------------------------------------------------------------------

const HeroZoom = () => {
  const lenisRef = useRef<LenisRef | null>(null)

  return (
    <ReactLenis root ref={lenisRef}>
      <div className="relative">
        <HeroPanel />
        <TeamScrollVideos />
        <section className="outro relative flex h-svh w-full items-center justify-center overflow-hidden p-8 text-center">
          <h1 className="text-3xl">End of view</h1>
        </section>
      </div>
    </ReactLenis>
  )
}

export default HeroZoom
