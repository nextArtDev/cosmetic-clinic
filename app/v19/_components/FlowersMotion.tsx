'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { X, ArrowUpLeft, ShoppingBag } from 'lucide-react';
import type Lenis from 'lenis';
import s from './FlowersMotion.module.css';

const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ *
 * Hydration-safe reduced-motion detection. `useReducedMotion()` from
 * motion reads the media query during the very first client render, so
 * a visitor who prefers reduced motion hydrates against server HTML
 * that was rendered with motion enabled. This hook reports `false` on
 * the server and on the first client render (so hydration matches) and
 * applies the real preference immediately afterwards. Same shape as the
 * cart-hydration effect below.
 * ------------------------------------------------------------------ */
export function useSafeReducedMotion() {
  const [reduced, setReduced] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- the server cannot evaluate the media query, so the real preference can only be applied after mount. */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  return reduced;
}

/* ------------------------------------------------------------------ *
 * Film grain — upstream injects a fixed 70px noise.gif layer at 15%
 * opacity over the whole document (inline/40).
 * ------------------------------------------------------------------ */
export function NoiseOverlay() {
  return <div className={s.grain} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ *
 * Blur text — the GSAP SplitType + ScrollTrigger reveal from
 * inline/43, applied upstream to the hero headline and eight section
 * headings. Words are staggered rather than characters because
 * Arabic-script glyphs would lose their cursive joins if split.
 * ------------------------------------------------------------------ */
export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.9,
  duration = 0.6,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
}) {
  const lines = useMemo(() => text.split('\n').map((line) => line.split(/\s+/).filter(Boolean)), [text]);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.length, 0), [lines]);

  // No reduced-motion branch: this reveal only animates opacity and filter, so
  // it carries no vestibular risk, and branching here would either desync
  // hydration or leave the words stuck at opacity 0.
  if (total < 2) return <span className={className}>{text}</span>;

  const step = stagger / total;

  return (
    <motion.span
      className={`${s.blurText} ${className ?? ''}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } }}
    >
      {lines.map((words, lineIndex) => (
        <Fragment key={`line-${lineIndex}`}>
          {lineIndex > 0 ? <br /> : null}
          {words.map((word, wordIndex) => (
            <Fragment key={`${lineIndex}-${wordIndex}`}>
              <motion.span
                className={s.blurWord}
                variants={{
                  hidden: { opacity: 0, filter: 'blur(10px)' },
                  show: { opacity: 1, filter: 'blur(0px)', transition: { duration, ease: 'easeOut' } },
                }}
              >
                {word}
              </motion.span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </Fragment>
      ))}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ *
 * Link slide — upstream mirrors each anchor label into data-content
 * inside `.wrapper-slide-text` so it can slide up on hover (inline/42).
 * ------------------------------------------------------------------ */
export function LinkSlide({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`${s.linkSlide} ${className ?? ''}`}>
      <span className={s.linkSlideInner}>
        <span className={s.linkSlideLabel}>{label}</span>
        <span className={`${s.linkSlideLabel} ${s.linkSlideAlt}`} aria-hidden="true">
          {label}
        </span>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Cursor preview — StringTune's StringCursor (lerp 0.75) driving the
 * `.tutorial-cursor` figures from inline/37. The native cursor is kept,
 * exactly as upstream does.
 * ------------------------------------------------------------------ */
export function CursorLayer() {
  const reduced = useSafeReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const keyRef = useRef('');
  const [live, setLive] = useState(false);
  const [preview, setPreview] = useState<{ src: string; label: string } | null>(null);

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const node = host.current;
    if (!node) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let started = false;
    let frame = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.75;
      currentY += (targetY - currentY) * 0.75;
      node.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        started = true;
        currentX = targetX;
        currentY = targetY;
        setLive(true);
      }
      const target = (event.target as Element | null)?.closest?.('[data-flower-cursor]') as HTMLElement | null;
      const next = target ? `${target.dataset.flowerCursor}|${target.dataset.flowerCursorLabel ?? ''}` : '';
      if (next !== keyRef.current) {
        keyRef.current = next;
        setPreview(target ? { src: target.dataset.flowerCursor ?? '', label: target.dataset.flowerCursorLabel ?? '' } : null);
      }
    };

    const onLeave = () => {
      started = false;
      keyRef.current = '';
      setLive(false);
      setPreview(null);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`${s.cursor} ${live ? s.cursorLive : ''} ${preview ? s.cursorActive : ''}`}
    >
      <div className={s.cursorFigure}>
        {preview?.src ? <img src={preview.src} alt="" /> : null}
        {preview?.label ? <span>{preview.label}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sticky header — upstream's fixed 120px bar (rec1835390891) that
 * slides down from translateY(-120px) once the hero is passed.
 * ------------------------------------------------------------------ */
export function StickyHeader({
  visible,
  count,
  onNav,
  onContact,
  onCart,
}: {
  visible: boolean;
  count: number;
  onNav: (id: string) => void;
  onContact: () => void;
  onCart: () => void;
}) {
  const reduced = useSafeReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const links: [string, string][] = [
    ['نگاه ما', 'flowers-story'],
    ['مجموعه گل‌ها', 'flowers-catalog'],
    ['آدم‌های سیم', 'flowers-team'],
  ];

  return (
    <motion.header
      className={s.stickyBar}
      initial={false}
      animate={{ y: visible ? '0%' : '-108%' }}
      transition={{ duration: 0.55, ease }}
      inert={visible ? undefined : true}
    >
      <div className={s.stickyInner}>
        <button className={s.stickyLogo} onClick={() => onNav('flowers-top')} aria-label="گل سیم، بازگشت به بالا">
          گُل<span>/</span>سیم<sup>®</sup>
        </button>
        <nav className={s.stickyNav} aria-label="ناوبری چسبان">
          {links.map(([label, id]) => (
            <button key={id} onClick={() => onNav(id)}>
              <LinkSlide label={label} />
            </button>
          ))}
          <button onClick={onContact}>
            <LinkSlide label="گفت‌وگو با ما" />
          </button>
        </nav>
        <div className={s.stickyPreview}>
          {visible && !reduced ? (
            <video muted loop playsInline autoPlay poster="/flowers/quiet.webp" src="/flowers/blossom.mp4" />
          ) : null}
          <span>
            مجموعه گل‌ها <ArrowUpLeft size={13} />
          </span>
        </div>
        <button className={s.stickyCart} onClick={onCart} aria-label="سبد گل">
          <ShoppingBag size={17} strokeWidth={1.5} />
          <span>{count}</span>
        </button>
      </div>
      <motion.span className={s.stickyProgress} style={{ scaleX: progress }} />
    </motion.header>
  );
}

/* ------------------------------------------------------------------ *
 * Pinned showcase — upstream pins four full-bleed images in sequence
 * while a card swaps its copy (rec1825455681, sbs event "scroll",
 * fi:'fixed', di 10000 / 3100 / 2400 / 1400).
 * ------------------------------------------------------------------ */
export type ShowcaseItem = { id: string; label: string; english: string; image: string; text: string };

function PinLayer({
  item,
  index,
  count,
  progress,
}: {
  item: ShowcaseItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const start = index / count;
  const end = (index + 1) / count;
  const fade = 0.45 / count;
  const eps = 1e-4;
  const a = Math.max(0, start - fade);
  const b = Math.max(a + eps, start);
  const c = Math.max(b + eps, end - fade);
  const d = Math.max(c + eps, end);
  const opacity = useTransform(progress, [a, b, c, d], [index === 0 ? 1 : 0, 1, 1, index === count - 1 ? 1 : 0]);
  const scale = useTransform(progress, [a, d], [1.08, 1]);

  return (
    <motion.div className={s.pinLayer} style={{ opacity, scale }}>
      <img src={item.image} alt={item.label} loading="lazy" />
    </motion.div>
  );
}

export function PinnedShowcase({
  items,
  eyebrow,
  onSelect,
}: {
  items: ShowcaseItem[];
  eyebrow: string;
  onSelect: (id: string) => void;
}) {
  const reduced = useSafeReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  const count = items.length;

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setActive((current) => (current === next ? current : next));
  });

  if (reduced) {
    return (
      <section className={s.pinWrap}>
        <div className={s.pinStatic}>
          {items.map((item) => (
            <button key={item.id} className={s.pinCard} onClick={() => onSelect(item.id)}>
              <div className={s.pinCardImage}>
                <img src={item.image} alt={item.label} loading="lazy" />
              </div>
              <h3 className={s.pinCardTitle}>{item.label}</h3>
              <p className={s.pinCardText}>{item.text}</p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const current = items[active];

  return (
    <div ref={wrap} className={s.pinWrap} style={{ height: `${count * 100}vh` }}>
      <div className={s.pinViewport}>
        {items.map((item, index) => (
          <PinLayer key={item.id} item={item} index={index} count={count} progress={scrollYProgress} />
        ))}
        <div className={s.pinLayerShade} />

        <div className={s.pinCardWrap}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className={s.pinCard}
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -32 }}
              transition={{ duration: 0.5, ease }}
            >
              <button
                className={s.pinCardImage}
                onClick={() => onSelect(current.id)}
                data-flower-cursor={current.image}
                data-flower-cursor-label={current.english}
                aria-label={`دیدن گل‌های دسته ${current.label}`}
              >
                <img src={current.image} alt={current.label} loading="lazy" />
                <span className={s.pinCardIndex}>( {current.english} )</span>
              </button>
              <h3 className={s.pinCardTitle}>
                <BlurText text={current.label} stagger={0.5} />
              </h3>
              <p className={s.pinCardText}>{current.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={s.pinRail}>
          {items.map((item, index) => (
            <button
              key={item.id}
              className={index === active ? s.pinRailActive : ''}
              onClick={() => onSelect(item.id)}
              aria-label={item.label}
            >
              <span>{item.label}</span>
              <i />
            </button>
          ))}
        </div>

        <span className={s.pinHint}>{eyebrow}</span>
        <span className={s.pinCount} dir="ltr">
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Zoom lightbox — upstream loads tilda-zoom for its eight zoomable
 * product images.
 * ------------------------------------------------------------------ */
export function ZoomLightbox({
  open,
  src,
  caption,
  onClose,
}: {
  open: boolean;
  src: string;
  caption?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={s.zoomOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={caption || 'نمایش بزرگ تصویر'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button className={s.zoomClose} onClick={onClose} aria-label="بستن">
            <X size={22} />
          </button>
          <motion.figure
            className={s.zoomFigure}
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={src} alt={caption ?? ''} />
            {caption ? <figcaption className={s.zoomCaption}>{caption}</figcaption> : null}
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 * Decorative hairline — upstream's section rules are literal runs of
 * "1" glyphs (six <span>11111111111</span> nodes).
 * ------------------------------------------------------------------ */
export function Rule({ className }: { className?: string }) {
  return (
    <div className={`${s.rule} ${className ?? ''}`} aria-hidden="true">
      {'1'.repeat(460)}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Smooth scroll — upstream loads SmoothScroll.js with
 * { stepSize: 80, animationTime: 1400 }. Recreated with the Lenis
 * dependency already present in the repo, desktop fine pointers only,
 * disabled for reduced motion, and torn down on unmount.
 * ------------------------------------------------------------------ */
export function useSmoothScroll() {
  const reduced = useSafeReducedMotion();
  const instance = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let disposed = false;
    let frame = 0;
    let lenis: Lenis | null = null;

    void import('lenis')
      .then(({ default: LenisCtor }) => {
        if (disposed) return;
        lenis = new LenisCtor({ duration: 1.4, smoothWheel: true, touchMultiplier: 1.6 });
        instance.current = lenis;
        const loop = (time: number) => {
          lenis?.raf(time);
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      })
      .catch(() => {
        /* Smooth scrolling is a progressive enhancement. */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
      instance.current = null;
    };
  }, [reduced]);

  return useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;
      const lenis = instance.current;
      if (lenis) lenis.scrollTo(element, { offset: -12, duration: 1.3 });
      else element.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    },
    [reduced],
  );
}
