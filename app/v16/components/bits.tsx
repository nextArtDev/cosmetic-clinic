"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn, gsapSetup } from "../lib/fx";

/* ------------------------------------------------------------------ */
/* Reveal — gsap-from on scroll into view                              */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
  y = 44,
  delay = 0,
  stagger = 0,
  start = "top 84%",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const targets = stagger ? gsap.utils.toArray<HTMLElement>("[data-rv]", el) : [el];
      gsap.fromTo(
        targets,
        { y, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.05,
          delay,
          ease: "power3.out",
          stagger: stagger || undefined,
          scrollTrigger: { trigger: el, start, once },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [y, delay, stagger, start, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHead                                                         */
/* ------------------------------------------------------------------ */

export function SectionHead({
  kicker,
  title,
  desc,
  action,
  center,
  className,
}: {
  kicker: string;
  title: ReactNode;
  desc?: string;
  action?: { label: string; onClick: () => void };
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-10 md:mb-14", center && "text-center", className)} stagger={0.12}>
      <p data-rv className={cn("mb-4 flex items-center gap-2.5 text-xs font-black text-maya-clay md:text-sm", center && "justify-center")}>
        <i className="maya-diamond" />
        {kicker}
        <i className="maya-diamond" />
      </p>
      <h2 data-rv className="text-3xl font-black leading-[1.15] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {desc ? (
        <p data-rv className={cn("mt-4 max-w-xl text-sm leading-7 text-maya-mute md:text-base md:leading-8", center && "mx-auto")}>
          {desc}
        </p>
      ) : null}
      {action ? (
        <p data-rv className="mt-6">
          <button className="maya-btn maya-btn-ghost" onClick={action.onClick}>
            {action.label}
            <ArrowLeft className="size-4" />
          </button>
        </p>
      ) : null}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* MayaMarquee — infinite row, scroll-velocity reactive                */
/* ------------------------------------------------------------------ */

export function MayaMarquee({
  children,
  speed = 20,
  direction = 1,
  className,
  trackClassName,
  velocityBoost = false,
  fadeEdges = true,
}: {
  children: ReactNode;
  speed?: number;
  direction?: 1 | -1;
  className?: string;
  trackClassName?: string;
  velocityBoost?: boolean;
  fadeEdges?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = gsapSetup();
    const track = ref.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        track,
        { xPercent: direction === 1 ? 0 : -50 },
        { xPercent: direction === 1 ? -50 : 0, ease: "none", duration: speed, repeat: -1 },
      );

      let st: { kill: () => void } | null = null;
      if (velocityBoost) {
        st = ScrollTrigger.create({
          onUpdate(self) {
            const boost = Math.min(Math.abs(self.getVelocity()) / 250, 3.5);
            tween.timeScale(direction * (1 + boost));
            gsap.to(tween, { timeScale: direction, duration: 0.7, ease: "power1.out", overwrite: true });
          },
        });
      }
      return () => {
        st?.kill();
        tween.kill();
      };
    }, ref);
    return () => ctx.revert();
  }, [speed, direction, velocityBoost]);

  return (
    <div
      className={cn("maya-scrollrow", className)}
      style={
        fadeEdges
          ? { maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)" }
          : undefined
      }
    >
      <div ref={ref} className={cn("maya-scrollrow-track", trackClassName)}>
        <div className="flex flex-none items-center">{children}</div>
        <div className="flex flex-none items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* WordByWord — splits text into word spans (for scrub fills)          */
/* ------------------------------------------------------------------ */

export function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-word className="inline-block">
          {w}
          {i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}
