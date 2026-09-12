"use client";

/* ============================================================
   /v16 — shared motion primitives.

   Small, dependency-light building blocks used by the chrome and
   the sections: a mount-gated reduced-motion hook (no hydration
   mismatch), a circular rotating text element, a char splitter for
   gsap reveals, the custom scrollbar and the back-to-top button.
   ============================================================ */

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowUp } from "lucide-react";
import { getLenis, scrollToTarget } from "../lib/fx";

/* ------------------------------------------------------------------ */
/* reduced motion — mount-gated so SSR and first client render agree   */
/* ------------------------------------------------------------------ */

export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* RotatingText — circular text on an SVG path, spinning forever        */
/* ------------------------------------------------------------------ */

export function RotatingText({
  text,
  size = 176,
  children,
  className,
  duration = 24,
  reverse = false,
}: {
  text: string;
  size?: number;
  children?: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  const raw = useId();
  const id = `maya-rot${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const r = size / 2 - 14;
  return (
    <div className={`maya-rotating ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        <defs>
          <path id={id} d={`M ${size / 2},${size / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
        </defs>
        <text style={{ fontSize: size * 0.085 }}>
          <textPath href={`#${id}`} startOffset="0">
            {text}
          </textPath>
        </text>
      </svg>
      {/* absolute so percentage-sized children resolve against the root box */}
      <div className="absolute inset-0 z-10 grid place-items-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SplitText — word/char spans that gsap can stagger                    */
/* ------------------------------------------------------------------ */

export function SplitText({
  text,
  by = "chars",
  className,
  itemClassName = "maya-split-item",
}: {
  text: string;
  by?: "chars" | "words";
  className?: string;
  itemClassName?: string;
}) {
  const parts = by === "chars" ? Array.from(text) : text.split(" ");
  return (
    <span className={`maya-split ${className ?? ""}`} aria-label={text}>
      {parts.map((p, i) => (
        <span key={`${p}-${i}`} className={itemClassName} aria-hidden="true">
          {p === " " ? "\u00A0" : p}
          {by === "words" && i < parts.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ScrollBar — the theme's thin custom scrollbar (#scrollbar)           */
/* ------------------------------------------------------------------ */

export function ScrollBar() {
  const [state, setState] = useState({ top: 0, height: 40, ready: false });
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const total = doc.scrollHeight;
        const view = window.innerHeight;
        const ratio = Math.min(1, view / total);
        const h = Math.max(32, ratio * view);
        const maxScroll = Math.max(1, total - view);
        const top = (window.scrollY / maxScroll) * (view - h);
        setState({ top, height: h, ready: true });
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  /* drag to scroll */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let pointerId: number | null = null;
    let startY = 0;
    let startScroll = 0;

    const down = (e: PointerEvent) => {
      pointerId = e.pointerId;
      dragging.current = true;
      startY = e.clientY;
      startScroll = window.scrollY;
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current || pointerId !== e.pointerId) return;
      const doc = document.documentElement;
      const view = window.innerHeight;
      const maxScroll = Math.max(1, doc.scrollHeight - view);
      const usable = view - Math.max(32, (view / doc.scrollHeight) * view);
      const delta = ((e.clientY - startY) / Math.max(1, usable)) * maxScroll;
      const next = Math.max(0, Math.min(maxScroll, startScroll + delta));
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(next, { immediate: true });
      else window.scrollTo(0, next);
    };
    const up = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      dragging.current = false;
      pointerId = null;
      el.dataset.dragging = "false";
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  if (!state.ready) return null;
  return (
    <div className="maya-scrollbar hidden lg:block" ref={trackRef} aria-hidden="true">
      <div
        className="maya-scrollbar-thumb"
        style={{ height: state.height, transform: `translateY(${state.top}px)` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BackToTop                                                            */
/* ------------------------------------------------------------------ */

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      className="maya-totop"
      data-visible={visible}
      onClick={() => scrollToTarget(0)}
      aria-label="بازگشت به بالا"
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
