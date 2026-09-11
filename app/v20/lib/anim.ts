"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export { gsap, ScrollTrigger };

/** Smoothly scroll the window to a section selector (uses GSAP ScrollTo). */
export function scrollToSection(selector: string) {
  gsap.to(window, {
    duration: 1.1,
    ease: "power3.inOut",
    scrollTo: { y: selector, offsetY: 0 },
  });
}
