'use client'

import { useEffect, useRef, useState } from 'react'
import doctor1 from '../../public/images/doctors/1.jpeg'
import doctor2 from '../../public/images/doctors/2.jpeg'
import doctor3 from '../../public/images/doctors/3.jpg'
import doctor4 from '../../public/images/doctors/4.jpeg'
import doctor5 from '../../public/images/doctors/5.jpeg'
import { StaticImageData } from 'next/image'

type TeamMember = {
  id: string
  name: string
  role: string
  profile: StaticImageData
}

type VideoConfig = {
  src: string
  clip: string
  align: 'justify-start' | 'justify-center' | 'justify-end'
}

type VideoMaskProps = {
  src: string
  clip: string
  align: VideoConfig['align']
}

// const TEAM: TeamMember[] = [
//   {
//     alt: 'Profile 1',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/103a4a8da-344c-4fcd-b588-00302b16d8c3.png',
//   },
//   {
//     alt: 'Profile 2',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1c8b64082-40da-41cc-b68e-d0b2f3e50641.png',
//   },
//   {
//     alt: 'Profile 3',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1cb27e14d-99ac-41ff-98a7-516b85e7314c.png',
//   },
//   {
//     alt: 'Profile 4',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/171fa5f30-5da2-465a-abac-32e6f48901a5.png',
//   },
//   {
//     alt: 'Profile 5',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1a151d5fb-d445-4b2e-8508-b3f08ab8ae40.png',
//   },
//   {
//     alt: 'Profile 6',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/17f181797-8e67-46b5-a655-d0eaa0f5fddd.png',
//   },
//   {
//     alt: 'Profile 7',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/1c69caca2-f270-4be6-b64b-25ad0f2ba0ce.png',
//   },
//   {
//     alt: 'Profile 8',
//     src: 'https://image.qwenlm.ai/public_source/d306d6a7-4fca-4104-90e9-1f8e1cfdadee/18a5fb232-ca74-401d-99ce-dcc99dd405f3.png',
//   },
// ]

const TEAM: TeamMember[] = [
  { id: '1', name: 'لیلا حسینی', role: 'دستیار', profile: doctor1 },
  { id: '2', name: 'محسن احمدی', role: 'منشی', profile: doctor3 },
  { id: '3', name: 'زهره محمدی', role: 'دستیار', profile: doctor2 },
  { id: '4', name: 'یوسف خوشنام', role: 'دستیار', profile: doctor5 },
  { id: '5', name: 'شبنم رمضانی', role: 'دستیار', profile: doctor4 },
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

function VideoMask({ src, clip, align }: VideoMaskProps) {
  return (
    <div
      className="relative h-[22rem] w-[min(22rem,86vw)] bg-white/50 dark:bg-black/50 md:h-[28rem] md:w-96"
      style={{ clipPath: clip }}
    >
      {/* Fixed strip mirrors the scrolling container's geometry (same max-width / padding / alignment)
          so the video stays aligned with its mask on every screen size, incl. large screens */}
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

export default function TeamScrollVideos() {
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

  // Radius adapts to team size: more members → wider ring so cards never overlap
  const targetRadius: number = Math.max(
    280,
    (memberCount * 110) / (2 * Math.PI) + 40,
  )
  const expandRadius: number = animationProgress * targetRadius

  // Center is empty until the pictures fly out (no stacked photo at start)
  const photoOpacity: number = Math.min(animationProgress * 2, 1)

  // Fluid scale for the whole circle system — fits both narrow and short screens
  const circleScale: number = Math.min(1, viewport.w / 780, viewport.h / 780)

  return (
    <div
      ref={sectionRef}
      className="relative min-h-[400vh] overflow-x-clip bg-white dark:bg-black"
    >
      {/* ── Fixed responsive videos — background layer (z-0), passes behind the circle center ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="mx-auto h-full max-w-[80rem] px-5 py-14 md:px-10 md:py-20">
          <div className="grid h-full grid-rows-3">
            {VIDEOS.map((video, idx) => (
              <div key={idx} className={`flex items-center ${video.align}`}>
                <VideoMask
                  src={video.src}
                  clip={video.clip}
                  align={video.align}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky expanding team circle — foreground layer (z-10) ── */}
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
                {/* Glass center — video passes visibly behind the text */}
                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-white/40 bg-white/25 backdrop-blur-xl dark:border-white/10 dark:bg-black/25">
                  {TEAM.map((member, idx) => {
                    const angle: number = (idx * 2 * Math.PI) / memberCount
                    return (
                      <div
                        key={member.id}
                        className="absolute z-0 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg transition-transform duration-300 ease-out dark:border-gray-800"
                        style={{
                          transform: `translate(${expandRadius * Math.cos(angle)}px, ${
                            expandRadius * Math.sin(angle)
                          }px)`,
                          opacity: photoOpacity,
                        }}
                      >
                        <img
                          src={member.profile.src}
                          alt={member.name}
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
