"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Headset, Clock3, ShieldCheck } from "lucide-react";
import type { MayaFaq } from "../lib/data";
import { cn, EASE_STANDARD } from "../lib/fx";
import { Reveal, SectionHead } from "./bits";
import { useStore } from "./Store";

export function Faq({ items }: { items: MayaFaq[] }) {
  const [open, setOpen] = useState(0);
  const { notify } = useStore();

  return (
    <section id="maya-faq" className="maya-wrap py-20 md:py-28" aria-label="سوالات متداول">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        {/* sticky intro */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead
            className="mb-6"
            kicker="پاسخ سریع"
            title="سوالات متداول"
            desc="هر سؤالی درباره خرید، ارسال، بازگشت یا پرداخت داری، اول اینجا را ببین."
          />
          <Reveal y={30}>
            <div className="rounded-3xl border border-maya-line bg-maya-parchment/50 p-6 md:p-7">
              <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-maya-ink text-maya-cream">
                <Headset className="size-5" />
              </span>
              <p className="text-lg font-black">هنوز سؤال داری؟</p>
              <p className="mt-2 text-sm leading-7 text-maya-mute">
                تیم پشتیبانی مایا همه‌روزه از ۹ صبح تا ۹ شب پاسخگوی توست؛ تلفنی، چت یا واتساپ.
              </p>
              <div className="mt-4 space-y-2 text-xs font-semibold text-maya-mute">
                <p className="flex items-center gap-2">
                  <Clock3 className="size-4 text-maya-clay" /> پاسخگویی: ۹ تا ۲۱ — حتی تعطیلات
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-maya-clay" /> ضمانت اصالت و بازگشت کالا
                </p>
              </div>
              <button
                className="maya-btn maya-btn-dark mt-6 w-full"
                onClick={() => notify("نسخه نمایشی — چت پشتیبانی به‌زودی")}
              >
                گفتگو با پشتیبانی
              </button>
            </div>
          </Reveal>
        </div>

        {/* accordions */}
        <Reveal stagger={0.09}>
          <ul className="border-t border-maya-line">
            {items.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.id} data-rv className="border-b border-maya-line">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-right"
                  >
                    <span
                      className={cn(
                        "text-base font-extrabold transition-colors duration-300 md:text-lg",
                        isOpen ? "text-maya-clay-deep" : "text-maya-ink group-hover:text-maya-clay-deep",
                      )}
                    >
                      {f.q}
                    </span>
                    <span
                      className={cn(
                        "grid size-10 flex-none place-items-center rounded-full border transition-all duration-500",
                        isOpen
                          ? "rotate-45 border-maya-clay bg-maya-clay text-maya-cream"
                          : "border-maya-line text-maya-mute group-hover:border-maya-ink group-hover:text-maya-ink",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto", transition: { duration: 0.3, ease: EASE_STANDARD } }}
                        exit={{ height: 0, transition: { duration: 0.25, ease: EASE_STANDARD } }}
                        className="overflow-hidden"
                      >
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_STANDARD } }}
                          className="max-w-2xl pb-7 pl-14 text-sm leading-8 text-maya-mute"
                        >
                          {f.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
