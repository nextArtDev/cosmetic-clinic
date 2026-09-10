'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, ShoppingBag } from 'lucide-react';
import { useV15 } from '../_lib/store';
import { faDigits } from '../_lib/format';
import { scrollToSection } from '../_lib/lenis';
import Magnetic from './Magnetic';
import { V15_EASE, getV15IntroDelay } from './Preloader';

/** V15 — Minimal fixed header: transparent over hero, frosted after scroll,
 * hides going down / returns going up (luxury-site behavior).
 */
export default function Header() {
  const { setMenuOpen, setCartOpen, count, menuOpen } = useV15();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const delay = getV15IntroDelay();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 160);
    setScrolled(latest > 40);
  });

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: hidden && !menuOpen ? '-110%' : '0%', opacity: 1 }}
      transition={{ duration: 0.6, ease: V15_EASE, opacity: { delay } }}
      className={`fixed inset-x-0 top-0 z-[50] transition-colors duration-500 ${
        scrolled
          ? 'border-b border-[color:var(--v15-line)] bg-[color:var(--v15-paper)]/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-5">
        {/* rightmost (RTL start): wordmark */}
        <a
          href="#top"
          data-cursor="hover"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('#top');
          }}
          className="group flex flex-col leading-none"
          aria-label="مِزون راگا — بازگشت به بالای صفحه"
        >
          <span className="text-xl font-light tracking-tight md:text-2xl">
            مِزون{' '}
            <span className="v15-latin text-2xl font-medium tracking-[0.18em] md:text-3xl">
              RĀGĀ
            </span>
          </span>
          <span className="v15-ink2 mt-1 text-[10px] font-light tracking-wide opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            خانه‌ی چرمِ ایرانی
          </span>
        </a>

        {/* latin center note — desktop only */}
        <p className="v15-latin hidden text-[11px] uppercase tracking-[0.4em] opacity-60 md:block">
          Handcrafted in Tehran — Est. 1304 SH
        </p>

        {/* left cluster */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            data-cursor="hover"
            onClick={() => scrollToSection('#boutique')}
            className="v15-uline hidden px-1 py-2 text-sm font-light md:block"
          >
            بوتیک‌ها
          </button>

          <Magnetic strength={0.4}>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--v15-line-strong)] transition-colors duration-300 hover:bg-[color:var(--v15-ink)] hover:text-[color:var(--v15-paper)]"
              aria-label={`سبد خرید — ${faDigits(count)} قلم`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--v15-caramel)] px-1 text-[10px] font-medium text-white"
                  >
                    {faDigits(count)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Magnetic>

          <Magnetic strength={0.4}>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 items-center gap-2 rounded-full border border-[color:var(--v15-line-strong)] px-4 transition-colors duration-300 hover:bg-[color:var(--v15-ink)] hover:text-[color:var(--v15-paper)] md:px-5"
              aria-label="باز کردن منو"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="text-sm font-light">منو</span>
            </button>
          </Magnetic>
        </div>
      </div>
    </motion.header>
  );
}
