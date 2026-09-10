'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowLeft, X } from 'lucide-react'
import { InstagramIcon, LinkedinIcon, TelegramIcon } from './SocialIcons'
import { useV15 } from '../_lib/store'
import { NAV_LINKS, COLLECTIONS } from '../_lib/data'
import { getLenis, scrollToSection } from '../_lib/lenis'
import { V15_EASE } from './Preloader'
import Magnetic from './Magnetic'

/**
 * Fullscreen dark menu — curtain drop, staggered oversized links,
 * live collection preview on the side. Scroll is locked while open.
 */
export default function MenuOverlay() {
  const { menuOpen, setMenuOpen, toast } = useV15()

  useEffect(() => {
    const lenis = getLenis()
    if (menuOpen) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [menuOpen])

  const go = (href: string) => {
    setMenuOpen(false)
    window.setTimeout(() => scrollToSection(href), 450)
  }

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-[60] v15-bg-ink text-[color:var(--v15-paper)]"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.8, ease: V15_EASE }}
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="منوی اصلی"
        >
          {/* top bar inside overlay */}
          <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
            <span className="text-xl font-light">
              مِزون{' '}
              <span className="v15-latin text-2xl tracking-[0.18em]">RĀGĀ</span>
            </span>
            <Magnetic strength={0.4}>
              <button
                type="button"
                data-cursor="hover"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 transition-colors duration-300 hover:bg-[color:var(--v15-paper)] hover:text-[color:var(--v15-ink)]"
                aria-label="بستن منو"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </Magnetic>
          </div>

          <div className="grid h-[calc(100dvh-80px)] grid-cols-1 content-between px-5 pb-6 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:pb-10">
            {/* nav links */}
            <nav className="flex flex-col justify-center gap-1 md:gap-2">
              {NAV_LINKS.map((link, i) => (
                <div key={link.href} className="overflow-hidden">
                  <motion.button
                    type="button"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%', transition: { duration: 0.4, delay: 0 } }}
                    transition={{ duration: 0.85, ease: V15_EASE, delay: 0.25 + i * 0.07 }}
                    onClick={() => go(link.href)}
                    data-cursor="hover"
                    className="v15-menu-link group flex w-full items-baseline gap-4 py-1 text-right md:gap-6"
                  >
                    <span className="text-sm font-light opacity-60">{link.index}</span>
                    <span className="text-xl font-extralight">{link.label}</span>
                    <ArrowLeft className="h-5 w-5 shrink-0 opacity-40" strokeWidth={1.4} />
                  </motion.button>
                </div>
              ))}
            </nav>
{/* right column: collection preview + socials */}
            <div className="flex flex-col justify-between gap-8 md:col-span-2 md:flex-row md:gap-10">
              {/* hero wordmark + CTA */}
              <div className="flex flex-col items-end gap-6 md:items-start">
                <p className="v15-latin text-2xl font-medium tracking-[0.2em]">
                  Maison Rāgā
                </p>
                <button
                  type="button"
                  data-cursor="hover"
                  onClick={() => {
                    setMenuOpen(false)
                    toast(
                      'کارگاهِ راگا — نمایشی',
                      'همان‌اکنون در حال آماده‌سازی است و به‌زودی به پلتفرم متصل می‌شود.',
                    )
                  }}
                  className="v15-btn v15-btn--fill flex w-full max-w-[260px] justify-center"
                >
                  ورود به کارگاه
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* live collection preview */}
              <div className="relative h-[30vw] w-full max-w-sm self-end overflow-hidden md:h-[22vw]">
                <motion.div
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: V15_EASE, delay: 0.35 }}
                  className="relative h-full w-full"
                >
                  <Image
                    src="/maison/craft-hands.jpg"
                    alt="دوختِ دست در کارگاهِ راگا"
                    fill
                    sizes="30vw"
                    className="object-cover"
                  />
                </motion.div>
              </div>
              <div className="flex flex-wrap justify-end gap-x-6 gap-y-2">
                {COLLECTIONS.map((c, i) => (
                  <motion.button
                    key={c.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: V15_EASE }}
                    onClick={() => go('#collections')}
                    data-cursor="hover"
                    className="v15-uline text-sm font-light opacity-70 hover:opacity-100"
                  >
                    {c.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* bottom row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex items-end justify-between border-t border-white/10 pt-5 md:col-span-2"
            >
              <div className="flex gap-5 text-xs opacity-60">
                <span className="v15-latin tracking-[0.25em]">FA</span>
                <button
                  type="button"
                  data-cursor="hover"
                  className="tracking-wide"
                  onClick={() => {
                    setMenuOpen(false)
                    toast('نسخه‌ی انگلیسی به‌زودی', 'در نسخه‌ی نهایی متصل می‌شود.')
                  }}
                >
                  <span className="v15-latin tracking-[0.25em] opacity-50">
                    EN — SOON
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { icon: InstagramIcon, label: 'اینستاگرام' },
                  { icon: TelegramIcon, label: 'تلگرام' },
                  { icon: LinkedinIcon, label: 'لینکدین' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    data-cursor="hover"
                    aria-label={label}
                    onClick={() => toast(label, 'پیوندِ شبکه‌های اجتماعی — نسخه‌ی نمایشی')}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors duration-300 hover:bg-[color:var(--v15-paper)] hover:text-[color:var(--v15-ink)]"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}