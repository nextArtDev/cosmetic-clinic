'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/engine';
import { brand } from '../data';
import styles from './elitone.module.css';

/**
 * Upstream preloader: a counter runs to 100 while the page's `[data-src]`
 * images decode, then
 *   - percentage  → autoAlpha 0, y -50, 1s
 *   - viewport    → fromTo({ autoAlpha: .25, y: innerHeight / 1.25 },
 *                          { duration: 1.5, autoAlpha: 1, y: 0, ease: 'expo.out' })
 *   - overlay     → clipPath polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%), 1.5s
 */
export default function Preloader({
  onDone,
  viewport,
}: {
  onDone: () => void;
  viewport: React.RefObject<HTMLDivElement | null>;
}) {
  const [pct, setPct] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const started = performance.now();
    let raf = 0;
    let finished = false;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 1900);
      const eased = 1 - Math.pow(1 - t, 2.2);
      const next = Math.round(eased * 100);
      setPct(next);
      if (barRef.current) {
        barRef.current.style.setProperty('--es-progress', `${next}%`);
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (finished) return;
      finished = true;

      const tl = gsap.timeline({ onComplete: onDone });
      tl.to([countRef.current, nameRef.current], {
        autoAlpha: 0,
        y: -50,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.05,
      });
      if (viewport.current) {
        tl.fromTo(
          viewport.current,
          { autoAlpha: 0.25, y: window.innerHeight / 1.25 },
          { duration: 1.5, autoAlpha: 1, y: 0, clearProps: 'all', ease: 'expo.out' },
          0.05,
        );
      }
      tl.to(
        rootRef.current,
        {
          duration: 1.5,
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          ease: 'expo.out',
        },
        0.05,
      );
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.esPreloader} ref={rootRef} aria-hidden="true">
      <span className={styles.esPreloaderBar} ref={barRef} />
      <span className={styles.esPreloaderCount} ref={countRef}>
        {pct}
      </span>
      <span className={styles.esPreloaderName} ref={nameRef}>
        {brand.name} — {brand.tagline}
      </span>
    </div>
  );
}
