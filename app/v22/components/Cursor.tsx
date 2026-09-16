'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/engine';
import styles from './elitone.module.css';

/**
 * Upstream `#cursor`: 2rem ring, 12rem when active with a label, 4rem on click.
 * Position is a gsap quickSetter driven by the same time-based lerp the
 * reference uses — `c = 1 - Math.pow(.9, .06 * deltaMs)`.
 */
export default function Cursor({
  scope,
}: {
  scope: React.RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = scope.current;
    if (!el || !root) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    const setX = gsap.quickSetter(el, 'x', 'px') as (v: number) => void;
    const setY = gsap.quickSetter(el, 'y', 'px') as (v: number) => void;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      el.classList.add(styles.esCursorOn);
    };
    const onDown = () => el.classList.add(styles.esCursorClick);
    const onUp = () => el.classList.remove(styles.esCursorClick);
    const onLeave = () => el.classList.remove(styles.esCursorOn);

    // One delegated listener pair — upstream attaches per element, but a
    // delegated `over`/`out` on the route root is equivalent and cheaper.
    const onOver = (e: Event) => {
      const hit = (e.target as HTMLElement | null)?.closest?.(
        'a, button, [data-cursor], input, textarea, select',
      ) as HTMLElement | null;
      if (!hit) return;
      const label = hit.getAttribute('data-cursor');
      if (label && labelRef.current) labelRef.current.textContent = label;
      el.classList.add(styles.esCursorActive);
      // Upstream swaps the label for a chevron on `[data-arrow]`, and mirrors
      // it when the element also carries `data-prev`.
      el.classList.toggle(styles.esCursorArrow, hit.hasAttribute('data-arrow'));
      el.classList.toggle(styles.esCursorReverse, hit.hasAttribute('data-prev'));
    };
    const onOut = (e: Event) => {
      const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
      if (related?.closest?.('a, button, [data-cursor], input, textarea, select')) return;
      el.classList.remove(
        styles.esCursorActive,
        styles.esCursorArrow,
        styles.esCursorReverse,
      );
    };

    const tick = (_t: number, delta: number) => {
      const c = 1 - Math.pow(0.9, 0.06 * delta);
      pos.x += (target.x - pos.x) * c;
      pos.y += (target.y - pos.y) * c;
      setX(pos.x);
      setY(pos.y);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseout', onLeave);
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseout', onOut);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseout', onLeave);
      root.removeEventListener('mouseover', onOver);
      root.removeEventListener('mouseout', onOut);
      gsap.ticker.remove(tick);
    };
  }, [scope]);

  return (
    <div className={styles.esCursor} ref={ref} aria-hidden="true">
      <span className={styles.esCursorLabel} ref={labelRef} />
    </div>
  );
}
