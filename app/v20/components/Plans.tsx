"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { gsap } from "../lib/anim";
import { faIndex } from "../lib/fa";
import type { IranfitMonth } from "../data/types";

export default function Plans({ months }: { months: IranfitMonth[] }) {
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
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, delay: 0.12, ease: "power3.out" }
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
