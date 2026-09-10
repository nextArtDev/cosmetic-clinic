'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { setLenis } from '../_lib/lenis';

/** V15 — Lenis-powered smooth scrolling, scoped to this route only.
 * Registers the instance in the module singleton so overlays can
 * call lenis.stop()/start() and nav links can smooth-scroll.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      touchMultiplier: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
