"use client";

import { useLayoutEffect, useRef } from "react";
import { Plus } from "lucide-react";
import type { MayaProduct } from "../lib/data";
import { fa, gsapSetup } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { Reveal } from "./bits";
import { ConfettiBurst } from "./Confetti";

/* chip placement presets (percent of section box — desktop) */
const SPOTS = [
  { top: "4%", right: "6%", depth: 1.3, rotate: -5 },
  { top: "10%", left: "7%", depth: 0.9, rotate: 4 },
  { bottom: "16%", right: "11%", depth: 1.1, rotate: 3 },
  { bottom: "8%", left: "10%", depth: 1.4, rotate: -4 },
  { top: "42%", right: "2%", depth: 0.7, rotate: 6 },
];

export function Burst({ products }: { products: MayaProduct[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { addToCart } = useStore();
  const items = products.slice(0, 5);

  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      const chips = gsap.utils.toArray<HTMLElement>("[data-burst-chip]", sectionRef.current!);
      if (!chips.length) return;

      const box = sectionRef.current!.getBoundingClientRect();
      const cx = box.width / 2;
      const cy = box.height / 2;

      /* burst from center on enter */
      chips.forEach((chip) => {
        const r = chip.getBoundingClientRect();
        const sr = sectionRef.current!.getBoundingClientRect();
        const chipCx = r.left - sr.left + r.width / 2;
        const chipCy = r.top - sr.top + r.height / 2;
        gsap.fromTo(
          chip,
          {
            x: cx - chipCx,
            y: cy - chipCy,
            scale: 0.2,
            autoAlpha: 0,
            rotate: (Math.random() - 0.5) * 60,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            rotate: parseFloat(chip.dataset.rot || "0"),
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 62%", once: true },
          },
        );
      });

      /* gentle mouse parallax */
      const quicks = chips.map((chip) => ({
        x: gsap.quickTo(chip, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(chip, "y", { duration: 0.9, ease: "power3.out" }),
        depth: parseFloat(chip.dataset.pdepth || "1"),
      }));
      const onMove = (e: MouseEvent) => {
        const relX = (e.clientX / window.innerWidth - 0.5) * 2;
        const relY = (e.clientY / window.innerHeight - 0.5) * 2;
        quicks.forEach((q) => {
          q.x(relX * 26 * q.depth);
          q.y(relY * 20 * q.depth);
        });
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      return () => window.removeEventListener("mousemove", onMove);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-maya-ink py-24 text-maya-cream md:py-36"
      aria-label="استایل‌های ترند"
    >
      {/* the theme's burst_effects section exists purely to fire a
          confetti cannon when its top crosses the viewport top */}
      <ConfettiBurst effect="school-pride" duration={1000} triggerPosition="top" triggerOnce />

      {/* soft radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 46% at 50% 50%, rgba(154,106,61,0.22), transparent 70%)",
        }}
      />

      {/* floating product chips (desktop) */}
      {items.map((p, i) => (
        <div
          key={p.id}
          data-burst-chip
          data-rot={SPOTS[i].rotate}
          data-pdepth={SPOTS[i].depth}
          className="absolute z-10 hidden w-40 will-change-transform lg:block"
          style={{ top: SPOTS[i].top, right: SPOTS[i].right, left: SPOTS[i].left, bottom: SPOTS[i].bottom }}
        >
          <div className="group overflow-hidden rounded-2xl shadow-2xl">
            <div className="relative aspect-[3/3.4] overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button
                onClick={() => addToCart(p)}
                aria-label={`افزودن ${p.title} به سبد`}
                className="absolute top-2.5 left-2.5 grid size-8 place-items-center rounded-full bg-maya-cream text-maya-ink transition-all duration-300 hover:rotate-90 hover:bg-maya-clay hover:text-maya-cream active:scale-90"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="bg-maya-cream px-3 py-2 text-maya-ink">
              <p className="truncate text-[11px] font-bold">{p.title}</p>
              <PriceTag price={p.price} className="text-[10px] text-maya-mute" />
            </div>
          </div>
        </div>
      ))}

      {/* center copy */}
      <div className="maya-wrap relative z-0 mx-auto max-w-2xl text-center">
        <Reveal stagger={0.14}>
          <p data-rv className="mb-5 flex items-center justify-center gap-2.5 text-xs font-black text-maya-clay md:text-sm">
            <i className="maya-diamond" />
            پر‌طرفدارترین‌های همین حالا
            <i className="maya-diamond" />
          </p>
          <h2 data-rv className="text-3xl font-black leading-[1.25] sm:text-4xl lg:text-[3.4rem] lg:leading-[1.2]">
            استایل‌های ترندی که
            <br />
            نباید از دست بدهی!
          </h2>
          <p data-rv className="mx-auto mt-6 max-w-xl text-sm leading-8 text-maya-cream/70 md:text-base">
            گزیده‌ای از محبوب‌ترین استایل‌های فصل؛ هر قطعه با وسواس به‌خاطر کیفیت، راحتی و محبوبیتش
            انتخاب شده تا بی‌نیاز از وسواس، شیک بمانی. از ضروری‌های روزمره تا لباس‌های خاص.
          </p>
          <p data-rv className="mt-8">
            <a href="#maya-trending" className="maya-btn maya-btn-cream">
              خرید کن
            </a>
          </p>
        </Reveal>
      </div>

      {/* mobile chips rail */}
      <div className="maya-wrap mt-14 lg:hidden">
        <div className="maya-nobar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2">
          {items.slice(0, 4).map((p, i) => (
            <div key={p.id} className="w-44 flex-none snap-start overflow-hidden rounded-2xl">
              <div className="relative aspect-[3/3.4] overflow-hidden">
                <img src={p.image} alt={p.title} loading="lazy" className="size-full object-cover" />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-maya-ink/60 px-2 py-0.5 text-[10px] font-bold text-maya-cream backdrop-blur">
                  {fa(i + 1)}
                </span>
              </div>
              <div className="bg-maya-cream px-3 py-2 text-maya-ink">
                <p className="truncate text-[11px] font-bold">{p.title}</p>
                <PriceTag price={p.price} className="text-[10px] text-maya-mute" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
