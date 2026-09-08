'use client'

import { useState, type ReactNode } from 'react'
import SmoothScroll from './SmoothScroll'
import Intro from './Intro'
import CustomCursor from './CustomCursor'
import Header from './Header'
import MenuOverlay from './MenuOverlay'
import BookCta from './BookCta'

export default function SiteChrome({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="grain relative">
      <SmoothScroll />
      <Intro />
      <CustomCursor />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BookCta />
      {/* SVG gooey filter — consumed by .blob-cta.gooey (filter: url(#v6-goo)).
          v6-prefixed id so it can never collide with another filter. */}
      <svg className="svg-filter" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="v6-goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <main id="main">{children}</main>
    </div>
  )
}
