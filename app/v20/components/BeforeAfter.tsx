"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, MoveHorizontal, Quote } from "lucide-react";
import { gsap } from "../lib/anim";
import ScrollCue from "./ScrollCue";
import { faIndex, toFaDigits } from "../lib/fa";
import type { IranfitBeforeAfter } from "../data/types";

const MIN = 6;
const MAX = 94;
const START = 50;

/**
 * "قبل و بعد" — drag-to-compare slider.
 *
 * Mirrors the original site's `section_beforeafter` / `ba-slider`: a photo with
 * a draggable divider that reveals the "before" treatment against the "after"
 * photo, a set of dots to switch between clients, and a text column with the
 * client name + result. Position is written straight to a CSS custom property
 * so dragging never triggers a React re-render.
 */
export default function BeforeAfter({ items }: { items: IranfitBeforeAfter[] }) {
  const [idx, setIdx] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const posRef = useRef(START);

  const item = items[idx];

  const apply = useCallback((p: number) => {
    const el = stageRef.current;
    if (!el) return;
    const clamped = Math.min(MAX, Math.max(MIN, p));
    posRef.current = clamped;
    el.style.setProperty("--if-ba", `${clamped}%`);
    handleRef.current?.setAttribute("aria-valuenow", String(Math.round(clamped)));
  }, []);

  const fromClientX = useCallback(
    (clientX: number) => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      apply(((clientX - r.left) / r.width) * 100);
    },
    [apply],
  );

  /* Intro sweep every time the pair changes — the handle glides in from the
     right so the "reveal" reads immediately. Skipped for reduced-motion
     visitors, who get the resting position straight away. */
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      apply(START);
      return;
    }
    const proxy = { v: 88 };
    const tween = gsap.to(proxy, {
      v: START,
      duration: 1.4,
      ease: "power3.inOut",
      onUpdate: () => apply(proxy.v),
    });
    return () => {
      tween.kill();
    };
  }, [apply, idx]);

  /* Pointer drag (mouse + touch + pen). Capture on the stage so the drag keeps
     tracking even when the cursor outruns the handle. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const down = (e: PointerEvent) => {
      dragging.current = true;
      stage.setPointerCapture(e.pointerId);
      fromClientX(e.clientX);
    };
    const move = (e: PointerEvent) => {
      if (dragging.current) fromClientX(e.clientX);
    };
    const up = (e: PointerEvent) => {
      dragging.current = false;
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    };

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, [fromClientX]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") {
      apply(posRef.current - step);
    } else if (e.key === "ArrowRight") {
      apply(posRef.current + step);
    } else if (e.key === "Home") {
      apply(MIN);
    } else if (e.key === "End") {
      apply(MAX);
    } else {
      return;
    }
    e.preventDefault();
  };

  const go = (next: number) => {
    const n = items.length;
    setIdx(((next % n) + n) % n);
  };

  return (
    <section id="beforeafter" data-if-spy="۷" className="if-section if-ba-section">
      <span className="if-ghost" data-if-parallax>
        ۰۷
      </span>

      <div className="if-container">
        <div className="if-ba-split">
          <div className="if-ba-stage" ref={stageRef} data-if-reveal>
            <div className="if-ba-layer if-ba-after">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={`${item.name} پس از برنامه ایرون‌فیت`} loading="lazy" />
            </div>

            <div className="if-ba-layer if-ba-before" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" loading="lazy" />
            </div>

            <span className="if-ba-tag if-ba-tag--before">قبل</span>
            <span className="if-ba-tag if-ba-tag--after">بعد</span>

            <div
              className="if-ba-handle"
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label="مقایسه تصویر قبل و بعد — با کلیدهای جهت‌دار جابه‌جا کنید"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={START}
              onKeyDown={onKey}
            >
              <span className="if-ba-line" aria-hidden />
              <span className="if-ba-grip">
                <MoveHorizontal size={16} />
              </span>
            </div>
          </div>

          <div className="if-ba-text">
            <p className="if-kicker" data-if-reveal>
              ۰۷ · {item.duration}
            </p>
            <h2 className="if-title" data-if-reveal data-if-delay="0.08">
              <em>{item.name}</em>
              <br />
              {item.city}
            </h2>
            <p className="if-ba-result" data-if-reveal data-if-delay="0.14">
              {item.result}
            </p>
            <blockquote className="if-ba-quote" data-if-reveal data-if-delay="0.2">
              <Quote size={22} aria-hidden />
              <p>{item.quote}</p>
            </blockquote>

            <div className="if-ba-ctl" data-if-reveal data-if-delay="0.26">
              <div className="if-dots">
                {items.map((it, i) => (
                  <button
                    key={it.slug}
                    type="button"
                    className={`if-dot ${i === idx ? "is-on" : ""}`}
                    aria-label={`مقایسه ${toFaDigits(i + 1)}`}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
              <div className="if-ba-ctl-right">
                <span className="if-ba-count">
                  {faIndex(idx + 1)} / {faIndex(items.length)}
                </span>
                <div className="if-slider-btns">
                  <button type="button" className="if-arrow" aria-label="مقایسه قبلی" onClick={() => go(idx - 1)}>
                    <ArrowRight size={19} />
                  </button>
                  <button type="button" className="if-arrow" aria-label="مقایسه بعدی" onClick={() => go(idx + 1)}>
                    <ArrowLeft size={19} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollCue target="#app" label="اپلیکیشن" />
    </section>
  );
}
