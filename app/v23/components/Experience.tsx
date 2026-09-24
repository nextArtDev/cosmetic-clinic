'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HomeEntry, NavNode, ServiceEntry, Settings } from '../types';
import styles from '../styles/jacques.module.css';
import { createLenis, mountParallaxIn, registerMotion } from '../lib/engine';
import Header from './Header';
import Hero from './Hero';
import Footer from './Footer';
import {
  ImageBannerBlock,
  PushGuidesBlock,
  ServiceListBlock,
  TextImageBlock,
} from './Blocks';

/**
 * /v23 root — the isolation boundary.
 *
 * Three rules make this route incapable of affecting the live site:
 *
 *  1. Every stylesheet rule is scoped under the wrapper class below. There is
 *     no rule anywhere in the route that can match an element outside it.
 *
 *  2. The one thing that genuinely must live on <html> — the 10px rem base —
 *     is gated on `html[data-v23-active]`. That attribute is set here on mount
 *     and removed on unmount, so on every other route the rule is inert. The
 *     attribute is the only global thing this route ever touches.
 *
 *  3. The reference writes its header/footer measurements onto
 *     `document.body`. Doing that here would leak `--header-height` into the
 *     production layout, so they are written onto the wrapper element instead.
 *     Every consumer is a descendant, so it inherits exactly the same values.
 */

type Measurements = { header: number; inner: number; withLogo: number };

export default function Experience({
  home,
  navigation,
  settings,
  services,
}: {
  home: HomeEntry;
  navigation: NavNode[];
  settings: Settings;
  services: ServiceEntry[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [measure, setMeasure] = useState<Measurements>({ header: 0, inner: 0, withLogo: 0 });
  const [footerHeight, setFooterHeight] = useState(0);
  const [cookiesOpen, setCookiesOpen] = useState(true);

  const onMeasure = useCallback((m: Measurements) => {
    setMeasure((prev) =>
      prev.header === m.header && prev.inner === m.inner && prev.withLogo === m.withLogo ? prev : m,
    );
  }, []);

  /* (2) the single global hook, scoped to this route's lifetime */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-v23-active', '');
    return () => html.removeAttribute('data-v23-active');
  }, []);

  /* Lenis + ScrollTrigger, wired together the way the reference wires them */
  useEffect(() => {
    registerMotion();
    const { destroy } = createLenis({ onScroll: () => ScrollTrigger.update() });
    return destroy;
  }, []);

  /* image parallax — re-measured whenever the page grows under it */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cleanup: (() => void) | undefined;
    const build = () => {
      cleanup?.();
      cleanup = mountParallaxIn(root);
      ScrollTrigger.refresh();
    };

    build();

    // Fonts and lazy images change the layout height after first paint, which
    // invalidates every ScrollTrigger measured below them.
    let timer = 0;
    const rebuild = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 180);
    };

    window.addEventListener('load', rebuild);
    window.addEventListener('resize', rebuild);
    document.fonts?.ready.then(rebuild).catch(() => {});

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', rebuild);
      window.removeEventListener('resize', rebuild);
      cleanup?.();
    };
  }, []);

  const vars = {
    '--header-height': `${measure.header}px`,
    '--header-inner-height': `${measure.inner}px`,
    '--header-with-logo-height': `${measure.withLogo}px`,
    '--footer-height': `${footerHeight}px`,
  } as CSSProperties;

  return (
    <div className={styles['jc-root']} ref={rootRef} style={vars}>
      <a className="c-skip-to-content" href="#main">
        رفتن به محتوا
      </a>

      <Header
        navigation={navigation}
        settings={settings}
        onMeasure={onMeasure}
        onMenuToggle={(open) => {
          // The reference locks the page while the menu is open; stopping
          // Lenis does that without touching any global class.
          document.documentElement.style.overflowY = open ? 'hidden' : '';
        }}
      />

      <div className="c-router-view">
        <div className="v-home">
          <Hero entry={home} />

          <div className="c-blocks-builder v-home__blocks-builder" id="main">
            <section className="c-blocks-builder__section">
              <div className="c-blocks-builder__blocks">
                {home.sections.flatMap((section) =>
                  section.blocks.map((block) => {
                    switch (block.typeHandle) {
                      case 'BlockTextImage':
                        return <TextImageBlock block={block} key={block.id} />;
                      case 'BlockImageBanner':
                        return <ImageBannerBlock block={block} key={block.id} />;
                      case 'BlockServiceList':
                        return (
                          <ServiceListBlock block={block} services={services} key={block.id} />
                        );
                      case 'BlockPushGuides':
                        return <PushGuidesBlock block={block} key={block.id} />;
                      default:
                        return null;
                    }
                  }),
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer navigation={navigation} settings={settings} onMeasure={setFooterHeight} />

      {cookiesOpen ? (
        <section className="galletita-box is-galletita-visible">
          <div className="galletita-box__inner">
            <div className="galletita-box__content">
              <h2 className="galletita-box__content__title">به حریم خصوصی شما احترام می‌گذاریم</h2>
              <div className="galletita-box__content__description">
                <p>
                  ما از کوکی‌ها برای بهبود تجربه‌ی مرور شما، نمایش محتوای مرتبط و تحلیل بازدیدها
                  استفاده می‌کنیم.
                </p>
                <p>با کلیک روی «می‌پذیرم»، با استفاده از کوکی‌ها موافقت می‌کنید.</p>
              </div>
            </div>
            <div className="galletita-box__actions">
              <button
                type="button"
                className="queso-clickable c-raw-button is-hoverable c-button-secondary"
                onClick={() => setCookiesOpen(false)}
              >
                <span className="c-text-variant t-c1 c-raw-button__label">می‌پذیرم</span>
              </button>
              <button
                type="button"
                className="queso-clickable c-raw-button is-hoverable c-button-secondary"
                onClick={() => setCookiesOpen(false)}
              >
                <span className="c-text-variant t-c1 c-raw-button__label">رد می‌کنم</span>
              </button>
              <a
                className="queso-clickable c-raw-button is-hoverable c-button-secondary"
                href="#privacy"
              >
                <span className="c-text-variant t-c1 c-raw-button__label">بیشتر بدانید</span>
              </a>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
