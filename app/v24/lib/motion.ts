/**
 * /v24 motion runtime.
 *
 * Every number here is the reference's own. Two sources:
 *
 *  - the builder's page config, which the reference ships inline as a 126 KB
 *    JSON blob. It describes motion as `element id -> animation -> mediaParams
 *    per breakpoint -> effect ids`, each effect carrying keyframes plus a
 *    start/end position on a normalised 0-100 scale. That blob was extracted
 *    into `data/animations.json`, so the port builds its timelines from the
 *    reference's real keyframes instead of approximating them.
 *  - the page's own inline `<script>` blocks, which hold the hand-written
 *    micro-interactions: the hero blur ramp, the header colour/hide logic, the
 *    scroll-driven advantage tabs, the anchor flash-mask, the Lottie scrub.
 *
 * `tt_animation.js` in the reference turns effects into GSAP percentage
 * keyframes; `buildKeyframes` below is that same transform.
 *
 * The reference is a plain script that never tears down. A route does, and
 * React StrictMode mounts every effect twice, so every registration here is
 * collected and reverted — see `collect`.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomEase from 'gsap/CustomEase';
import Lenis from 'lenis';
import type { AnimationSpec, Effect, MediaParams } from '../types';
import spec from '../data/animations.json';

const ANIMATIONS = spec as unknown as AnimationSpec;

/* ------------------------------------------------------------------ helpers */

type Cleanup = () => void;

/**
 * Registers a teardown and returns a single function that runs them all in
 * reverse. `gsap.context` owns the tweens; this owns everything else.
 *
 * The callback MUST return a function. A teardown written as the *body* runs
 * at mount instead — the failure mode is a feature that is attached and
 * detached in the same tick, with nothing in the console.
 */
function collect(list: Cleanup[]) {
  return (fn: () => Cleanup | void) => {
    const out = fn();
    if (typeof out !== 'function') {
      throw new Error('[v24] collect() callback must return a teardown function');
    }
    list.push(out);
  };
}

/** the reference's own ease resolver: passthrough for power/none, CustomEase otherwise */
const customEases = new Set<string>();
function resolveEase(id: string, ease: string): string {
  if (!ease) return 'none';
  if (ease.startsWith('power') || ease.startsWith('none')) return ease;
  const key = `v24-custom-${id}`;
  if (!customEases.has(key)) {
    // the reference hands CustomEase the raw "x1,y1,x2,y2" string
    CustomEase.create(key, ease);
    customEases.add(key);
  }
  return key;
}

/**
 * `tt_animation.js`'s `a()`: fold each effect's from/to keyframe onto its
 * start/end percentage. The first keyframe of a given property name wins, so a
 * later effect touching the same property only contributes its end state.
 */
function buildKeyframes(effects: Effect[]) {
  const seen = new Set<string>();
  const out: Record<string, Record<string, unknown>> = {};
  for (const { name, options, keyframes } of effects) {
    const start = `${options.startKeyframe}%`;
    const end = `${options.endKeyframe}%`;
    if (!seen.has(name)) {
      out[start] = { ...out[start], ...keyframes[0] };
      seen.add(name);
    }
    out[end] = { ...out[end], ...keyframes[1] };
  }
  return out;
}

/** which mediaParams entry applies at the current width */
function pickMedia(media: Record<string, MediaParams>, width: number): MediaParams | null {
  const ordered: Array<[string, boolean]> = [
    ['(min-width: 1920px)', width >= 1920],
    ['(min-width: 1440px)', width >= 1440],
    ['(max-width: 991px)', width <= 991],
    ['screen', true],
  ];
  for (const [key, matches] of ordered) {
    const entry = media[key];
    if (matches && entry && !entry.disabled) return entry;
  }
  return null;
}

