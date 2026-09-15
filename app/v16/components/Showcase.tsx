"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { MosaicTile } from "../lib/data";
import { gsapSetup } from "../lib/fx";
import { useStore } from "./Store";

/* ----------------------------- media mosaic ---------------------------- */
/* Port of the reference `media_grid` section. Note that the reference gives
   this section no `methodCalled` — it has no GSAP engine animation and no
   entrance reveal at all. What animates is the mosaic itself:

     · eight cells in a packed grid (4×4 at ≥768px, 2×8 below), each cell its
       own one-or-two-slide loop slider;
     · every cell slides along its own axis — the reference hands each cell a
       Splide `direction` of ltr / rtl / ttb — while the two edge arrows
       advance all eight together (`media-grid-slide.js` calls `go()` on every
       instance);
     · the arrows only reveal while the pointer is in the outer 20% of the
       viewport (`#hoverHandler`);
     · a 1500px "spotlight" disc lerps toward the cursor at 0.3
       (`#spotlightHandler`), and the section scheme rotates on every step
       (`#changeScheme`).

   Grid spans, directions, caption anchors, the CTA and the four pastel
   schemes are all transcribed from the reference (see `lib/data.ts`). */

/* the reference's `data-slide-scheme` array, in order: the section's own
   scheme followed by the same alternate three times. */
const SCHEME_STEPS = [0, 1, 1, 1];
const SCHEME_BG = [
  { bg: "#000000", spot: "#808080" }, // scheme-f2e74476 (the section's own)
  { bg: "#212123", spot: "#9f9fa4" }, // scheme-4861db02
];

export function MediaGrid({ tiles }: { tiles: MosaicTile[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const fwdRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const { notify } = useStore();

  /* ONE slide cursor for the whole mosaic — the reference drives every cell
     from the same click, so they all advance together. A cell with a single
     slide simply never moves. */
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [schemeIdx, setSchemeIdx] = useState(0);

  const go = useCallback((d: 1 | -1) => {
    setDir(d);
    setStep((s) => s + d);
    setSchemeIdx((i) => (i + d + SCHEME_STEPS.length) % SCHEME_STEPS.length);
  }, []);

  /* spotlight + edge-reveal arrows. Both listeners sit on the section (the
     reference attaches the spotlight to the section and the hover handler to
     `document`; the section is full-width, so the effect is the same). */
  useEffect(() => {
    const root = rootRef.current;
    const spot = spotRef.current;
    if (!root || !spot) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    if (!reduce) {
      const tick = () => {
        x += (tx - x) * 0.3;
        y += (ty - y) * 0.3;
        spot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    }

    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      tx = e.clientX - r.left - spot.offsetWidth / 2;
      ty = e.clientY - r.top - spot.offsetHeight / 2;
      /* The reference reveals `prev` near the left window edge and `next`
         near the right. This port is RTL, so the pair is mirrored: the left
         edge advances (forward is leftward in RTL) and the right edge goes
         back. */
      const w = window.innerWidth;
      fwdRef.current?.classList.toggle("is-shown", e.clientX < w * 0.2);
      backRef.current?.classList.toggle("is-shown", e.clientX > w * 0.8);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      fwdRef.current?.classList.remove("is-shown");
      backRef.current?.classList.remove("is-shown");
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const scheme = SCHEME_BG[SCHEME_STEPS[schemeIdx]];

  return (
    <section
      ref={rootRef}
      className="maya-mg"
      aria-label="پیشنهادهای فصل"
      style={{ "--mg-bg": scheme.bg, "--mg-spot": scheme.spot } as CSSProperties}
    >
      <div ref={spotRef} className="maya-mg-spot" aria-hidden />

      <div className="maya-mg-nav">
        {/* mirrored for RTL: the left edge is "forward" (leftward is the
            reading direction), the right edge is "back" */}
        <button
          ref={fwdRef}
          type="button"
          className="maya-mg-arrow maya-mg-forward"
          onClick={() => go(1)}
          aria-label="اسلاید بعدی"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          ref={backRef}
          type="button"
          className="maya-mg-arrow maya-mg-back"
          onClick={() => go(-1)}
          aria-label="اسلاید قبلی"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="maya-mg-list maya-wrap">
        {tiles.map((t) => {
          const n = t.slides.length;
          const pos = n > 1 ? (((step % n) + n) % n) : 0;

          /* which edge the caption enters from — the reference keys this off
             the cell's own axis plus the navigation direction. */
          const anim =
            t.direction === "ttb"
              ? dir > 0
                ? "in-bottom"
                : "in-top"
              : t.direction === "ltr"
                ? dir > 0
                  ? "in-right"
                  : "in-left"
                : dir > 0
                  ? "in-left"
                  : "in-right";

          return (
            <div
              key={t.id}
              className="maya-mg-item"
              data-dir={t.direction}
              data-feature={
                t.desktopSpan[0] > 1 && t.desktopSpan[1] > 1 ? "" : undefined
              }
              style={
                {
                  "--mg-cd": String(t.desktopSpan[0]),
                  "--mg-rd": String(t.desktopSpan[1]),
                  "--mg-cm": String(t.mobileSpan[0]),
                  "--mg-rm": String(t.mobileSpan[1]),
                  "--mg-pos": String(pos),
                  "--mg-bg": t.scheme.bg,
                  "--mg-ink": t.scheme.ink,
                } as CSSProperties
              }
            >
              <div className="maya-mg-track">
                {t.slides.map((s, si) => {
                  const active = si === pos;
                  return (
                    <div key={si} className="maya-mg-slide" data-img={s.image ? "" : undefined}>
                      {s.image ? (
                        /* NOT `loading="lazy"`: the off-axis slides sit
                           translated outside their `overflow: hidden` cell, so
                           the browser defers them and the first advance lands
                           on a blank tile. The seven mosaic images are small,
                           so they load eagerly. */
                        <img src={s.image} alt={s.title} className="maya-mg-img" />
                      ) : null}
                      {t.place !== "none" ? (
                        <div className="maya-mg-cap" data-place={t.place}>
                          {/* remounting on `step` replays the entrance, which is
                              what the reference's `slide-active` class does */}
                          <div
                            className="maya-mg-cap-inner"
                            key={active && step > 0 ? step : "idle"}
                            data-anim={active && step > 0 ? anim : undefined}
                          >
                            <h3 className="maya-mg-title">{s.title}</h3>
                            {s.desc ? <p className="maya-mg-text">{s.desc}</p> : null}
                            {s.cta ? (
                              <button
                                type="button"
                                className="maya-mg-cta"
                                onClick={() => notify(`نسخه نمایشی — «${s.title}» به‌زودی`)}
                              >
                                {s.cta}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
