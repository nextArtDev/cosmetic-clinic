"use client";

import { useRef, useState } from "react";
import { ChevronDown, Clock, Lock, Play } from "lucide-react";
import { gsap } from "../lib/anim";
import { faIndex } from "../lib/fa";
import type { IranfitMonth } from "../data/types";

/**
 * "۰۲ — برنامه تمرینی": the 8-month accordion.
 *
 * The original site paired its month list with a video carousel whose cards
 * showed a locked preview and a "SIGNUP TO WATCH" button. Each panel here now
 * carries the same idea: a poster card with a play disc that routes the visitor
 * into the onboarding quiz instead of the video.
 */
export default function Plans({
  months,
  onSignup,
}: {
  months: IranfitMonth[];
  onSignup: () => void;
}) {
  const [openIdx, setOpenIdx] = useState<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  const toggle = (i: number) => {
    const root = listRef.current;
    if (!root) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>(".if-plan-panel"));
    const next = openIdx === i ? -1 : i;

    panels.forEach((panel, idx) => {
      const inner = panel.firstElementChild as HTMLElement | null;
      if (!inner) return;
      if (idx === next) {
        gsap.to(panel, {
          height: () => inner.offsetHeight,
          duration: 0.65,
          ease: "power3.inOut",
          onComplete: () => gsap.set(panel, { height: "auto" }),
        });
        gsap.fromTo(
          inner.children,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, delay: 0.12, ease: "power3.out" },
        );
      } else if (gsap.getProperty(panel, "height") !== 0) {
        gsap.to(panel, { height: 0, duration: 0.55, ease: "power3.inOut" });
      }
    });

    setOpenIdx(next);
  };

  return (
    <section id="program" data-if-spy="۲" className="if-section">
      <span className="if-ghost" data-if-parallax>
        ۰۲
      </span>
      <div className="if-container">
        <p className="if-kicker" data-if-reveal>
          ۰۲ · برنامه تمرینی
        </p>
        <h2 className="if-title" data-if-reveal data-if-delay="0.08">
          دیگر هیچ‌وقت از تمرین
          <br />
          <em>خسته نمی‌شوی</em>
        </h2>
        <p className="if-lead" data-if-reveal data-if-delay="0.16">
          هیچ دو جلسه‌ای شبیه هم نیست. برنامه بر اساس فرم بدن، هدف و امکاناتی
          که داری ساخته می‌شود و هر ماه یک فصل تازه از پیشرفت است.
        </p>

        <div className="if-plans-list" ref={listRef} data-if-reveal data-if-delay="0.2">
          {months.map((m, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={m.title} className={`if-plan-item ${isOpen ? "is-open" : ""}`}>
                <button
                  className="if-plan-head"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                >
                  <span className="if-plan-idx">{faIndex(i + 1)}</span>
                  <span className="if-plan-title">
                    {m.title}
                    <small>{m.subtitle}</small>
                  </span>
                  <span className="if-plan-badge">
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div
                  className="if-plan-panel"
                  style={i === 0 ? { height: "auto" } : undefined}
                >
                  <div className="if-plan-body">
                    <button
                      type="button"
                      className="if-plan-media"
                      onClick={onSignup}
                      aria-label={`ثبت‌نام برای تماشای ${m.title}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.poster} alt="" loading="lazy" />
                      <span className="if-plan-media-veil" aria-hidden />
                      <span className="if-plan-media-play" aria-hidden>
                        <Play size={18} fill="currentColor" strokeWidth={0} />
                      </span>
                      <span className="if-plan-media-gate">
                        <Lock size={12} />
                        ثبت‌نام برای تماشا
                      </span>
                      <span className="if-plan-media-meta">
                        <Clock size={12} />
                        {m.meta}
                      </span>
                    </button>

                    <div className="if-plan-copy">
                      <p>{m.description}</p>
                      <div className="if-plan-weeks">
                        {m.weeks.map((w) => (
                          <span key={w} className="if-week-chip">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
