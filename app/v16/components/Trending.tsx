"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import type { MayaProduct } from "../lib/data";
import { cn, fa, gsapSetup, scrollToTarget } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { SectionHead } from "./bits";

/* The theme hides the split heading below 768px (showing a static one
   instead) and turns the tiles into a snap carousel there, so the deck
   geometry changes with the layout and the gsap context is rebuilt when
   it does (same pattern as Bundle). */
type Layout = "sm" | "md" | "lg";

function pickLayout(w: number): Layout {
  return w >= 1200 ? "lg" : w >= 768 ? "md" : "sm";
}

/* ------------------------------------------------------------------ */
/* One narrow tile — the theme's `.product-tile`                       */
/* ------------------------------------------------------------------ */

function TrendingTile({ product }: { product: MayaProduct }) {
  const { setQuickView } = useStore();
  const [size, setSize] = useState<string | null>(null);

  return (
    <div data-trend-card className="maya-trending-tile group will-change-transform">
      <div className="relative overflow-hidden rounded-[5px] bg-maya-parchment">
        <button
          className="block aspect-[149/185] w-full cursor-pointer"
          onClick={() => setQuickView(product)}
          aria-label={`مشاهده سریع ${product.title}`}
        >
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        </button>

        {product.tag ? (
          <span
            className={cn(
              "absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold",
              product.tag === "حراج" ? "bg-maya-clay text-maya-cream" : "bg-maya-cream text-maya-ink",
            )}
          >
            {product.tag}
          </span>
        ) : null}

        {/* hover overlay — the theme's `product-card-mediaoverlay` */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-maya-ink/40 px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => setQuickView(product)}
            className="flex items-center gap-1.5 rounded-full bg-maya-cream px-3 py-1.5 text-[10px] font-bold text-maya-ink transition-colors hover:bg-maya-clay hover:text-maya-cream"
          >
            <Eye className="size-3" />
            مشاهده سریع
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {product.sizes.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[9px] font-bold transition-colors",
                  (size ?? product.sizes[0]) === s
                    ? "bg-maya-ink text-maya-cream"
                    : "bg-maya-cream/90 text-maya-ink hover:bg-maya-clay hover:text-maya-cream",
                )}
              >
                {fa(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-0.5 pt-2.5 text-center">
        <button
          className="maya-linkline line-clamp-2 text-[10px] leading-[1.2] font-semibold"
          onClick={() => setQuickView(product)}
        >
          {product.title}
        </button>
        <PriceTag price={product.price} compareAt={product.compareAt} className="mt-1.5 text-[10px]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The section                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   Port of the theme's trendingProduct() (data-animation-type="style-1").

   Layout: the heading is split into two halves (`card-title-front` /
   `card-title-back`) which sit in a two-column grid, while the tile row
   spans both columns on top of them — so at rest the giant heading is
   visible only through the gaps between the tiles.

   Motion: the engine parks every tile as a 3D deck —

     gsap.set(cards, { opacity: 0, scale: .5, rotationY: 70 })
     cards.forEach((el, i) => gsap.set(el, { x: <stack point>, z: 10 * i }))
     gsap.set([cards, centerArea], { transformStyle: "preserve-3d", perspective: 1000 })

   then scrubs one timeline (start `top top+=55vh`, end
   `bottom bottom-=35%`, scrub 1.5, no pin) in which the two heading
   halves fly out to ∓50vw and fade while the deck converges:

     .to([front, back], { x: ∓innerWidth/2, opacity: 0 })
     .to(cards, { x: 0, rotationY: 0, scale: 1, opacity: 1, z: 0 }, "<")

   RTL note: the engine's `x` signs assume LTR, where the first half sits
   on the left. Here the first half renders on the right, so every
   horizontal sign is mirrored through DIR.
   ------------------------------------------------------------------ */

const TITLE = "محصولات پرطرفدار";
const TITLE_FRONT = TITLE.slice(0, Math.ceil(TITLE.length / 2));
const TITLE_BACK = TITLE.slice(Math.ceil(TITLE.length / 2));
const DIR = -1; /* -1 for RTL, +1 for LTR */

export function Trending({ products }: { products: MayaProduct[] }) {
  const [layout, setLayout] = useState<Layout>("lg");
  const sectionRef = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLSpanElement>(null);
  const backRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const sync = () => setLayout(pickLayout(window.innerWidth));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const section = sectionRef.current;
    const deck = deckRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    if (!section || !deck || !front || !back) return;

    const wide = layout !== "sm";

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-trend-card]", deck);
      if (!cards.length) return;

      const fly = window.innerWidth / 2;

      /* 1. park the deck: half-scale, edge-on, every tile stacked on the
            same x with a 10px depth step so they fan out in 3D */
      gsap.set(cards, { opacity: 0, scale: 0.5, rotationY: 70 });
      if (wide) gsap.set([front, back], { x: (i: number) => (i === 0 ? -2 : 2) * DIR });

      const deckRect = deck.getBoundingClientRect();
      const half = deckRect.width / 2;
      cards.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        gsap.set(el, { x: half - (r.left - deckRect.left) + r.width, z: 10 * i });
      });

      gsap.set(cards, { transformStyle: "preserve-3d", perspective: 1000 });
      gsap.set(deck, { transformStyle: "preserve-3d", perspective: 1000 });

      /* 2. scrub: heading halves part, deck lands */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => "top top+=" + window.innerHeight * 0.55,
          end: () => "bottom bottom-=" + window.innerHeight * 0.35,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      if (wide) {
        tl.to([front, back], {
          x: (i: number) => (i === 0 ? -fly : fly) * DIR,
          opacity: 0,
          ease: "none",
        });
      }
      tl.to(cards, { x: 0, rotationY: 0, scale: 1, opacity: 1, z: 0, ease: "none" }, wide ? "<" : 0);
    }, sectionRef);

    return () => ctx.revert();
  }, [layout, products.length]);

  return (
    <section
      ref={sectionRef}
      id="maya-trending"
      className="relative overflow-hidden"
      aria-label="محصولات پرطرفدار"
    >
      <div className="maya-wrap py-11 md:py-[45px]">
        {/* the theme only renders a heading below 768px */}
        <div className="md:hidden">
          <SectionHead
            kicker="انتخاب مشتریان"
            title={TITLE}
            desc="آیتم‌هایی که این هفته بیشتر از همه دیده و خریده شدند؛ با امکان مشاهده سریع و انتخاب سایز."
            action={{ label: "دیدن همه محصولات", onClick: () => scrollToTarget("#maya-bestsellers") }}
          />
        </div>

        <div className="maya-trending-wrapper">
          <span ref={frontRef} className="maya-trending-front" aria-hidden="true">
            {TITLE_FRONT}
          </span>
          <div ref={deckRef} className="maya-trending-tiles">
            {products.map((p) => (
              <TrendingTile key={p.id} product={p} />
            ))}
          </div>
          <span ref={backRef} className="maya-trending-back" aria-hidden="true">
            {TITLE_BACK}
          </span>
        </div>
      </div>
    </section>
  );
}
