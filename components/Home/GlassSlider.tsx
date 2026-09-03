'use client'

import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, useGSAP)

export interface GlassSliderItem {
  id: string
  title: string
  description?: string
  image: string
  href: string
}

export interface GlassSliderProps {
  items: GlassSliderItem[]
  className?: string
}

const GlassSlider: React.FC<GlassSliderProps> = ({ items, className }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const tl = useRef<gsap.core.Timeline | null>(null)

  const numItems = items.length
  const itemStep = numItems > 0 ? 1 / numItems : 1
  const wrapTracker = gsap.utils.wrap(0, numItems)

  const activeItem = items[activeIndex] ?? items[0]

  useGSAP(
    () => {
      if (!wrapperRef.current || !svgRef.current || !containerRef.current)
        return
      if (numItems === 0) return

      let circlePath =
        svgRef.current.querySelector<SVGPathElement>('#circlePath')
      if (!circlePath) {
        circlePath = MotionPathPlugin.convertToPath(
          '#holder',
          false,
        )[0] as SVGPathElement
        circlePath.id = 'circlePath'
        svgRef.current.prepend(circlePath)
      }

      const itemElements = gsap.utils.toArray<HTMLElement>(
        '.carousel-item',
        wrapperRef.current,
      )

      const positionItems = () => {
        gsap.set(itemElements, {
          motionPath: {
            path: circlePath,
            align: circlePath,
            alignOrigin: [0.5, 0.5],
            end: (i: number) => i / numItems,
          },
          scale: 0.9,
        })
      }
      positionItems()

      const ro = new ResizeObserver(positionItems)
      ro.observe(wrapperRef.current)

      tl.current = gsap
        .timeline({ paused: true })
        .to(
          wrapperRef.current,
          {
            rotation: 360,
            transformOrigin: 'center',
            duration: 1,
            ease: 'none',
          },
          0,
        )
        .to(
          itemElements,
          {
            rotation: '-=360',
            transformOrigin: 'center',
            duration: 1,
            ease: 'none',
          },
          0,
        )

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=2000',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        snap: { snapTo: itemStep, duration: 0.3 },
        onUpdate: (self) => {
          if (!tl.current) return
          tl.current.progress(self.progress)
          const newIndex = wrapTracker(Math.round(self.progress / itemStep))
          setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev))
        },
      })

      return () => {
        st.kill()
        ro.disconnect()
        tl.current = null
      }
    },
    { scope: containerRef, dependencies: [numItems], revertOnUpdate: true },
  )

  const handleItemClick = (targetIndex: number) => {
    if (targetIndex === activeIndex || !tl.current) return

    let diff = targetIndex - activeIndex
    if (Math.abs(diff) > numItems / 2) {
      diff = diff > 0 ? diff - numItems : diff + numItems
    }

    const targetProgress = tl.current.progress() + diff / numItems

    gsap.to(tl.current, {
      progress: targetProgress,
      duration: 1,
      ease: 'power3.inOut',
      overwrite: true,
    })
  }

  if (numItems === 0) return null

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-screen w-full items-center justify-center ${className ?? ''}`}
    >
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .scanline {
          animation: scan 3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .scanline { animation: none; }
        }
      `}</style>

      {/* Ambient Luxury Glow */}
      <div className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-sky-500/10 blur-[120px]"></div>

      {/* Responsive Circle Container */}
      <div className="relative flex h-[85vmin] max-h-[500px] w-[85vmin] max-w-[500px] items-center justify-center">
        {/* Center Liquid Glass Medical Hologram */}
        <div className="pointer-events-none absolute z-10 h-[60%] w-[60%] rounded-full">
          {/* CSS Glass Layer */}
          <div className="absolute inset-0 rounded-full border border-sky-400/30 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_-2px_5px_rgba(0,0,0,0.3)] backdrop-blur-xl"></div>

          {/* SVG Liquid Noise Texture */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full rounded-full opacity-30 mix-blend-overlay">
            <defs>
              <filter id="lens-noise" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.015"
                  numOctaves="3"
                  seed="5"
                  result="turbulence"
                />
                <feSpecularLighting
                  in="turbulence"
                  surfaceScale="15"
                  specularConstant="0.8"
                  specularExponent="20"
                  lightingColor="#38bdf8"
                  result="spec"
                >
                  <feDistantLight azimuth="135" elevation="45" />
                </feSpecularLighting>
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#lens-noise)" />
          </svg>

          {/* Inner Holographic Image Area — all images stacked, crossfaded */}
          <div className="absolute inset-[15%] overflow-hidden rounded-full border border-sky-300/20 shadow-[inset_0_0_20px_rgba(56,189,248,0.2)]">
            {items.map((item, i) => (
              <Image
                key={item.id}
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 767px) 40vmin, 220px"
                quality={80}
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`absolute inset-0 object-cover mix-blend-luminosity transition-all duration-500 ease-out ${
                  i === activeIndex
                    ? 'scale-110 opacity-80'
                    : 'scale-100 opacity-0'
                }`}
              />
            ))}
            {/* Medical Blue Tint Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/30 via-transparent to-blue-900/40 mix-blend-color"></div>

            {/* Moving Scanline */}
            <div className="scanline absolute left-0 right-0 h-[2px] bg-sky-400 shadow-[0_0_10px_2px_rgba(56,189,248,0.8)]"></div>
          </div>

          {/* Center Typography + CTA */}
          <div className="absolute bottom-1/2 left-1/2 w-full -translate-x-1/2 text-center">
            <span className="mb-1 block text-[10px] font-light uppercase tracking-[0.3em] text-sky-400/70">
              خدمت
            </span>
            <span className="block text-xl font-light tracking-wider text-white md:text-2xl">
              {activeItem.title}
            </span>
            {activeItem.description && (
              <span className="mt-1 block text-xs text-white/60">
                {activeItem.description}
              </span>
            )}
          </div>

          <Link
            href={activeItem.href || '#'}
            prefetch={false}
            className="pointer-events-auto absolute left-1/2 top-[72%] -translate-x-1/2 rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-200 backdrop-blur-md transition-colors hover:bg-sky-500/25 hover:text-white"
          >
            مشاهده خدمت
          </Link>
        </div>

        {/* Carousel Items Wrapper */}
        <div ref={wrapperRef} className="absolute inset-0 h-full w-full">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.title}
              aria-current={i === activeIndex}
              className={`carousel-item group absolute flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-sm font-light tracking-widest transition-all duration-500 ease-out md:h-24 md:w-24 ${
                i === activeIndex
                  ? 'z-30 scale-110 border border-sky-400 text-white shadow-[0_0_20px_2px_rgba(56,189,248,0.7),0_0_40px_5px_rgba(56,189,248,0.3),inset_0_0_10px_2px_rgba(56,189,248,0.3)]'
                  : 'z-20 scale-90 border border-white/10 text-gray-400 hover:border-sky-400/40 hover:text-white hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]'
              }`}
              onClick={() => handleItemClick(i)}
            >
              {/* Dynamic Glass Background */}
              <div
                className={`absolute inset-0 rounded-full backdrop-blur-md transition-colors duration-500 ${
                  i === activeIndex
                    ? 'bg-sky-500/10'
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}
              ></div>

              {/* Glass Bevels */}
              <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.4)]"></div>

              {/* Label */}
              <span className="relative z-10 max-w-full truncate px-2 text-[11px] pointer-events-none">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* SVG Path Holder (Invisible) */}
        <svg
          ref={svgRef}
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        >
          <circle
            id="holder"
            className="fill-none stroke-transparent"
            cx="200"
            cy="200"
            r="150"
          />
        </svg>
      </div>
    </div>
  )
}

export default GlassSlider
