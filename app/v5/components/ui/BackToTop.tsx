"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import type Lenis from "lenis";

/**
 * Back-to-top with a scroll-progress conic ring — ported from
 * novacapillaire.fr (#nova-back-to-top): rAF-throttled scroll tracking sets
 * --v5-scroll-progress (0–100), a % label follows the reading position and
 * the button fades in past 350px. Click scrolls to top via Lenis when the
 * port's smooth-scroll instance is live (falls back to window.scrollTo).
 */
export default function BackToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const button = btnRef.current;
    if (!button) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frameRequested = false;
    let lastPercent = -1;

    const update = () => {
      frameRequested = false;
      const scrollElement = document.scrollingElement ?? document.documentElement;
      const maxScroll = Math.max(0, scrollElement.scrollHeight - window.innerHeight);
      const scrollTop = Math.max(0, window.scrollY || scrollElement.scrollTop || 0);
      const progress = maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0;
      button.style.setProperty("--v5-scroll-progress", progress.toFixed(2));

      const rounded = Math.round(progress);
      if (rounded !== lastPercent && percentRef.current) {
        // Persian digits, as the rest of the port
        percentRef.current.textContent = `${rounded.toLocaleString("fa-IR", { useGrouping: false })}٪`;
        lastPercent = rounded;
      }
      setVisible(scrollTop > 350);
    };

    const requestUpdate = () => {
      if (frameRequested) return;
      frameRequested = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: reduce, duration: reduce ? 0 : 1.1 });
    } else {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={scrollToTop}
      aria-label="بازگشت به بالای صفحه"
      className={`v5-back-to-top ${visible ? "is-visible" : ""}`}
    >
      <span ref={percentRef} className="v5-back-to-top__percent" aria-hidden>
        ۰٪
      </span>
      <ArrowUp className="v5-back-to-top__arrow nc:absolute" size={16} strokeWidth={2.4} aria-hidden />
    </button>
  );
}
