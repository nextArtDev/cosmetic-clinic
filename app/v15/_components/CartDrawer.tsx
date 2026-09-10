'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useV15 } from '../_lib/store'
import { faDigits, toman } from '../_lib/format'
import { getLenis } from '../_lib/lenis'
import { V15_EASE } from './Preloader'

/**
 * Sliding cart drawer (mock). Locks smooth-scroll while open, releases on close.
 */
export default function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    items,
    count,
    subtotal,
    setQty,
    removeFromCart,
    toast,
  } = useV15()

  useEffect(() => {
    const lenis = getLenis()
    if (cartOpen) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
  }, [cartOpen])

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-[color:var(--v15-ink)]/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-[75] flex w-[min(430px,94vw)] flex-col bg-[color:var(--v15-paper)]"
            initial={{ x: '-104%' }}
            animate={{ x: 0 }}
            exit={{ x: '-104%' }}
            transition={{ duration: 0.65, ease: V15_EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="سبد خرید"
            data-lenis-prevent
          >
            {/* head */}
            <div className="flex items-center justify-between border-b border-[color:var(--v15-line)] px-6 py-5">
              <p className="flex items-center gap-3 text-lg font-light">
                سبدِ خرید
                <span className="rounded-full bg-[color:var(--v15-ink)] px-2.5 py-0.5 text-xs text-[color:var(--v15-paper)]">
                  {faDigits(count)}
                </span>
              </p>
              <button
                type="button"
                data-cursor="hover"
                onClick={() => setCartOpen(false)}
                aria-label="بستن سبد"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--v15-line-strong)] transition-colors duration-300 hover:bg-[color:var(--v15-ink)] hover:text-[color:var(--v15-paper)]"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                  <ShoppingBag className="h-10 w-10 opacity-25" strokeWidth={1} />
                  <p className="text-sm font-light leading-7 opacity-70">
                    سبدِ شما خالی است.
                    <br />
                    سفری به «گزیده‌ی فروشگاه» بزنید.
                  </p>
                  <button
                    type="button"
                    data-cursor="hover"
                    className="v15-btn mt-2"
                    onClick={() => {
                      setCartOpen(false)
                      window.setTimeout(
                        () =>
                          document
                            .querySelector('#shop')
                            ?.scrollIntoView({ behavior: 'smooth' }),
                        500,
                      )
                    }}
                  >
                    ادامه‌ی خرید
                  </button>
                </div>
              ) : (
<ul className="flex flex-col divide-y divide-[color:var(--v15-line)]">
                  <AnimatePresence initial={false}>
                    {items.map(({ product, qty }) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.45, ease: V15_EASE }}
                        className="flex gap-5 py-6"
                      >
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[color:var(--v15-card)]">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-normal">{product.name}</p>
                              <p className="v15-ink2 mt-1 text-[11px] font-light">
                                {product.material}
                              </p>
                            </div>
                            <button
                              type="button"
                              data-cursor="hover"
                              aria-label={`حذف ${product.name}`}
                              onClick={() => removeFromCart(product.id)}
                              className="opacity-40 transition-opacity hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.4} />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 rounded-full border border-[color:var(--v15-line-strong)] px-2 py-1">
                              <button
                                type="button"
                                data-cursor="hover"
                                aria-label="افزایش تعداد"
                                onClick={() => setQty(product.id, qty + 1)}
                              >
                                <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
                              </button>
                              <span className="w-5 text-center text-sm">
                                {faDigits(qty)}
                              </span>
                              <button
                                type="button"
                                data-cursor="hover"
                                aria-label="کاهش تعداد"
                                onClick={() => setQty(product.id, qty - 1)}
                              >
                                <Minus className="h-3.5 w-3.5" strokeWidth={1.6} />
                              </button>
                            </div>
                            <p className="text-sm font-normal">
                              {toman(product.price * qty)}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* summary */}
            {items.length > 0 && (
              <div className="border-t border-[color:var(--v15-line)] px-6 py-6">
                <div className="mb-2 flex items-center justify-between text-sm font-light">
                  <span className="opacity-70">جمعِ کل</span>
                  <span className="text-base font-normal">{toman(subtotal)}</span>
                </div>
                <p className="mb-5 text-[11px] font-light opacity-50">
                  هزینه‌ی ارسالِ بیمه‌شده در مرحله‌ی بعد محاسبه می‌شود. (نمایشی)
                </p>
                <button
                  type="button"
                  data-cursor="hover"
                  className="v15-btn v15-btn--fill w-full justify-center"
                  onClick={() =>
                    toast(
                      'ادامه‌ی پرداخت — نسخه‌ی نمایشی',
                      'به‌زودی به درگاهِ پرداخت و Prisma متصل می‌شود.',
                    )
                  }
                >
                  تسویه‌حساب و پرداختِ امن
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}