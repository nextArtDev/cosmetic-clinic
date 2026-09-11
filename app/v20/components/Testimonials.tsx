"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, TrendingDown } from "lucide-react";
import { gsap } from "../lib/anim";
import { toFaDigits } from "../lib/fa";
import type { IranfitTestimonial } from "../data/types";

export default function Testimonials({ items }: { items: IranfitTestimonial[] }) {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      const n = items.length;
      setIdx(((next % n) + n) % n);
    },
    [items.length]
  );

  /* autoplay */
  useEffect(() => {
    timerRef.current = window.setInterval(() => go(idx + 1), 6200);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [idx, go]);

  /* slide animation — translateX is direction-safe in RTL */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    gsap.to(track, { xPercent: idx * 100, duration: 0.85, ease: "power3.inOut" });
  }, [idx]);

  return (
    <section id="stories" data-if-spy="۶" className="if-section if-stories">
      <span className="if-stories-quote" aria-hidden>
        «
      </span>
      <div className="if-container">
        <p className="if-kicker" data-if-reveal>
          ۰۶ · داستان قهرمانان ما
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

        <div className="if-slider" data-if-reveal data-if-delay="0.2">
          <div className="if-slider-viewport">
            <div className="if-slider-track" ref={trackRef}>
              {items.map((t) => (
                <article key={t.name} className="if-story">
                  <div style={{ display: "grid", gap: "0.8rem", justifyItems: "start" }}>
                    <span className="if-avatar">{t.name.charAt(0)}</span>
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

          <div className="if-slider-ctl">
            <div className="if-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  className={`if-dot ${idx === i ? "is-on" : ""}`}
                  aria-label={`نظر شماره ${toFaDigits(i + 1)}`}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <div className="if-slider-btns">
              <button className="if-arrow" aria-label="قبلی" onClick={() => go(idx - 1)}>
                <ArrowRight size={19} />
              </button>
              <button className="if-arrow" aria-label="بعدی" onClick={() => go(idx + 1)}>
                <ArrowLeft size={19} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
