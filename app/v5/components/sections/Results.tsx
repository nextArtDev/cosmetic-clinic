"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import SectionHeading from "../../components/ui/SectionHeading";
import CompareSlider from "../../components/ui/CompareSlider";
import Button from "../../components/ui/Button";
import Reveal, { StaggerGroup, StaggerItem } from "../../components/ui/Reveal";
import { resultCases, resultPoints } from "../../lib/site";

export default function Results() {
  const autoplay = useMemo(
    () => Autoplay({ delay: 4200, stopOnInteraction: false, stopOnMouseEnter: true }),
    [],
  );
  const [emblaRef, embla] = useEmblaCarousel(
    { align: "start", loop: true, skipSnaps: false, dragFree: false },
    [autoplay],
  );
  const [selected, setSelected] = useState(0);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  const onScroll = useCallback(() => {
    if (!embla) return;
    setProgress(Math.max(0, Math.min(1, embla.scrollProgress())));
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    embla.on("scroll", onScroll);
    embla.on("reInit", onSelect);
    const init = window.setTimeout(() => {
      setCount(embla.scrollSnapList().length);
      onSelect();
      onScroll();
    }, 0);
    return () => {
      window.clearTimeout(init);
      embla.off("select", onSelect);
      embla.off("scroll", onScroll);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect, onScroll]);

  return (
    <section id="resultats" className="nc:relative   nc:overflow-hidden   nc:bg-ink   nc:py-24   nc:text-white   nc:sm:py-32">
      <div className="grain   nc:absolute   nc:inset-0" />
      {/* Ambient glow — velvet-breath ported from novacapillaire.fr */}
      <div className="v5-velvet-blob   nc:pointer-events-none   nc:absolute   nc:-end-32   nc:top-20   nc:size-[560px]   nc:rounded-full   nc:bg-sage/30   nc:blur-[160px]" />

      <div className="nc:relative   nc:mx-auto   nc:max-w-7xl   nc:px-5   nc:sm:px-8">
        <div className="nc:grid   nc:gap-14   nc:lg:grid-cols-12   nc:lg:gap-10">
          <div className="nc:lg:col-span-6">
            <SectionHeading
              dark
              eyebrow="قبل و بعد"
              title={"نتیجه‌ای طبیعی،\nاز *همه زاویه‌ها*"}
              description="آنچه دیده نمی‌شود، دقیقاً مهم‌ترین بخش است: خط رویشی که به چشم نمی‌آید، تراکمی که با نور می‌گیرد و کاشتی که با گذر زمان می‌ماند."
            />

            <StaggerGroup className="nc:mt-12   nc:grid   nc:gap-x-8   nc:gap-y-8   nc:sm:grid-cols-2">
              {resultPoints.map((p) => (
                <StaggerItem key={p.index}>
                  <div className="nc:group   nc:border-t   nc:border-white/12   nc:pt-5">
                    <p className="nc:flex   nc:items-center   nc:gap-3   nc:text-[12px]   nc:font-bold     nc:text-sage-soft">
                      {p.index}
                      <span className="nc:h-px   nc:w-6   nc:bg-sage-soft/40   nc:transition-all   nc:duration-700   nc:group-hover:w-12   nc:group-hover:bg-sage-soft" />
                    </p>
                    <h4 className="nc:mt-3   nc:text-[1.15rem]   nc:font-semibold  ">{p.title}</h4>
                    <p className="nc:mt-2   nc:text-[14px]   nc:leading-relaxed   nc:text-white/60">{p.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          <Reveal delay={2} className="nc:lg:col-span-6">
            <CompareSlider
              before="/v5/images/before.webp"
              after="/v5/images/after.webp"
              beforeAlt="تاج کم‌پشت قبل از کاشت"
              afterAlt="تاج پرپشت دوازده ماه پس از کاشت"
              className="nc:aspect-square   nc:shadow-lift   nc:ring-1   nc:ring-white/10   nc:lg:aspect-[4/4.4]"
            />
            <p className="nc:mt-4   nc:text-[12.5px]   nc:text-white/45">
              تصاویر نمونه، در شرایط عکس‌برداری استاندارد. نتیجه در هر فرد متفاوت است.
            </p>
          </Reveal>
        </div>

        {/* Carousel */}
        <div className="nc:mt-24">
          <div className="nc:mb-8   nc:flex   nc:flex-wrap   nc:items-end   nc:justify-between   nc:gap-6">
            <div>
              <p className="eyebrow   dot-white   nc:text-sage-soft">گالری نمونه‌ها</p>
              <h3 className="letterpress-light   nc:mt-3   nc:text-[clamp(1.6rem,3vw,2.3rem)]   nc:font-semibold  ">
                خط رویش، تاج سر، شقیقه: پنج پرونده مستند
              </h3>
            </div>

            <div className="nc:flex   nc:items-center   nc:gap-3">
              <span className="nc:text-sm   nc:tabular-nums   nc:text-white/60">
                {String(selected + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <div className="nc:flex   nc:gap-2">
                <button
                  type="button"
                  onClick={() => embla?.scrollPrev()}
                  aria-label="نمونه قبلی"
                  className="nc:group   nc:grid   nc:size-12   nc:place-items-center   nc:rounded-full   nc:border   nc:border-white/20   nc:transition-all   nc:duration-300   nc:hover:border-white   nc:hover:bg-white   nc:hover:text-ink   nc:active:scale-95"
                >
                  <ArrowRight className="nc:size-4   nc:transition-transform   nc:duration-300   nc:group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => embla?.scrollNext()}
                  aria-label="نمونه بعدی"
                  className="nc:group   nc:grid   nc:size-12   nc:place-items-center   nc:rounded-full   nc:border   nc:border-white/20   nc:transition-all   nc:duration-300   nc:hover:border-white   nc:hover:bg-white   nc:hover:text-ink   nc:active:scale-95"
                >
                  <ArrowLeft className="nc:size-4   nc:transition-transform   nc:duration-300   nc:group-hover:-translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="nc:overflow-hidden" ref={emblaRef}>
            <div className="nc:-ms-4   nc:flex   nc:touch-pan-y">
              {resultCases.map((c, i) => {
                const active = i === selected;
                return (
                  <div key={c.id} className="nc:min-w-0   nc:flex-[0_0_78%]   nc:ps-4   nc:sm:flex-[0_0_46%]   nc:lg:flex-[0_0_30%]">
                    <motion.figure
                      animate={{ scale: active ? 1 : 0.96, opacity: active ? 1 : 0.7 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="nc:group   nc:relative   nc:aspect-[4/5]   nc:overflow-hidden   nc:rounded-[22px]   nc:bg-ink-soft"
                    >
                      <Image
                        src={c.image}
                        alt={c.alt}
                        fill
                        sizes="(min-width:1024px) 30vw, (min-width:640px) 46vw, 78vw"
                        className="nc:object-cover   nc:transition-transform   nc:duration-[1.6s]   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:group-hover:scale-105"
                      />
                      <div className="nc:absolute   nc:inset-0   nc:bg-gradient-to-t   nc:from-ink/85   nc:via-ink/10   nc:to-transparent" />
                      <figcaption className="nc:absolute   nc:inset-x-0   nc:bottom-0   nc:p-5">
                        <p className="nc:text-[11px]   nc:font-bold   nc:normal-case     nc:text-sage-soft">
                          {c.grafts} · {c.months}
                        </p>
                        <p className="nc:mt-1.5   nc:text-[15px]   nc:font-semibold   nc:leading-snug">{c.title}</p>
                      </figcaption>
                    </motion.figure>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="nc:mt-8   nc:flex   nc:items-center   nc:gap-6">
            <div className="nc:relative   nc:h-px   nc:flex-1   nc:bg-white/15">
              <motion.span
                className="nc:absolute   nc:inset-y-[-1px]   nc:start-0   nc:w-1/5   nc:rounded-full   nc:bg-sage-soft"
                animate={{ left: `${progress * 80}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
            <Button href="/v5/#profils" variant="dark" size="sm">
              مشاهده پروفایل‌ها
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
