"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import type { MayaPromoTile } from "../lib/data";
import { gsapSetup } from "../lib/fx";
import { SectionHead } from "./bits";
import { useStore } from "./Store";

/* ----------------------------- media grid ---------------------------- */

export function MediaGrid({ tiles }: { tiles: MayaPromoTile[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { notify } = useStore();

  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-tile]", gridRef.current!).forEach((tile, i) => {
        gsap.fromTo(
          tile,
          { clipPath: "inset(22% 22% 22% 22% round 32px)", autoAlpha: 0.35 },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            autoAlpha: 1,
            duration: 1.15,
            ease: "power3.out",
            delay: (i % 3) * 0.12,
            scrollTrigger: { trigger: gridRef.current, start: "top 74%", once: true },
          },
        );
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="maya-wrap py-20 md:py-28" aria-label="پیشنهادهای فصل">
      <SectionHead
        kicker="پیشنهادهای فصل"
        title="برای هر لحظه، یک انتخاب"
        desc="چهار روایتِ فصل؛ از گرم‌ترین لایه‌ها تا شلوغ‌ترین حراج‌های مایا."
      />
      <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:grid-rows-2">
        {tiles.map((t, i) => (
          <button
            key={t.id}
            data-tile
            onClick={() => notify(`نسخه نمایشی — «${t.title}» به‌زودی`)}
            className={`group relative overflow-hidden rounded-3xl text-right will-change-[clip-path] lg:[grid-area:unset] ${
              i === 0 ? "lg:col-span-2 lg:row-span-2" : ""
            }`}
          >
            <div className={`w-full overflow-hidden bg-maya-parchment ${i === 0 ? "aspect-[4/4] lg:h-full lg:aspect-auto" : "aspect-[4/2.1]"}`}>
              <img
                src={t.image}
                alt={t.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-maya-ink/70 via-maya-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-maya-cream md:p-6">
              <div>
                <h3 className={`font-black leading-snug ${i === 0 ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>
                  {t.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 max-w-xs text-xs leading-6 text-maya-cream/75">{t.desc}</p>
              </div>
              <span className="grid size-10 flex-none translate-y-2 place-items-center rounded-full bg-maya-cream text-maya-ink opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpLeft className="size-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- media with text --------------------------- */

const DUO = [
  {
    id: "d1",
    image: "/maya/img/mt-1.webp",
    chip: "کالکشن مجلسی",
    title: "وقار در ساده‌ترین حالت",
  },
  {
    id: "d2",
    image: "/maya/img/mt-2.webp",
    chip: "بافت‌های زمستانه",
    title: "گرمای لطیف، ظاهری جسورانه",
  },
];

export function MediaWithText() {
  const ref = useRef<HTMLDivElement>(null);
  const { notify } = useStore();

  /* Port of the theme's mediaWithTextSec() — this section ships
     data-animation-type="square", so the two panels start fully off-canvas on
     opposite sides and slide toward each other (−15% / +15%) as the section
     scrolls in. The engine's timeline is NOT pinned here: it scrubs over the
     wrapper's own entry (start "top+=10% bottom", end "bottom center"). */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-duo]", ref.current!);
      if (!panels.length) return;
      gsap.set(panels, { xPercent: (i) => (i === 0 ? 100 : -100) });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top+=10% bottom",
            end: "bottom center",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        })
        .to(panels, { xPercent: (i) => (i === 0 ? -15 : 15), ease: "none" });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="maya-wrap pb-20 md:pb-28" aria-label="دو روایتِ مایا">
      <div ref={ref} className="grid gap-4 overflow-hidden sm:grid-cols-2 md:gap-6">
        {DUO.map((d) => (
          <div
            key={d.id}
            data-duo
            className="group relative overflow-hidden rounded-3xl will-change-transform"
          >
            <div className="aspect-square w-full overflow-hidden bg-maya-parchment">
              <img src={d.image} alt={d.title} loading="lazy" className="size-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-maya-ink/25 transition-colors duration-600 group-hover:bg-maya-ink/45" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-maya-cream">
              <span className="rounded-full border border-maya-cream/40 px-4 py-1.5 text-[11px] font-bold backdrop-blur-sm transition-all duration-500 group-hover:bg-maya-cream group-hover:text-maya-ink">
                {d.chip}
              </span>
              <h3 className="max-w-xs text-2xl font-black leading-snug transition-transform duration-500 group-hover:-translate-y-1.5 md:text-[2rem]">
                {d.title}
              </h3>
              <button
                onClick={() => notify(`نسخه نمایشی — «${d.chip}» به‌زودی`)}
                className="maya-linkline mt-1 flex items-center gap-2 text-sm font-bold opacity-0 transition-all duration-500 group-hover:opacity-100"
              >
                دیدن کالکشن
                <ArrowLeft className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
