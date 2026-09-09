'use client'

import type { ReactNode } from 'react'

/**
 * Infinite marquee — port of the grind Marquee.tsx. The CSS keyframe
 * (v12-marquee in globals.css) is mirrored for RTL so travel still
 * reads forward for a Persian audience.
 */
export default function Marquee({
  children,
  duration = 30,
  reverse = false,
  className,
  pauseOnHover = false,
}: {
  children: ReactNode
  duration?: number
  reverse?: boolean
  className?: string
  pauseOnHover?: boolean
}) {
  return (
    <div
      className={`tg:overflow-hidden tg:whitespace-nowrap ${
        pauseOnHover ? 'marquee-paused' : ''
      } ${className ?? ''}`}
    >
      <div
        className={`animate-marquee tg:inline-flex tg:will-change-transform ${
          reverse ? 'marquee-reverse' : ''
        }`}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        <div className="tg:flex tg:shrink-0 tg:items-center">{children}</div>
        <div className="tg:flex tg:shrink-0 tg:items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
