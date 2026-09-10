'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CRAFT_STEPS } from '../_lib/data';
import { faDigits, faIndex } from '../_lib/format';
import { scrollToSection } from '../_lib/lenis';
import { WordsReveal, FadeUp } from './Reveal';

/** V15 — Savoir-faire chapter. Desktop: pinned horizontal drift driven by vertical
 * scroll (sticky + transform). Mobile: gracefully becomes a vertical stack.
 */
export default function Craft() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section id="craft" className="v15-bg2 relative">
      {isDesktop ? <HorizontalCraft /> : <VerticalCraft />}
    </section>
  );
}

function ChapterHead({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? '' : 'px-5 pt-20 md:px-10 md:pt-28'}>
      <FadeUp>
        <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.2em] opacity-70">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
          صنعتگری
          <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-60">
            Savoir-Faire
          </span>
        </p>
      </FadeUp>
      <WordsReveal
        as="h2"
        text="چهار قرار با چرم"
        className="text-4xl font-extralight md:text-6xl"
      />
    </div>
  );
}

function StepCard({ step, i, wide }: { step: (typeof CRAFT_STEPS)[number]; i: number; wide?: boolean }) {
  return (
    <article
      className={`group flex shrink-0 flex-col ${
        wide ? 'w-[44vw]' : 'w-full'
      }`}
    >
      <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden">
        <Image
          src={step.image}
          alt={step.title}
          fill
          sizes={wide ? '44vw' : '88vw'}
          className="v15-zoom object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-[color:var(--v15-paper)]/85 px-3 py-1 text-[10px] font-light backdrop-blur">
          مرحله‌ی {faIndex(step.index)}
        </span>
      </div>
      <div className="flex items-baseline gap-4">
        <span className="v15-latin text-4xl font-light opacity-25 md:text-5xl">
          {faIndex(step.index)}
        </span>
        <div>
          <h3 className="text-xl font-light md:text-2xl">{step.title}</h3>
          <p className="v15-latin mt-1 text-[10px] uppercase tracking-[0.35em] opacity-50">
            {step.latin}
          </p>
        </div>
      </div>
      <p className="v15-ink2 mt-4 max-w-md text-sm font-light leading-8">
        {step.body}
      </p>
    </article>
  );
}

/* ── desktop: pinned horizontal drift ──────────────────────────────────── */
function HorizontalCraft() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ['4vw', '-196vw']);

  return (
    <div ref={targetRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-10 flex items-end justify-between px-10">
          <ChapterHead compact />
          <p className="max-w-[220px] text-right text-xs font-light leading-6 opacity-60">
            اسکرول کنید تا مسیرِ چرم را از هید تا مُهر طی کنید
            <ArrowLeft className="mt-2 h-4 w-4" strokeWidth={1.4} />
          </p>
        </div>

        <div dir="ltr" className="w-full">
          <motion.div style={{ x }} className="flex w-max items-start gap-[6vw] px-[6vw]">
            {CRAFT_STEPS.map((step, i) => (
              <div key={step.index} dir="rtl">
                <StepCard step={step} i={i} wide />
              </div>
            ))}

            {/* closing panel */}
            <div dir="rtl" className="flex w-[38vw] shrink-0 flex-col items-start justify-center gap-6">
              <p className="text-3xl font-extralight leading-[1.7] md:text-4xl">
                ۲۷ ساعتِ کارِ دست،
                <br />
                برای یک عمرِ همراهی.
              </p>
              <button
                type="button"
                data-cursor="hover"
                onClick={() => scrollToSection('#shop')}
                className="v15-btn"
              >
                دیدنِ محصولات
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* progress hairline */}
        <div className="mx-10 mt-14 h-px bg-[color:var(--v15-line)]">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full origin-left bg-[color:var(--v15-caramel)]"
          />
        </div>
      </div>
    </div>
  );
}

/* ── mobile: elegant vertical stack ────────────────────────────────────── */
function VerticalCraft() {
  return (
    <div className="pb-20">
      <ChapterHead />
      <div className="mt-10 flex flex-col gap-14 px-5">
        {CRAFT_STEPS.map((step, i) => (
          <FadeUp key={step.index} delay={i * 0.05}>
            <StepCard step={step} i={i} />
          </FadeUp>
        ))}
        <FadeUp>
          <div className="border border-[color:var(--v15-line)] p-7">
            <p className="text-2xl font-extralight leading-[1.8]">
              {faDigits(27)} ساعتِ کارِ دست، برای یک عمرِ همراهی.
            </p>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => scrollToSection('#shop')}
              className="v15-btn mt-6"
            >
              دیدنِ محصولات
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
