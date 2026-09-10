"use client";

import { useLayoutEffect, useRef } from "react";
import { Play } from "lucide-react";
import { gsapSetup } from "../lib/fx";
import { MayaMarquee, Reveal } from "./bits";

const PHRASE = "گرم بمان، شیک بمان، کالکشن زمستان";

function Phrase({ outline, accent }: { outline?: boolean; accent?: boolean }) {
  return (
    <span className="flex items-center whitespace-nowrap">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span
            className={
              outline
                ? "maya-outline-cream px-6 text-[13vw] font-black md:text-[6.5vw]"
                : `px-6 text-[11vw] font-black md:text-[5.2vw] ${accent ? "text-maya-clay" : "text-maya-cream"}`
            }
          >
            {PHRASE}
          </span>
          <i className="maya-diamond scale-150 text-maya-clay" />
        </span>
      ))}
    </span>
  );
}

export function VideoMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = gsapSetup();
    const ctx = gsap.context(() => {
      /* tilt stack on scroll */
      gsap.fromTo(
        "[data-mq-stack]",
        { rotate: 3.5, scale: 1.06 },
        {
          rotate: -3.5,
          scale: 1.06,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
      /* video parallax */
      gsap.fromTo(
        videoRef.current,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      /* pause video offscreen */
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => videoRef.current?.play().catch(() => {}),
        onEnterBack: () => videoRef.current?.play().catch(() => {}),
        onLeave: () => videoRef.current?.pause(),
        onLeaveBack: () => videoRef.current?.pause(),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[78vh] min-h-[520px] items-center overflow-hidden bg-maya-ink"
      aria-label="ویدیوی کالکشن زمستان"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 -top-[12%] h-[124%] w-full object-cover opacity-90"
        src="/maya/media/atelier.mp4"
        poster="/maya/img/video-poster.jpg"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      />
      <div className="absolute inset-0 bg-maya-ink/45" />

      {/* marquee stack */}
      <div data-mq-stack className="relative z-10 w-full will-change-transform">
        <MayaMarquee speed={15} direction={1} velocityBoost fadeEdges={false}>
          <Phrase />
        </MayaMarquee>
        <MayaMarquee speed={33} direction={-1} velocityBoost fadeEdges={false} className="-my-3 md:-my-6">
          <Phrase outline />
        </MayaMarquee>
        <MayaMarquee speed={15} direction={1} velocityBoost fadeEdges={false}>
          <Phrase accent />
        </MayaMarquee>
      </div>

      {/* center cta */}
      <div className="absolute inset-0 z-20 grid place-items-center">
        <Reveal y={26} start="top 70%">
          <a
            href="#maya-trending"
            className="group flex size-24 flex-col items-center justify-center gap-1 rounded-full bg-maya-cream text-maya-ink shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-maya-clay hover:text-maya-cream md:size-28"
          >
            <Play className="size-5 transition-transform duration-300 group-hover:scale-125" fill="currentColor" />
            <span className="text-[10px] font-black">تماشا</span>
          </a>
        </Reveal>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-maya-ink to-transparent" />
    </section>
  );
}
