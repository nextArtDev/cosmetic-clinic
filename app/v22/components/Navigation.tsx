'use client';

import { useEffect, useRef, useState } from 'react';
import { brand, menuPrimary, menuSecondary, nav, socials } from '../data';
import { gsap, prefersReducedMotion } from '../lib/engine';
import { Mark } from './bits';
import styles from './elitone.module.css';

/**
 * Upstream navigation: a fixed bar (brand · quick links · language · toggler)
 * plus a full-screen `[data-menu]` panel whose main items each own a
 * `figure.image` preview — the plate follows the pointer while an item is
 * hovered, scaling from 0 with an `expo.out` mask wipe.
 */
export default function Navigation({
  open,
  onToggle,
  onClose,
  solid,
  hidden,
  inverted,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  solid: boolean;
  hidden: boolean;
  inverted: boolean;
}) {
  const imageRef = useRef<HTMLDivElement>(null);
  const imageElRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Pointer-following preview plate. We listen on `window` (not the host) so
  // any bubbling quirk around the menu's stacking context doesn't matter.
//   We drive the tween manually because `gsap.quickTo` was observed not to
//   apply its transform in this environment; `overwrite:'auto'` + a per-frame
//   rAF gives the same one-tween-at-a-time behaviour.
  useEffect(() => {
    const plate = imageRef.current;
    const host = mainRef.current;
    if (!plate || !host) return;
    if (prefersReducedMotion()) return;

    gsap.set(plate, { xPercent: -50, yPercent: -50 });
    let raf = 0;
    let live: gsap.core.Tween | null = null;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        live?.kill();
        live = gsap.to(plate, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.7,
          ease: 'expo.out',
          overwrite: 'auto',
        });
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      live?.kill();
    };
  }, []);

  const enter = (src?: string) => {
    if (!src || !imageRef.current) return;
    if (imageElRef.current) {
      imageElRef.current.style.backgroundImage = `url(${src})`;
    }
    gsap.killTweensOf([imageRef.current, imageElRef.current]);
    gsap.to(imageRef.current, { autoAlpha: 1, duration: 0.5, ease: 'expo.out' });
    gsap.fromTo(
      imageElRef.current,
      { scale: 1.35, yPercent: 12 },
      { scale: 1, yPercent: 0, duration: 1.1, ease: 'expo.out' },
    );
  };

  const leave = () => {
    if (!imageRef.current) return;
    gsap.killTweensOf(imageRef.current);
    gsap.to(imageRef.current, { autoAlpha: 0, duration: 0.45, ease: 'expo.out' });
  };

  return (
    <>
      <header
        className={[
          styles.esNav,
          solid ? styles.esNavSolid : '',
          hidden && !open ? styles.esNavUp : '',
          inverted && !open && !solid ? styles.esNavInverted : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <a className={styles.esBrand} href="#top" aria-label={brand.name}>
          <Mark />
        </a>

        <nav className={styles.esQuickLinks} aria-label="ناوبریِ اصلی">
          {nav.slice(0, 5).map((item) => (
            <a key={item.label} className={styles.esQuickLink} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.esNavActions}>
          <span className={styles.esLang} title="زبان">
            فا
          </span>
          <button
            type="button"
            className={styles.esToggle}
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? 'بستنِ منو' : 'باز کردنِ منو'}
          >
            <span className={styles.esToggleBars} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`${styles.esMenu} ${open ? styles.esMenuVisible : ''}`}
        aria-hidden={!open}
      >
        <nav className={styles.esMenuMain} ref={mainRef} aria-label="منوی اصلی">
          <div className={styles.esMenuImage} ref={imageRef} aria-hidden="true">
            <div className={styles.esMenuImageMask}>
              <div className={styles.esMenuImageEl} ref={imageElRef} />
            </div>
          </div>

          {menuPrimary.map((item, i) => (
            <a
              key={item.label}
              className={styles.esMenuItem}
              href={item.href}
              data-cursor="برو"
              onClick={onClose}
              onMouseEnter={() => enter(item.image)}
              onMouseLeave={leave}
            >
              <span
                className={styles.esMenuItemInner}
                style={{ transitionDelay: open ? `${0.06 * i + 0.12}s` : '0s' }}
              >
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <div className={styles.esMenuFoot}>
          <nav className={styles.esMenuSecondary} aria-label="منوی فرعی">
            {menuSecondary.map((item) => (
              <a key={item.label} href={item.href} onClick={onClose}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.esMenuSocials}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** Small helper so the root can own scroll state without prop drilling. */
export function useScrollState() {
  const [state, setState] = useState({ solid: false, hidden: false, inverted: true });
  const ref = useRef(state);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const next = {
        solid: y > 80,
        hidden: y > 400 && y > last + 4,
        inverted: y < window.innerHeight * 0.85,
      };
      last = y;
      // Only re-render when something actually changed.
      if (
        next.solid !== ref.current.solid ||
        next.hidden !== ref.current.hidden ||
        next.inverted !== ref.current.inverted
      ) {
        ref.current = next;
        setState(next);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return state;
}
