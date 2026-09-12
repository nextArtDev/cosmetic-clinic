"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import type { MayaFeaturedTab, MayaProduct } from "../lib/data";
import { cn, EASE_EXPO, gsapSetup } from "../lib/fx";
import { useStore, PriceTag } from "./Store";
import { SectionHead } from "./bits";
import { SplitText } from "./Motion";

type Tab = MayaFeaturedTab & { products: MayaProduct[] };
const DURATION = 7000;

export function FeaturedTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState("");
  const touch = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
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

  /* ------------------------------------------------------------------
     Port of the theme's featuredCollectionsList().
     The original pins the section for 150% of scroll and, across that
     pin: slides the hero image in from xPercent −100 / scale .7, grows
     the description rail to full width, sweeps a thin rule 0 → 1 → 0,
     and reveals the active heading's characters with rotationX 90.
     ------------------------------------------------------------------ */
  useLayoutEffect(() => {
    const { gsap, ScrollTrigger } = gsapSetup();
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const image = stage.querySelector<HTMLElement>("[data-ft-image]");
      const fill = stage.querySelector<HTMLElement>("[data-ft-fill]");
      const desc = stage.querySelector<HTMLElement>("[data-ft-desc-inner]");
      const section = stage.closest("section");

      const chars = () => stage.querySelectorAll<HTMLElement>(".maya-ft-char");
      const revealChars = () => {
        const c = chars();
        if (c.length) gsap.from(c, { duration: 0.8, opacity: 0, stagger: 0.02, rotationX: 90, ease: "expo.out" });
      };

      if (image) gsap.set(image, { xPercent: -100, scale: 0.7 });
      if (fill) gsap.set(fill, { scaleX: 0 });
      if (desc) gsap.set(desc, { width: "0%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: () => section?.classList.add("maya-ft-pinned"),
          onLeaveBack: () => section?.classList.remove("maya-ft-pinned"),
        },
      });

      if (image) {
        tl.to(image, {
          xPercent: 0,
          scale: 1,
          ease: "none",
          onStart: () => {
            section?.classList.add("maya-ft-pinned");
            revealChars();
          },
          onReverseComplete: () => section?.classList.remove("maya-ft-pinned"),
        });
      }
      if (desc) tl.to(desc, { width: "100%", ease: "none" }, "<");
      if (fill) tl.to(fill, { scaleX: 1, ease: "none" }, "<").to(fill, { scaleX: 0, ease: "none" });

      /* re-run the char reveal whenever the user switches tabs */
      const onClick = () => {
        const c = chars();
        if (c.length) gsap.fromTo(c, { opacity: 0, rotationX: 90 }, { duration: 0.8, opacity: 1, rotationX: 0, stagger: 0.02, ease: "expo.out" });
      };
      stage.querySelectorAll("[data-ft-tab]").forEach((b) => b.addEventListener("click", onClick));

      ScrollTrigger.refresh();
      return () => stage.querySelectorAll("[data-ft-tab]").forEach((b) => b.removeEventListener("click", onClick));
    }, stageRef);

    return () => ctx.revert();
  }, [tabs.length]);

  const tab = tabs[active];

  return (
    <section
      className="bg-maya-parchment/60"
      aria-label="کالکشن‌های منتخب"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="maya-wrap pt-20 pb-10 md:pt-28">
        <SectionHead
          center
          kicker="کالکشن‌های منتخب"
          title="استایلی که تا کمال خلق شده"
          desc="مدی که با هر حال‌وهوایی جور می‌شود! از ضروری‌های روزمره تا ترندهای شاخص؛ برای هر موقعیت، یک استایل کامل."
        />
      </div>

      {/* pinned stage — the tab experience holds for 150% of scroll */}
      <div ref={stageRef} className="relative" style={{ height: "250svh" }}>
        <div className="maya-ft-panel flex h-[100svh] items-center overflow-hidden">
          <div className="maya-wrap w-full">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* tab list */}
              <div className="order-2 lg:order-1">
                {tabs.map((t, i) => {
                  const isActive = i === active;
                  return (
                    <div key={t.id} data-ft-row className="border-b border-maya-line first:border-t">
                      <button
                        data-ft-tab
                        onClick={() => select(i)}
                        className="group flex w-full items-center justify-between gap-6 py-5 text-right md:py-7"
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
                              "maya-ft-pill inline-flex px-4 py-1.5 text-xl font-black transition-all duration-500 md:text-3xl",
                              isActive ? "text-maya-ink" : "text-maya-ink/35 group-hover:text-maya-ink/70",
                            )}
                            data-active={isActive}
                          >
                            {isActive ? (
                              <SplitText text={t.heading} by="chars" itemClassName="maya-ft-char" />
                            ) : (
                              t.heading
                            )}
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
                            <div className="space-y-3 pb-6 pl-12">
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
                <div className="mt-6 flex items-center gap-3 text-lg font-black text-maya-clay md:text-2xl">
                  <span className="min-h-8">
                    {typed}
                    <i className="maya-caret" />
                  </span>
                </div>

                {/* thin rule the engine sweeps 0 → 1 → 0 across the pin */}
                <div className="mt-5 h-px w-full bg-maya-line">
                  <div data-ft-fill className="maya-ft-fill h-px w-full bg-maya-ink" />
                </div>
              </div>

              {/* visual panel */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div
                    data-ft-image
                    className="maya-ft-image relative aspect-[4/4.2] overflow-hidden rounded-[2rem] bg-maya-sand"
                  >
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
                    <p data-ft-front className="absolute bottom-5 right-6 left-6 text-maya-cream">
                      <span className="text-xs font-bold opacity-80">کالکشن</span>
                      <span className="mt-1 block text-xl font-black">{tab.heading}</span>
                    </p>
                  </div>

                  {/* description rail — grows to full width during the pin */}
                  <div data-ft-desc className="mt-4 overflow-hidden">
                    <div
                      data-ft-desc-inner
                      className="maya-ft-desc-inner whitespace-nowrap rounded-full border border-maya-line bg-maya-cream/70 px-4 py-2 text-[11px] font-bold text-maya-mute"
                    >
                      {tab.typed}
                    </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
