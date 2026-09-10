'use client';

import { useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { COLLECTIONS } from '../_lib/data';
import { faIndex } from '../_lib/format';
import { scrollToSection } from '../_lib/lenis';
import { V15_EASE } from './Preloader';
import { WordsReveal, FadeUp, DrawnLine } from './Reveal';

/** V15 — Oversized index list of collections. On desktop a floating preview
 * image chases the cursor (spring physics); on touch, each row keeps
 * its own thumbnail.
 */
export default function Collections() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [finePointer, setFinePointer] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 140, damping: 18, mass: 0.5 });
  const py = useSpring(my, { stiffness: 140, damping: 18, mass: 0.5 });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (!finePointer) setFinePointer(true);
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <section
      id="collections"
      ref={sectionRef}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(null)}
      className="relative px-0 pb-24 pt-24 md:pb-36 md:pt-32"
    >
      {/* header */}
      <div className="mb-12 flex items-end justify-between px-5 md:mb-16 md:px-10">
        <div>
          <FadeUp>
            <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.2em] opacity-70">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
              چهار روایت از چرم
              <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-60">
                Collections
              </span>
            </p>
          </FadeUp>
          <WordsReveal
            as="h2"
            text="کالکشن‌های خانه"
            className="text-4xl font-extralight md:text-6xl"
          />
        </div>
        <FadeUp delay={0.1} className="hidden md:block">
          <button
            type="button"
            data-cursor="hover"
            onClick={() => scrollToSection('#shop')}
            className="v15-uline pb-1 text-sm font-light"
          >
            دیدنِ همه در فروشگاه
          </button>
        </FadeUp>
      </div>

      <DrawnLine className="mx-5 w-auto md:mx-10" />

      {/* rows */}
      <div className="relative">
        {COLLECTIONS.map((col, i) => (
          <button
            key={col.id}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => scrollToSection('#shop')}
            data-cursor="view"
            data-cursor-label="کاوش"
            className="v15-row group relative block w-full border-b border-[color:var(--v15-line)] px-5 py-8 text-right md:px-10 md:py-11"
          >
            <div className="flex items-center gap-5 md:gap-10">
              {/* thumb — always visible on touch */}
              <span className="relative block h-16 w-12 shrink-0 overflow-hidden md:hidden">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>

              <span className="v15-latin w-8 shrink-0 text-xs tracking-[0.3em] opacity-45 md:w-12 md:text-sm">
                {faIndex(col.index)}
              </span>

              <span className="flex-1">
                <span className="block text-[11vw] font-extralight leading-none transition-transform duration-500 md:text-[5.2vw] md:group-hover:-translate-x-3">
                  {col.name}
                </span>
                <span className="v15-ink2 mt-2 block text-xs font-light transition-colors duration-500 group-hover:text-[color:var(--v15-paper)]/60 md:mt-3 md:text-sm">
                  {col.category} — {col.story}
                </span>
              </span>

              <span className="v15-latin hidden text-sm tracking-[0.35em] opacity-35 lg:block">
                {col.latinName}
              </span>

              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[color:var(--v15-line-strong)] transition-all duration-500 group-hover:border-[color:var(--v15-paper)]/50 md:flex">
                <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" strokeWidth={1.4} />
              </span>
            </div>
          </button>
        ))}

        {/* floating cursor-follow preview (desktop) */}
        <AnimatePresence>
          {active !== null && finePointer && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 4 }}
              transition={{ duration: 0.45, ease: V15_EASE }}
              style={{ x: px, y: py }}
              className="pointer-events-none absolute right-0 top-0 z-20 hidden h-[300px] w-[230px] translate-x-[20%] -translate-y-[110%] md:block"
            >
              <div className="relative h-full w-full overflow-hidden shadow-2xl shadow-black/30">
                <Image
                  src={COLLECTIONS[active].image}
                  alt={COLLECTIONS[active].name}
                  fill
                  sizes="230px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
