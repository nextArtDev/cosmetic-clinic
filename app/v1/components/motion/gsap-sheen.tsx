"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Signature motion element: a slow specular sweep of light across a glass
 * surface, driven by GSAP so it can run as an independent, infinitely
 * looping timeline decoupled from React re-renders.
 */
export function GsapSheen({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { xPercent: -60, opacity: 0 },
        {
          xPercent: 60,
          opacity: 1,
          duration: 3.2,
          ease: "sine.inOut",
          repeat: -1,
          repeatDelay: 1.6,
          yoyo: true,
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return <div ref={ref} className={className ?? "glass-sheen"} />;
}
