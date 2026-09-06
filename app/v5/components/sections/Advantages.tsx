"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeading from "../../components/ui/SectionHeading";
import Button from "../../components/ui/Button";
import Reveal, { StaggerGroup, StaggerItem } from "../../components/ui/Reveal";
import { advantages } from "../../lib/site";

/**
 * Activates the badge "orbit" animation each time a card enters the viewport,
 * mirroring an IntersectionObserver-driven pattern (threshold 0.45).
 */
function useOrbitActivation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".orbit-card"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setRadius = (card: HTMLElement) => {
      const badge = card.querySelector<HTMLElement>(".orbit-badge");
      if (!badge) return;
      const bw = parseFloat(getComputedStyle(badge).borderTopWidth) || 0;
      const r = Math.max(0, badge.getBoundingClientRect().width / 2 - bw / 2);
      card.style.setProperty("--orbit-radius", `${r}px`);
    };

    cards.forEach((card, i) => {
      setRadius(card);
      card.style.setProperty("--orbit-delay", `${(i % 4) * 90}ms`);
    });

    if (reduce) {
      cards.forEach((c) => c.classList.add("is-orbit-active"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("is-orbit-active", e.isIntersecting);
        });
      },
      { threshold: 0.45 },
    );
    cards.forEach((c) => io.observe(c));

    const onResize = () => cards.forEach(setRadius);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return ref;
}

export default function Advantages() {
  const gridRef = useOrbitActivation<HTMLDivElement>();
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="fue-saphir" className="nc:relative   nc:overflow-hidden   nc:bg-paper   nc:py-24   nc:sm:py-32">
      <div className="nc:mx-auto   nc:max-w-7xl   nc:px-5   nc:sm:px-8">
        <div className="nc:grid   nc:gap-12   nc:lg:grid-cols-12   nc:lg:gap-10">
          <div className="nc:lg:col-span-5">
            <SectionHeading
              eyebrow="فن‌آوری"
              title={"مزیت‌های اصلی\nروش *SBAR*"}
              description="نسل جدید FUE: تیغه الماسی جای فولاد را می‌گیرد تا کانال‌های ریزتر، تمیزتر و متراکم‌تری باز شود."
            />

            <Reveal delay={3} className="nc:mt-10">
              <div ref={imgRef} className="nc:relative   nc:aspect-[5/4]   nc:overflow-hidden   nc:rounded-[24px]   nc:shadow-soft">
                <motion.div style={{ y }} className="nc:absolute   nc:inset-[-10%]">
                  <Image
                    src="/v5/images/hero-detail.webp"
                    alt="تیغه الماسی و گرافت‌های مرتب روی محفظه"
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="nc:object-cover"
                  />
                </motion.div>
                <div className="frosted   nc:absolute   nc:bottom-4   nc:start-4   nc:rounded-full   nc:px-4   nc:py-2   nc:text-[12px]   nc:font-semibold   nc:ring-1   nc:ring-white/60">
                  کانال‌های ۰٫۸ تا ۱٫۲ میلی‌متری
                </div>
              </div>
            </Reveal>

            <Reveal delay={4} className="nc:mt-8">
              <Button href="/v5/diagnostic" variant="sage">
                آیا کاندید مناسبی هستم؟
              </Button>
            </Reveal>
          </div>

          <div className="nc:lg:col-span-7">
            <StaggerGroup className="nc:grid   nc:gap-4   nc:sm:grid-cols-2" amount={0.15}>
              <div ref={gridRef} className="nc:contents">
                {advantages.map((a, i) => (
                  <StaggerItem key={a.index} className={i % 2 === 1 ? "nc:sm:translate-y-10" : ""}>
                    <article
                      className={`orbit-card   nc:group   nc:relative   nc:h-full   nc:overflow-hidden   nc:rounded-[22px]   nc:p-7   nc:transition-all   nc:duration-700   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:hover:-translate-y-1  ${
                        i === 1
                          ? "orbit-card--dark nc:bg-ink nc:text-white nc:shadow-lift"
                          : "glace-blanche nc:text-ink nc:shadow-soft nc:hover:shadow-lift"
                      }`}
                    >
                      <div className="nc:flex   nc:items-start   nc:justify-between   nc:gap-4">
                        <span className={`orbit-badge  ${i === 1 ? "nc:text-white" : "nc:text-ink"}`}>{a.index}</span>
                        <span
                          className={`eyebrow   nc:mt-2  ${i === 1 ? "nc:text-sage-soft/80" : "nc:text-graphite"}`}
                        >
                          Atout
                        </span>
                      </div>
                      <h4 className="nc:mt-8   nc:text-[1.35rem]   nc:font-semibold   nc:leading-tight  ">
                        {a.title}
                      </h4>
                      <p className={`nc:mt-3   nc:text-[14.5px]   nc:leading-relaxed  ${i === 1 ? "nc:text-white/70" : "nc:text-graphite"}`}>
                        {a.text}
                      </p>
                      <span
                        className={`nc:absolute   nc:inset-x-7   nc:bottom-0   nc:h-px   nc:origin-left   nc:scale-x-0   nc:transition-transform   nc:duration-700   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:group-hover:scale-x-100  ${
                          i === 1 ? "nc:bg-sage-soft" : "nc:bg-sage"
                        }`}
                      />
                    </article>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
