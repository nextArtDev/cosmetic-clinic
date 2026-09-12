"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowUpLeft } from "lucide-react";
import type { MayaCollection } from "../lib/data";
import { fa, gsapSetup } from "../lib/fx";
import { RotatingText, useReducedMotionSafe } from "./Motion";

/* ============================================================
   Statement / rich text.

   Ports the reference's `richText` section (`data-animation-type=
   "color-based"`):
     · the manifesto heading is painted with a radial gradient
       clipped to the text; the scrub drives --maya-reveal from
       100% → 0% so the accent colour wipes out from the bottom
       centre (reference: --text-reveal-percentage),
     · the circular SALE badge in the middle of the row scales down
       from 20× to 1×,
     · the collection thumbnails converge toward the centre.
   The section is pinned for 125% of the viewport, as in the original.
   ============================================================ */

const STATEMENT =
  "مایا، ظرافتِ بی‌زمان را با روندِ امروز در هم می‌آمیزد و پوشاکی می‌سازد که به تو اعتمادبه‌نفس و وقار می‌بخشد؛ با پارچه‌های درجه‌یک و طرح‌های یکتا، استایلی خلق می‌کنیم که زیبایی را از نو تعریف می‌کند، تا در هر لحظه بی‌نیاز از تلاش بدرخشی.";

const CENTER = 3;

export function Statement({ collections }: { collections: MayaCollection[] }) {
  const stageRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap } = gsapSetup();
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-converge]", rowRef.current!);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      /* radial text wipe — the reference animates this var 100% → 0% */
      tl.fromTo(
        headingRef.current,
        { "--maya-reveal": "100%" },
        { "--maya-reveal": "0%", ease: "none" },
        0,
      );

      /* circular SALE badge scales in from 20× (reference: scale 20 → 1) */
      tl.fromTo(badgeRef.current, { scale: 20 }, { scale: 1, ease: "none" }, 0);

      /* thumbnails converge toward the centre */
      items.forEach((el, i) => {
        const d = i - CENTER;
        tl.fromTo(el, { x: d * 55 }, { x: 0, ease: "none" }, 0);
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
      className="relative bg-maya-cream"
      style={reduced ? undefined : { height: "225svh" }}
      aria-label="مانیفست مایا"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] flex-col justify-center overflow-hidden">
        <div className="maya-wrap">
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

          {/* converging collection row + circular SALE badge */}
          <div ref={rowRef} className="maya-col-row mt-10 md:mt-14">
            {cells.map((cell) =>
              cell.kind === "badge" ? (
                <div key="badge" className="grid place-items-center">
                  <div ref={badgeRef} data-badge className="will-change-transform">
                    <RotatingText text="حراج • تا ۵۰٪ تخفیف • فقط این هفته • " size={148} duration={22}>
                      <div className="grid size-[62%] place-items-center rounded-full bg-maya-clay text-maya-cream shadow-xl">
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
                  href="#maya-collections"
                  onClick={(e) => e.preventDefault()}
                  className="maya-col-thumb group will-change-transform"
                  aria-label={cell.c.title}
                >
                  <img src={cell.c.image} alt={cell.c.title} loading="lazy" />
                  <span className="maya-tooltip">{cell.c.title}</span>
                  <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-maya-cream/85 text-[9px] font-black backdrop-blur-sm">
                    {fa(cell.c.count)}
                  </span>
                </a>
              ),
            )}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-[11px] font-bold text-maya-mute">
            <ArrowUpLeft className="size-3.5" />
            اسکرول کن تا مانيفست کامل شود
          </p>
        </div>
      </div>
    </section>
  );
}