/** resolves a triggerElement like `#igoxothd7_0`, falling back to the element itself */
function resolveTrigger(root: HTMLElement, selector: string | undefined, fallback: Element) {
  if (!selector) return fallback;
  const direct = root.querySelector(selector);
  if (direct) return direct;
  const key = selector.replace(/^#/, '').replace(/_\d+$/, '');
  return root.querySelector(`[data-v24-anim="${key}"]`) ?? fallback;
}

/* ------------------------------------------------------- animation timelines */

/**
 * Builds one ScrollTrigger-backed timeline per animated element, from the
 * extracted spec. Returns the ScrollTriggers so the caller can refresh them
 * once fonts and images have settled.
 */
export function buildAnimations(root: HTMLElement, width: number) {
  const triggers: ScrollTrigger[] = [];
  const timelines: gsap.core.Timeline[] = [];

  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-v24-anim]'))) {
    const key = el.getAttribute('data-v24-anim');
    if (!key) continue;
    const animations = ANIMATIONS[key];
    if (!animations) continue;

    for (const animation of animations) {
      const mp = pickMedia(animation.media, width);
      if (!mp || !mp.effects?.length) continue;

      const trigger = resolveTrigger(root, mp.triggerElement, el);
      const isScroll = animation.trigger === 'SCROLL_TRANSFORM';
      const isAppear = animation.trigger === 'APPEAR_ON_SCREEN';

      if (isScroll) {
        // The reference's `getScrollTrigger()` returns a *vars object* and hands
        // it straight to `gsap.timeline({scrollTrigger: vars})` — it never calls
        // `ScrollTrigger.create` itself. That matters: GSAP does not adopt an
        // existing ScrollTrigger instance passed this way, so pre-creating one
        // leaves the timeline unlinked and it plays freely to completion the
        // moment it is built. Every scroll-scrubbed element then snaps to its
        // final keyframe (the numbers strip jumped to x = -265.83vw at 8% of
        // its travel).
        //
        // start/end are assembled exactly as the reference does:
        //   `${startPosition}+=${startOffset} ${scrollerStartOffset}`
        const tl = gsap.timeline({
          id: animation.id,
          scrollTrigger: {
            trigger,
            start: `${mp.startPosition ?? 'top'}+=${mp.startOffset ?? '0%'} ${mp.scrollerStartOffset ?? 'top'}`,
            end: `${mp.endPosition ?? 'bottom'}+=${mp.endOffset ?? '0%'} ${mp.scrollerEndOffset ?? 'bottom'}`,
            scrub: mp.smoothing ?? true,
            invalidateOnRefresh: true,
          },
        });
        tl.to(el, { keyframes: buildKeyframes(mp.effects) });
        timelines.push(tl);
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      } else if (isAppear) {
        const once = Number(mp.iterations) === 1;
        const tl = gsap.timeline({
          id: animation.id,
          scrollTrigger: {
            trigger: el,
            start: `${mp.stageOfAppear ?? 'top'} bottom`,
            once,
            // The reference's own default is "play none restart reset", and
            // "play none none none" only when `iterations === 1`.
            toggleActions: once ? 'play none none none' : 'play none restart reset',
          },
        });
        // `getCommonVars` marks only the FIRST effect of each property name as
        // `immediateRender`; the rest are explicitly false. Without that, two
        // `fromTo`s at position 0 both render immediately and the later one's
        // "from" state stomps the earlier one — the classic flash. The
        // reference keys this off effect ids, which the extraction dropped, so
        // source order stands in for them (it is the same thing).
        const seenProps = new Set<string>();
        for (const effect of mp.effects) {
          const firstOfProp = !seenProps.has(effect.name);
          seenProps.add(effect.name);
          const { delay, duration } = effect.options;
          tl.fromTo(
            el,
            { ...effect.keyframes[0] },
            {
              ...effect.keyframes[1],
              delay,
              duration,
              ease: resolveEase(animation.id, effect.options.ease),
              immediateRender: firstOfProp,
            },
            0,
          );
        }
        timelines.push(tl);
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      } else if (animation.trigger === 'HOVER' || animation.trigger === 'CLICK') {
        // pointer-driven: a paused timeline the listeners play and reverse
        const tl = gsap.timeline({ paused: true, id: animation.id });
        const seenProps = new Set<string>();
        for (const effect of mp.effects) {
          const firstOfProp = !seenProps.has(effect.name);
          seenProps.add(effect.name);
          const { delay, duration } = effect.options;
          const vars: Record<string, unknown> = {
            delay,
            duration,
            ease: resolveEase(animation.id, effect.options.ease),
            immediateRender: firstOfProp,
          };
          // the reference's own guard: only an immediate-render effect with a
          // zero duration is nudged off zero (GSAP would otherwise skip it)
          if (firstOfProp && duration === 0) vars.duration = 0.001;
          tl.fromTo(el, { ...effect.keyframes[0] }, { ...effect.keyframes[1], ...vars }, 0);
        }
        timelines.push(tl);
        const enter = () => tl.play();
        const leave = () => tl.reverse();
        const click = () => (tl.progress() === 1 ? tl.reverse() : tl.play());
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        el.addEventListener('click', click);
        triggers.push({
          kill: () => {
            el.removeEventListener('mouseenter', enter);
            el.removeEventListener('mouseleave', leave);
            el.removeEventListener('click', click);
          },
        } as unknown as ScrollTrigger);
      }
    }
  }
  return { triggers, timelines };
}

