"use client";

/* ============================================================
   /v16 — stacked featured collection.

   Ports the reference's `featured_collection` section
   ("ELEVATE YOUR WARDROBE TODAY"): a 6-column cascade where each
   column is offset further down than the one before it, and every
   card slides in from the bottom on scroll via ScrollTrigger.batch
   with a staggered delay (the original's `slide-in-bottom` +
   `animation-delay: calc(2s / count * index)`).

   Mounted between the bundle and best-sellers sections, matching
   the original's section order.
   ============================================================ */

import { useLayoutEffect, useRef, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { STACKED_COLLECTION, type MayaProduct } from "../lib/data";
import { cn, fa, gsapSetup, scrollToTarget } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { SectionHead } from "./bits";
import { useReducedMotionSafe } from "./Motion";

const COLS = 6;

function StackCard({ product, index }: { product: MayaProduct; index: number }) {
  const { setQuickView, addToCart } = useStore();
  const [hover, setHover] = useState(false);

  return (
    <div
      className="maya-stacked-item group flex flex-col"
      style={{ ["--maya-stack-i" as string]: String(index % COLS) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="maya-card-media rounded-2xl bg-maya-parchment" data-hover={hover}>
        <button
          className="block aspect-[3/4] w-full cursor-pointer"
          onClick={() => setQuickView(product)}
          aria-label={`مشاهده سریع ${product.title}`}
        >
          <img
            className="maya-card-img1 size-full object-cover"
            src={product.image}
            alt={product.title}
            loading="lazy"
          />
          {product.image2 ? (
            <img className="maya-card-img2" src={product.image2} alt="" loading="lazy" aria-hidden="true" />
          ) : null}
        </button>

        {product.tag ? (
          <span
            className={cn(
              "absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold",
              product.tag === "حراج" ? "bg-maya-clay text-maya-cream" : "bg-maya-cream text-maya-ink",
            )}
          >
            {product.tag}
          </span>
        ) : null}

        <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-3 gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => setQuickView(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-maya-cream/92 py-2 text-[11px] font-bold backdrop-blur-md transition-colors hover:bg-maya-ink hover:text-maya-cream"
          >
            <Eye className="size-3.5" />
            مشاهده سریع
          </button>
          <button
            onClick={() => addToCart(product, product.sizes[0])}
            className="grid size-8 flex-none place-items-center rounded-full bg-maya-ink text-maya-cream transition-colors hover:bg-maya-clay"
            aria-label={`افزودن ${product.title} به سبد`}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        <button
          className="maya-linkline text-right text-[13px] font-bold leading-6"
          onClick={() => setQuickView(product)}
        >
          {product.title}
        </button>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <PriceTag price={product.price} compareAt={product.compareAt} className="text-xs whitespace-nowrap" />
          <span className="flex gap-1">
            {product.colors.slice(0, 3).map((c) => (
              <i
                key={c}
                className="size-2.5 rounded-full border border-maya-line"
                style={{ background: c }}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StackedCollection({ products }: { products: MayaProduct[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();

  useLayoutEffect(() => {
    if (reduced) return;
    const { gsap, ScrollTrigger } = gsapSetup();
    const items = gsap.utils.toArray<HTMLElement>(".maya-stacked-item", gridRef.current!);
    if (!items.length) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(items, {
        start: "top 94%",
        once: true,
        onEnter: (batch) =>
          batch.forEach((el, i) => {
            /* the original staggers by 2s / itemCount per index */
            window.setTimeout(() => {
              (el as HTMLElement).dataset.inView = "true";
            }, (i * 2000) / items.length);
          }),
      });
    }, gridRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="maya-stacked"
      className="bg-maya-parchment/60 py-20 md:py-28"
      aria-label={STACKED_COLLECTION.title}
    >
      <div className="maya-wrap">
        <SectionHead
          kicker={STACKED_COLLECTION.kicker}
          title={STACKED_COLLECTION.title}
          desc={STACKED_COLLECTION.desc}
          action={{ label: "دیدن همه محصولات", onClick: () => scrollToTarget("#maya-bestsellers") }}
        />

        <div
          ref={gridRef}
          className="maya-stacked-grid"
          style={{ ["--maya-cols" as string]: String(COLS) }}
        >
          {products.map((p, i) => (
            <StackCard key={p.id} product={p} index={i} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs font-semibold text-maya-mute md:hidden">
          {fa(products.length)} محصول — برای دیدن همه، بکشید
        </p>
      </div>
    </section>
  );
}
