"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { Play } from "lucide-react";
import { gsapSetup } from "../lib/fx";
import { MayaMarquee } from "./bits";

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

  /* Port of the theme's videoWithTextOverlay().
     This section ships data-animation-type="tilt" and media-width-large
     (--overlay-media-size: .7), so while it is pinned the media rotates to
     −4deg and shrinks to 70% of its box while the text marquee rises from
     yPercent 100 → 0. The original pins for `offsetHeight / 1.5` of scroll;
     we reproduce that with a 167svh stage + a sticky 100svh panel, which is
     more robust than gsap's own pin under Lenis. */
  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = gsapSetup();
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const media = section.querySelector<HTMLElement>("[data-vt-media]");
      const radius = section.querySelector<HTMLElement>("[data-vt-radius]");
      const marquee = section.querySelector<HTMLElement>("[data-vt-marquee]");
      const content = section.querySelector<HTMLElement>("[data-vt-content]");
      if (!media || !marquee) return;

      /* read the same custom properties the engine reads */
      const mediaSize = parseFloat(String(gsap.getProperty(media, "--overlay-media-size"))) || 0.7;
      const cardRadius = gsap.getProperty(radius, "--card-radius") ?? 0;
      const tilt = section.dataset.animationType === "tilt" ? -4 : 0;

      gsap.set(media, { rotation: 0 });
      if (radius) gsap.set(radius, { borderRadius: 0 });
      gsap.set(marquee, { yPercent: 100 });

      let scrolled = false;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      tl.to(media, {
        rotation: tilt,
        scale: mediaSize,
        ease: "none",
        onUpdate() {
          const past = this.progress() >= 0.5;
          if (past === scrolled) return;
          scrolled = past;
          media.classList.toggle("maya-vt-scrolled", past);
          content?.classList.toggle("maya-vt-content-active", past);
        },
      });
      if (radius) tl.to(radius, { borderRadius: cardRadius, ease: "none" }, "<");
      tl.to(marquee, { yPercent: 0, ease: "none" }, "<");
    }, sectionRef);

    /* play only while the section is on screen */
    const io = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => videoRef.current?.play().catch(() => {}),
      onEnterBack: () => videoRef.current?.play().catch(() => {}),
      onLeave: () => videoRef.current?.pause(),
      onLeaveBack: () => videoRef.current?.pause(),
    });

    return () => {
      io.kill();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-animation-type="tilt"
      className="relative bg-maya-ink"
      style={{ height: "167svh" }}
      aria-label="ویدیوی کالکشن زمستان"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        {/* media — shrinks to 70% and tilts to −4deg (video-text-overlay-media) */}
        <div
          data-vt-media
          className="absolute inset-0 will-change-transform"
          style={{ "--overlay-media-size": 0.7 } as CSSProperties}
        >
          <div
            data-vt-radius
            className="absolute inset-0 overflow-hidden will-change-[border-radius]"
            style={{ "--card-radius": "0px" } as CSSProperties}
          >
            <video
              ref={videoRef}
              className="size-full object-cover opacity-90"
              src="/maya/media/atelier.mp4"
              poster="/maya/img/video-poster.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
            <div className="absolute inset-0 bg-maya-ink/45" />
          </div>
        </div>

        {/* rising text layer (video-with-text-marquee) */}
        <div
          data-vt-marquee
          className="absolute inset-0 z-10 flex flex-col items-center justify-center will-change-transform"
        >
          <div data-vt-content className="maya-vt-content w-full">
            {/* .video-with-text-marquee-list is pre-rotated −4deg in the theme */}
            <div className="maya-vt-list">
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
          </div>

          {/* center cta — rides along with the marquee */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <a
              href="#maya-trending"
              className="group pointer-events-auto flex size-24 flex-col items-center justify-center gap-1 rounded-full bg-maya-cream text-maya-ink shadow-2xl transition-all duration-500 hover:scale-110 hover:bg-maya-clay hover:text-maya-cream md:size-28"
            >
              <Play className="size-5 transition-transform duration-300 group-hover:scale-125" fill="currentColor" />
              <span className="text-[10px] font-black">تماشا</span>
            </a>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-maya-ink to-transparent" />
      </div>
    </section>
  );
}
