"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MousePointer2 } from "lucide-react";
import type { MayaCollection } from "../lib/data";
import { cn, fa, gsapSetup, scrollToTarget } from "../lib/fx";
import { useReducedMotionSafe } from "./Motion";

/* ============================================================
   Collection carousel.

   The reference pins this section and scrubs the collection rail
   horizontally while the scroll progresses (reference method
   `collectionCarousel`), marking the item nearest the centre as
   `active-item` and driving a progress line. Reproduced here with a
   CSS-sticky pin (robust under Lenis) plus a gsap ScrollTrigger
   scrub; the arrows jump the window to the matching scroll offset.

   Under prefers-reduced-motion the stage collapses and the rail
   becomes an ordinary swipeable overflow row.
   ============================================================ */

export function CollectionCarousel({ collections }: { collections: MayaCollection[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [active, setActive] = useState(0);
  const [flip, setFlip] = useState(0);
  const reduced = useReducedMotionSafe();

  /* banner clip reveal + parallax (unchanged) */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { clipPath: "inset(6% 6% 6% 6% round 28px)", scale: 0.985 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: bannerRef.current, start: "top 92%", end: "top 34%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        "[data-banner-img]",
        { yPercent: -10, scale: 1.18 },
        {
          yPercent: 10,
          scale: 1.18,
          ease: "none",
          scrollTrigger: { trigger: bannerRef.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
    return () => ctx.revert();
  }, []);

  /* how far the rail has to travel */
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDist(Math.max(0, track.scrollWidth - window.innerWidth + 48));
    };
    measure();
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 600);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [collections.length]);

  /* pinned horizontal scrub */
  useLayoutEffect(() => {
    if (reduced || dist <= 0) return;
    const { gsap, ScrollTrigger } = gsapSetup();
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const sign = getComputedStyle(track).direction === "rtl" ? 1 : -1;

    const ctx = gsap.context(() => {
      const st = {
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true,
      };
      gsap.to(track, { x: sign * dist, ease: "none", scrollTrigger: st });
      gsap.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: st });

      ScrollTrigger.create({
        ...st,
        onUpdate: (self) => {
          const n = collections.length;
          const i = Math.min(n - 1, Math.floor(self.progress * n + 0.0001));
          setActive((prev) => {
            if (prev !== i) setFlip((f) => f + 1);
            return i;
          });
        },
      });
    }, stageRef);

    return () => ctx.revert();
  }, [reduced, dist, collections.length]);

  const jump = useCallback(
    (i: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const idx = Math.max(0, Math.min(collections.length - 1, i));
      if (reduced || dist <= 0) {
        scrollToTarget("#maya-collections");
        return;
      }
      const top = stage.getBoundingClientRect().top + window.scrollY;
      const scrollable = stage.offsetHeight - window.innerHeight;
      scrollToTarget(top + (scrollable * idx) / Math.max(1, collections.length - 1));
    },
    [collections.length, dist, reduced],
  );

  const pinned = !reduced && dist > 0;

  return (
    <section id="maya-collections" aria-label="کالکشن‌ها">
      {/* wide banner */}
      <div ref={bannerRef} className="relative overflow-hidden will-change-[clip-path]">
        <div className="relative h-[52vh] min-h-[340px] md:h-[64vh]">
          <img
            data-banner-img
            src="/maya/img/banner-wide.webp"
            alt="کالکشن‌های مایا"
            loading="lazy"
            className="absolute inset-0 -top-[10%] h-[120%] w-full object-cover will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maya-ink/65 via-maya-ink/10 to-maya-ink/25" />
          <div className="maya-wrap absolute inset-x-0 bottom-0 pb-8 text-maya-cream md:pb-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 flex items-center gap-2.5 text-xs font-bold text-maya-sand">
                  <i className="maya-diamond text-maya-clay" />
                  هر فصل، یک روایت تازه
                </p>
                <h2 className="text-4xl font-black leading-tight md:text-6xl">کالکشن‌های مایا</h2>
              </div>
              <p className="mb-2 flex items-center gap-6 text-sm font-bold text-maya-cream/85">
                <span className="hidden items-center gap-2 md:flex">
                  <MousePointer2 className="size-4" />
                  برای دیدن، بکشید
                </span>
                <span>
                  {fa(collections.length)} <span className="text-maya-cream/60">کالکشن</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* pinned rail stage */}
      <div
        ref={stageRef}
        className="relative"
        style={pinned ? { height: `calc(100svh + ${dist}px)` } : undefined}
      >
        <div
          className={cn(
            "sticky top-0 flex flex-col justify-center overflow-hidden",
            pinned ? "h-[100svh]" : "py-14",
          )}
        >
          <div className="maya-wrap mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 flex items-center gap-2.5 text-xs font-black text-maya-clay">
                <i className="maya-diamond" />
                اسکرول کن تا ببینی
              </p>
              <h3 className="text-2xl font-black md:text-4xl">
                {collections[active]?.title ?? "کالکشن‌های مایا"}
              </h3>
            </div>
            <p className="text-sm font-bold tabular-nums text-maya-mute">
              {fa(String(active + 1).padStart(2, "0"))}
              <span className="mx-1 text-maya-fog">/</span>
              {fa(String(collections.length).padStart(2, "0"))}
            </p>
          </div>

          {/* the rail itself — translated by the scrub */}
          <div className={cn(!pinned && "overflow-x-auto pb-3")}>
            <div
              ref={trackRef}
              className="flex w-max gap-4 px-5 will-change-transform md:gap-6 md:px-10 xl:px-14"
            >
              {collections.map((c, i) => (
                <a
                  key={c.id}
                  href="#maya-collections"
                  onClick={(e) => e.preventDefault()}
                  className="group relative w-[68vw] flex-none overflow-hidden rounded-3xl sm:w-[42vw] lg:w-[30vw]"
                  data-active={active === i}
                  aria-label={c.title}
                >
                  <div className="aspect-[3/3.8] w-full overflow-hidden bg-maya-parchment">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      className={cn(
                        "size-full object-cover transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                        active === i ? "scale-[1.04]" : "scale-100 opacity-70 group-hover:opacity-100",
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t from-maya-ink/65 via-transparent to-transparent transition-opacity duration-500",
                      active === i ? "opacity-100" : "opacity-70",
                    )}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-maya-cream [perspective:800px]">
                    <div className="maya-col-caption" data-flip={active === i ? flip : undefined}>
                      <p className="text-lg font-black md:text-xl">{c.title}</p>
                      <p className="mt-1 text-xs text-maya-cream/75">{fa(c.count)} محصول</p>
                    </div>
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full bg-maya-cream text-maya-ink transition-all duration-500",
                        active === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                      )}
                    >
                      <ArrowLeft className="size-4" />
                    </span>
                  </div>
                  <span className="absolute top-4 left-4 rounded-full bg-maya-ink/40 px-2.5 py-1 text-[10px] font-bold text-maya-cream backdrop-blur-sm">
                    {fa(String(i + 1).padStart(2, "0"))}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* progress + arrows */}
          <div className="maya-wrap mt-8 flex items-center gap-5">
            <div className="flex gap-2">
              <button
                onClick={() => jump(active - 1)}
                disabled={active === 0}
                aria-label="قبلی"
                className="grid size-11 place-items-center rounded-full border border-maya-line transition-all hover:bg-maya-ink hover:text-maya-cream active:scale-90 disabled:opacity-30"
              >
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => jump(active + 1)}
                disabled={active === collections.length - 1}
                aria-label="بعدی"
                className="grid size-11 place-items-center rounded-full border border-maya-line transition-all hover:bg-maya-ink hover:text-maya-cream active:scale-90 disabled:opacity-30"
              >
                <ArrowLeft className="size-4" />
              </button>
            </div>
            <div className="relative h-px flex-1 overflow-visible bg-maya-line">
              <div
                ref={progressRef}
                className="absolute -top-0.5 h-[3px] w-full origin-right rounded-full bg-maya-ink"
                style={pinned ? undefined : { transform: `scaleX(${(active + 1) / collections.length})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