/* -------------------------------------------------------------- smooth scroll */

/**
 * Lenis with the reference's exact configuration, read from its own inline
 * bootstrap. The reference sets `window.lenis`; this port deliberately does
 * not, because a host app may already own that global.
 */
export function createLenis(onFrame: (t: number) => void) {
  // The reference's own options, verbatim:
  //   {lerp:0.050, duration:1.2, wheelMultiplier:1.0, anchors:!0,
  //    gestureOrientation:'vertical', normalizeWheel:!1, smoothTouch:!1}
  // Two notes:
  //  - `normalizeWheel` is in the reference's config but was dropped from
  //    Lenis 1.3's type. `false` is the default either way, so the value is kept
  //    for fidelity and the object widened rather than quietly changed.
  //  - `smoothTouch` was renamed to `syncTouch` in Lenis 1.3; `false` is the
  //    default in both, so it is omitted rather than passed under a name the
  //    installed version would ignore.
  const options = {
    lerp: 0.05,
    duration: 1.2,
    wheelMultiplier: 1.0,
    anchors: true,
    gestureOrientation: 'vertical',
    normalizeWheel: false,
  };
  const lenis = new Lenis(options as ConstructorParameters<typeof Lenis>[0]);
  let raf = 0;
  const frame = (time: number) => {
    lenis.raf(time);
    onFrame(time);
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

/* ------------------------------------------------------------------- header */

/**
 * The reference's header runtime, verbatim in behaviour: the bar sits on a
 * translucent white pill until it passes 35vh, then swaps to a dark pill and a
 * dark logo whenever it is over a light section. On mobile the swap is driven
 * by the adaptive sections instead. The bar also hides on scroll-down and
 * shows on scroll-up, and stays hidden until the reviews section arrives.
 */
export function initHeader(root: HTMLElement, cleanups: Cleanup[]) {
  const header = root.querySelector<HTMLElement>('.header');
  if (!header) return () => {};

  const menuWrapper = header.querySelector<HTMLElement>('.menu__wrapper');
  const headerButton = header.querySelector<HTMLElement>('.header-button');
  const logoImage = header.querySelector<HTMLElement>('.logo__image');
  const logoPaths = logoImage ? Array.from(logoImage.querySelectorAll('path')) : [];

  const LIGHT_BG = 'rgba(255, 255, 255, 0.1)';
  const DARK_BG = 'rgba(0, 0, 0, 0.4)';
  const COVER_COLOR_DELAY_VH = 35;
  const TARGET_BG = ['rgb(255, 254, 252)', 'rgb(245, 245, 245)'];

  let scrollPrev = 0;
  let overReviews = false;

  function isHeaderOverLightSection() {
    const headerBottom = header!.getBoundingClientRect().bottom;
    for (const section of Array.from(root.querySelectorAll<HTMLElement>('.section'))) {
      const bg = getComputedStyle(section).backgroundColor;
      if (!TARGET_BG.includes(bg)) continue;
      const rect = section.getBoundingClientRect();
      if (headerBottom > rect.top && headerBottom < rect.bottom) return true;
    }
    return false;
  }

  function isOverAdaptiveSections() {
    const headerBottom = header!.getBoundingClientRect().bottom;
    for (const section of Array.from(root.querySelectorAll<HTMLElement>('.numbers-adaptive, .advantages-adaptive'))) {
      const rect = section.getBoundingClientRect();
      if (headerBottom > rect.top && headerBottom < rect.bottom) return true;
    }
    return false;
  }

  function refresh() {
    const scrolled = window.scrollY;
    const isMobile = window.innerWidth <= 991;

    let isDark: boolean;
    if (isMobile) {
      isDark = isOverAdaptiveSections() ? true : isHeaderOverLightSection();
    } else {
      const delayPx = COVER_COLOR_DELAY_VH * (window.innerHeight / 100);
      isDark = scrolled < delayPx ? false : isHeaderOverLightSection();
    }

    const bg = isDark ? DARK_BG : LIGHT_BG;
    if (menuWrapper) menuWrapper.style.backgroundColor = bg;
    if (headerButton) headerButton.style.backgroundColor = bg;
    const fill = isDark ? '#010f2b' : '#FFFEFC';
    for (const p of logoPaths) p.style.setProperty('fill', fill, 'important');
    header!.dataset.v24HeaderTheme = isDark ? 'dark' : 'light';
    // the reference injects a stylesheet to retarget :hover; a data attribute on
    // the wrapper does the same job without touching the document.
    root.dataset.v24HeaderTheme = isDark ? 'dark' : 'light';

    // hidden until the reviews section's top crosses 9% of the viewport
    const reviews =
      root.querySelector<HTMLElement>('.reviews') ??
      root.querySelector<HTMLElement>('.reviews-adaptive');
    overReviews = reviews ? reviews.getBoundingClientRect().top <= window.innerHeight * 0.09 : false;

    if (overReviews || (scrolled > 100 && scrolled > scrollPrev)) {
      header!.style.transform = 'translateY(-100%)';
      header!.style.opacity = '0';
    } else {
      header!.style.transform = 'translateY(0)';
      header!.style.opacity = '1';
    }
    scrollPrev = scrolled;
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      refresh();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refresh);
  refresh();
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', refresh);
  });
  return refresh;
}

