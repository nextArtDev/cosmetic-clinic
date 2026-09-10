/** V15 — module-level handle for the Lenis instance owned by this route.
 * Kept in a tiny singleton so overlays (menu / cart) can stop & start
 * smooth scrolling without prop drilling. It never touches the main app.
 */

import type Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Smoothly scroll to an anchor target if lenis is alive. */
export function scrollToSection(target: string) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  } else {
    document
      .querySelector(target)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
