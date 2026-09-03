'use client'

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

// Mock imports - replace with your actual imports
// import { MAIN_BODY, FACE_B, FACE_A, ... } from '@/path/to/images'

// Your data type
type SurgerySlide = {
  id: string
  menuSide: 'left' | 'right'
  title: string
  subtitle: string
  beforeImage?: string
  afterImage?: string
  imageSrc?: string
  panelClassName?: string
  lines?: { x1: number; y1: number; x2: number; y2: number; origin: string }[]
  dots?: { x: number; y: number }[]
  shield: {
    left: number
    top: number
    width: number
    height: number
    radius: number
  }
}

const SLIDES: SurgerySlide[] = [
  // Paste your SLIDES array here...
  {
    id: 'brow',
    menuSide: 'left',
    title: 'اکتیو ابرو',
    subtitle: 'لیفت پیشانی',
    shield: { left: 25, top: 12, width: 20, height: 1, radius: 1 },
  },
  {
    id: 'lipo',
    menuSide: 'right',
    title: 'لیپوساکشن',
    subtitle: 'فرم‌دهی اندام',
    shield: { left: 18.5, top: 55, width: 78, height: 10, radius: 4 },
  },
  {
    id: 'bleph',
    menuSide: 'left',
    title: 'بلفاروپلاستی',
    subtitle: 'جراحی پلک',
    // beforeImage: FACE_B,
    // afterImage: FACE_A,
    // panelClassName: 'left-[48%] top-[48%]',
    // lines: [{ x1: 40, y1: 58, x2: 60, y2: 58, origin: 'right' }],
    // dots: [{ x: 60, y: 58 }],
    shield: { left: 65, top: 8, width: 35, height: 15.5, radius: 3.4 },
  },
  {
    id: 'abdo',
    menuSide: 'right',
    title: 'ابدومینوپلاستی',
    subtitle: 'لیفت شکم',
    // imageSrc: MAIN_BODY,
    // beforeImage: ABDO_B,
    // afterImage: ABDO_A,
    // panelClassName: 'left-[38%] top-[45%]',
    shield: { left: 55, top: 40, width: 72, height: 30, radius: 6.9 },
  },
  {
    id: 'submental',
    menuSide: 'left',
    title: 'لیپوساکشن زیر چانه',
    subtitle: 'از بین بردن غبغب',
    // beforeImage: FACE_B,
    // afterImage: FACE_A,
    // panelClassName: 'left-[38%] top-[63%]',
    shield: { left: 50, top: 25, width: 50, height: 20, radius: 4.7 },
  },
  {
    id: 'breast',
    menuSide: 'right',
    title: 'بزرگ‌سازی سینه',
    subtitle: 'پروتز سینه',
    // imageSrc: MAIN_BODY,
    // beforeImage: BREAST_B,
    // afterImage: BREAST_A,
    // panelClassName: 'left-[35%] top-[28%]',
    shield: { left: -10, top: 39, width: 80, height: 28, radius: 6.3 },
  },
  {
    id: 'rhino',
    menuSide: 'left',
    title: 'رینوپلاستی',
    subtitle: 'جراحی بینی',
    // beforeImage: FACE_B,
    // afterImage: FACE_A,
    // panelClassName: 'left-[35%] top-[35%]',
    shield: { left: 38, top: 4.5, width: 27, height: 1, radius: 1 },
  },
  {
    id: 'mammo',
    menuSide: 'right',
    title: 'ماستوپکسی',
    subtitle: 'لیفت و کوچک‌سازی سینه',
    // imageSrc: MAIN_BODY,
    // beforeImage: BREAST_B,
    // afterImage: BREAST_A,
    // panelClassName: 'left-[34%] top-[25%]',
    shield: { left: 20, top: 46, width: 80, height: 28, radius: 6.3 },
  },
  {
    id: 'face',
    menuSide: 'right',
    title: 'فیس‌لیفت',
    subtitle: 'لیفت صورت',
    // beforeImage: FACE_B,
    // afterImage: FACE_A,
    // panelClassName: 'left-[34%] top-[5%]',
    shield: { left: 35, top: 16, width: 80, height: 80, radius: 5.3 },
  },
  {
    id: 'chin',
    menuSide: 'left',
    title: 'چانه و گونه',
    subtitle: 'پروتز · فرم‌دهی',
    // beforeImage: FACE_B,
    // afterImage: FACE_A,
    // panelClassName: 'left-[38%] top-[63%]',
    shield: { left: 13, top: 25, width: 50, height: 20, radius: 4.7 },
  },
]

