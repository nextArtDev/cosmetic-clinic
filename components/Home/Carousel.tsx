'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

export interface Section {
  id: string
  title: string
  description?: string
  image: string
  href: string
}

export const sectionsData: Section[] = [
  {
    id: '1',
    title: 'ابدومینوپلاستی',
    description: 'جراحی شکم',
    image: '/images/a/Abdiminoplasty.webp',
    href: '/',
  },
  {
    id: '2',
    title: 'بلفاپلاستی',
    description: 'لیفت ابرو',
    image: '/images/a/belfa-1.webp',
    href: '/',
  },
  {
    id: '3',
    title: 'لیفت بدن',
    image: '/images/a/body-countoring.webp',
    href: '/',
  },
  {
    id: '4',
    title: 'لیفت سینه',
    image: '/images/a/breast-lift.webp',
    href: '/',
  },
  {
    id: '5',
    title: 'لیفت ابرو',
    image: '/images/a/bro-lift.webp',
    href: '/',
  },
  {
    id: '6',
    title: 'لیپوساکشن غبغب',
    image: '/images/a/chin-implant.webp',
    href: '/',
  },
  {
    id: '7',
    title: 'لیفت صورت',
    image: '/images/a/face-lift.webp',
    href: '/',
  },
  {
    id: '8',
    title: 'لیپوساکشن',
    image: '/images/a/liposuction.webp',
    href: '/',
  },
  {
    id: '9',
    title: 'جراحی بینی',
    image: '/images/a/rhino.webp',
    href: '/',
  },
  {
    id: '10',
    title: 'پروتز سینه',
    image: '/images/a/breast.webp',
    href: '/',
  },
  {
    id: '11',
    title: 'تزریق ژل',
    image: '/images/a/injectables.webp',
    href: '/',
  },
]

gsap.registerPlugin(useGSAP, ScrollTrigger)

export const ScrollShowcase = () => {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const container = containerRef.current
      if (!container) return

      const mm = gsap.matchMedia()

      const setup = (isMobile: boolean) => {
        const textSections = Array.from(
          container.querySelectorAll<HTMLElement>('.text-section'),
        )

        const imageClusters = Array.from(
          container.querySelectorAll<HTMLElement>('.image-cluster'),
        )

        const totalSlides = Math.min(
          sectionsData.length,
          textSections.length,
          imageClusters.length,
        )

        if (!totalSlides) return

        const firstText = textSections[0]
        const firstCluster = imageClusters[0]

        if (!firstText || !firstCluster) return

        const enterRotation = isMobile ? 4 : 12
        const enterX = isMobile ? 20 : 70
        const enterY = isMobile ? -24 : -60

        const exitRotation = isMobile ? -4 : -12
        const exitX = isMobile ? -20 : -70
        const exitY = isMobile ? 24 : 60

        const textY = isMobile ? 16 : 28
        const textDuration = isMobile ? 0.35 : 0.5
        const imageDuration = isMobile ? 0.7 : 0.9

        gsap.set(firstText, { autoAlpha: 1, y: 0 })
        gsap.set(firstCluster, { autoAlpha: 1, rotation: 0, x: 0, y: 0 })

        gsap.set(textSections.slice(1, totalSlides), { autoAlpha: 0, y: textY })
        gsap.set(imageClusters.slice(1, totalSlides), {
          autoAlpha: 0,
          rotation: enterRotation,
          x: enterX,
          y: enterY,
        })

        const scrollPerSlide = isMobile ? 75 : 85
        const scrollDistance = Math.max(totalSlides - 1, 1) * scrollPerSlide
        const snapTo = totalSlides > 1 ? 1 / (totalSlides - 1) : 1

        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: `+=${scrollDistance}%`,
            pin: true,
            scrub: 0.15,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo,
              duration: { min: 0.12, max: 0.35 },
              delay: 0,
              ease: 'power3.inOut',
            },
          },
        })

        for (let index = 1; index < totalSlides; index++) {
          const prevText = textSections[index - 1]
          const prevCluster = imageClusters[index - 1]
          const currentText = textSections[index]
          const currentCluster = imageClusters[index]

          if (!prevText || !prevCluster || !currentText || !currentCluster) {
            continue
          }

          const label = `slide-${index}`
          masterTl.add(label)

          masterTl.to(
            prevText,
            {
              autoAlpha: 0,
              y: -textY,
              duration: textDuration,
              ease: 'power1.out',
            },
            label,
          )

          masterTl.to(
            prevCluster,
            {
              autoAlpha: 0,
              rotation: exitRotation,
              x: exitX,
              y: exitY,
              duration: imageDuration,
              ease: 'power1.inOut',
            },
            label,
          )

          masterTl.to(
            currentText,
            {
              autoAlpha: 1,
              y: 0,
              duration: textDuration,
              ease: 'power1.out',
            },
            `${label}+=0.2`,
          )

          masterTl.to(
            currentCluster,
            {
              autoAlpha: 1,
              rotation: 0,
              x: 0,
              y: 0,
              duration: imageDuration,
              ease: 'power1.inOut',
            },
            label,
          )
        }
      }

      mm.add('(max-width: 767px)', () => setup(true))
      mm.add('(min-width: 768px)', () => setup(false))

      return () => {
        mm.revert()
      }
    },
    { scope: containerRef },
  )

  return (
    <section
      ref={containerRef}
      dir="rtl"
      className="relative h-screen w-full overflow-hidden bg-black font-sans text-white select-none"
      style={{ height: '100svh' }}
    >
      <div className="absolute inset-0">
        {sectionsData.map((section, index) => {
          const isFirst = index === 0

          return (
            <article
              key={section.id}
              className="absolute inset-0 overflow-hidden"
            >
              <div
                className={`image-cluster absolute inset-0 will-change-transform ${
                  !isFirst ? 'invisible opacity-0' : ''
                }`}
              >
                <img
                  src={section.image}
                  alt={section.title}
                  loading={isFirst ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>

              <div
                className={`text-section absolute inset-0 z-10 flex flex-col items-center justify-end ${
                  !isFirst ? 'invisible opacity-0' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:bg-gradient-to-l md:from-black/85 md:via-black/40 md:to-transparent" />

                <div className="relative flex w-full flex-col items-center px-4 pb-[max(4rem,env(safe-area-inset-bottom))] text-center md:items-end md:justify-center md:px-12 md:text-right">
                  <div className="mb-3 md:mb-4">
                    <span className="inline-block rounded-full border border-white/20 bg-black/50 px-4 py-1.5 text-[10px] font-bold tracking-wider text-rose-400 backdrop-blur-md md:text-xs">
                      {section.title}
                    </span>
                  </div>

                  <h2 className="mb-5 max-w-[18rem] text-2xl font-bold leading-tight drop-shadow-lg md:mb-6 md:max-w-md md:text-4xl lg:text-5xl">
                    {section.description || section.title}
                  </h2>

                  {section.href && (
                    <a
                      href={section.href}
                      aria-label={`مشاهده ${section.title}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0 md:text-sm"
                    >
                      مشاهده
                    </a>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