/* ----------------------------------------------------------------- hero blur */

/**
 * The hero's copy blurs out as the cover scrolls away: 0 -> 20px between 20%
 * and 50% of the cover's travel, then back to 0 by 70%. The pre-order button
 * also stops accepting clicks past 25%, which is what makes the CTA read as
 * "the hero has moved on" rather than "the button is broken".
 */
export function initHeroBlur(root: HTMLElement, cleanups: Cleanup[]) {
  const section = root.querySelector<HTMLElement>('.cover');
  if (!section) return () => {};

  const targets = Array.from(
    section.querySelectorAll<HTMLElement>('.cover__title, .cover__subtitle, .pre-order-button'),
  );
  const buttons = targets.filter((el) => el.matches('.pre-order-button'));
  if (!targets.length) return () => {};

  const update = () => {
    const maxScroll = section.offsetHeight - window.innerHeight;
    const raw = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const progress = Math.min(1, Math.max(0, raw));

    const blocked = progress >= 0.25;
    for (const btn of buttons) btn.style.pointerEvents = blocked ? 'none' : '';

    const start1 = 0.2;
    const peak = 0.5;
    const end1 = 0.7;
    let blur = 0;
    if (progress >= start1 && progress <= peak) blur = ((progress - start1) / (peak - start1)) * 20;
    else if (progress > peak && progress <= end1) blur = (1 - (progress - peak) / (end1 - peak)) * 20;

    for (const el of targets) {
      el.style.filter = `blur(${blur}px)`;
      el.style.transition = 'filter 0.08s linear';
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  cleanups.push(() => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  });
  return update;
}

/* -------------------------------------------------------------------- videos */

/**
 * Videos play only while a share of them is on screen; the poster fades 200 ms
 * after load. Both are the reference's own thresholds.
 *
 * The poster is only hidden once a video can actually play. The reference can
 * assume its MP4s are there; this port cannot — the origin is unreachable and
 * the videos could not be mirrored, so the `<video>` elements carry a poster
 * still instead of a source (see `.tmp-numa/port-jsx.mjs`). Hiding the overlay
 * on a timer would uncover an empty element.
 */
export function initVideos(root: HTMLElement, cleanups: Cleanup[]) {
  const videos = Array.from(
    root.querySelectorAll<HTMLVideoElement>('.cover__video, .cover-adaptive__video, .advantages__video'),
  );
  const poster = root.querySelector<HTMLElement>('.video-poster');

  const timers: number[] = [];
  const hidePoster = () => poster?.classList.add('hide');

  const hero = root.querySelector<HTMLVideoElement>('.cover__video');
  if (hero) {
    // `canplay` fires only when there is real media behind the element
    hero.addEventListener('canplay', hidePoster, { once: true });
    timers.push(window.setTimeout(() => {
      if (hero.readyState >= 2) hidePoster();
    }, 200));
  }

  const observers: IntersectionObserver[] = [];
  for (const video of videos) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.5) void video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(video);
    observers.push(io);
  }

  cleanups.push(() => {
    for (const t of timers) clearTimeout(t);
    for (const io of observers) io.disconnect();
    hero?.removeEventListener('canplay', hidePoster);
  });
  return () => {};
}

