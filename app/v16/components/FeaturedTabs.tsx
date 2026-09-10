"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import type { MayaFeaturedTab, MayaProduct } from "../lib/data";
import { cn, EASE_EXPO } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { Reveal, SectionHead } from "./bits";

type Tab = MayaFeaturedTab & { products: MayaProduct[] };
const DURATION = 7000;

export function FeaturedTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState("");
  const touch = useRef(0);
  const { setQuickView } = useStore();

  const select = useCallback((i: number) => {
    setActive(i);
    touch.current = Date.now(); // reset autoplay clock
  }, []);

  /* autoplay — the clock resets whenever the timer (re)starts, and each
     auto-advance restarts it too, so tabs change exactly every DURATION */
  useEffect(() => {
    if (paused) return;
    touch.current = Date.now(); // start a fresh countdown on mount/resume
    const t = window.setInterval(() => {
      if (Date.now() - touch.current >= DURATION - 200) {
        touch.current = Date.now();
        setActive((a) => (a + 1) % tabs.length);
      }
    }, 400);
    return () => window.clearInterval(t);
  }, [paused, tabs.length]);

  /* typewriter */
  useEffect(() => {
    const full = tabs[active].typed;
    setTyped(""); // eslint-disable-line react-hooks/set-state-in-effect -- restart typewriter when the active tab changes
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(t);
    }, 65);
    return () => window.clearInterval(t);
  }, [active, tabs]);

  const tab = tabs[active];

  return (
    <section
      className="bg-maya-parchment/60 py-20 md:py-28"
      aria-label="کالکشن‌های منتخب"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="maya-wrap">
        <SectionHead
          center
          kicker="کالکشن‌های منتخب"
          title="استایلی که تا کمال خلق شده"
          desc="مدی که با هر حال‌وهوایی جور می‌شود! از ضروری‌های روزمره تا ترندهای شاخص؛ برای هر موقعیت، یک استایل کامل."
        />

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* tab list */}
          <Reveal stagger={0.1} className="order-2 lg:order-1">
            {tabs.map((t, i) => {
              const isActive = i === active;
              return (
                <div key={t.id} data-rv className="border-b border-maya-line first:border-t">
                  <button
                    onClick={() => select(i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-right md:py-8"
                    aria-expanded={isActive}
                  >
                    <span className="flex items-baseline gap-4">
                      <span
                        className={cn(
                          "text-xs font-black transition-colors",
                          isActive ? "text-maya-clay" : "text-maya-fog",
                        )}
                      >
                        {String(i + 1).padStart(2, "0").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])}
                      </span>
                      <span
                        className={cn(
                          "text-xl font-black transition-all duration-500 md:text-3xl",
                          isActive ? "translate-x-0 text-maya-ink" : "translate-x-1 text-maya-ink/35 group-hover:text-maya-ink/70",
                        )}
                      >
                        {t.heading}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-10 flex-none place-items-center rounded-full border transition-all duration-500",
                        isActive
                          ? "rotate-180 border-maya-ink bg-maya-ink text-maya-cream"
                          : "border-maya-line text-maya-mute group-hover:border-maya-ink group-hover:text-maya-ink",
                      )}
                    >
                      <ArrowLeft className="size-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE_EXPO }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pb-8 pl-12">
                          {t.paragraphs.map((p) => (
                            <p key={p.slice(0, 16)} className="text-sm leading-8 text-maya-mute">
                              {p}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* progress */}
                  {isActive && (
                    <motion.div
                      key={`bar-${active}-${paused}`}
                      className="h-0.5 origin-right bg-maya-clay"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: paused ? 0 : 1 }}
                      transition={{ duration: DURATION / 1000, ease: "linear" }}
                    />
                  )}
                </div>
              );
            })}

            {/* typewriter line */}
            <div data-rv className="mt-8 flex items-center gap-3 text-lg font-black text-maya-clay md:text-2xl">
              <span className="min-h-8">
                {typed}
                <i className="maya-caret" />
              </span>
            </div>
          </Reveal>

          {/* visual panel */}
          <Reveal y={60} className="order-1 lg:order-2">
            <div className="relative">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] bg-maya-sand">
                <AnimatePresence initial={false}>
                  <motion.img
                    key={tab.id}
                    src={tab.image}
                    alt={tab.heading}
                    initial={{ opacity: 0, scale: 1.08, clipPath: "inset(0 0 100% 0)" }}
                    animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE_EXPO }}
                    className="absolute inset-0 size-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-maya-ink/45 to-transparent" />
                <p className="absolute bottom-5 right-6 left-6 text-maya-cream">
                  <span className="text-xs font-bold opacity-80">کالکشن</span>
                  <span className="mt-1 block text-xl font-black">{tab.heading}</span>
                </p>
              </div>

              {/* product thumbs */}
              <div className="absolute -bottom-6 right-4 left-4 flex justify-center gap-3 md:right-8 md:left-auto md:justify-end">
                <AnimatePresence mode="popLayout" initial={false}>
                  {tab.products.map((p, i) => (
                    <motion.button
                      key={`${tab.id}-${p.id}`}
                      layout
                      initial={{ y: 34, opacity: 0, rotate: 4 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.55, ease: EASE_EXPO, delay: 0.15 + i * 0.09 }}
                      onClick={() => setQuickView(p)}
                      className="group relative w-24 overflow-hidden rounded-2xl border-2 border-maya-cream bg-maya-cream shadow-lg transition-transform hover:-translate-y-1.5 md:w-28"
                      aria-label={`مشاهده ${p.title}`}
                    >
                      <div className="aspect-[3/3.6] w-full overflow-hidden">
                        <img src={p.image} alt={p.title} loading="lazy" className="size-full object-cover" />
                      </div>
                      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-maya-cream/92 px-2.5 py-1.5 backdrop-blur-sm">
                        <PriceTag price={p.price} className="text-[10px]" />
                        <Plus className="size-3 flex-none text-maya-clay" />
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
