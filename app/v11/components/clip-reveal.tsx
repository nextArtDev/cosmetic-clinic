'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Clip-path curtain reveal on scroll — the reference site's signature
 * image entrance: the photo starts inset (inset(12% 18%) + scale 1.25)
 * and wipes open to full bleed while parallaxing slightly.
 * Wrap any <img> in it; respects prefers-reduced-motion.
 */
export default function ClipReveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(12% 18% 12% 18%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            end: 'top 30%',
            scrub: 0.6,
          },
        },
      )
      const media = el.querySelector('img, video, picture')
      if (media) {
        gsap.fromTo(
          media,
          { scale: 1.25 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              end: 'bottom 35%',
              scrub: 0.6,
            },
          },
        )
      }
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className={`clip-reveal ${className}`}>
      {children}
    </div>
  )
}
