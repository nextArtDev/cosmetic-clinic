'use client';

import { useEffect, useRef } from 'react';
import { createMotion } from '../lib/motion';
import { PopupMenu } from '../sections/PopupMenu';
import { PopupCredits } from '../sections/PopupCredits';
import { PopupPreorder } from '../sections/PopupPreorder';
import { Header } from '../sections/Header';
import { Cover } from '../sections/Cover';
import { CoverAdaptive } from '../sections/CoverAdaptive';
import { Route } from '../sections/Route';
import { RouteAdaptive } from '../sections/RouteAdaptive';
import { Numbers } from '../sections/Numbers';
import { Advantages } from '../sections/Advantages';
import { NumbersAdaptive } from '../sections/NumbersAdaptive';
import { AdvantagesAdaptive } from '../sections/AdvantagesAdaptive';
import { Metrics } from '../sections/Metrics';
import { MetricsLottie } from '../sections/MetricsLottie';
import { MetricsAdaptive } from '../sections/MetricsAdaptive';
import { AppSection } from '../sections/AppSection';
import { AppAdaptive } from '../sections/AppAdaptive';
import { Steps } from '../sections/Steps';
import { StepsAdaptive } from '../sections/StepsAdaptive';
import { Reviews } from '../sections/Reviews';
import { ReviewsAdaptive } from '../sections/ReviewsAdaptive';
import { Footer } from '../sections/Footer';
import { FooterAdaptive } from '../sections/FooterAdaptive';

/** the document attribute the route owns while it is mounted */
const ACTIVE = 'data-v24-active';

/**
 * /v24's route shell.
 *
 * It reproduces the reference's own wrapper stack — `div.mosaic-wrap >
 * div.root.root-main` — because the vendored stylesheet is keyed to those
 * classes and the page's type scale and background colour are declared on
 * `.root-main`. Skipping the stack would mean restating the reference's
 * defaults by hand and drifting from them.
 *
 * Two things happen on mount and are undone on unmount:
 *   - `html[data-v24-active]` is set. It is the only hook the route has on the
 *     document, and the only rules gated on it are Lenis's five `html.lenis`
 *     declarations, which cannot be scoped because Lenis toggles classes on
 *     <html> itself. The previous value is restored, not just removed.
 *   - the motion runtime boots. It owns every tween, ScrollTrigger and listener
 *     it creates and reverts them on `destroy()`, which matters because
 *     StrictMode mounts the effect twice.
 *
 * Nothing is written to <body>, and no measurement is published outside the
 * wrapper — the reference pushes `--header-height` onto <body>, this port does
 * not need it.
 */
export default function Experience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const previous = document.documentElement.getAttribute(ACTIVE);
    document.documentElement.setAttribute(ACTIVE, 'true');

    const runtime = createMotion({ root: el, activeAttribute: ACTIVE });

    return () => {
      runtime.destroy();
      // restore rather than remove: another route may have set its own value
      if (previous === null) document.documentElement.removeAttribute(ACTIVE);
      else document.documentElement.setAttribute(ACTIVE, previous);
    };
  }, []);

  return (
    // `dir` is deliberately NOT set here. The reference is a physical LTR
    // design — wide flex strips translated leftward by scroll, plus absolute
    // `left:`/`right:` offsets — and `dir="rtl"` on this element re-anchors
    // every one of those strips to the right edge, parking them off-screen.
    // Persian reading order is applied to the copy instead, in
    // styles/numa.theme.css. `lang` stays for hyphenation and font fallback.
    <div id="v24-root" className="v24-root" ref={rootRef} lang="fa">
      <div className="mosaic-wrap">
        <div className="root root-main">
          <PopupMenu />
          <PopupCredits />
          <PopupPreorder />
          <Header />

          {/* the reference groups the hero, its adaptive twin, the route
              illustration and the numbers row inside one bare wrapper */}
          <div className="div">
            <Cover />
            <CoverAdaptive />
            <Route />
            <RouteAdaptive />
            <Numbers />
          </div>

          <Advantages />

          <div className="div div--u-ixqz5hria">
            <NumbersAdaptive />
            <AdvantagesAdaptive />
          </div>

          <div className="div">
            <Metrics />
            <MetricsLottie />
            <MetricsAdaptive />
            <AppSection />
            <AppAdaptive />
            <Steps />
            <StepsAdaptive />
            <Reviews />
            <ReviewsAdaptive />
            <Footer />
            <FooterAdaptive />
          </div>

          {/* Deliberately not ported, and why:
           *  - the reference's inline <script> embeds. Their behaviour is the
           *    motion runtime above; leaving them in would double-bind it.
           *  - the builder's "Made in Taptop" badge and its credit pop-up
           *    trigger, plus the Yandex SmartCaptcha iframe. They are the
           *    vendor's chrome and a third-party captcha, not the design. */}
        </div>
      </div>
    </div>
  );
}
