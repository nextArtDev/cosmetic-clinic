'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  gsap,
  ScrollTrigger,
  registerElitoneMotion,
  revealBlock,
  revealExcerpt,
  revealSeparator,
  revealTitle,
  createLenis,
  type Lenis,
} from '../lib/engine';
import type { BlogPost, ProductCategory, Showroom } from '../data';
import Cursor from './Cursor';
import Footer from './Footer';
import Hero from './Hero';
import Lightbox from './Lightbox';
import Navigation, { useScrollState } from './Navigation';
import Preloader from './Preloader';
import { About, Contacts, CtaShortcuts, Journal, Products, Showrooms } from './Sections';
import styles from './elitone.module.css';
import './elitone.global.css';

registerElitoneMotion();

/** SSR-safe layout effect (used to hide reveal targets before first paint). */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type Props = {
  posts: BlogPost[];
  showrooms: Showroom[];
  products: ProductCategory[];
};

export default function Experience({ posts, showrooms, products }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [booted, setBooted] = useState(false);
  const [skipPreloader, setSkipPreloader] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const scroll = useScrollState();

  const loading = !booted && !skipPreloader;

  /* ── route isolation ─────────────────────────────────────────────
     `html[data-v22-active]` is the only global hook this route uses; it is
     removed on unmount, so the home page and every sibling route see the
     document exactly as they left it. */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-v22-active', '');
    return () => html.removeAttribute('data-v22-active');
  }, []);

  /* ── session gate for the preloader (upstream sessionStorage 'init') ── */
  useEffect(() => {
    try {
      // Client-only read: must not run on the server, and the resulting flag
      // only matters after hydration — so the effect is the right place.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem('es-v22-init')) setSkipPreloader(true);
    } catch {
      /* sessionStorage unavailable — run the preloader */
    }
  }, []);

  const handlePreloaded = useCallback(() => {
    setBooted(true);
    try {
      sessionStorage.setItem('es-v22-init', '1');
    } catch {
      /* ignore */
    }
  }, []);

  /* ── smooth scroll ───────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    createLenis().then((instance) => {
      if (cancelled) {
        instance?.destroy();
        return;
      }
      lenisRef.current = instance;
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ── lock scrolling behind the menu / lightbox ─────────────────── */
  useEffect(() => {
    const locked = menuOpen || lightbox.open;
    const html = document.documentElement;
    if (locked) {
      lenisRef.current?.stop();
      html.style.overflow = 'hidden';
    } else {
      lenisRef.current?.start();
      html.style.overflow = '';
    }
    return () => {
      html.style.overflow = '';
    };
  }, [menuOpen, lightbox.open]);

  /* ── scroll progress rail ─────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (railRef.current) railRef.current.style.width = `${(p * 100).toFixed(2)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── reveals ──────────────────────────────────────────────────────
     One pass over the route's own [data-es-anim] / [data-es-reveal] nodes,
     mirroring upstream's `e.animated = { titles, excerpts, separators }`. */
  useIsoLayoutEffect(() => {
    if (loading) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const q = <T extends HTMLElement>(sel: string) =>
        Array.from(root.querySelectorAll<T>(sel));

      q('[data-es-anim="title"]').forEach((el) => {
        gsap.set(el, { autoAlpha: 0 });
        revealTitle(el, { delay: Number(el.dataset.esAnimDelay ?? 0) });
      });
      q('[data-es-anim="excerpt"]').forEach((el) => {
        gsap.set(el, { autoAlpha: 0 });
        revealExcerpt(el, { delay: Number(el.dataset.esAnimDelay ?? 0) });
      });
      q('[data-es-anim="separator"]').forEach((el) => {
        gsap.set(el, { autoAlpha: 0 });
        revealSeparator(el, { delay: Number(el.dataset.esAnimDelay ?? 0) });
      });
      q('[data-es-reveal]').forEach((el) => {
        revealBlock(el, {
          y: Number(el.dataset.esRevealY ?? 40),
          delay: Number(el.dataset.esRevealDelay ?? 0),
          children: el.dataset.esRevealChildren,
          stagger: Number(el.dataset.esRevealStagger ?? 0.08),
        });
      });
    }, root);

    // Late layout (fonts, images) invalidates every trigger below it.
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 300);
    window.addEventListener('load', refresh);
    if (document.fonts?.ready) void document.fonts.ready.then(refresh);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, [loading]);

  /* ── resize → re-split lines (upstream `onResize`) ──────────────── */
  useEffect(() => {
    if (loading) return;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [loading]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openQuarry = useCallback((i: number) => setLightbox({ open: true, index: i }), []);

  return (
    <div className={styles.experience} ref={rootRef} data-mode="light">
      {loading && <Preloader onDone={handlePreloaded} viewport={viewportRef} />}

      <Cursor scope={rootRef} />

      <span className={styles.esRail} aria-hidden="true">
        <i ref={railRef} />
      </span>

      <Navigation
        open={menuOpen}
        onToggle={() => setMenuOpen((v) => !v)}
        onClose={closeMenu}
        solid={scroll.solid}
        hidden={scroll.hidden}
        inverted={scroll.inverted}
      />

      <div ref={viewportRef}>
        <Hero />
        <About onOpenQuarry={openQuarry} />
        <Products items={products} />
        <Showrooms items={showrooms} />
        <Journal posts={posts} />
        <Contacts items={showrooms} />
        <CtaShortcuts />
      </div>

      <Footer showrooms={showrooms} />

      <Lightbox
        open={lightbox.open}
        index={lightbox.index}
        onClose={() => setLightbox((s) => ({ ...s, open: false }))}
        onIndex={(i) => setLightbox({ open: true, index: i })}
      />
    </div>
  );
}
