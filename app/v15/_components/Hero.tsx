'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { V15_EASE, getV15IntroDelay } from './Preloader';

/** V15 — Full-viewport editorial hero: slow settle-zoom, scroll parallax,
 * oversized Persian wordmark, rotating badge, hairline scroll cue.
 */
export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const delay = getV15IntroDelay();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative h-[100svh] overflow-hidden">
      {/* image */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
        <motion.div
          className="relative h-full w-full"
          initial={{ scale: 1.22 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: V15_EASE, delay: delay - 0.3 > 0 ? delay - 0.3 : 0 }}
        >
          <Image
            src="/maison/hero.jpg"
            alt="کیف چرمی دست‌دوزِ راگا روی سنگِ تراورتن در نورِ گرم"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--v15-ink)]/45 via-transparent to-[color:var(--v15-ink)]/15" />
        </motion.div>
      </motion.div>

      {/* content */}
      <motion.div
        style={{ y: textY, opacity: fade }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-[color:var(--v15-paper)]"
      >
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: V15_EASE, delay: delay + 0.15 }}
          className="text-[11px] font-extralight tracking-[0.3em] md:text-xs"
        >
          خانه‌ی چرمِ دست‌دوزِ ایرانی — از ۱۳۰۴ خورشیدی
        </motion.p>

        <div className="mt-3 overflow-hidden">
          <motion.h1
            initial={{ y: '108%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1.3, ease: V15_EASE, delay: delay + 0.25 }}
            className="text-[30vw] font-thin leading-[0.95] md:text-[20vw]"
          >
            راگا
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: V15_EASE, delay: delay + 0.55 }}
          className="v15-latin text-xs uppercase tracking-[0.5em] opacity-80 md:text-sm"
        >
          Maison Rāgā — Le Cuir du Silence
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: delay + 0.8 }}
          className="mt-6 max-w-md text-sm font-light leading-8 opacity-90 md:text-base"
        >
          زیبایی، در سکوتِ چرم شکل می‌گیرد؛ هر بخیه، قراری است با زمان.
        </motion.p>
      </motion.div>

      {/* bottom row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: delay + 1 }}
        className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-5 pb-6 text-[color:var(--v15-paper)] md:px-10 md:pb-8"
      >
        <div className="text-[11px] font-extralight leading-6 opacity-85 md:text-xs">
          کیف‌های چرمِ گیاهی‌دباغی
          <br />
          دوخته‌شده به دست، در تهران
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="text-[10px] font-extralight tracking-[0.25em] opacity-80">
            اسکرول کنید
          </span>
          <div className="h-14 w-px overflow-hidden bg-white/25">
            <motion.div
              className="w-full bg-white"
              initial={{ height: '0%' }}
              animate={{ height: ['0%', '100%', '100%'] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: delay + 1.1 }}
            />
          </div>
        </div>

        <div className="text-right text-[11px] font-extralight leading-6 opacity-85 md:text-xs">
          تهران — ایران
          <br />
          <span className="v15-latin tracking-[0.2em]">35.80° N — 51.43° E</span>
        </div>
      </motion.div>

      {/* rotating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: V15_EASE, delay: delay + 1.15 }}
        className="absolute bottom-24 right-6 z-10 hidden md:block"
      >
        <div className="v15-spin-slow relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <path id="v15-circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
            </defs>
            <text className="fill-[color:var(--v15-paper)] text-[8.2px] tracking-[0.22em]">
              <textPath href="#v15-circle">
                چرمِ دست‌دوزِ ایرانی • MAISON RĀGĀ • از ۱۳۰۴ •
              </textPath>
            </text>
          </svg>
          <span className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-[color:var(--v15-paper)]" />
        </div>
      </motion.div>
    </section>
  );
}
