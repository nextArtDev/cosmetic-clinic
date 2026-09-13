"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Sparkles } from "lucide-react";
import type { MayaHeroSlide } from "../lib/data";
import { fa, gsapSetup, scrollToTarget, EASE_EXPO } from "../lib/fx";

const AUTOPLAY = 6500;

/* the reference's banner-overlay story marquee */
const STORY =
  "داستان مایا با یک رؤیا آغاز شد: آمیزشِ سبک و ظرافت. از عشق به جزئیات تا کمال در دوخت، ما پوشاکی می‌سازیم که توانمند می‌کند و الهام می‌بخشد. همین امروز ترندهای بی‌زمان را کشف کن!";

const OVERLAY_LINKS: Array<[string, string]> = [
  ["کالکشن زنانه", "#maya-collections"],
  ["کالکشن مردانه", "#maya-stacked"],
  ["محبوب‌ترین‌ها", "#maya-bestsellers"],
];

/* ------------------------- orbit badge ------------------------- */

function OrbitBadge({ words }: { words: string[] }) {
  return (
    <div className="relative size-36 md:size-44" style={{ ["--r" as string]: "4.6rem" }}>
      <div className="maya-orbit absolute inset-0">
        {words.map((w, i) => (
          <span key={w} className="maya-orbit-item" aria-hidden={i > 0}>
            <span style={{ ["--a" as string]: `${i * 90}deg` }}>
              <i className="rounded-full border border-maya-cream/40 bg-maya-ink/30 px-3 py-1 text-[11px] font-bold text-maya-cream backdrop-blur-sm">
                {w}
              </i>
            </span>
          </span>
        ))}
      </div>
      <div className="absolute inset-[22%] grid place-items-center rounded-full border border-dashed border-maya-cream/50">
        <button
          onClick={() => scrollToTarget("#maya-collections")}
          className="group grid size-full place-items-center rounded-full"
          aria-label="دیدن کالکشن‌ها"
        >
          <Plus className="size-6 text-maya-cream transition-transform duration-500 group-hover:rotate-90" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ hero ------------------------------ */

export function Hero({ slides }: { slides: MayaHeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLElement>(null);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length),
    [slides.length],
  );

  /* autoplay */
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY);
    return () => window.clearInterval(t);
  }, [paused, slides.length]);

  /* ---- pinned banner-slider scrub (reference: `bannerSlider`) ----
     The stage is 200svh tall and the inner panel is sticky, so the
     hero pins for one viewport of scrolling; the scrub then drives
     the marquee, the slide fade and the overlay rise, exactly like
     the original's pinned timeline. */
  useLayoutEffect(() => {
    const { gsap } = gsapSetup();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
      tl.to("[data-hero-marquee]", { xPercent: -15, ease: "none" }, 0)
        .to("[data-hero-media]", { yPercent: 12, ease: "none" }, 0)
        .to("[data-hero-slide-content]", { opacity: 0.12, ease: "none" }, 0)
        .fromTo("[data-banner-overlay]", { yPercent: 100 }, { yPercent: 0, ease: "none" }, 0)
        .to("[data-hero-orbit]", { scale: 0.86, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-controls]", { opacity: 0, ease: "none" }, 0);
    }, stageRef);
    return () => ctx.revert();
  }, []);

  const slide = slides[index];

  return (
    <section
      ref={stageRef}
      className="relative bg-maya-ink text-maya-cream"
      style={{ height: "200svh" }}
      aria-label="معرفی فروشگاه مایا"
    >
      <div
        className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* stage: media + copy. The stage fills the whole hero — rather than
            giving the controls their own flex row — so the media runs behind
            the control band and the marquee overlay, like the theme's
            `d-media-fixed`. Previously the media stopped above the controls
            and left a bare strip of section background under the photo. */}
        <div className="relative h-full">
          <div data-hero-media className="absolute inset-0 will-change-transform">
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                <motion.img
                  src={slide.image}
                  alt={slide.lines.join(" ")}
                  className="size-full object-cover"
                  style={{ objectPosition: slide.position ?? "center" }}
                  initial={{ scale: 1.14 }}
                  animate={{ scale: 1.02 }}
                  transition={{ duration: AUTOPLAY / 1000 + 1, ease: "linear" }}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-maya-ink/55 via-maya-ink/20 to-maya-ink/70" />
          </div>

          <div className="maya-wrap relative z-10 flex h-full flex-col justify-end pb-32 pt-32">
            <div data-hero-slide-content className="max-w-3xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={slide.id}>
                  <motion.p
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.08 }}
                    className="mb-5 inline-flex items-center gap-3 text-xs font-bold text-maya-sand md:text-sm"
                  >
                    <i className="maya-diamond text-maya-clay" />
                    {slide.kicker}
                  </motion.p>

                  <h1 className="text-[13.5vw] leading-[1.04] font-black sm:text-6xl md:text-7xl xl:text-[5.6rem]">
                    {slide.lines.map((line, li) => (
                      <span key={li} className="maya-mask pb-1">
                        <motion.span
                          initial={{ y: "115%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "-115%", transition: { duration: 0.35, ease: EASE_EXPO } }}
                          transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.16 + li * 0.1 }}
                        >
                          {line}
                        </motion.span>
                      </span>
                    ))}
                  </h1>

                  <motion.p
                    initial={{ y: 22, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.34 }}
                    className="mt-5 max-w-md text-sm leading-7 text-maya-cream/85 md:text-base md:leading-8"
                  >
                    {slide.desc}
                  </motion.p>

                  <motion.div
                    initial={{ y: 22, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0, transition: { duration: 0.22 } }}
                    transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.44 }}
                    className="mt-8 flex flex-wrap items-center gap-3"
                  >
                    <button className="maya-btn maya-btn-cream" onClick={() => scrollToTarget("#maya-trending")}>
                      اکنون کاوش کن
                      <ArrowLeft className="size-4" />
                    </button>
                    <button
                      className="maya-btn maya-btn-ghost border-maya-creamline text-maya-cream"
                      style={{ ["--maya-btn-fill" as string]: "var(--color-maya-cream)" }}
                      onClick={() => scrollToTarget("#maya-statement")}
                      onMouseEnter={(e) => e.currentTarget.classList.add("hover:text-maya-ink")}
                    >
                      داستان ما
                    </button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* orbit badge — desktop corner (offset clears the control band) */}
          <div data-hero-orbit className="absolute bottom-[132px] left-10 z-10 hidden lg:block xl:left-16">
            <OrbitBadge words={["ظرافت", "سبک", "تجمل", "همیشگی"]} />
          </div>

          {/* scroll hint */}
          <div className="pointer-events-none absolute bottom-[94px] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
            <span className="text-[10px] font-bold text-maya-cream/60">اسکرول کنید</span>
            <span className="relative block h-10 w-px overflow-hidden bg-maya-cream/25">
              <span className="absolute inset-x-0 h-full animate-[maya-scrollhint_1.8s_ease-in-out_infinite] bg-maya-cream" />
            </span>
          </div>
        </div>

        {/* controls row — absolutely placed so the media runs behind it */}
        <div data-hero-controls className="absolute inset-x-0 bottom-0 z-10 pb-6">
          <div className="maya-wrap flex items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-end gap-1 text-sm font-black tabular-nums">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={index}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_EXPO }}
                    className="text-3xl"
                  >
                    {fa(String(index + 1).padStart(2, "0"))}
                  </motion.span>
                </AnimatePresence>
                <span className="pb-1 text-maya-cream/60">/ {fa(String(slides.length).padStart(2, "0"))}</span>
              </div>
              <div className="hidden h-px w-28 self-center overflow-hidden rounded-full bg-maya-cream/25 sm:block">
                <motion.div
                  key={`${index}-${paused}`}
                  className="h-full origin-right bg-maya-cream"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused ? 0 : 1 }}
                  transition={{ duration: AUTOPLAY / 1000, ease: "linear" }}
                />
              </div>
            </div>

            <div className="hidden items-center gap-8 text-sm font-bold md:flex">
              {[
                ["کالکشن زنانه", "#maya-collections"],
                ["استایل اسپرت", "#maya-bestsellers"],
                ["پرفروش‌ترین‌ها", "#maya-trending"],
              ].map(([label, target]) => (
                <button key={label} onClick={() => scrollToTarget(target)} className="maya-linkline text-maya-cream/90">
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="اسلاید قبلی"
                className="grid size-11 place-items-center rounded-full border border-maya-cream/35 text-maya-cream transition-all hover:bg-maya-cream hover:text-maya-ink active:scale-90"
              >
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="اسلاید بعدی"
                className="grid size-11 place-items-center rounded-full border border-maya-cream/35 text-maya-cream transition-all hover:bg-maya-cream hover:text-maya-ink active:scale-90"
              >
                <ArrowLeft className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* banner overlay — the reference's story marquee + icon links */}
        <div data-banner-overlay className="maya-banner-overlay relative z-20 will-change-transform">
          <div className="maya-banner-overlay-marquee">
            <div data-hero-marquee className="maya-banner-overlay-track will-change-transform">
              {[0, 1].map((dup) => (
                <span key={dup} aria-hidden={dup === 1}>
                  {STORY}
                  <i className="maya-diamond scale-150 text-maya-clay" />
                </span>
              ))}
            </div>
          </div>
          <div className="maya-banner-icons">
            {OVERLAY_LINKS.map(([label, target], i) => (
              <button key={label} onClick={() => scrollToTarget(target)} className="maya-banner-icon">
                <Sparkles className="size-3.5 text-maya-clay" />
                {label}
                {i === 0 ? <span className="sr-only">— نخستین کالکشن</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