/* ---------------------------------------------------------- advantages tabs */

/**
 * The advantages section is a tall scroll stage: three tabs correspond to three
 * points in its travel (0%, 50%, 100%), and clicking one eases the page there
 * over 1200 ms — 1500 ms for the 2 <-> 3 hop, which the reference treats as the
 * long jump.
 */
export function initAdvantagesTabs(root: HTMLElement, cleanups: Cleanup[]) {
  const section = root.querySelector<HTMLElement>('.advantages');
  if (!section) return () => {};
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-tab]'));
  if (!tabs.length) return () => {};

  const TAB_POSITIONS = [0, 0.5, 1];
  const BASE = 1200;
  const SPECIAL = 1500;
  let sectionTop = section.offsetTop;
  let scrollLength = section.scrollHeight - window.innerHeight;

  const measure = () => {
    sectionTop = section.offsetTop;
    scrollLength = section.scrollHeight - window.innerHeight;
  };

  const activeTab = () => {
    const percent = (window.scrollY - sectionTop) / scrollLength;
    if (percent < 0.38) return 1;
    if (percent < 0.63) return 2;
    return 3;
  };

  // the reference's own cubic in/out, kept because the feel is part of the design
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

  let raf = 0;
  function scrollTo(targetY: number, duration: number) {
    cancelAnimationFrame(raf);
    const startY = window.scrollY;
    const diff = targetY - startY;
    let start: number | undefined;
    const step = (ts: number) => {
      if (start === undefined) start = ts;
      const percent = Math.min((ts - start) / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(percent));
      if (percent < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  const handlers: Array<[HTMLElement, () => void]> = [];
  for (const tab of tabs) {
    // the reference reads this by the invalid attribute name `tab`; the
    // transcription moves it to `data-tab` so the markup is valid JSX
    const index = Number(tab.getAttribute('data-tab'));
    const onClick = () => {
      const current = activeTab();
      if (index === current) return;
      const target = sectionTop + TAB_POSITIONS[index - 1] * scrollLength;
      const longHop = (current === 2 && index === 3) || (current === 3 && index === 2);
      scrollTo(target, longHop ? SPECIAL : BASE);
    };
    tab.addEventListener('click', onClick);
    handlers.push([tab, onClick]);
  }

  window.addEventListener('resize', measure);
  cleanups.push(() => {
    cancelAnimationFrame(raf);
    for (const [el, fn] of handlers) el.removeEventListener('click', fn);
    window.removeEventListener('resize', measure);
  });
  return measure;
}

/* -------------------------------------------------------------------- lottie */

/** one scrubbed Lottie instance: the player, its frame count and the element
 *  whose visibility gates playback */
interface LottieEntry {
  seek: (frame: number) => void;
  totalFrames: number;
  container: HTMLElement;
  active: boolean;
}

/**
 * The metrics section is a scroll-scrubbed Lottie. The reference loads the
 * player from unpkg at runtime; the port loads the same build from
 * `/v24/vendor/` so the route has no third-party runtime dependency and
 * package.json stays untouched.
 *
 * Playback only starts once 30% of the container is visible, and the frame is
 * driven by the block's own travel — both the reference's numbers.
 */
export function initLottie(root: HTMLElement, cleanups: Cleanup[]) {
  const containers = Array.from(root.querySelectorAll<HTMLElement>('.metrics__lottie-animate'));
  if (!containers.length) return () => {};

  const SRC = '/v24/vendor/lottie-player.js';
  let disposed = false;
  let raf = 0;

  const start = () => {
    if (disposed) return;
    const players: LottieEntry[] = [];

    for (const container of containers) {
      if (container.querySelector('lottie-player')) continue;
      const player = document.createElement('lottie-player');
      player.setAttribute('src', '/v24/vendor/data.json');
      player.setAttribute('background', 'transparent');
      (player as HTMLElement).style.width = '100%';
      (player as HTMLElement).style.height = '100%';
      container.appendChild(player);

      // annotated, not inferred: `seek` starts as a no-op and is replaced once
      // the player reports `ready`, and an inferred `() => void` cannot be
      // reassigned a `(frame: number) => void`.
      const entry: LottieEntry = { seek: () => {}, totalFrames: 0, container, active: false };
      player.addEventListener('ready', () => {
        const anim = (player as unknown as { getLottie: () => { totalFrames: number } }).getLottie();
        entry.totalFrames = anim.totalFrames;
        entry.seek = (frame: number) => (player as unknown as { seek: (f: number) => void }).seek(frame);
      });
      players.push(entry);
    }

    const block = root.querySelector<HTMLElement>('.metrics__lottie-block');
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!block) return;
      for (const entry of players) {
        if (!entry.totalFrames) continue;
        const rect = entry.container.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        if (rect.height > 0 && visible / rect.height >= 0.3) entry.active = true;
        else {
          entry.active = false;
          continue;
        }
        const scrollable = block.offsetHeight - window.innerHeight;
        let progress = 1;
        if (scrollable > 0) {
          const blockTop = window.scrollY + block.getBoundingClientRect().top;
          progress = Math.max(0, Math.min(1, (window.scrollY - blockTop) / scrollable));
        }
        entry.seek(Math.round(progress * (entry.totalFrames - 1)));
      }
    };
    raf = requestAnimationFrame(tick);
  };

  const existing = document.querySelector<HTMLScriptElement>(`script[data-v24-lottie]`);
  let script: HTMLScriptElement | null = existing;
  const onLoad = () => start();
  if (!existing) {
    script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.dataset.v24Lottie = 'true';
    script.addEventListener('load', onLoad);
    document.head.appendChild(script);
  } else {
    start();
  }

  cleanups.push(() => {
    disposed = true;
    cancelAnimationFrame(raf);
    if (script) script.removeEventListener('load', onLoad);
  });
  return () => {};
}

