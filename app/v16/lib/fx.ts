"use client";

/* Shared client-side helpers for the Maya route. */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

/* ---------- gsap singleton ---------- */
let registered = false;
export function gsapSetup() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/* ---------- lenis singleton ---------- */
let lenisInstance: Lenis | null = null;
export function setLenis(l: Lenis | null) {
  lenisInstance = l;
}
export function getLenis() {
  return lenisInstance;
}
export function scrollToTarget(target: string | number) {
  const l = getLenis();
  if (l) {
    l.scrollTo(target as never, { offset: target === 0 ? 0 : -72, duration: 1.4 });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}

/* ---------- persian formatting ---------- */
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export function fa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}
export function faGroup(n: number): string {
  const grouped = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return fa(grouped);
}
export function toman(n: number): string {
  return `${faGroup(n)} تومان`;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- mix ---------- */
export const EASE_EXPO = [0.76, 0, 0.24, 1] as const;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
