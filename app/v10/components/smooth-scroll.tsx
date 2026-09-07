'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** اسکرول نرم لنیس — فقط داخل مسیر /v10، با رویدادهای اختصاصی v10. */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = reduced ? null : new Lenis({ duration: 1.1, smoothWheel: true, anchors: { offset: -72 } })
    const tick = (time: number) => lenis?.raf(time * 1000)
    lenis?.on('scroll', ScrollTrigger.update)
    if (lenis) gsap.ticker.add(tick)
    function scroll(event: Event) {
      const target = (event as CustomEvent<string>).detail
      if (!document.querySelector(target)) return
      if (lenis) lenis.scrollTo(target, { offset: -72, force: true })
      else document.querySelector(target)?.scrollIntoView({ behavior: 'instant' })
    }
    function lock(event: Event) { if ((event as CustomEvent<boolean>).detail) lenis?.stop(); else lenis?.start() }
    window.addEventListener('v10:scroll', scroll)
    window.addEventListener('v10:lock', lock)
    return () => {
      gsap.ticker.remove(tick)
      lenis?.destroy()
      window.removeEventListener('v10:scroll', scroll)
      window.removeEventListener('v10:lock', lock)
    }
  }, [])
  return null
}
