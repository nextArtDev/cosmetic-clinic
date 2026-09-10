'use client';

import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { faDigits } from '../_lib/format';

export const V15_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SEEN_KEY = 'v15-seen';

export function getV15IntroDelay(): number {
  if (typeof window === 'undefined') return 0;
  return sessionStorage.getItem(SEEN_KEY) ? 0.35 : 2.35;
}

/** V15 — Couture-style loading curtain: percentage counter, latin wordmark,
 * then the panel sweeps up. Plays fully once per session.
 */
export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(SEEN_KEY);
    const controls = animate(0, 100, {
      duration: seen ? 0.6 : 1.9,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => {
        sessionStorage.setItem(SEEN_KEY, '1');
        window.setTimeout(() => setDone(true), 300);
      },
    });
    return () => controls.stop();
  }, []);

  if (done) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center v15-bg-ink"
      exit={{ y: '-100%' }}
      animate={{ y: progress >= 100 ? '-100%' : '0%' }}
      transition={{ duration: 1, ease: V15_EASE }}
      aria-hidden
    >
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: V15_EASE, delay: 0.15 }}
        className="v15-paper-t text-xs font-light tracking-[0.35em] opacity-80"
      >
        خانه‌ی چرمِ دست‌دوز — از ۱۳۰۴
      </motion.p>

      <div className="mt-4 overflow-hidden">
        <motion.h1
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: V15_EASE, delay: 0.25 }}
          className="v15-latin v15-paper-t text-[13vw] leading-none tracking-[0.28em] md:text-[7vw]"
        >
          RĀGĀ
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="v15-paper-t mt-5 text-[11px] font-extralight"
      >
        در حال آماده‌سازیِ کارگاه…
      </motion.p>

      {/* progress hairline */}
      <div className="absolute bottom-16 right-1/2 h-px w-40 translate-x-1/2 bg-white/10">
        <div
          className="h-full bg-[color:var(--v15-caramel)] transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="v15-paper-t absolute bottom-6 left-6 text-4xl font-thin tabular-nums opacity-70 md:left-10 md:text-5xl">
        {faDigits(progress)}٪
      </span>
    </motion.div>
  );
}
