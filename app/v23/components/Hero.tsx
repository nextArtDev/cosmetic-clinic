'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import type { HomeEntry } from '../types';
import { WORDS } from '../data';
import { ButtonLink, Picture, WordsList } from './Bits';
import { clamp, cubicEaseInOut, registerMotion, useBreakpoint, useScrollDriver } from '../lib/engine';

/**
 * The reference's `c-hero-base` / `c-hero-home`.
 *
 * Three things move here, all transcribed from the reference's HeroBase
 * component rather than guessed:
 *
 *  1. The photograph starts at `filter: blur(10rem); transform: scale(1.1)` in
 *     CSS and is tweened to `blur(0rem); scale: 1` 200 ms after mount, over
 *     1.6 s on the site's own cubic-bezier. That is the page's opening gesture.
 *
 *  2. A fixed overlay above the image fades in *by scroll delta*, not by
 *     position: +0.004 per downward frame, -0.004 per upward frame, clamped to
 *     [0.1, 0.4]. It settles at whatever value the user stopped at.
 *
 *  3. The heading and the copy drift apart on opposite signs of the same
 *     progress term, so they separate as the hero leaves.
 *
 * All three are suppressed below the `lg` breakpoint, exactly as upstream —
 * the reference only writes the inline transform when `min-width: 1024px`
 * matches.
 */
export default function Hero({ entry }: { entry: HomeEntry }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const isDesktop = useBreakpoint('min', 'lg');

  const [overlay, setOverlay] = useState(0.1);
  const [headingY, setHeadingY] = useState(0);
  const [copyY, setCopyY] = useState(0);

  // (1) the blur reveal
  useEffect(() => {
    registerMotion();
    const image = imageRef.current;
    if (!image) return;

    const t = window.setTimeout(() => {
      gsap.to(image, {
        filter: 'blur(0rem)',
        scale: 1,
        duration: 1.6,
        ease: cubicEaseInOut(),
      });
    }, 200);

    return () => window.clearTimeout(t);
  }, []);

  // (2) + (3) the scroll-driven drift
  useScrollDriver(
    heroRef,
    (progress, delta) => {
      setOverlay((prev) =>
        delta > 0 ? Math.min(0.4, prev + 0.004) : delta < 0 ? Math.max(0.1, prev - 0.004) : prev,
      );
      setHeadingY(clamp(0, 10, progress * 10));
      setCopyY(-clamp(0, 15, progress) * 15);
    },
    isDesktop,
  );

  return (
    <div className="c-hero-base -has-before-heading c-hero-home v-home__hero" ref={heroRef} id="top">
      <div className="c-hero-base__container l-container l-grid">
        <div className="c-hero-base__before-heading col-full">
          <WordsList words={WORDS} className="c-hero-home__words-list" />
        </div>

        <div
          className="c-hero-base__heading col-full"
          ref={headingRef}
          style={isDesktop ? ({ transform: `translateY(${headingY}%)` } as CSSProperties) : undefined}
        >
          <h1 className="c-text-variant t-h1-display" aria-label={entry.a11yHeading}>
            {entry.heading}
          </h1>
        </div>

        <div
          className="c-hero-base__copy col-2-md start-3-md col-4-lg start-5-lg col-5-xl start-6-xl"
          ref={copyRef}
          style={isDesktop ? ({ transform: `translateY(${copyY}%)` } as CSSProperties) : undefined}
        >
          <p className="c-text-variant t-h4">{entry.description}</p>
          <ButtonLink link={entry.buttonLink} theme="light" icon="arrow" />
        </div>
      </div>

      <Picture asset={entry.heroImage} className="c-hero-base__image" rootRef={imageRef} />

      <div className="c-hero-base__overlay" style={{ opacity: overlay }} />
    </div>
  );
}
