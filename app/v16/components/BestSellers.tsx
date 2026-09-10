"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";
import type { MayaBestSeller } from "../lib/data";
import { cn, fa, faGroup, gsapSetup } from "../lib/fx";
import { useStore } from "./Store";
import { SectionHead } from "./bits";

export function BestSellers({ items }: { items: MayaBestSeller[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [fine, setFine] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { notify } = useStore();

  useLayoutEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches); // eslint-disable-line react-hooks/set-state-in-effect -- one-time pointer-capability sync
  }, []);

  /* row entrances */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-bs-row]", sectionRef.current!).forEach((row, i) => {
        gsap.fromTo(
          row.querySelector("[data-bs-inner]"),
          { y: 60, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.07,
            scrollTrigger: { trigger: row, start: "top 88%", once: true },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* cursor-follow preview — attaches once the pointer is fine and the
     preview element is actually rendered (ref is null before that) */
  useLayoutEffect(() => {
    if (!fine) return;
    const { gsap } = gsapSetup();
    const preview = previewRef.current;
    const el = sectionRef.current;
    if (!preview || !el) return;
    const xTo = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo(e.clientX - r.left - 110);
      yTo(e.clientY - r.top - 150);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [fine]);

  return (
    <section
      id="maya-bestsellers"
      ref={sectionRef}
      className="relative py-20 md:py-28"
      aria-label="پرفروش‌ترین‌ها"
      onMouseLeave={() => setHovered(null)}
    >
      {/* floating preview */}
      {fine && (
        <div
          ref={previewRef}
          className="pointer-events-none absolute top-0 left-0 z-20 hidden w-56 lg:block"
          aria-hidden
        >
          <AnimatePresence mode="popLayout">
            {hovered !== null && (
              <motion.div
                key={hovered}
                initial={{ opacity: 0, scale: 0.82, rotate: hovered % 2 ? 5 : -5 }}
                animate={{ opacity: 1, scale: 1, rotate: hovered % 2 ? 3 : -3 }}
                exit={{ opacity: 0, scale: 0.85, rotate: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl shadow-2xl"
              >
                <div className="aspect-[3/3.8] w-full overflow-hidden bg-maya-parchment">
                  <img src={items[hovered].image} alt="" className="size-full object-cover" />
                </div>
                <div className="flex items-center justify-between bg-maya-ink px-4 py-2.5 text-maya-cream">
                  <span className="text-[11px] font-bold">{items[hovered].note}</span>
                  <span className="text-[10px] opacity-70">مشاهده</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="maya-wrap">
        <SectionHead
          kicker="در یک نگاه"
          title="پرفروش‌ترین‌های فصل"
          desc="پنج آیتمی که بیشتر از همه در سبد خرید مشتریان مایا تکرار شده‌اند."
        />

        <ul className="border-t border-maya-line">
          {items.map((item, i) => (
            <li key={item.id} data-bs-row className="border-b border-maya-line">
              <div data-bs-inner>
                <button
                  onClick={() => notify(`نسخه نمایشی — صفحه «${item.title}» به‌زودی`)}
                  onMouseEnter={() => setHovered(i)}
                  className={cn(
                    "group flex w-full items-center gap-5 py-6 text-right transition-colors duration-300 md:gap-10 md:py-8",
                    hovered !== null && hovered !== i && "opacity-40",
                  )}
                >
                  {/* index */}
                  <span
                    className={cn(
                      "w-10 flex-none text-sm font-black transition-colors md:text-base",
                      hovered === i ? "text-maya-clay" : "text-maya-fog",
                    )}
                  >
                    {fa(String(i + 1).padStart(2, "0"))}
                  </span>

                  {/* mobile thumb */}
                  <span className="size-14 flex-none overflow-hidden rounded-xl lg:hidden">
                    <img src={item.image} alt="" className="size-full object-cover" />
                  </span>

                  {/* rolling title */}
                  <span className="maya-roll-parent min-w-0 flex-1">
                    <span className="maya-roll text-xl font-black sm:text-2xl md:text-4xl lg:text-[2.75rem]">
                      <span>{item.title}</span>
                      <span aria-hidden>{item.title}</span>
                    </span>
                  </span>

                  {/* price + arrow */}
                  <span className="flex flex-none items-center gap-4 md:gap-8">
                    <span className="text-left leading-tight">
                      <span className="block text-sm font-black md:text-lg">{faGroup(item.price)}</span>
                      <span className="block text-[10px] font-semibold text-maya-mute">تومان</span>
                    </span>
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full border transition-all duration-400 md:size-12",
                        hovered === i
                          ? "rotate-0 border-maya-ink bg-maya-ink text-maya-cream"
                          : "-rotate-45 border-maya-line text-maya-mute",
                      )}
                    >
                      <ArrowUpLeft className="size-4" />
                    </span>
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
