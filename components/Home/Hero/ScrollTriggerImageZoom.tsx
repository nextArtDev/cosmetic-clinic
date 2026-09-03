'use client'

import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxHeroProps {
  /** Background image URL for the hero section */
  heroImage?: string
  /** Foreground image URL that will scale on scroll */
  foregroundImage?: string
  /** Alt text for the foreground image */
  imageAlt?: string
  /** Height of the component (default: 100vh) */
  height?: string
  /** Custom content to display over the hero section */
  children?: React.ReactNode
  /** Animation duration multiplier (default: 150%) */
  scrollDistance?: string
  /** Enable debug markers (default: false) */
  showMarkers?: boolean
  /** Custom className for the wrapper */
  className?: string
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  // heroImage = 'https://images.unsplash.com/photo-1589848315097-ba7b903cc1cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // foregroundImage = 'https://assets-global.website-files.com/63ec206c5542613e2e5aa784/643312a6bc4ac122fc4e3afa_main%20home.webp',
  heroImage = 'https://images.unsplash.com/photo-1589848315097-ba7b903cc1cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  foregroundImage = 'https://assets-global.website-files.com/63ec206c5542613e2e5aa784/643312a6bc4ac122fc4e3afa_main%20home.webp',
  imageAlt = 'Parallax image',
  height = '100vh',
  children,
  scrollDistance = '+=150%',
  showMarkers = false,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const image = imageRef.current
    const hero = heroRef.current

    if (!wrapper || !image || !hero) return

    // Create timeline with ScrollTrigger
    timelineRef.current = gsap
      .timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'center center',
          end: scrollDistance,
          pin: true,

          scrub: 1.5,
          markers: showMarkers,
          anticipatePin: 1,
          refreshPriority: -1,
        },
      })
      .to(image, {
        scale: 3,
        z: 350,
        transformOrigin: '48% 35%',
        ease: 'power1.inOut',
      })
      .to(
        hero,
        {
          scale: 1.1,
          transformOrigin: 'center center',
          ease: 'power1.inOut',
        },
        '<', // Start at the same time as the previous animation
      )

    // Cleanup function
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === wrapper) {
          trigger.kill()
        }
      })
    }
  }, [scrollDistance, showMarkers])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full z-10 ${className}`}
      style={{ height }}
    >
      {/* Content Layer */}
      <div className="relative w-full overflow-x-hidden z-10">
        <section
          ref={heroRef}
          className="w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{
            height,
            backgroundImage: `url(${heroImage})`,
          }}
        >
          {children}
        </section>
      </div>

      {/* Image Container - Foreground Layer */}
      <div
        className="absolute inset-0 z-20 overflow-hidden"
        style={{
          perspective: '500px',
          height,
        }}
      >
        <img
          ref={imageRef}
          src={foregroundImage}
          alt={imageAlt}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>
    </div>
  )
}

// Demo component showing usage
const ParallaxZoom: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ParallaxHero
        scrollDistance="+=100%" // Longer scroll duration
        showMarkers={false} // Debug visuals
        height="100vh" // Adjust container size
        // heroImage="/images/5.jpeg"
        // foregroundImage="/images/zoom/fg.png"
      >
        <div></div>
      </ParallaxHero>
    </div>
  )
}

export default ParallaxZoom
