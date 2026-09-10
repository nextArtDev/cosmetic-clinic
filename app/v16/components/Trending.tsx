"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Plus, Check } from "lucide-react";
import type { MayaProduct } from "../lib/data";
import { cn, fa, scrollToTarget } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { Reveal, SectionHead } from "./bits";

function ProductCard({ product }: { product: MayaProduct }) {
  const { addToCart, setQuickView } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, size ?? product.sizes[0]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div data-rv className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-maya-parchment">
        <button
          className="block aspect-[3/4] w-full cursor-pointer"
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

        {product.tag && (
          <span
            className={cn(
              "absolute top-3.5 right-3.5 rounded-full px-3 py-1 text-[11px] font-bold",
              product.tag === "حراج" ? "bg-maya-clay text-maya-cream" : "bg-maya-cream text-maya-ink",
            )}
          >
            {product.tag}
          </span>
        )}

        {/* quick view pill */}
        <button
          onClick={() => setQuickView(product)}
          className="absolute inset-x-3.5 bottom-3.5 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-maya-cream/90 py-2.5 text-xs font-bold opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-maya-ink hover:text-maya-cream group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="size-4" />
          مشاهده سریع
        </button>

        {/* sizes on hover */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 max-lg:hidden">
          {product.sizes.map((s, i) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              style={{ transitionDelay: `${i * 25}ms` }}
              className={cn(
                "grid size-8 -translate-x-2 place-items-center rounded-full text-[11px] font-bold shadow-sm transition-all duration-300 group-hover:translate-x-0",
                (size ?? product.sizes[0]) === s
                  ? "bg-maya-ink text-maya-cream"
                  : "bg-maya-cream/95 text-maya-ink hover:bg-maya-clay hover:text-maya-cream",
              )}
            >
              {fa(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <button
              className="maya-linkline text-right text-sm font-bold md:text-[15px]"
              onClick={() => setQuickView(product)}
            >
              {product.title}
            </button>
            <div className="mt-2 flex items-center gap-1.5">
              {product.colors.map((c, i) => (
                <button
                  key={c}
                  className="maya-swatch"
                  style={{ background: c }}
                  data-active={color === i}
                  onClick={() => setColor(i)}
                  aria-label={`رنگ ${fa(i + 1)}`}
                />
              ))}
            </div>
          </div>
          <PriceTag price={product.price} compareAt={product.compareAt} className="mt-0.5 text-sm whitespace-nowrap" />
        </div>

        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "mt-4 flex items-center justify-center gap-2 rounded-full border py-2.5 text-xs font-bold transition-colors duration-300",
            added
              ? "border-maya-clay bg-maya-clay text-maya-cream"
              : "border-maya-line text-maya-ink hover:border-maya-ink hover:bg-maya-ink hover:text-maya-cream",
          )}
        >
          {added ? <Check className="size-4" /> : <Plus className="size-4" />}
          {added ? "اضافه شد" : "افزودن به سبد"}
        </motion.button>
      </div>
    </div>
  );
}

export function Trending({ products }: { products: MayaProduct[] }) {
  return (
    <section id="maya-trending" className="maya-wrap py-20 md:py-28" aria-label="محصولات پرطرفدار">
      <SectionHead
        kicker="انتخاب مشتریان"
        title="محصولات پرطرفدار"
        desc="آیتم‌هایی که این هفته بیشتر از همه دیده و خریده شدند؛ با امکان مشاهده سریع و انتخاب سایز."
        action={{ label: "دیدن همه محصولات", onClick: () => scrollToTarget("#maya-bestsellers") }}
      />
      <Reveal stagger={0.1} className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </Reveal>
    </section>
  );
}