/* ------------------------------------------------------------------- anchors */

/**
 * The reference intercepts in-page anchor clicks, masks the jump with a
 * full-screen flash and, for the steps section, walks the scroll in ten eased
 * increments so the reveal is visible instead of skipped.
 */
export function initAnchors(root: HTMLElement, cleanups: Cleanup[], lenis: Lenis | null) {
  const flash = document.createElement('div');
  flash.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#f5f5f5;z-index:9999999;display:none;pointer-events:none;';
  root.appendChild(flash);

  const timers: number[] = [];

  const cleanupStyles = () => {
    document.documentElement.style.overflow = '';
    flash.style.display = 'none';
    flash.style.pointerEvents = 'none';
    lenis?.start();
  };

  const jump = (anchorId: string) => {
    const anchor = root.querySelector<HTMLElement>(`#${CSS.escape(anchorId)}`);
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    if (!anchor) {
      cleanupStyles();
      return;
    }

    const isSteps = anchor.closest('.steps') !== null;
    const rect = anchor.getBoundingClientRect();
    const targetY = Math.max(rect.top + window.scrollY, anchor.offsetTop);

    if (!isSteps) {
      window.scrollTo(0, targetY);
      timers.push(window.setTimeout(cleanupStyles, 100));
      return;
    }

    root.classList.add('disable-steps-animations');
    const pre = Math.max(0, targetY - 150);
    window.scrollTo(0, pre);
    const STEPS = 10;
    const DURATION = 400;
    for (let i = 1; i <= STEPS; i++) {
      timers.push(
        window.setTimeout(() => {
          const progress = i / STEPS;
          const eased = 1 - Math.pow(1 - progress, 5);
          window.scrollTo(0, pre + (targetY - pre) * eased);
          if (i === STEPS) {
            const finalRect = anchor.getBoundingClientRect();
            if (finalRect.top < 0 || finalRect.top > window.innerHeight) window.scrollTo(0, targetY);
          }
        }, (DURATION / STEPS) * i),
      );
    }
    timers.push(
      window.setTimeout(() => {
        cleanupStyles();
        timers.push(window.setTimeout(() => root.classList.remove('disable-steps-animations'), 100));
      }, 850),
    );
  };

  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const anchorId = href.slice(1);
    if (!anchorId) return;
    event.preventDefault();
    event.stopPropagation();
    flash.style.display = 'block';
    flash.style.pointerEvents = 'auto';
    jump(anchorId);
    history.replaceState(null, '', `#${anchorId}`);
  };

  document.addEventListener('click', onClick, { capture: true });
  cleanups.push(() => {
    document.removeEventListener('click', onClick, { capture: true });
    for (const t of timers) clearTimeout(t);
    cleanupStyles();
    flash.remove();
  });
  return () => {};
}

