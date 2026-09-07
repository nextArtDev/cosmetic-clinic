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
      <main id="main">{children}</main>
    </div>
  )
}
