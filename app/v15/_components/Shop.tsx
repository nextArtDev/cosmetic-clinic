'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { PRODUCTS, type Product } from '../_lib/data'
import { toman } from '../_lib/format'
import { useV15 } from '../_lib/store'
import { V15_EASE } from './Preloader'
import { WordsReveal, FadeUp } from './Reveal'

/**
 * Shop — mock catalogue grid (swap PRODUCTS with Prisma results later).
 * Card micro-interactions: deep image zoom, quick-add slide-up, tag badge.
 */
export default function Shop() {
  return (
    <section id="shop" className="px-5 pb-28 pt-8 md:px-10 md:pb-40 md:pt-16">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
        <div>
          <FadeUp>
            <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.2em] opacity-70">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
              گزیده‌ی فروشگاه
              <span className="v15-latin text-[10px] uppercase tracking-[0.35em] opacity-60">
                The Selection
              </span>
            </p>
          </FadeUp>
          <WordsReveal
            as="h2"
            text="دوخته‌شده برای روزهای شما"
            className="text-4xl font-extralight leading-[1.5] md:text-6xl"
          />
        </div>
        <FadeUp delay={0.1}>
          <p className="v15-ink2 max-w-xs text-xs font-light leading-7 md:text-sm">
            قیمت‌ها به تومان و نمایشی‌اند؛ پس از اتصال به Prisma از پایگاه‌داده
            خوانده می‌شوند.
          </p>
        </FadeUp>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product, i) => (
          <FadeUp key={product.id} delay={(i % 3) * 0.08}>
            <ProductCard product={product} />
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, setCartOpen, toast } = useV15()

  const add = () => {
    addToCart(product)
    toast(`«${product.name}» به سبد اضافه شد`, product.category)
  }

  return (
    <article className="group" data-cursor="view" data-cursor-label="دیدن">
      <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--v15-card)]">
        <motion.div
          className="relative h-full w-full"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.9, ease: V15_EASE }}
        >
          <Image
            src={product.image}
            alt={`${product.name} — ${product.material}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        {product.tag && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-[color:var(--v15-paper)]/85 px-3 py-1 text-[10px] font-normal backdrop-blur">
            {product.tag}
          </span>
        )}

        {/* quick add */}
        <div className="v15-quick absolute inset-x-4 bottom-4 z-10">
          <button
            type="button"
            onClick={add}
            data-cursor="hover"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--v15-ink)]/90 py-3.5 text-sm font-normal text-[color:var(--v15-paper)] backdrop-blur transition-colors duration-300 hover:bg-[color:var(--v15-caramel)]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.6} />
            افزودن به سبد
          </button>
        </div>
      </div>

      <div
        className="mt-5 flex items-start justify-between gap-4"
        onDoubleClick={() => setCartOpen(true)}
      >
        <div>
          <h3 className="text-lg font-light leading-7">{product.name}</h3>
          <p className="v15-latin mt-0.5 text-[10px] uppercase tracking-[0.3em] opacity-50">
            {product.latinName}
          </p>
          <p className="v15-ink2 mt-2 text-xs font-light leading-6">
            {product.material}
          </p>
        </div>
        <p className="shrink-0 pt-1 text-sm font-normal">{toman(product.price)}</p>
      </div>
    </article>
  )
}