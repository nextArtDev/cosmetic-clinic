'use client'

import React, { useRef, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// Register plugins (handled once)
gsap.registerPlugin(useGSAP, ScrollTrigger)

interface SlideData {
  title: string
  tags: string[]
  accent: string
  link: string
  img: string
}

const settings = {
  smoothness: 0.05,
  bufferSlides: 3,
  imageShift: 25,
  copyShift: 15,
  titleHold: 0.1,
  imageZoom: 1.25,
  revealOverlap: 0.5,
}

const slides: SlideData[] = [
  {
    title: 'Studioform',
    tags: ['Design', 'Development', 'Motion'],
    accent: '#a9d0f5',
    link: '#',
    img: '/images/b-a/nim-1.png',
  },
  {
    title: 'Nightboolean',
    tags: ['Branding', 'UI/UX', 'Strategy'],
    accent: '#f5a97a',
    link: '#',
    img: '/images/b-a/nim-1.png',
  },
  {
    title: 'Stillpose',
    tags: ['Photography', 'Art Direction', 'Web'],
    accent: '#b7e0a0',
    link: '#',
    img: '/images/b-a/main-b.png',
  },
]

type ColumnKey = 'left' | 'right'

const ScrollSlider: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Ref to hold scroll target for smoothing
  const scrollTargetRef = useRef(1)

  // Setup Keyboard Navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const isInView = rect.top <= window.innerHeight && rect.bottom >= 0

      if (isInView) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault()
          window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' })
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault()
          window.scrollBy({
            top: -window.innerHeight * 0.5,
            behavior: 'smooth',
          })
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useGSAP(
    () => {
      if (!containerRef.current || !leftRef.current || !rightRef.current) return

      let scrollPosition = 1
      let animationId: number | null = null

      const columns: Record<
        ColumnKey,
        { el: HTMLDivElement; visibleSlides: Map<number, HTMLDivElement> }
      > = {
        left: { el: leftRef.current, visibleSlides: new Map() },
        right: { el: rightRef.current, visibleSlides: new Map() },
      }

      const createSlide = (side: ColumnKey, index: number) => {
        const slideIndex =
          ((index % slides.length) + slides.length) % slides.length
        const data = slides[slideIndex]

        const el = document.createElement('div')
        el.className =
          'absolute inset-0 overflow-hidden will-change-[clip-path]'
        el.style.zIndex = `${index}`
        el.style.backgroundColor = data.accent

        // Image
        const img = document.createElement('img')
        img.src = data.img
        img.alt = data.title
        img.loading = 'lazy'
        img.className = 'w-full h-full object-cover block will-change-transform'
        el.appendChild(img)

        // Overlay
        const overlay = document.createElement('div')
        overlay.className =
          'absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 pointer-events-none'
        el.appendChild(overlay)

        // Copy Container
        const copy = document.createElement('div')
        copy.className =
          'absolute bottom-[10%] left-0 w-full flex flex-col items-center justify-end text-center pointer-events-none will-change-transform px-[4%] z-[2]'
        copy.style.color = data.accent

        // Tags
        const tags = document.createElement('div')
        tags.className =
          'flex gap-6 text-xs font-semibold tracking-[0.15em] uppercase mb-6 opacity-90 [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]'
        // Safe to use innerHTML here as it's mapping static, trusted array data
        tags.innerHTML = data.tags
          .map((t) => `<span>${t}</span>`)
          .join('<span class="opacity-60 mx-2">•</span>')
        copy.appendChild(tags)

        // Title
        const title = document.createElement('h2')
        title.className =
          'text-[clamp(2.5rem,8vw,7rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.9] m-0 mb-8 [text-shadow:0_4px_30px_rgba(0,0,0,0.6)]'
        title.innerText = data.title
        copy.appendChild(title)

        // Link
        const link = document.createElement('a')
        link.href = data.link
        link.className =
          'no-underline uppercase text-sm font-bold tracking-[0.1em] pointer-events-auto cursor-pointer border-b-2 pb-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:opacity-80 hover:-translate-y-0.5'
        link.style.color = data.accent
        link.style.borderColor = data.accent
        link.innerText = 'View Full Project'

        link.addEventListener('click', (e) => {
          if (data.link === '#') e.preventDefault()
        })

        copy.appendChild(link)
        el.appendChild(copy)

        columns[side].el.appendChild(el)
        columns[side].visibleSlides.set(index, el)
      }

      const getRevealShape = (side: ColumnKey, revealAmount: number) => {
        const d =
          Math.max(0, Math.min(1, revealAmount)) *
          (100 + settings.revealOverlap)
        return side === 'left'
          ? `polygon(0% ${100 - d}%, 100% ${100 - d}%, 100% 100%, 0% 100%)`
          : `polygon(0% 0%, 100% 0%, 100% ${d}%, 0% ${d}%)`
      }

      const getTitlePosition = (slideProgress: number) => {
        const fromCenter = slideProgress - 1
        const past = Math.abs(fromCenter) - settings.titleHold
        if (past <= 0) return 1
        const t = past / (1 - settings.titleHold)
        return 1 + Math.sign(fromCenter) * t * t * (3 - 2 * t)
      }

      const updateSlider = () => {
        const first = Math.floor(scrollPosition) - settings.bufferSlides
        const last = Math.floor(scrollPosition) + settings.bufferSlides
        const sides: ColumnKey[] = ['left', 'right']

        for (const side of sides) {
          const { visibleSlides } = columns[side]
          const driftDirection = side === 'left' ? 1 : -1

          for (let i = first; i <= last; i++) {
            if (!visibleSlides.has(i)) {
              createSlide(side, i)
            }
          }

          for (const [index, el] of visibleSlides) {
            if (index < first || index > last) {
              el.remove()
              visibleSlides.delete(index)
              continue
            }

            const revealAmount = scrollPosition - index
            const slideProgress = Math.max(0, Math.min(2, revealAmount))

            el.style.clipPath = getRevealShape(side, revealAmount)

            const imageDrift =
              (1 - slideProgress) * settings.imageShift * driftDirection
            const imgEl = el.querySelector('img')
            if (imgEl) {
              imgEl.style.transform = `translateY(${imageDrift}%) scale(${settings.imageZoom})`
            }

            const titleDrift =
              (1 - getTitlePosition(slideProgress)) *
              settings.copyShift *
              driftDirection
            const copyEl = el.querySelector(
              'div:nth-child(3)',
            ) as HTMLElement | null // Selects the copy div safely
            if (copyEl) {
              copyEl.style.transform = `translateY(${titleDrift}px)`
            }
          }
        }
      }

      const animateSlider = () => {
        scrollPosition +=
          (scrollTargetRef.current - scrollPosition) * settings.smoothness
        updateSlider()
        animationId = requestAnimationFrame(animateSlider)
      }

      // Map native scroll to virtual scroll target
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          // Cycles 2 times the length of slides over the scroll distance
          scrollTargetRef.current = 1 + self.progress * slides.length * 2

          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${self.progress})`
          }
        },
        onLeave: () => cancelAnimationFrame(animationId!),
        onEnterBack: () => animateSlider(),
      })

      animateSlider()

      return () => {
        st.kill()
        if (animationId !== null) {
          cancelAnimationFrame(animationId)
        }
      }
    },
    { scope: containerRef },
  )

  return (
    // Outer container defines the scroll distance. 300vh means you scroll 2 screen heights while it's pinned.
    <section ref={containerRef} className="relative w-full h-[300vh] bg-black">
      {/* Inner container that actually pins to the top */}
      <div
        ref={sliderRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex"
      >
        <div
          ref={leftRef}
          className="flex-1 relative h-full overflow-hidden bg-black"
        />
        <div
          ref={rightRef}
          className="flex-1 relative h-full overflow-hidden bg-black"
        />

        {/* UI Overlays */}
        <div className="absolute top-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-center z-50 pointer-events-none mix-blend-difference text-white">
          <div className="font-bold tracking-[0.2em] text-xs md:text-sm">
            PORTFOLIO
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 py-8 flex justify-between items-end z-50 pointer-events-none mix-blend-difference text-white">
          <div className="flex items-center gap-4 text-[0.65rem] md:text-xs uppercase tracking-[0.1em] opacity-80">
            <span>Scroll to Explore</span>
            <div className="w-10 h-px bg-current animate-[pulse_2s_infinite_ease-in-out]"></div>
          </div>
          <div className="w-32 md:w-48 h-px bg-white/20 overflow-hidden">
            <div
              ref={progressRef}
              className="w-full h-full bg-current origin-left scale-x-0"
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScrollSlider
