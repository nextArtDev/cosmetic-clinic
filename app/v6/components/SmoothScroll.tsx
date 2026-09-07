'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'

let lenisInstance: Lenis | null = null

export function getLenis() {
  return lenisInstance
}

export default function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })
    lenisInstance = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisInstance = null
    }
  }, [pathname])

  return null
}

export function useScrollTo() {
  return (target: string) => {
    const el = document.querySelector(target)
    if (!el) return
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.4 })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