/* -------------------------------------------------------------------- popups */

/**
 * The reference opens the pre-order pop-up by setting `position: fixed` on
 * <body> and stops Lenis. A route cannot mutate the shared document that way,
 * so the same state is expressed as `data-v24-locked` on the wrapper — the
 * theme sheet turns that into `overflow: hidden` — and Lenis is stopped
 * directly. The visual result is identical and nothing outside the route moves.
 */
export function initPopups(root: HTMLElement, cleanups: Cleanup[], lenis: Lenis | null) {
  const triggers = Array.from(root.querySelectorAll<HTMLElement>('[data-action-element]'));
  const openPopups = new Set<HTMLElement>();

  const sync = () => {
    const locked = openPopups.size > 0;
    root.dataset.v24Locked = locked ? 'true' : 'false';
    if (locked) lenis?.stop();
    else lenis?.start();
  };

  const handlers: Array<[HTMLElement, (e: Event) => void]> = [];

  for (const trigger of triggers) {
    const targetId = trigger.getAttribute('data-action-element');
    if (!targetId) continue;
    const onClick = (event: Event) => {
      const popup =
        root.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`) ??
        root.querySelector<HTMLElement>(`.pop-up--u-${CSS.escape(targetId)}`);
      if (!popup) return;
      event.preventDefault();
      popup.classList.add('pop-up--open');
      openPopups.add(popup);
      sync();
    };
    trigger.addEventListener('click', onClick);
    handlers.push([trigger, onClick]);
  }

  for (const closer of Array.from(root.querySelectorAll<HTMLElement>('.pop-up__inside-close-button, .pop-up__outside-close-button, .pop-up__overlay'))) {
    const onClick = () => {
      const popup = closer.closest<HTMLElement>('.pop-up');
      if (!popup) return;
      popup.classList.remove('pop-up--open');
      openPopups.delete(popup);
      sync();
    };
    closer.addEventListener('click', onClick);
    handlers.push([closer, onClick]);
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !openPopups.size) return;
    for (const popup of openPopups) popup.classList.remove('pop-up--open');
    openPopups.clear();
    sync();
  };
  document.addEventListener('keydown', onKey);

  cleanups.push(() => {
    for (const [el, fn] of handlers) el.removeEventListener('click', fn);
    document.removeEventListener('keydown', onKey);
    root.dataset.v24Locked = 'false';
    lenis?.start();
  });
  return () => {};
}

/* --------------------------------------------------------------------- boot */

export interface MotionOptions {
  /** the scoped wrapper — every query in this module is rooted here */
  root: HTMLElement;
  /** the route shell writes this attribute so the global sheet activates */
  activeAttribute: string;
}

export interface MotionRuntime {
  destroy(): void;
  refresh(): void;
}

/**
 * Boots the whole runtime. Returns a handle whose `destroy` reverts every tween
 * and listener — required because StrictMode runs the effect twice and because
 * a route can be navigated away from.
 */
export function createMotion({ root, activeAttribute }: MotionOptions): MotionRuntime {
  gsap.registerPlugin(ScrollTrigger);

  const cleanups: Cleanup[] = [];
  const collectFn = collect(cleanups);
  const ctx = gsap.context(() => {}, root);

  // Lenis drives the real window scroll; its rAF loop also pumps ScrollTrigger
  // so the two never disagree about the scroll position.
  const { lenis, destroy: destroyLenis } = createLenis(() => ScrollTrigger.update());
  cleanups.push(destroyLenis);
  document.documentElement.classList.add('lenis');

  const refreshHeader = initHeader(root, cleanups);
  const refreshBlur = initHeroBlur(root, cleanups);
  initVideos(root, cleanups);
  const measureAdvantages = initAdvantagesTabs(root, cleanups);
  initLottie(root, cleanups);
  initAnchors(root, cleanups, lenis);
  initPopups(root, cleanups, lenis);

  let triggers: ScrollTrigger[] = [];
  let timelines: gsap.core.Timeline[] = [];
  const build = () => {
    for (const t of timelines) t.kill();
    for (const t of triggers) t.kill();
    const built = buildAnimations(root, window.innerWidth);
    triggers = built.triggers;
    timelines = built.timelines;
  };
  build();

  /** fonts and images land after first paint and change every measurement below */
  const refresh = () => {
    measureAdvantages();
    refreshHeader();
    refreshBlur();
    ScrollTrigger.refresh();
  };

  const onLoad = () => refresh();
  window.addEventListener('load', onLoad);
  if (document.fonts?.ready) void document.fonts.ready.then(refresh);

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // breakpoints change which mediaParams entry applies, so rebuild
      build();
      refresh();
    }, 200);
  };
  window.addEventListener('resize', onResize);

  cleanups.push(() => {
    window.removeEventListener('load', onLoad);
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
    for (const t of timelines) t.kill();
    for (const t of triggers) t.kill();
    // Safety net. GSAP registers a ScrollTrigger on the timeline, and a trigger
    // created for an element that has since been re-rendered can outlive the
    // arrays above. Only triggers whose element is inside this route's subtree
    // are eligible, so nothing outside the route can be touched.
    for (const st of ScrollTrigger.getAll()) {
      if (st.trigger instanceof Element && root.contains(st.trigger)) st.kill();
    }
    ctx.revert();
    document.documentElement.classList.remove('lenis');
    document.documentElement.removeAttribute(activeAttribute);
    root.removeAttribute('data-v24-locked');
    root.removeAttribute('data-v24-header-theme');
  });

  return {
    refresh,
    destroy() {
      while (cleanups.length) cleanups.pop()!();
    },
  };
}
