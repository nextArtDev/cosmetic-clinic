'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { nav, site } from '../../lib/site'
import Button from '../ui/Button'

const EASE = [0.76, 0, 0.24, 1] as const

const panel = {
  hidden: { clipPath: 'inset(0 0 100% 0 round 28px)' },
  show: {
    clipPath: 'inset(0 0 0% 0 round 28px)',
    transition: { duration: 0.8, ease: EASE },
  },
  exit: {
    clipPath: 'inset(0 0 100% 0 round 28px)',
    transition: { duration: 0.6, ease: EASE, delay: 0.15 },
  },
}

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

const item = {
  hidden: { y: 48, opacity: 0, rotate: 3 },
  show: {
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { y: 20, opacity: 0, transition: { duration: 0.3 } },
}

export default function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="nc:fixed nc:inset-0 nc:z-40 nc:px-3 nc:pb-3 nc:pt-[84px] nc:sm:px-5"
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { duration: 0.4 } },
          exit: { opacity: 0, transition: { duration: 0.4, delay: 0.3 } },
        }}
        className="nc:absolute nc:inset-0 nc:-z-10 nc:bg-ink/30 nc:backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        variants={panel}
        className="nc:relative nc:mx-auto nc:flex nc:h-full nc:max-w-7xl nc:flex-col nc:overflow-hidden nc:rounded-[28px] nc:bg-ink nc:text-white"
        data-lenis-prevent
      >
        <div className="grain nc:absolute nc:inset-0" />
        <div className="nc:relative nc:flex nc:h-full nc:flex-col nc:overflow-y-auto nc:px-6 nc:py-8 nc:sm:px-10 nc:lg:flex-row nc:lg:items-end nc:lg:justify-between nc:lg:px-14 nc:lg:py-12">
          <motion.ul variants={list} className="nc:flex nc:flex-col nc:gap-1">
            {[...nav.primary, ...nav.secondary.slice(0, 3)].map((link, i) => (
              <motion.li
                key={link.label}
                variants={item}
                className="nc:overflow-hidden"
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="nc:group nc:flex nc:items-baseline nc:gap-4 nc:py-1.5 nc:text-[clamp(1.9rem,6vw,3.6rem)] nc:font-semibold nc:leading-[1.05] nc:tracking-[-0.03em] nc:text-white/90 nc:transition-colors nc:hover:text-white"
                >
                  <span className="nc:text-[11px] nc:font-bold nc:tracking-[0.2em] nc:text-sage-soft/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="nc:relative">
                    {link.label}
                    <span className="nc:absolute nc:-bottom-1 nc:left-0 nc:h-[2px] nc:w-full nc:origin-left nc:scale-x-0 nc:bg-sage-soft nc:transition-transform nc:duration-500 nc:ease-[cubic-bezier(.16,1,.3,1)] nc:group-hover:scale-x-100" />
                  </span>
                  <ArrowUpRight className="nc:size-6 nc:-translate-x-2 nc:opacity-0 nc:transition-all nc:duration-500 nc:group-hover:translate-x-0 nc:group-hover:opacity-100" />
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            variants={list}
            className="nc:mt-10 nc:flex nc:flex-col nc:gap-6 nc:border-t nc:border-white/10 nc:pt-8 nc:lg:mt-0 nc:lg:w-80 nc:lg:border-0 nc:lg:pt-0"
          >
            <motion.div variants={item}>
              <p className="eyebrow nc:mb-3 nc:text-sage-soft/80">
                Prendre contact
              </p>
              <a
                href={site.phoneHref}
                className="nc:block nc:text-xl nc:font-semibold nc:hover:text-sage-soft"
              >
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="nc:mt-1 nc:block nc:text-white/60 nc:hover:text-white"
              >
                {site.email}
              </a>
              <p className="nc:mt-2 nc:text-sm nc:text-white/50">
                {site.address}
              </p>
            </motion.div>
            <motion.div
              variants={item}
              className="nc:flex nc:flex-wrap nc:items-center nc:gap-2"
            >
              {site.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="nc:grid nc:h-10 nc:min-w-10 nc:place-items-center nc:rounded-full nc:border nc:border-white/15 nc:px-3 nc:text-xs nc:font-bold nc:transition-all nc:hover:border-white nc:hover:bg-white nc:hover:text-ink"
                >
                  {s.label}
                </a>
              ))}
            </motion.div>
            <motion.div
              variants={item}
              className="nc:flex nc:flex-wrap nc:gap-2"
            >
              <Button href="/v5/diagnostic" variant="dark" onClick={onClose}>
                Demander un diagnostic
              </Button>
              <Button
                href={site.whatsappHref}
                variant="outline"
                className="nc:!text-white nc:!ring-white/30"
                icon="external"
              >
                WhatsApp
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
