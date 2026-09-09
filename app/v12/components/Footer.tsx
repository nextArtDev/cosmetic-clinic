'use client'

import { motion } from 'framer-motion'
import Marquee from './Marquee'
import Magnetic from './Magnetic'
import { FadeUp } from './Reveal'
import { FOOTER, NAV_LINKS, doctor, toFa } from '../lib/content'

/**
 * Footer — faithful port of the grind Footer.tsx. RTL: the big marquee
 * CTA arrow points left; menu links underline from the right.
 */
export default function Footer() {
  return (
    <footer className="tg:relative tg:overflow-hidden tg:border-t tg:border-white/10 tg:bg-[#0a0a0a]">
      {/* Big marquee CTA */}
      <a href="#start" className="group tg:block tg:border-b tg:border-white/10 tg:py-10 tg:md:py-14">
        <Marquee duration={20} pauseOnHover>
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="tg:mx-8 tg:flex tg:items-center tg:gap-8 tg:font-display tg:text-6xl tg:leading-none tg:transition-colors tg:duration-500 group-hover:tg:text-[#d7fe45] tg:md:text-9xl"
            >
              {FOOTER.marqueeCta}
              <span className="text-stroke-volt tg:transition-transform tg:duration-500 group-hover:tg:-translate-x-3">
                →
              </span>
            </span>
          ))}
        </Marquee>
      </a>

      <div className="tg:mx-auto tg:max-w-7xl tg:px-5 tg:py-16 tg:md:px-10 tg:md:py-20">
        <div className="tg:grid tg:grid-cols-1 tg:gap-12 tg:md:grid-cols-3">
          <FadeUp>
            <div>
              <div className="tg:font-display tg:text-3xl">
                دکتر <span className="tg:text-[#d7fe45]">رستگار</span>
              </div>
              <p className="tg:mt-4 tg:max-w-xs tg:text-sm tg:leading-loose tg:text-[#f2f0eb]/50">
                {FOOTER.tagline}
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div>
              <h4 className="tg:mb-5 tg:text-xs tg:font-bold tg:text-[#f2f0eb]/40">
                {FOOTER.menuTitle}
              </h4>
              <ul className="tg:space-y-3">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="group tg:inline-flex tg:items-center tg:gap-2 tg:text-[#f2f0eb]/70 tg:transition-colors tg:duration-300 hover:tg:text-[#d7fe45]"
                    >
                      <span className="tg:h-px tg:w-0 tg:bg-[#d7fe45] tg:transition-all tg:duration-300 group-hover:tg:w-5" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div>
              <h4 className="tg:mb-5 tg:text-xs tg:font-bold tg:text-[#f2f0eb]/40">
                {FOOTER.followTitle}
              </h4>
              <div className="tg:flex tg:gap-3">
                {FOOTER.social.map((s) => (
                  <Magnetic key={s}>
                    <a
                      href="#top"
                      aria-label={s}
                      className="tg:flex tg:h-12 tg:w-12 tg:items-center tg:justify-center tg:rounded-full tg:border tg:border-white/15 tg:text-sm tg:font-bold tg:transition-all tg:duration-300 hover:tg:border-[#d7fe45] hover:tg:bg-[#d7fe45] hover:tg:text-[#0a0a0a]"
                    >
                      {s[0]}
                    </a>
                  </Magnetic>
                ))}
              </div>
              <p className="tg:mt-6 tg:text-sm tg:text-[#f2f0eb]/50" dir="ltr" style={{ textAlign: 'right' }}>
                {doctor.email}
              </p>
            </div>
          </FadeUp>
        </div>

        <div className="tg:mt-16 tg:flex tg:flex-col tg:items-center tg:justify-between tg:gap-4 tg:border-t tg:border-white/10 tg:pt-8 tg:text-xs tg:text-[#f2f0eb]/30 tg:md:flex-row">
          <span>
            {FOOTER.copyright.replace('{year}', toFa(new Date().getFullYear()))} —{' '}
            {doctor.role}
          </span>
          <motion.a
            href="#top"
            whileHover={{ y: -3 }}
            className="tg:flex tg:items-center tg:gap-2 tg:text-[#f2f0eb]/50 tg:transition-colors hover:tg:text-[#d7fe45]"
          >
            {FOOTER.backToTop}
          </motion.a>
        </div>
      </div>
    </footer>
  )
}
