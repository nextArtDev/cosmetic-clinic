"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { gsap } from "../lib/anim";

/** Magnetic hover micro-interaction wrapper (desktop pointers only). */
export default function Magnetic({
  children,
  strength = 0.45,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    gsap.to(el, { x, y, duration: 0.5, ease: "power3.out" });
    const inner = el.firstElementChild as HTMLElement | null;
    if (inner) gsap.to(inner, { x: x * 0.35, y: y * 0.35, duration: 0.5, ease: "power3.out" });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
    const inner = el.firstElementChild as HTMLElement | null;
    if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <span
      ref={ref}
      style={{ display: "inline-block" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </span>
  );
}
