'use client';

/**
 * /v22 motion engine.
 *
 * Every value in here is lifted from the upstream theme bundle of
 * https://www.elitestone.it/ (dist/js/main.min.js) so the port moves the way
 * the reference moves:
 *
 *   title    gsap.fromTo(lines,
 *              { autoAlpha: 0, y: '100%', rotateX: -80, rotateZ: 10 },
 *              { delay: .025 * i, duration: 1.5, ease: 'expo.out',
 *                autoAlpha: 1, y: 0, rotateX: 0, rotateZ: 0, clearProps: 'all' })
 *
 *   excerpt  parent clipPath = polygon(0 0, 100% 0, 100% 110%, 0 110%)
 *            gsap.fromTo(lines, { autoAlpha: 0, y: '100%' },
 *              { delay: .015 * i, duration: 1.5, ease: 'expo.out',
 *                autoAlpha: 1, y: 0, clearProps: 'all',
 *                onComplete: () => parent.style.clipPath = 'none' })
 *
 *   reel     gsap.timeline({ defaults: { ease: 'none' },
 *              scrollTrigger: { trigger: header, start: 'top top', scrub: true }})
 *              .to('.swiper-wrapper', { y: window.innerHeight / 1.5 })
 *
 *   preloader  percentage/text out, then
 *              viewport  fromTo({ autoAlpha: .25, y: innerHeight / 1.25 },
 *                               { duration: 1.5, autoAlpha: 1, y: 0, ease: 'expo.out' })
 *              overlay   to({ clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' })
 *
 *   cursor   quickSetter lerp: `c = 1 - Math.pow(.9, .06 * deltaMs)`
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;
export function registerElitoneMotion() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out' });
  registered = true;
}

export { gsap, ScrollTrigger };

/** The upstream easing curve, as a CSS string. */
export const EASE_CSS = 'cubic-bezier(0.83, 0, 0.17, 1)';
/** Upstream `expo.out`, expressed for framer-free CSS use. */
export const EXPO_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ────────────────────────────────────────────────────────────────
   Line splitting
   Upstream uses GSAP SplitText (lines + `nestedLinesSplit`). That is a
   paid plugin, so we reimplement the observable behaviour: measure word
   boxes, group them by baseline row, then wrap each row in a masked
   `.line > .inner` pair.
   ──────────────────────────────────────────────────────────────── */

const ORIGINAL = 'data-es-original';

/**
 * Splits an element's text into masked rows and returns the inner (animatable)
 * spans. Elements containing child elements fall back to a single masked row —
 * every element we animate is authored as plain text for exactly this reason.
 *
 * If the source text contains explicit `\n`, those are honoured as hard line
 * breaks before natural wrapping — the reference's hero title ships as three
 * pre-split lines and we want them to animate as three, not as one row that
 * happens to fit on screen.
 */
export function splitLines(el: HTMLElement): HTMLElement[] {
  const original = el.getAttribute(ORIGINAL) ?? el.innerHTML;
  el.setAttribute(ORIGINAL, original);

  const raw = (el.textContent ?? '').replace(/\r\n?/g, '\n');
  const explicitLines = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  if (!explicitLines.length) return [];

  if (el.children.length > 0) {
    el.innerHTML = `<span class="esLine"><span class="esLineInner">${original}</span></span>`;
    return Array.from(el.querySelectorAll<HTMLElement>('.esLineInner'));
  }

  // 1. lay the words out as inline-blocks so we can read their rows.
  //    Build per explicit-line word probes; an explicit \n forces a new row.
  const probes: HTMLSpanElement[] = [];
  const frag = document.createDocumentFragment();
  for (let li = 0; li < explicitLines.length; li++) {
    for (const word of explicitLines[li].split(/\s+/).filter(Boolean)) {
      const s = document.createElement('span');
      s.textContent = word;
      s.style.display = 'inline-block';
      frag.appendChild(s);
      frag.appendChild(document.createTextNode(' '));
      probes.push(s);
    }
    // Mark each explicit break with a sentinel that goes on its own offsetTop.
    if (li < explicitLines.length - 1) {
      const br = document.createElement('span');
      br.innerHTML = '\u200B'; // zero-width; flushes offsetTop past the line above
      br.style.display = 'inline-block';
      br.style.width = '100%';
      br.style.height = '0';
      frag.appendChild(br);
      probes.push(br);
    }
  }
  el.textContent = '';
  el.appendChild(frag);

  // 2. group by row (offsetTop), tolerance for mixed font metrics.
  const rows: string[][] = [];
  let last: number | null = null;
  for (const p of probes) {
    if (p.textContent === '') continue; // skip line-break sentinels
    const top = p.offsetTop;
    if (last === null || Math.abs(top - last) > 2) {
      rows.push([]);
      last = top;
    }
    rows[rows.length - 1].push(p.textContent ?? '');
  }

  // 3. rebuild as masked rows
  el.textContent = '';
  const inners: HTMLElement[] = [];
  for (const words of rows) {
    const line = document.createElement('span');
    line.className = 'esLine';
    const inner = document.createElement('span');
    inner.className = 'esLineInner';
    inner.textContent = words.join(' ');
    line.appendChild(inner);
    el.appendChild(line);
    inners.push(inner);
  }
  return inners;
}

