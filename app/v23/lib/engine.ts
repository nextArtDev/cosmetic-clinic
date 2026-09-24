'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

/**
 * /v23 motion engine.
 *
 * Every number in this file is transcribed from the reference site's own
 * bundle (`dist/assets/app-*.js` and its lazy chunks), not eyeballed:
 *
 *   - the Lenis config is the literal object the reference constructs;
 *   - the image parallax is the reference's `ImageBase` component, including
 *     its 130%-tall wrapper, the `30 / 130` travel and the `scrub: 0.8`;
 *   - the breakpoint map is the reference's own `Yc` object.
 *
 * Nothing here touches global state — the ScrollTriggers are all created from
 * elements inside the /v23 subtree and killed on unmount.
 */

/** The reference's breakpoint map, verbatim. */
export const BREAKPOINTS = {
  '2xs': '0',
  xs: '420px',
  sm: '576px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
  '2xl': '1440px',
  '3xl': '1728px',
  '4xl': '1920px',
  '5xl': '2000px',
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Mirror of the reference's `useMediaQuery(min|max, name)` composable. */
export function useBreakpoint(mode: 'min' | 'max', bp: Breakpoint) {
  const query = `(${mode}-width: ${BREAKPOINTS[bp]})`;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}

let registered = false;

/** gsap.registerPlugin is idempotent, but we only need to pay for it once. */
export function registerMotion() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  registered = true;
}

/**
 * The reference builds its own ease from a cubic-bezier —
 * `CustomEase.create("custom", "0.66, 0, 0.34, 1")` — for the hero's blur
 * reveal. CustomEase accepts that format directly, so the curve is exact.
 *
 * The same curve is the site's transition easing in CSS
 * (`cubic-bezier(.66, 0, .34, 1)`), which is why the GSAP reveal and the CSS
 * hovers feel like one system.
 */
export const EASE_QUART_IN_OUT = '0.66, 0, 0.34, 1';

let easeReady = false;
function ensureEase() {
  if (easeReady) return;
  registerMotion();
  CustomEase.create('jcQuartInOut', EASE_QUART_IN_OUT);
  easeReady = true;
}

export function cubicEaseInOut() {
  ensureEase();
  return 'jcQuartInOut';
}

/* ── Lenis ───────────────────────────────────────────────────────────────── */

export type LenisOptions = {
  /** Called on every Lenis frame — ScrollTrigger uses it to stay in sync. */
  onScroll?: () => void;
};

/**
 * The reference constructs exactly this:
 *
 *   new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - 2 ** (-8 * t)),
 *               lerp: .6, wheelMultiplier: 1, touchMultiplier: 1, infinite: false })
 *
 * and drives it by hand with requestAnimationFrame rather than Lenis's own
 * autoRaf, so the same is done here.
 */
export function createLenis({ onScroll }: LenisOptions = {}) {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
    lerp: 0.6,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    infinite: false,
  });

  let raf = 0;
  const frame = (time: number) => {
    lenis.raf(time);
    onScroll?.();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    lenis,
    destroy() {
      cancelAnimationFrame(raf);
      lenis.destroy();
    },
  };
}

/* ── image parallax ──────────────────────────────────────────────────────── */

/** `30 / (100 + 30) * 100` — the reference's travel constant. */
const PARALLAX_OVERSCAN = 30;
const PARALLAX_TRAVEL = (PARALLAX_OVERSCAN / (100 + PARALLAX_OVERSCAN)) * 100;

/**
 * The reference's `ImageBase` parallax, reimplemented against a live element.
 *
 * The picture is wrapped in a 130%-tall box that is then translated upward by
 * `PARALLAX_TRAVEL` as the container crosses the viewport. The `onUpdate` clamp
 * is the reference's own guard against gsap overshooting past the wrapper.
 */
export function mountParallax(container: HTMLElement, wrapper: HTMLElement) {
  registerMotion();

  const start = container.getBoundingClientRect().top > 0 ? 'top bottom' : 'top top';

  gsap.set(wrapper, { height: `${100 + PARALLAX_OVERSCAN}%`, yPercent: 0 });

  const tween = gsap.to(wrapper, {
    yPercent: -PARALLAX_TRAVEL,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start,
      end: 'bottom top',
      scrub: 0.8,
      onUpdate: () => {
        const p = gsap.getProperty(wrapper, 'yPercent') as number;
        if (p > 0) gsap.set(wrapper, { yPercent: 0 });
        else if (p < -PARALLAX_OVERSCAN) gsap.set(wrapper, { yPercent: -PARALLAX_OVERSCAN });
      },
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

/** Collects every `.-parallax` picture inside `root` and wires it up. */
export function mountParallaxIn(root: HTMLElement) {
  registerMotion();
  const cleanups: (() => void)[] = [];

  root.querySelectorAll<HTMLElement>('.c-image-base-picture.-parallax').forEach((container) => {
    const wrapper = container.querySelector<HTMLElement>('.c-image-base-picture__parallax-wrapper');
    if (wrapper) cleanups.push(mountParallax(container, wrapper));
  });

  return () => cleanups.forEach((fn) => fn());
}

/* ── scroll-driven numbers ───────────────────────────────────────────────── */

export const clamp = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v));

/** `1 - (rect.top + 400) / (innerHeight / 2)` — shared by hero + banner. */
export function scrollProgress(el: HTMLElement) {
  const half = window.innerHeight / 2;
  return 1 - (el.getBoundingClientRect().top + 400) / half;
}

/**
 * Subscribes to scroll and hands the raw values to a writer. Used by the hero
 * and the transition banner, both of which the reference drives from a plain
 * `scroll` listener rather than ScrollTrigger.
 *
 * The writer receives `progress` and the signed delta since the last frame
 * (the hero's overlay opacity is delta-driven, not position-driven).
 */
export function useScrollDriver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  write: (progress: number, delta: number, el: T) => void,
  enabled = true,
) {
  const lastY = useRef(0);
  const writeRef = useRef(write);

  // Keep the latest callback reachable without re-binding the scroll listener
  // on every render. Declared before the listener effect so it runs first.
  useEffect(() => {
    writeRef.current = write;
  }, [write]);

  useEffect(() => {
    if (!enabled) return;
    lastY.current = window.pageYOffset || document.documentElement.scrollTop;

    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const y = window.pageYOffset || document.documentElement.scrollTop;
      writeRef.current(scrollProgress(el), y - lastY.current, el);
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref, enabled]);
}
