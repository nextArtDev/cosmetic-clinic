'use client';

import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { ScrollWord, FadeUp } from './Reveal';

const TEXT =
  'هر کیفِ راگا با دستانِ یک استادکار آغاز می‌شود — از انتخابِ پوست تا آخرین بخیه. ما عجله نداریم؛ چرم، زمان می‌خواهد و ما به زمان احترام می‌گذاریم.';

/** V15 — Pinned manifesto: words brighten one by one as you scroll through
 * the section (scroll-driven opacity cascade).
 */
export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.72', 'end 0.45'],
  });

  const words = TEXT.split(' ');

  return (
    <section ref={ref} className="relative px-5 py-28 md:px-10 md:py-44">
      <FadeUp className="mx-auto mb-10 flex max-w-4xl items-center gap-4 md:mb-14">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
        <span className="text-xs font-normal tracking-[0.2em] opacity-70">
          مانیفستِ خانه
        </span>
        <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-50">
          The Manifesto
        </span>
        <span className="h-px flex-1 bg-[color:var(--v15-line)]" />
      </FadeUp>

      <p className="mx-auto max-w-4xl text-[7.2vw] font-extralight leading-[1.85] md:text-[2.9vw] md:leading-[1.9]">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <ScrollWord key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </ScrollWord>
          );
        })}
      </p>

      <FadeUp delay={0.15} className="mx-auto mt-12 max-w-4xl md:mt-16">
        <p className="v15-ink2 text-sm font-light leading-8 md:text-base">
          — دفترچه‌ی کارگاه، صفحه‌ی نخست
        </p>
      </FadeUp>
    </section>
  );
}
