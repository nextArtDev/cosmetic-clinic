'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'
import { Phone } from 'lucide-react'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import Button from '../ui/Button'
import { nav, site } from '../../lib/site'
import { lockScroll } from '../providers/SmoothScroll'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    if (open) return
    setHidden(y > prev && y > 160)
  })

  useEffect(() => {
    lockScroll(open)
    return () => lockScroll(false)
  }, [open])

  useEffect(() => {
    if (open) return
    const t = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="nc:fixed nc:inset-x-0 nc:top-0 nc:z-50 nc:px-3 nc:pt-3 nc:sm:px-5"
      >
        <div
          className={`nc:mx-auto nc:flex nc:max-w-7xl nc:items-center nc:justify-between nc:rounded-full nc:px-4 nc:transition-all nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:sm:px-5 ${
            scrolled || open
              ? 'frosted nc:h-[60px] nc:shadow-[0_10px_40px_-18px_rgba(12,13,14,.35)] nc:ring-1 nc:ring-ink/5'
              : 'nc:h-[72px] nc:bg-transparent'
          }`}
        >
          <Logo />

          <nav
            className="nc:hidden nc:items-center nc:gap-8 nc:lg:flex"
            aria-label="Navigation principale"
          >
            {nav.primary.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="link-underline nc:text-[13.5px] nc:font-semibold nc:tracking-tight nc:text-ink/80 nc:transition-colors nc:hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nc:flex nc:items-center nc:gap-2">
            <a
              href={site.phoneHref}
              className="nc:hidden nc:size-11 nc:place-items-center nc:rounded-full nc:text-ink nc:transition-colors nc:hover:bg-ink nc:hover:text-white nc:md:grid"
              aria-label={`Appeler le ${site.phone}`}
            >
              <Phone className="nc:size-4" strokeWidth={2} />
            </a>
            <div className="nc:hidden nc:sm:block">
              <Button href={nav.cta.href} size="sm" icon="arrow">
                {nav.cta.label}
              </Button>
            </div>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              className="nc:group nc:relative nc:grid nc:size-11 nc:place-items-center nc:rounded-full nc:transition-colors nc:hover:bg-ink/5"
            >
              <span className="nc:relative nc:block nc:h-3.5 nc:w-6">
                <motion.span
                  animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="nc:absolute nc:left-0 nc:top-0 nc:block nc:h-[2px] nc:w-full nc:origin-center nc:rounded-full nc:bg-ink"
                />
                <motion.span
                  animate={
                    open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.25 }}
                  className="nc:absolute nc:left-0 nc:top-1/2 nc:block nc:h-[2px] nc:w-full nc:-translate-y-1/2 nc:rounded-full nc:bg-ink"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                  className="nc:absolute nc:bottom-0 nc:left-0 nc:block nc:h-[2px] nc:w-full nc:origin-center nc:rounded-full nc:bg-ink"
                />
              </span>
              <span className="nc:pointer-events-none nc:absolute nc:-bottom-6 nc:hidden nc:text-[10px] nc:font-semibold nc:uppercase nc:tracking-[0.2em] nc:text-ink/50 nc:opacity-0 nc:transition-opacity nc:group-hover:opacity-100 nc:lg:block">
                {open ? 'Fermer' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && <MobileMenu onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
