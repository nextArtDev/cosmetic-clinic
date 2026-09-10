"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import type { MayaTestimonial } from "../lib/data";
import { cn, fa, EASE_EXPO } from "../lib/fx";
import { SectionHead } from "./bits";

export function Testimonials({ items }: { items: MayaTestimonial[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [offsets, setOffsets] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    const V = vp.clientWidth;
    const W = track.scrollWidth;
    const max = Math.max(0, W - V);
    setMaxDrag(max);
    const kids = Array.from(track.children) as HTMLElement[];
    // RTL flex row: later cards overflow to the left (negative offsetLeft).
    // Target x aligns each card's right edge with the viewport's right edge.
    setOffsets(
      kids.map((k) => {
        const raw = V - (k.offsetLeft + k.offsetWidth);
        return Math.min(Math.max(raw, 0), max);
      }),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const t = window.setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const goTo = useCallback(
    (i: number) => {
      const clamped = ((i % items.length) + items.length) % items.length;
      setIndex(clamped);
      setX(Math.min(offsets[clamped] ?? 0, maxDrag));
    },
    [items.length, offsets, maxDrag],
  );

  /* autoplay */
  useEffect(() => {
    if (paused || dragging || maxDrag === 0) return;
    const t = window.setInterval(() => goTo(index + 1), 7000);
    return () => window.clearInterval(t);
  }, [paused, dragging, index, goTo, maxDrag]);

  /* nearest index while dragging */
  const onDragEnd = () => {
    setDragging(false);
    const current = latestX.current;
    if (!offsets.length) return;
    let best = 0;
    let bestDist = Infinity;
    offsets.forEach((o, i) => {
      const d = Math.abs(Math.min(o, maxDrag) - current);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    goTo(best);
  };
  const latestX = useRef(0);

  return (
    <section
      className="overflow-hidden bg-maya-parchment/60 py-20 md:py-28"
      aria-label="نظرات مشتریان"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="maya-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            className="mb-0"
            kicker="صدای مشتریان"
            title="مشتریان ما چه می‌گویند"
            desc="از تهران تا تبریز؛ تجربه‌های واقعی خرید از مایا."
          />
          <div className="mb-10 flex gap-2 md:mb-14">
            <button
              onClick={() => goTo(index - 1)}
              aria-label="قبلی"
              className="grid size-12 place-items-center rounded-full border border-maya-line transition-all hover:bg-maya-ink hover:text-maya-cream active:scale-90"
            >
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="بعدی"
              className="grid size-12 place-items-center rounded-full border border-maya-line transition-all hover:bg-maya-ink hover:text-maya-cream active:scale-90"
            >
              <ArrowLeft className="size-4" />
            </button>
          </div>
        </div>

        <div ref={viewportRef} className="cursor-grab overflow-hidden active:cursor-grabbing">
          <motion.div
            ref={trackRef}
            drag={maxDrag > 0 ? "x" : false}
            dragConstraints={{ left: 0, right: maxDrag }}
            dragElastic={0.08}
            onDragStart={() => setDragging(true)}
            onDragEnd={onDragEnd}
            animate={{ x }}
            transition={{ duration: 0.7, ease: EASE_EXPO }}
            onUpdate={(latest) => {
              if (typeof latest.x === "number") latestX.current = latest.x;
            }}
            className="flex gap-4 py-8 will-change-transform md:gap-6"
          >
            {items.map((t, i) => (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: EASE_EXPO }}
                className={cn(
                  "flex w-[86%] flex-none flex-col rounded-3xl border border-maya-line bg-maya-cream p-6 transition-shadow duration-500 sm:w-[56%] lg:w-[41%] xl:w-[31.8%] md:p-8",
                  "hover:shadow-[0_28px_60px_-24px_rgba(22,19,14,0.3)]",
                )}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-maya-ink text-maya-cream">
                    <Quote className="size-4.5" fill="currentColor" />
                  </span>
                  <span className="flex gap-0.5 text-maya-clay" aria-label="۵ ستاره">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-3.5" fill="currentColor" strokeWidth={0} />
                    ))}
                  </span>
                </div>
                <p className="flex-1 text-sm leading-8 text-maya-coal md:text-[15px]">{t.quote}</p>
                <footer className="mt-6 flex items-center gap-3 border-t border-maya-line pt-5">
                  <span className="grid size-11 place-items-center rounded-full bg-maya-parchment text-sm font-black text-maya-clay">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-black">{t.name}</p>
                    <p className="text-xs text-maya-mute">{t.city} — خریدار تاییدشده</p>
                  </div>
                </footer>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* dots */}
        <div className="mt-2 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`رفتن به نظر ${fa(i + 1)}`}
              className={cn(
                "h-2 rounded-full transition-all duration-400",
                i === index ? "w-8 bg-maya-ink" : "w-2 bg-maya-line hover:bg-maya-mute",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
