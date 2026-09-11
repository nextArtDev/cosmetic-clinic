"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, scrollToSection } from "../lib/anim";
import { IRANFIT_SECTIONS } from "../data/types";
import { faIndex } from "../lib/fa";

export default function ProgressRail() {
  const [active, setActive] = useState(1);
  const fillRef = useRef<HTMLSpanElement>(null);

  /* overall page progress → rail fill */
  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        gsap.set(fill, { scaleY: self.progress });
      },
    });
    return () => st.kill();
  }, []);

  /* scrollspy per section */
  useEffect(() => {
    const triggers = IRANFIT_SECTIONS.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActive(s.index);
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <nav className="if-rail" aria-label="فهرست بخش‌ها">
      {IRANFIT_SECTIONS.slice(0, 4).map((s) => (
        <RailButton key={s.id} s={s} active={active} />
      ))}
      <span className="if-rail-track" aria-hidden>
        <span className="if-rail-fill" ref={fillRef} />
      </span>
      {IRANFIT_SECTIONS.slice(4).map((s) => (
        <RailButton key={s.id} s={s} active={active} />
      ))}
    </nav>
  );
}

function RailButton({
  s,
  active,
}: {
  s: (typeof IRANFIT_SECTIONS)[number];
  active: number;
}) {
  return (
    <button
      className={active === s.index ? "is-on" : ""}
      onClick={() => scrollToSection(`#${s.id}`)}
      aria-label={`رفتن به بخش ${faIndex(s.index)}`}
      aria-current={active === s.index}
    >
      {faIndex(s.index)}
    </button>
  );
}