/** Restores an element to its pre-split markup. */
export function unsplit(el: HTMLElement) {
  const original = el.getAttribute(ORIGINAL);
  if (original != null) el.innerHTML = original;
}

/* ────────────────────────────────────────────────────────────────
   Reveals
   ──────────────────────────────────────────────────────────────── */

type RevealOpts = { delay?: number; start?: string };

const START = 'top 88%';

/**
 * Upstream `[data-animation="title"]`: rows rise from a mask with a
 * perspective tilt, staggered 25ms apart.
 */
export function revealTitle(el: HTMLElement, opts: RevealOpts = {}) {
  const lines = splitLines(el);
  if (!lines.length) return null;
  el.classList.add('esSplit');
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: opts.start ?? START, once: true },
    delay: opts.delay ?? 0,
  });
  tl.set(el, { autoAlpha: 1 });
  lines.forEach((line, i) => {
    tl.fromTo(
      line,
      { autoAlpha: 0, yPercent: 100, rotateX: -80, rotateZ: 10 },
      {
        duration: 1.5,
        ease: 'expo.out',
        autoAlpha: 1,
        yPercent: 0,
        rotateX: 0,
        rotateZ: 0,
        clearProps: 'all',
      },
      i * 0.025,
    );
  });
  return tl;
}

/**
 * Upstream `[data-animation="excerpt"]`: the parent is clipped to 110% height
 * (so the descenders survive) and rows slide up inside it.
 */
export function revealExcerpt(el: HTMLElement, opts: RevealOpts = {}) {
  const lines = splitLines(el);
  if (!lines.length) return null;
  el.classList.add('esSplit');
  el.style.clipPath = 'polygon(0 0, 100% 0, 100% 110%, 0 110%)';
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: opts.start ?? START, once: true },
    delay: opts.delay ?? 0,
    onComplete: () => {
      el.style.clipPath = 'none';
    },
  });
  tl.set(el, { autoAlpha: 1 });
  lines.forEach((line, i) => {
    tl.fromTo(
      line,
      { autoAlpha: 0, yPercent: 100 },
      { duration: 1.5, ease: 'expo.out', autoAlpha: 1, yPercent: 0, clearProps: 'all' },
      i * 0.015,
    );
  });
  return tl;
}

/**
 * Upstream `span.separator`: the hairline rule draws out from the label and
 * the whole thing fades up. (GSAP cannot interpolate a `clamp()` custom
 * property, so the rule is scaled instead of width-animated.)
 */
export function revealSeparator(el: HTMLElement, opts: RevealOpts = {}) {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: el, start: opts.start ?? START, once: true },
    delay: opts.delay ?? 0,
  });
  tl.fromTo(
    el,
    { autoAlpha: 0, xPercent: 6 },
    { duration: 1.2, ease: 'expo.out', autoAlpha: 1, xPercent: 0, clearProps: 'transform' },
  );
  return tl;
}

/** Generic block rise — used for tiles, figures and cards. */
export function revealBlock(
  el: HTMLElement,
  opts: RevealOpts & { y?: number; stagger?: number; children?: string } = {},
) {
  const targets = opts.children
    ? Array.from(el.querySelectorAll<HTMLElement>(opts.children))
    : [el];
  if (!targets.length) return null;
  return gsap.fromTo(
    targets,
    { autoAlpha: 0, y: opts.y ?? 40 },
    {
      duration: 1.4,
      ease: 'expo.out',
      autoAlpha: 1,
      y: 0,
      stagger: opts.stagger ?? 0.08,
      delay: opts.delay ?? 0,
      clearProps: 'transform',
      scrollTrigger: { trigger: el, start: opts.start ?? START, once: true },
    },
  );
}

/* ────────────────────────────────────────────────────────────────
   Smooth scroll (Lenis) — upstream ships it too (`html.lenis.lenis-smooth`
   appears in their stylesheet).
   ──────────────────────────────────────────────────────────────── */

export type Lenis = {
  raf: (time: number) => void;
  destroy: () => void;
  stop: () => void;
  start: () => void;
  scrollTo: (target: number | string | HTMLElement, opts?: Record<string, unknown>) => void;
  on: (event: string, cb: (...a: unknown[]) => void) => void;
};

export async function createLenis(): Promise<Lenis | null> {
  if (prefersReducedMotion()) return null;
  try {
    const { default: LenisCtor } = await import('lenis');
    const instance = new LenisCtor({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    }) as unknown as Lenis & { resize?: () => void };
    // Keep ScrollTrigger and Lenis in lockstep.
    instance.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // Capture the original before overwriting — otherwise the override would
    // call itself and recurse forever.
    const originalDestroy = instance.destroy.bind(instance);
    return Object.assign(instance, {
      destroy: () => {
        gsap.ticker.remove(raf);
        originalDestroy();
      },
    });
  } catch {
    return null;
  }
}
