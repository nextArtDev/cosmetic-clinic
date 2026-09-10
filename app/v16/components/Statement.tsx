"use client";

import { useLayoutEffect, useRef } from "react";
import type { MayaCollection } from "../lib/data";
import { fa, gsapSetup } from "../lib/fx";
import { Reveal, Words } from "./bits";

const STATEMENT =
  "مایا، ظرافتِ بی‌زمان را با روندِ امروز در هم می‌آمیزد و پوشاکی می‌سازد که به تو اعتمادبه‌نفس و وقار می‌بخشد؛ با پارچه‌های درجه‌یک و طرح‌های یکتا، استایلی خلق می‌کنیم که زیبایی را از نو تعریف می‌کند، تا در هر لحظه بی‌نیاز از تلاش بدرخشی.";

function SaleBadge() {
  const words = ["حراج", "تا ٪۵۰", "فقط این هفته", "حراج"];
  return (
    <div className="group relative size-36 md:size-44" style={{ ["--r" as string]: "4.3rem" }}>
      <div className="maya-orbit absolute inset-0 group-hover:[animation-play-state:paused]">
        {words.map((w, i) => (
          <span key={i} className="maya-orbit-item" aria-hidden={i > 1}>
            <span style={{ ["--a" as string]: `${i * 90}deg` }}>
              <i className="rounded-full bg-maya-ink px-3 py-1 text-[10px] font-bold text-maya-cream shadow-md md:text-[11px]">
                {w}
              </i>
            </span>
          </span>
        ))}
      </div>
      <div className="absolute inset-[24%] grid place-items-center rounded-full bg-maya-clay text-maya-cream shadow-xl transition-transform duration-500 group-hover:scale-110">
        <div className="text-center leading-none">
          <p className="text-[10px] font-bold opacity-80">تا</p>
          <p className="text-2xl font-black md:text-3xl">٪۵۰</p>
          <p className="mt-0.5 text-[10px] font-bold opacity-80">تخفیف</p>
        </div>
      </div>
    </div>
  );
}

export function Statement({ collections }: { collections: MayaCollection[] }) {
  const textRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  /* word-by-word color fill on scroll */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", textRef.current!);
      gsap.fromTo(
        words,
        { color: "#d3c9b8" },
        {
          color: "#16130e",
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            end: "bottom 42%",
            scrub: 0.5,
          },
        },
      );
    }, textRef);
    return () => ctx.revert();
  }, []);

  /* parallax collage */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-depth]", collageRef.current!).forEach((el) => {
        const depth = parseFloat(el.dataset.depth || "1");
        gsap.fromTo(
          el,
          { yPercent: -7 * depth },
          {
            yPercent: 7 * depth,
            ease: "none",
            scrollTrigger: { trigger: collageRef.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      /* entrance clip reveal */
      gsap.utils.toArray<HTMLElement>("[data-col-card]", collageRef.current!).forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(14% 14% 14% 14%)", opacity: 0.4 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            delay: (i % 3) * 0.1 + Math.floor(i / 3) * 0.16,
            scrollTrigger: { trigger: collageRef.current, start: "top 74%", once: true },
          },
        );
      });
    }, collageRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="maya-statement" className="overflow-hidden py-20 md:py-32" aria-label="مانیفست مایا">
      <div className="maya-wrap">
        <Reveal y={26}>
          <p className="mb-8 flex items-center justify-center gap-2.5 text-xs font-black text-maya-clay md:text-sm">
            <i className="maya-diamond" />
            داستان ما با چشم‌اندازی آغاز شد: آمیزشِ سبک و وقار
            <i className="maya-diamond" />
          </p>
        </Reveal>

        <div ref={textRef} className="mx-auto max-w-5xl text-center">
          <h3 className="text-[6.4vw] font-black leading-[1.55] sm:text-3xl sm:leading-[1.7] md:text-[2.35rem] lg:text-[2.6rem]">
            <Words text={STATEMENT} />
          </h3>
        </div>

        {/* collage around rotating badge */}
        <div ref={collageRef} className="relative mt-16 md:mt-24">
          <div className="pointer-events-none absolute inset-0 z-20 hidden place-items-center md:grid">
            <div className="pointer-events-auto">
              <SaleBadge />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-8">
            {collections.map((c, i) => (
              <div key={c.id} data-depth={[(1), 0.6, 1.25, 0.8, 1.1, 0.7][i]} className="will-change-transform">
                <a
                  data-col-card
                  href="#maya-collections"
                  onClick={(e) => e.preventDefault()}
                  className="group relative block overflow-hidden rounded-2xl bg-maya-parchment md:rounded-3xl"
                >
                  <div className="aspect-[3/3.9] w-full overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                    />
                  </div>
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-maya-cream/85 px-4 py-2.5 backdrop-blur-md transition-all duration-400 group-hover:bg-maya-ink group-hover:text-maya-cream md:inset-x-4 md:bottom-4">
                    <span className="text-xs font-black md:text-sm">{c.title}</span>
                    <span className="text-[10px] font-bold opacity-70">{fa(c.count)}+</span>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* mobile badge */}
          <div className="mt-10 grid place-items-center md:hidden">
            <SaleBadge />
          </div>
        </div>
      </div>
    </section>
  );
}