const MorfingFloating = () => {
  const featureRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  gsap.registerPlugin(ScrollTrigger, useGSAP)

  // Derive starting positions dynamically from the SLIDES data
  const featureStartPosition = SLIDES.map((slide) => ({
    top: slide.shield.top,
    left: slide.shield.left + slide.shield.width / 2, // Center the dot on the shield
  }))

  useGSAP(() => {
    if (!featureRef.current || !wrapperRef.current) return

    const features = featureRef.current.querySelectorAll('.feature')
    const featureBg = featureRef.current.querySelectorAll('.feature-bg')

    // Set initial positions dynamically
    features.forEach((feature, index) => {
      if (index < featureStartPosition.length) {
        const featurePos = featureStartPosition[index]
        gsap.set(feature, {
          top: `${featurePos.top}%`,
          left: `${featurePos.left}%`,
        })
      }
    })

    // Store initial dimensions
    const featureStartDimensions: Array<{ width: number; height: number }> = []
    featureBg.forEach((bg) => {
      const rec = bg.getBoundingClientRect()
      featureStartDimensions.push({
        width: rec.width,
        height: rec.height,
      })
    })

    const remInPixel = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    const targetWidth = 3 * remInPixel
    const targetHeight = 3 * remInPixel

    const getSearchBarFinalWidth = () => (window.innerWidth < 1000 ? 20 : 25)
    let searchBarFinalWidth = getSearchBarFinalWidth()

    const handleResize = () => {
      searchBarFinalWidth = getSearchBarFinalWidth()
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', handleResize)

    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top middle',
      end: `+=${window.innerHeight * 3}`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const { progress } = self

        // Spotlight header animation (0 - 0.3333)
        if (progress <= 0.3333) {
          gsap.set('.spotlight-content', {
            y: `${-100 * (progress / 0.3333)}%`,
          })
        } else {
          gsap.set('.spotlight-content', { y: '-100%' })
        }

        // Feature movement and morphing (0 - 0.5)
        if (progress >= 0 && progress <= 0.5) {
          const featureProgress = progress / 0.5

          features.forEach((feature, index) => {
            if (index < featureStartPosition.length) {
              const original = featureStartPosition[index]
              const currentTop =
                original.top + (50 - original.top) * featureProgress
              const currentLeft =
                original.left + (50 - original.left) * featureProgress

              gsap.set(feature, {
                top: `${currentTop}%`,
                left: `${currentLeft}%`,
              })
            }
          })

          featureBg.forEach((bg, index) => {
            if (index < featureStartDimensions.length) {
              const featureDim = featureStartDimensions[index]
              const currentWidth =
                featureDim.width +
                (targetWidth - featureDim.width) * featureProgress
              const currentHeight =
                featureDim.height +
                (targetHeight - featureDim.height) * featureProgress
              const currentBorderRadius = 0.5 + (25 - 0.5) * featureProgress
              const currentBorderWidth =
                0.125 + (0.35 - 0.125) * featureProgress

              gsap.set(bg, {
                width: `${currentWidth}px`,
                height: `${currentHeight}px`,
                borderRadius: `${currentBorderRadius}px`,
                borderWidth: `${currentBorderWidth}rem`,
              })
            }
          })

          gsap.set('.feature-text', { opacity: 1 - featureProgress })
        } else if (progress > 0.5) {
          gsap.set('.feature-text', { opacity: 0 })
        }

        // Hide features after merging (0.5+)
        gsap.set('.feature', { opacity: progress >= 0.5 ? 0 : 1 })

        // Show search bar (0.5+)
        gsap.set('.search-bar', { opacity: progress >= 0.5 ? 1 : 0 })

        if (progress >= 0.5 && progress <= 0.75) {
          const searchBarProgress = (progress - 0.5) / 0.25
          const width = 3 + (searchBarFinalWidth - 3) * searchBarProgress
          const height = 3 + (5 - 3) * searchBarProgress
          const translateY = -50 + (0 - -50) * searchBarProgress

          gsap.set('.search-bar', {
            width: `${width}rem`,
            height: `${height}rem`,
            y: `${translateY}%`,
          })
          gsap.set('.search-bar p', { opacity: 0 })
        } else if (progress > 0.75) {
          gsap.set('.search-bar', {
            width: `${searchBarFinalWidth}rem`,
            height: `5rem`,
            y: '0%',
          })
        }

        if (progress > 0.75) {
          const finalHeaderProgress = (progress - 0.75) / 0.25
          gsap.set('.search-bar p', { opacity: finalHeaderProgress })
        } else {
          gsap.set('.search-bar p', { opacity: 0 })
        }
      },
    })

    return () => {
      // Kill ONLY this component's triggers — ScrollTrigger.getAll() would
      // also murder every other ScrollTrigger on the page (e.g. the layout's
      // CinematicFooter reveal), leaving them frozen at their from-state.
      // useGSAP's context revert already cleans up the trigger created above.
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative w-full  bg-[oklch(13%_0.011_35)] bg-[radial-gradient(90%_70%_at_50%_28%,oklch(21%_0.03_50)_0%,oklch(15%_0.012_44)_70%)] ">
      {/* This wrapper handles the Pinned ScrollTrigger */}
      <div
        ref={wrapperRef}
        className="relative h-svh w-full overflow-hidden flex items-center justify-center   "
      >
        <div className="spotlight-content absolute inset-0  flex flex-col items-center justify-end text-center z-1 pointer-events-none  pb-[20%] mix-blend-luminosity">
          <h1 className="text-5xl font-bold mb-4 ">تخصص ما، زیبایی شماست</h1>
          <h2 className="text-3xl"> جراحی پلاستیک، زیبایی و ترمیمی</h2>
        </div>

        {/* RESPONSIVE BODY CONTAINER 
            Using aspect-[2/3] forces the box to maintain the exact proportions of your body image.
            The max-h-full ensures it doesn't overflow vertically on wide screens.
        */}
        <div className="relative h-full aspect-3/5 max-h-full ">
          {/* Body Background */}
          <img
            src="/images/full-body3.png"
            alt="بدن انسان"
            className="w-full h-full object-contain pt-6"
          />

          {/* Features Layer */}
          <div ref={featureRef} className="absolute inset-0 w-full h-full z-10">
            {SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="feature absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div>
                  <div className="feature-bg text-red-500 relative border-2 border-blue-500 bg-white/10 backdrop-blur-sm p-2 rounded-lg overflow-hidden">
                    <div className="feature-text">
                      <h3 className="text-lg font-semibold mb-2 whitespace-nowrap">
                        {slide.title}
                      </h3>
                      {/* <p className="text-xs opacity-80 whitespace-nowrap">
                        {slide.subtitle}
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar & Header Content */}
          <div className="search-bar absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0   border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg z-30">
            <p className="text-red-700 text-4xl font-bold">رزرو نوبت</p>
          </div>
          {/* 
          <div className="header-content absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 text-center z-30">
            <h2 className="text-4xl font-bold">Final Header</h2>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default MorfingFloating
