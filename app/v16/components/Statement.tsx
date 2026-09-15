"use client";

import { useLayoutEffect, useRef } from "react";
import type { MayaCollection } from "../lib/data";
import { fa, gsapSetup } from "../lib/fx";
import { RotatingText, useReducedMotionSafe } from "./Motion";

/* ============================================================
   Statement / rich text.

   Port of the reference's `richText` section
   (`data-animation-type="color-based"`). Reading the engine:

     gsap.set([rich-animated-color], { scale: 20 })        // the ROUND BLOB
     timeline({ trigger: .section-wrapper, start: "top top+=header",
                end: "+=125%", scrub: 1.5, pin: true })
       .to(round,     { scale: 1 })
       .fromTo(section, { "--text-reveal-percentage": "100%" },
                        { "--text-reveal-percentage": "0%" }, "<")

   Two details that are easy to get wrong:

   1. `rich-animated-color` is NOT the SALE badge. It is `.animate-round`,
      a decorative disc that lives in `.animate-round-wrap` (absolute,
      inset 0, overflow hidden) and is sized/placed to sit exactly behind
      the centre badge. It opens the section as a full clay field and
      collapses into the badge's backing disc.
   2. The manifesto is painted by a radial gradient clipped to the text,
      `circle at center 100%`: clay out to `--text-reveal-percentage`, then
      a blend band of `percentage / 1.2` into ink. At 100% the whole
      sentence is clay (invisible on the clay field); at 0% it is all ink.

   The engine pins for `+=125%` of scroll. We reproduce that with a
   225svh stage + a sticky 100svh panel, which is more robust under Lenis.
   ============================================================ */

const STATEMENT =
  "مایا، ظرافتِ بی‌زمان را با روندِ امروز در هم می‌آمیزد و پوشاکی می‌سازد که به تو اعتمادبه‌نفس و وقار می‌بخشد؛ با پارچه‌های درجه‌یک و طرح‌های یکتا، استایلی خلق می‌کنیم که زیبایی را از نو تعریف می‌کند، تا در هر لحظه بی‌نیاز از تلاش بدرخشی.";

/* index of the centre cell — the reference ships `collection-items-7`, so
   three thumbnails sit on each side of the badge */
const CENTER = 3;

export function Statement({ collections }: { collections: MayaCollection[] }) {
  const stageRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const roundRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = gsapSetup();
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-converge]", rowRef.current!);
      const round = roundRef.current;

      /* --- the engine's convergence maths -------------------------------
         For every item that sits to one side of the centre it measures the
         gap to the centre and pushes `-(gap - accumulated margin)` onto a
         list; the mirrored list drives the other side. Net effect: the row
         starts fanned out and closes in on the badge. We reproduce the same
         geometry from the layout box instead of hard-coding pixel steps. */
      const offsets = items.map((el) => {
        const r = el.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        return mid - window.innerWidth / 2;
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
          onEnter: () => wrapRef.current?.classList.add("in-visible-state"),
          onEnterBack: () => wrapRef.current?.classList.add("in-visible-state"),
          onLeave: () => wrapRef.current?.classList.remove("in-visible-state"),
          onLeaveBack: () => wrapRef.current?.classList.remove("in-visible-state"),
        },
      });

      /* the round blob collapses into the badge backing */
      if (round) tl.fromTo(round, { scale: 20 }, { scale: 1, ease: "none" }, 0);

      /* radial text wipe — the reference animates this var 100% → 0% */
      tl.fromTo(
        headingRef.current,
        { "--maya-reveal": "100%" },
        { "--maya-reveal": "0%", ease: "none" },
        0,
      );

      /* thumbnails converge toward the centre */
      items.forEach((el, i) => {
        tl.fromTo(el, { x: offsets[i] * 0.55 }, { x: 0, ease: "none" }, 0);
      });
    }, stageRef);

    return () => ctx.revert();
  }, [reduced]);

  const thumbs = collections.slice(0, 6);
  const cells: Array<{ kind: "thumb"; c: MayaCollection; i: number } | { kind: "badge" }> = [];
  thumbs.slice(0, CENTER).forEach((c, i) => cells.push({ kind: "thumb", c, i }));
  cells.push({ kind: "badge" });
  thumbs.slice(CENTER).forEach((c, i) => cells.push({ kind: "thumb", c, i: i + CENTER }));

  return (
    <section
      id="maya-statement"
      ref={stageRef}
      className="maya-rich-section relative bg-maya-cream"
      style={reduced ? undefined : { height: "225svh" }}
      aria-label="مانیفست مایا"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        {/* decorative clay field — collapses into the badge's backing disc */}
        <div className="maya-round-wrap" aria-hidden="true">
          <div ref={roundRef} className="maya-round" />
        </div>

        <div
          ref={wrapRef}
          className="maya-wrap relative z-[3] flex h-full flex-col justify-center pb-[calc(var(--maya-badge)+var(--maya-col-pad)*2)]"
        >
          <p className="mb-6 flex items-center justify-center gap-2.5 text-xs font-black text-maya-clay md:mb-8 md:text-sm">
            <i className="maya-diamond" />
            داستان ما با چشم‌اندازی آغاز شد: آمیزشِ سبک و وقار
            <i className="maya-diamond" />
          </p>

          <h3
            ref={headingRef}
            className="maya-rich-text mx-auto max-w-5xl text-center text-[5.6vw] font-black leading-[1.5] sm:text-2xl sm:leading-[1.7] md:text-[2rem] lg:text-[2.35rem]"
          >
            {STATEMENT}
          </h3>
        </div>

        {/* converging collection row + circular SALE badge, pinned to the
            bottom of the panel (reference: `.rich-text-collection` inside a
            `section-height` wrapper) */}
        <div ref={rowRef} className="maya-col-row">
          {cells.map((cell, i) =>
            cell.kind === "badge" ? (
              <div key="badge" className="maya-col-badge" data-slot={i}>
                <div ref={badgeRef} className="will-change-transform">
                  <RotatingText
                    text="حراج • تا ۵۰٪ تخفیف • فقط این هفته • "
                    sizeCss="var(--maya-diameter)"
                    duration={40}
                  >
                    <div className="grid size-[62%] place-items-center rounded-full text-maya-cream">
                      <div className="text-center leading-none">
                        <p className="text-[9px] font-bold opacity-80">تا</p>
                        <p className="text-xl font-black md:text-2xl">٪۵۰</p>
                        <p className="mt-0.5 text-[9px] font-bold opacity-80">تخفیف</p>
                      </div>
                    </div>
                  </RotatingText>
                </div>
              </div>
            ) : (
              <a
                key={cell.c.id}
                data-converge
                data-slot={i}
                href="#maya-collections"
                onClick={(e) => e.preventDefault()}
                className="maya-col-thumb group will-change-transform"
                aria-label={cell.c.title}
              >
                <img src={cell.c.image} alt={cell.c.title} loading="lazy" />
                <span className="maya-tooltip">{cell.c.title}</span>
                <span className="maya-col-count">{fa(cell.c.count)}</span>
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
