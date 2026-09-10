"use client";

import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check, Package, Sparkles } from "lucide-react";
import type { MayaProduct } from "../lib/data";
import { cn, fa, faGroup, gsapSetup } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { SectionHead } from "./bits";

const MIN = 4;
const MAX = 7;
const DISCOUNT = 0.15;

export function Bundle({ products }: { products: MayaProduct[] }) {
  const { bundle, toggleBundle, clearBundle, addToCart, notify } = useStore();
  const railRef = useRef<HTMLDivElement>(null);

  /* cards settle from a scattered "pile" */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-bundle-card]", railRef.current!).forEach((el, i) => {
        gsap.fromTo(
          el,
          {
            y: 70 + (i % 3) * 26,
            rotate: i % 2 === 0 ? -4 - (i % 3) : 3 + (i % 3),
            autoAlpha: 0,
          },
          {
            y: 0,
            rotate: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: railRef.current, start: "top 78%", once: true },
            delay: i * 0.07,
          },
        );
      });
    }, railRef);
    return () => ctx.revert();
  }, []);

  const count = bundle.length;
  const ready = count >= MIN;
  const rawTotal = bundle.reduce((a, p) => a + p.price, 0);
  const total = ready ? Math.round(rawTotal * (1 - DISCOUNT)) : rawTotal;
  const need = Math.max(0, MIN - count);

  return (
    <section id="maya-bundle" className="relative overflow-hidden py-20 md:py-28" aria-label="باندل بساز">
      <div className="maya-wrap">
        <SectionHead
          kicker="میکس و مچ"
          title="باندل خودت را بساز"
          desc={`${fa(MIN)} تا ${fa(MAX)} قلم انتخاب کن و روی کل باندل ${fa(15)}٪ تخفیف بگیر؛ انتخاب‌ها را از نوار پایین مدیریت کن.`}
        />

        {/* product rail */}
        <div ref={railRef} className="maya-nobar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:gap-6 md:px-0">
          {products.map((p) => {
            const selected = bundle.some((x) => x.id === p.id);
            return (
              <div
                key={p.id}
                data-bundle-card
                className={cn(
                  "group w-56 flex-none snap-start overflow-hidden rounded-3xl border bg-white/40 transition-colors duration-300 md:w-64",
                  selected ? "border-maya-clay shadow-[0_18px_44px_-18px_rgba(154,106,61,0.5)]" : "border-maya-line",
                )}
              >
                <div className="relative aspect-[3/3.4] overflow-hidden bg-maya-parchment">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className={cn(
                      "size-full object-cover transition-all duration-700",
                      selected ? "scale-[1.03]" : "group-hover:scale-[1.05]",
                    )}
                  />
                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-maya-clay/15"
                      />
                    )}
                  </AnimatePresence>
                  <span
                    className={cn(
                      "absolute top-3 right-3 grid size-8 place-items-center rounded-full text-xs font-black transition-all duration-300",
                      selected ? "bg-maya-clay text-maya-cream" : "bg-maya-cream/85 text-maya-ink backdrop-blur-sm",
                    )}
                  >
                    {selected ? fa(bundle.findIndex((x) => x.id === p.id) + 1) : <Plus className="size-4" />}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{p.title}</p>
                    <PriceTag price={p.price} className="mt-1 text-xs text-maya-mute" />
                  </div>
                  <button
                    onClick={() => toggleBundle(p)}
                    aria-pressed={selected}
                    className={cn(
                      "grid size-10 flex-none place-items-center rounded-full transition-all duration-300 active:scale-85",
                      selected
                        ? "bg-maya-clay text-maya-cream rotate-0"
                        : "bg-maya-ink text-maya-cream hover:bg-maya-clay hover:rotate-90",
                    )}
                    aria-label={selected ? `حذف ${p.title} از باندل` : `افزودن ${p.title} به باندل`}
                  >
                    {selected ? <Check className="size-4" /> : <Plus className="size-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* sticky bundle bar */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 110, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 110, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="maya-wrap pointer-events-none sticky bottom-4 z-40 mt-8"
          >
            <div className="pointer-events-auto flex flex-wrap items-center gap-x-5 gap-y-3 rounded-3xl border border-maya-line bg-maya-cream/92 p-4 shadow-[0_24px_60px_-20px_rgba(22,19,14,0.4)] backdrop-blur-xl md:rounded-full md:pr-5">
              {/* thumbs */}
              <div className="flex -space-x-3 space-x-reverse">
                <AnimatePresence initial={false}>
                  {bundle.map((p) => (
                    <motion.button
                      key={p.id}
                      layout
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 30 }}
                      transition={{ type: "spring", stiffness: 500, damping: 26 }}
                      onClick={() => toggleBundle(p)}
                      className="size-11 overflow-hidden rounded-full border-2 border-maya-cream bg-maya-parchment shadow"
                      title={`حذف ${p.title}`}
                    >
                      <img src={p.image} alt={p.title} className="size-full object-cover" />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* progress segments */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      backgroundColor: i < count ? (i < MIN ? "#9a6a3d" : "#16130e") : "rgba(22,19,14,0.12)",
                    }}
                    className="h-1.5 w-6 rounded-full"
                  />
                ))}
              </div>

              <p className="flex items-center gap-2 text-xs font-bold text-maya-mute">
                <Package className="size-4" />
                {ready ? (
                  <span className="flex items-center gap-1.5 text-maya-clay-deep">
                    <Sparkles className="size-4" />
                    ۱۵٪ تخفیف باندل فعال شد
                  </span>
                ) : (
                  <>هنوز {fa(need)} قلم تا تخفیف مانده</>
                )}
              </p>

              <div className="mr-auto flex items-center gap-4">
                <div className="text-left leading-tight">
                  {ready && (
                    <p className="text-[10px] text-maya-mute line-through">{faGroup(rawTotal)}</p>
                  )}
                  <p className="text-sm font-black">
                    {faGroup(total)} <span className="text-[10px] font-semibold text-maya-mute">تومان</span>
                  </p>
                </div>
                <button
                  className="maya-btn maya-btn-dark px-5! py-3! text-xs!"
                  disabled={!ready}
                  onClick={() => {
                    bundle.forEach((p) => addToCart(p, p.sizes[0]));
                    clearBundle();
                    notify("کل باندل با تخفیف به سبد اضافه شد");
                  }}
                >
                  افزودن باندل به سبد
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
