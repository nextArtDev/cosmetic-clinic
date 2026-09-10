"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MousePointer2 } from "lucide-react";
import type { MayaCollection } from "../lib/data";
import { cn, fa, gsapSetup } from "../lib/fx";

export function CollectionCarousel({ collections }: { collections: MayaCollection[] }) {
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false });

  /* banner clip reveal */
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
          scrollTrigger: {
            trigger: bannerRef.current,
            start: "top 92%",
            end: "top 34%",
            scrub: 0.6,
          },
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

  /* drag to scroll (RTL aware) */
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const factor = rtl ? 1 : -1;
    let pointerId: number | null = null;

    const down = (e: PointerEvent) => {
      pointerId = e.pointerId;
      drag.current = { active: true, moved: false };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active || pointerId !== e.pointerId) return;
      if (Math.abs(e.movementX) > 2) drag.current.moved = true;
      el.scrollLeft += e.movementX * factor;
    };
    const up = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      drag.current.active = false;
      el.style.cursor = "grab";
      window.setTimeout(() => (drag.current.moved = false), 50);
    };
    const clickCapture = (e: MouseEvent) => {
      if (drag.current.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const cur = Math.abs(el.scrollLeft);
      setProgress(max > 0 ? cur / max : 0);
      setAtStart(cur < 8);
      setAtEnd(cur > max - 8);
    };
    onScroll();

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", clickCapture, true);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", clickCapture, true);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const amt = Math.min(el.clientWidth * 0.7, 420) * dir * (rtl ? -1 : 1);
    el.scrollBy({ left: amt, behavior: "smooth" });
  };

  return (
    <section id="maya-collections" className="py-20 md:py-28" aria-label="کالکشن‌ها">
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
                <h2 className="text-4xl font-black leading-tight md:text-6xl">
                  کالکشن‌های مایا
                </h2>
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

      {/* rail */}
      <div className="maya-wrap mt-10 md:mt-14">
        <div
          ref={railRef}
          className="maya-nobar flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-2 select-none md:gap-6"
        >
          {collections.map((c, i) => (
            <a
              key={c.id}
              href="#maya-collections"
              onClick={(e) => e.preventDefault()}
              className="group relative w-[68vw] flex-none snap-start overflow-hidden rounded-3xl sm:w-[42vw] lg:w-[29%]"
              aria-label={c.title}
            >
              <div className="aspect-[3/3.8] w-full overflow-hidden bg-maya-parchment">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-maya-ink/60 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-maya-cream">
                <div>
                  <p className="text-lg font-black md:text-xl">{c.title}</p>
                  <p className="mt-1 text-xs text-maya-cream/75">{fa(c.count)} محصول</p>
                </div>
                <span className="grid size-10 translate-y-2 place-items-center rounded-full bg-maya-cream text-maya-ink opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowLeft className="size-4" />
                </span>
              </div>
              <span className="absolute top-4 left-4 rounded-full bg-maya-ink/40 px-2.5 py-1 text-[10px] font-bold text-maya-cream backdrop-blur-sm">
                {fa(String(i + 1).padStart(2, "0"))}
              </span>
            </a>
          ))}

          {/* end card */}
          <div className="grid w-[68vw] flex-none snap-start place-items-center rounded-3xl border border-maya-line sm:w-[42vw] lg:w-[29%]">
            <div className="px-8 text-center">
              <p className="text-xl font-black">هنوز جا برای بیشتر است</p>
              <p className="mt-2 text-sm text-maya-mute">کالکشن‌های تازه هر فصل به مایا می‌آیند.</p>
            </div>
          </div>
        </div>

        {/* progress + arrows */}
        <div className="mt-8 flex items-center gap-5">
          <div className="flex gap-2">
            <button
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label="قبلی"
              className="grid size-11 place-items-center rounded-full border border-maya-line transition-all hover:bg-maya-ink hover:text-maya-cream active:scale-90 disabled:opacity-30"
            >
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label="بعدی"
              className="grid size-11 place-items-center rounded-full border border-maya-line transition-all hover:bg-maya-ink hover:text-maya-cream active:scale-90 disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </button>
          </div>
          <div className="relative h-px flex-1 overflow-visible bg-maya-line">
            <div
              className={cn("absolute -top-0.5 h-[3px] rounded-full bg-maya-ink transition-all duration-200")}
              style={{ insetInlineStart: `${progress * 78}%`, width: "22%" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
