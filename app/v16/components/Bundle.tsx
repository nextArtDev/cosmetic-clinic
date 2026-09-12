"use client";

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check, Package, Sparkles } from "lucide-react";
import type { MayaProduct } from "../lib/data";
import { cn, fa, faGroup, gsapSetup } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { SectionHead } from "./bits";

const MIN = 4;
const MAX = 7;
const DISCOUNT = 0.15;

/* the theme exposes --masonry-column-count per breakpoint (2 → 5) */
function pickColumns(w: number) {
  if (w >= 1280) return 5;
  if (w >= 1024) return 4;
  if (w >= 768) return 3;
  return 2;
}

export function Bundle({ products }: { products: MayaProduct[] }) {
  const { bundle, toggleBundle, clearBundle, addToCart, notify } = useStore();
  const [cols, setCols] = useState(2);
  const sectionRef = useRef<HTMLElement>(null);
  const masonryRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sync = () => setCols(pickColumns(window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  /* round-robin the products into columns so each column can drift
     independently (the engine's `.even-masonry` / `.odd-masonry`) */
  const columns = useMemo(() => {
    const out: MayaProduct[][] = Array.from({ length: cols }, () => []);
    products.forEach((p, i) => out[i % cols].push(p));
    return out;
  }, [products, cols]);

  /* ------------------------------------------------------------------
     Port of the theme's mixAndMatchBundle().
     The section ships data-animation-style="on-scroll": a 150% scrub
     (no pin) where the even columns drift up over 1.2 and the odd
     columns over 2, both starting together — so the columns lead/lag
     each other as the grid passes through the viewport.
     The engine also applies an absolute `y: -cardHeight/2`, but that is
     compensation for a wrapper it shortens by the same amount; we don't
     clip the grid, so the pure yPercent drift reads the same without
     leaving a hole at the bottom of the section.
     ------------------------------------------------------------------ */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const section = sectionRef.current;
    const masonry = masonryRef.current;
    if (!section || !masonry) return;

    const ctx = gsap.context(() => {
      const even = gsap.utils.toArray<HTMLElement>('[data-masonry="even"]', masonry);
      const odd = gsap.utils.toArray<HTMLElement>('[data-masonry="odd"]', masonry);
      if (!even.length && !odd.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top+=72",
          end: "+=150%",
          scrub: 1.5,
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });

      if (even.length) tl.to(even, { yPercent: -10, duration: 1.2, ease: "none" });
      if (odd.length) tl.to(odd, { yPercent: -10, duration: 2, ease: "none" }, "<");
    }, sectionRef);

    return () => ctx.revert();
  }, [cols, products.length]);

  const count = bundle.length;
  const ready = count >= MIN;
  const rawTotal = bundle.reduce((a, p) => a + p.price, 0);
  const total = ready ? Math.round(rawTotal * (1 - DISCOUNT)) : rawTotal;
  const need = Math.max(0, MIN - count);

  return (
    <section
      id="maya-bundle"
      ref={sectionRef}
      className="relative overflow-hidden py-20 md:py-28"
      aria-label="باندل بساز"
    >
      <div className="maya-wrap">
        <SectionHead
          kicker="میکس و مچ"
          title="باندل خودت را بساز"
          desc={`${fa(MIN)} تا ${fa(MAX)} قلم انتخاب کن و روی کل باندل ${fa(15)}٪ تخفیف بگیر؛ انتخاب‌ها را از نوار پایین مدیریت کن.`}
        />

        {/* masonry grid — even/odd columns drift at different rates */}
        <div ref={masonryRef} className="maya-bundle-masonry" style={{ "--masonry-column-count": cols } as CSSProperties}>
          {columns.map((col, j) => (
            <div
              key={j}
              data-masonry={j % 2 === 0 ? "even" : "odd"}
              className="maya-bundle-col"
            >
              {col.map((p) => {
                const selected = bundle.some((x) => x.id === p.id);
                return (
                  <div
                    key={p.id}
                    data-bundle-card
                    className={cn(
                      "group overflow-hidden rounded-3xl border bg-white/40 transition-colors duration-300",
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
                            ? "rotate-0 bg-maya-clay text-maya-cream"
                            : "bg-maya-ink text-maya-cream hover:rotate-90 hover:bg-maya-clay",
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
          ))}
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
