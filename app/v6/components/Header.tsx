'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useMotionValueEvent, useSpring } from 'framer-motion'
import Link from 'next/link'
import { Wordmark } from './Icons'
import { site } from '../lib/data'

export default function Header({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 80)
  })

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`header-shell ${scrolled ? 'scrolled' : ''} ${
        menuOpen ? '!bg-transparent !shadow-none !backdrop-blur-none' : ''
      }`}
    >
      {/* scroll progress */}
      <motion.div
        aria-hidden
        className="absolute right-0 top-0 h-[2px] w-full origin-right bg-pink"
        style={{ scaleX: progress }}
      />

      <div className="container-wondr flex items-center justify-between">
        {/* right tools — spacer so the wordmark stays optically centred (RTL:
            the physical right column plays the role the original's left one did) */}
        <div className="hidden w-[18rem] lg:block" aria-hidden />
        <div className="w-0 lg:hidden" aria-hidden />

        {/* center logo */}
        <Link
          href="/v6"
          aria-label="کلینیک درنا طب — خانه"
          data-cursor="discover"
          className="pointer-events-auto relative z-[70] shrink-0 transition-opacity duration-500"
          style={{ opacity: menuOpen ? 0 : 1 }}
        >
          <Wordmark className="w-[13rem] md:w-[18rem]" />
        </Link>

        {/* left actions (inline-end) */}
        <div className="flex w-[18rem] items-center justify-end gap-[2.4rem]">
          <a
            href={site.phoneHref}
            className="hidden text-[1.2rem] font-bold text-ink underline-anim xl:block"
            data-cursor="cta"
          >
            {site.phone}
          </a>
          <button
            type="button"
            aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            data-cursor="menu"
            className={`menu-burger relative z-[70] ${menuOpen ? 'open' : ''}`}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
