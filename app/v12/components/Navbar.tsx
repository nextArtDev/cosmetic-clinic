'use client'

import { useEffect, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'
import Magnetic from './Magnetic'
import { NAV_LINKS } from '../lib/content'

/**
 * Hide-on-scroll navbar — faithful port of the grind Navbar.tsx.
 * RTL: mobile menu slides from the top exactly as the original (clip-path
 * inset is direction-agnostic); arrows point left for "forward".
 */
export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(latest > prev && latest > 160 && !open)
    setScrolled(latest > 40)
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <motion.header
        className={`tg:fixed tg:inset-x-0 tg:top-0 tg:z-50 tg:transition-colors tg:duration-500 ${
          scrolled && !open
            ? 'tg:border-b tg:border-white/5 tg:bg-[#0a0a0a]/80 tg:backdrop-blur-md'
            : 'tg:border-b tg:border-transparent tg:bg-transparent'
        }`}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="tg:mx-auto tg:flex tg:max-w-7xl tg:items-center tg:justify-between tg:px-5 tg:py-4 tg:md:px-10 tg:md:py-5">
          <a
            href="#top"
            className="tg:font-display tg:text-xl tg:md:text-2xl"
            onClick={() => setOpen(false)}
          >
            دکتر <span className="tg:text-[#d7fe45]">رستگار</span>
          </a>

          <ul className="tg:hidden tg:items-center tg:gap-8 tg:lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group tg:relative tg:text-sm tg:font-medium tg:text-[#f2f0eb]/70 tg:transition-colors hover:tg:text-[#f2f0eb]"
                >
                  {l.label}
                  <span className="tg:absolute tg:-bottom-1 tg:right-0 tg:h-px tg:w-0 tg:bg-[#d7fe45] tg:transition-all tg:duration-300 group-hover:tg:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="tg:flex tg:items-center tg:gap-3">
            <Magnetic className="tg:hidden tg:lg:inline-block">
              <a
                href="#start"
                className="group tg:relative tg:inline-flex tg:items-center tg:gap-2 tg:overflow-hidden tg:rounded-full tg:bg-[#d7fe45] tg:px-6 tg:py-3 tg:text-sm tg:font-bold tg:text-[#0a0a0a]"
              >
                <span className="tg:absolute tg:inset-0 tg:-translate-x-full tg:bg-[#f2f0eb] tg:transition-transform tg:duration-500 tg:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:tg:translate-x-0" />
                <span className="tg:relative">همین حالا شروع کن</span>
                <span className="tg:relative tg:transition-transform tg:duration-300 group-hover:tg:-translate-x-1">
                  →
                </span>
              </a>
            </Magnetic>

            <button
              onClick={() => setOpen(!open)}
              className="tg:relative tg:z-50 tg:flex tg:h-11 tg:w-11 tg:flex-col tg:items-center tg:justify-center tg:gap-1.5 tg:rounded-full tg:border tg:border-white/15 tg:lg:hidden"
              aria-label="Menu"
            >
              <motion.span
                animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                className="tg:block tg:h-0.5 tg:w-5 tg:bg-[#f2f0eb]"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                className="tg:block tg:h-0.5 tg:w-5 tg:bg-[#f2f0eb]"
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="tg:fixed tg:inset-0 tg:z-40 tg:flex tg:flex-col tg:justify-end tg:bg-[#0a0a0a] tg:px-6 tg:pb-12 tg:lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="tg:space-y-2">
              {NAV_LINKS.map((l, i) => (
                <li key={l.href} className="tg:overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="tg:block tg:font-display tg:text-5xl tg:leading-tight tg:text-[#f2f0eb] tg:transition-colors active:tg:text-[#d7fe45]"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '110%' }}
                    transition={{
                      duration: 0.6,
                      delay: 0.15 + i * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.a
              href="#start"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="tg:mt-10 tg:inline-flex tg:w-full tg:items-center tg:justify-center tg:rounded-full tg:bg-[#d7fe45] tg:px-8 tg:py-4 tg:font-display tg:text-xl tg:text-[#0a0a0a]"
            >
              همین حالا شروع کن →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
