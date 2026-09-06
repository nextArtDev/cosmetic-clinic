"use client";

import { useRef, type ElementType } from "react";
import type React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SplitTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words wrapped in *asterisks* render in italic serif accent. */
  delay?: number;
  stagger?: number;
  trigger?: boolean;
};

/**
 * Word-by-word masked reveal powered by GSAP.
 * Supports an inline accent syntax: "Greffe *premium* à Paris".
 */
export default function SplitText({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.045,
  trigger = true,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const words = ref.current.querySelectorAll<HTMLElement>(".split-word");
      gsap.set(words, { yPercent: 110, opacity: 0, rotate: 2 });
      const tween = gsap.to(words, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger,
        delay,
        scrollTrigger: trigger
          ? {
              trigger: ref.current,
              start: "top 88%",
              once: true,
            }
          : undefined,
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: ref, dependencies: [text] },
  );

  // Split into lines by "\n", then words. Accent words are wrapped in *...*.
  const lines = text.split("\n");

  const Component = Tag as React.ComponentType<{
    ref?: React.Ref<HTMLElement>;
    className?: string;
    "aria-label"?: string;
    children?: React.ReactNode;
  }>;

  return (
    <Component ref={ref} className={className} aria-label={text.replace(/\*/g, "")}>
      {lines.map((line, li) => (
        <span className="split-line" key={li} aria-hidden>
          {line.split(" ").map((word, wi) => {
            const accent = word.startsWith("*") && word.endsWith("*");
            const clean = word.replace(/\*/g, "");
            return (
              <span key={wi} className="nc:inline-block   nc:overflow-hidden   nc:align-bottom   nc:pb-[0.1em]   nc:-mb-[0.1em]">
                <span
                  className={`split-word  ${
                    accent ? "nc:font-serif nc:font-normal nc:tracking-normal" : ""
                  }`}
                >
                  {clean}
                  {wi < line.split(" ").length - 1 ? "\u00A0" : ""}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </Component>
  );
}
