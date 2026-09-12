"use client";

/* ============================================================
   /v16 — preloader.

   Faithful to the reference theme's preloader.css + colorflux:
     · a 4px progress bar pinned to the top of the viewport that
       fills as the page initialises,
     · a full-screen veil whose background/text colours cycle
       (the theme's `colorflux` behaviour) while loading,
     · a two-panel "edge split" that peels apart to reveal the page,
     · desktop only — the reference hides it under 768px.

   Scroll is locked for the duration and everything is torn down on
   unmount, so no other route is affected.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { getLenis } from "../lib/fx";
import { useReducedMotionSafe } from "./Motion";

const PALETTE = [
  { bg: "rgba(22, 19, 14, 0.94)", text: "#f2ede4" },
  { bg: "rgba(154, 106, 61, 0.94)", text: "#f7f1e8" },
  { bg: "rgba(234, 226, 211, 0.95)", text: "#16130e" },
  { bg: "rgba(42, 37, 29, 0.94)", text: "#ddd2bf" },
];

const TAGLINES = ["پوشاک ایرانی", "ظرافت بی‌زمان", "دوخت درجه‌یک", "مایا"];

type Phase = "loading" | "leaving" | "done";

export function Preloader() {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [pal, setPal] = useState(0);
  const [tag, setTag] = useState(0);
  const reduced = useReducedMotionSafe();
  const timers = useRef<number[]>([]);

  useEffect(() => {
    /* desktop only, matching the reference's media query */
    if (window.matchMedia("(max-width: 767px)").matches || reduced) {
      setPhase("done"); // eslint-disable-line react-hooks/set-state-in-effect -- one-time capability check
      return;
    }

    const html = document.documentElement;
    const lenis = getLenis();
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    lenis?.stop();

    const push = (id: number) => timers.current.push(id);

    /* colour flux — the theme's `colorflux` class */
    push(window.setInterval(() => setPal((p) => (p + 1) % PALETTE.length), 280));
    push(window.setInterval(() => setTag((t) => (t + 1) % TAGLINES.length), 520));

    /* progress: ease toward 100 over ~1.7s, then reveal */
    let value = 0;
    push(
      window.setInterval(() => {
        value = Math.min(100, value + Math.max(1.4, (100 - value) * 0.11));
        setPct(value);
        if (value >= 99.6) {
          setPct(100);
          window.setTimeout(() => setPhase("leaving"), 220);
          window.setTimeout(() => setPhase("done"), 1250);
          timers.current.forEach((t) => window.clearInterval(t));
        }
      }, 45),
    );

    return () => {
      timers.current.forEach((t) => window.clearInterval(t));
      timers.current = [];
      html.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [reduced]);

  /* release the scroll lock once we are past the reveal */
  useEffect(() => {
    if (phase !== "done") return;
    const html = document.documentElement;
    html.style.overflow = "";
    getLenis()?.start();
  }, [phase]);

  if (phase === "done") return null;

  const theme = PALETTE[pal];

  return (
    <>
      <div className="maya-progress-container">
        <div
          className="maya-progress-bar"
          style={{ transform: `translateX(${-100 + pct}%)`, transition: "transform .3s ease-in-out" }}
        />
      </div>

      <div className="maya-edge-split" data-state={phase === "leaving" ? "leaving" : "idle"} aria-hidden="true" />

      <div
        className="maya-preloader"
        data-state={phase}
        role="status"
        aria-live="polite"
        style={{ ["--maya-pre-bg" as string]: theme.bg, ["--maya-pre-text" as string]: theme.text }}
      >
        <div className="maya-preloader-word">
          {Array.from("مایا").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 90}ms` }}>
              {ch}
            </span>
          ))}
          <span className="text-[0.35em] self-end pb-[0.35em] opacity-70" style={{ animationDelay: "380ms" }}>
            .
          </span>
        </div>
        <p className="maya-preloader-tag">{TAGLINES[tag]}</p>
      </div>
    </>
  );
}
