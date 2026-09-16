'use client';

import { useEffect, useRef, useState } from 'react';
import { hero } from '../data';
import { gsap, prefersReducedMotion } from '../lib/engine';
import { ANIM, cx } from './bits';
import styles from './elitone.module.css';

/** Matches the reference reel's Swiper `autoplay.delay: 5000`. */
const SLIDE_MS = 5000;

/**
 * Upstream `header` — the title block sits over `#elitestone-reel`, a
 * full-bleed autoplaying carousel with a 2.5px gold progress bar. Scrolling
 * drags the reel's `.swiper-wrapper` down by `innerHeight / 1.5`, so the
 * imagery lags the page.
 */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /* Reel parallax — mirrors the reference's ScrollTrigger call exactly. */
  useEffect(() => {
    const el = heroRef.current;
    const track = trackRef.current;
    if (!el || !track || prefersReducedMotion()) return;
    const tween = gsap.to(track, {
      y: () => window.innerHeight / 1.5,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  /* Autoplay + progress, written straight to the DOM (no 60fps re-renders). */
  useEffect(() => {
    if (paused || hero.slides.length < 2) return;
    let raf = 0;
    let last = performance.now();
    let p = 0;
    const tick = (now: number) => {
      p += (now - last) / SLIDE_MS;
      last = now;
      if (barRef.current) {
        barRef.current.style.setProperty('--es-progress', `${Math.min(1, p) * 100}%`);
      }
      if (p >= 1) {
        p = 0;
        setIndex((i) => (i + 1) % hero.slides.length);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <header
      className={styles.esHero}
      ref={heroRef}
      id="top"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.esReel} aria-hidden="true">
        <span className={styles.esReelProgress} ref={barRef} />
        <div className={styles.esReelTrack} ref={trackRef}>
          {hero.slides.map((slide, i) => (
            <div
              key={slide.image + i}
              className={cx(styles.esReelSlide, i === index && styles.esReelSlideOn)}
            >
              {/* Plain <img>: next/image lazy-loads badly under a clipped
                  reveal ancestor, which is exactly what the reel is. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt={i === index ? slide.alt : ''} draggable={false} />
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.esWrap} ${styles.esHeroInner}`}>
        <div className={styles.esHeroHead}>
          <div className={styles.esHeroCol}>
            <h1
              className={`${styles.esTitle} ${styles.esTitleSmall}`}
              {...ANIM.title}
            >
              {hero.titleLines.join('\n')}
            </h1>

            <div className={styles.esHeroCta} data-es-reveal>
              <a className={styles.esBtn} href="#products" data-cursor="کاوش">
                {hero.cta}
              </a>
            </div>

            <p className={styles.esHeroQuote} {...ANIM.excerpt}>
              {hero.quote}
              <cite>{hero.quoteAuthor}</cite>
            </p>
          </div>
        </div>

        <ul className={styles.esShortcuts}>
          {hero.shortcuts.map((s) => (
            <li key={s.label} data-es-reveal>
              <a className={styles.esShortcut} href={s.href} data-cursor="کاوش">
                <span>{s.label}</span>
                <span className={styles.esShortcutCaption}>
                  {s.caption}
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                    <path d="M0.32 0.95L6.1 6.93L0.32 13.05L0 12.9L4.01 6.93L0 1.1L0.32 0.95Z" />
                    <path d="M5.14 0.95L11.07 6.93L5.14 13.05L4.81 12.9L8.83 6.93L4.81 1.1L5.14 0.95Z" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
