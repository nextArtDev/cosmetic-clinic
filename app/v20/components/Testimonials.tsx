"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, TrendingDown } from "lucide-react";
import { gsap } from "../lib/anim";
import { toFaDigits } from "../lib/fa";
import type { IranfitTestimonial } from "../data/types";

const DURATION = 6.4;

export default function Testimonials({ items }: { items: IranfitTestimonial[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const dragX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      const n = items.length;
      setIdx(((next % n) + n) % n);
    },
    [items.length],
  );

  /* autoplay driven by GSAP so the progress bar and the advance stay in sync */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tw = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: DURATION,
        ease: "none",
        paused: reduced || paused,
        onComplete: () => go(idx + 1),
      },
    );
    tweenRef.current = tw;
    return () => {
      tw.kill();
      tweenRef.current = null;
    };
    // `paused` intentionally omitted: toggling it must not restart the bar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, go]);

  useEffect(() => {
    const tw = tweenRef.current;
    if (!tw) return;
    if (paused) tw.pause();
    else tw.resume();
  }, [paused]);

  /* slide animation — translateX is direction-safe in RTL */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    gsap.to(track, { xPercent: idx * 100, duration: 0.85, ease: "power3.inOut" });
  }, [idx]);

  return (
    <section id="stories" data-if-spy="۹" className="if-section if-stories">
      <span className="if-stories-quote" aria-hidden>
        «
      </span>
      <div className="if-container">
        <p className="if-kicker" data-if-reveal>
          ۰۹ · داستان قهرمانان ما
        </p>
        <h2 className="if-title" data-if-reveal data-if-delay="0.08">
          جاده ترسناک نیست؛
          <br />
          <em>سفر تو زیباست</em>
        </h2>
        <p className="if-lead" data-if-reveal data-if-delay="0.16">
          آدم‌های واقعی، شهرهای واقعی، نتایج واقعی. این‌ها فقط چند تا از
          هزاران داستانی است که اعضای ایرون‌فیت برایمان نوشته‌اند.
        </p>

        <div
          className="if-slider"
          data-if-reveal
          data-if-delay="0.2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            className="if-slider-viewport"
            onTouchStart={(e) => {
              dragX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (dragX.current === null) return;
              const dx = e.changedTouches[0].clientX - dragX.current;
              if (Math.abs(dx) > 46) go(dx > 0 ? idx - 1 : idx + 1);
              dragX.current = null;
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") go(idx + 1);
              else if (e.key === "ArrowRight") go(idx - 1);
            }}
            tabIndex={0}
            aria-roledescription="کاروسل"
            aria-label="نظرات اعضا"
          >
            <div className="if-slider-track" ref={trackRef}>
              {items.map((t) => (
                <article key={t.name} className="if-story">
                  <div className="if-story-side">
                    <span className="if-avatar">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.avatar} alt="" loading="lazy" />
                    </span>
                    <span className="if-stars" aria-label={`${toFaDigits(t.rating)} ستاره`}>
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} size={15} fill="currentColor" strokeWidth={0} />
                      ))}
                    </span>
                    <span className="if-story-stat">
                      <TrendingDown size={13} />
                      {t.result}
                    </span>
                  </div>
                  <div>
                    <p className="if-story-text">{t.quote}</p>
                    <div className="if-story-who">
                      <div>
                        <b>{t.name}</b>
                        <span>{t.city}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="if-slider-progress" aria-hidden>
            <span ref={barRef} />
          </div>

          <div className="if-slider-ctl">
            <div className="if-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`if-dot ${idx === i ? "is-on" : ""}`}
                  aria-label={`نظر شماره ${toFaDigits(i + 1)}`}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <div className="if-slider-btns">
              <button type="button" className="if-arrow" aria-label="قبلی" onClick={() => go(idx - 1)}>
                <ArrowRight size={19} />
              </button>
              <button type="button" className="if-arrow" aria-label="بعدی" onClick={() => go(idx + 1)}>
                <ArrowLeft size={19} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
