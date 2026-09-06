"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronsLeftRight } from "lucide-react";

type CompareSliderProps = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  className?: string;
};

export default function CompareSlider({ before, after, beforeAlt, afterAlt, className = "" }: CompareSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const pos = useMotionValue(50);
  const smooth = useSpring(pos, { stiffness: 260, damping: 30, mass: 0.5 });
  const clip = useTransform(smooth, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(smooth, (v) => `${v}%`);

  const update = useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pct = ((clientX - r.left) / r.width) * 100;
      pos.set(Math.min(96, Math.max(4, pct)));
    },
    [pos],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    update(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) update(e.clientX);
  };
  const stop = () => setDragging(false);

  return (
    <div
      ref={ref}
      className={`compare-handle   nc:group   nc:relative   nc:select-none   nc:overflow-hidden   nc:rounded-[24px]   nc:bg-fog  ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      role="slider"
      aria-label="مقایسه قبل و بعد"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos.get())}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") pos.set(Math.max(4, pos.get() - 4));
        if (e.key === "ArrowRight") pos.set(Math.min(96, pos.get() + 4));
      }}
    >
      {/* After (base) */}
      <Image src={after} alt={afterAlt} fill sizes="(min-width:1024px) 45vw, 100vw" className="nc:object-cover" draggable={false} />
      <span className="nc:absolute   nc:end-4   nc:top-4   nc:rounded-full   nc:bg-white/85   nc:px-3   nc:py-1   nc:text-[11px]   nc:font-bold   nc:normal-case     nc:text-ink   nc:backdrop-blur">
        بعد · ۱۲ ماه
      </span>

      {/* Before (clipped) */}
      <motion.div style={{ clipPath: clip }} className="nc:absolute   nc:inset-0">
        <Image src={before} alt={beforeAlt} fill sizes="(min-width:1024px) 45vw, 100vw" className="nc:object-cover" draggable={false} />
        <span className="nc:absolute   nc:start-4   nc:top-4   nc:rounded-full   nc:bg-ink/80   nc:px-3   nc:py-1   nc:text-[11px]   nc:font-bold   nc:normal-case     nc:text-white   nc:backdrop-blur">
          قبل
        </span>
      </motion.div>

      {/* Divider + handle */}
      <motion.div style={{ left }} className="nc:absolute   nc:inset-y-0   nc:z-10   nc:w-px   nc:-translate-x-1/2   nc:bg-white/90   nc:shadow-[0_0_0_1px_rgba(0,0,0,.08)]">
        <motion.span
          animate={{ scale: dragging ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="nc:absolute   nc:start-1/2   nc:top-1/2   nc:grid   nc:size-12   nc:-translate-x-1/2   nc:-translate-y-1/2   nc:place-items-center   nc:rounded-full   nc:bg-white   nc:text-ink   nc:shadow-lift   nc:ring-1   nc:ring-ink/10"
        >
          <ChevronsLeftRight className="nc:size-5" />
        </motion.span>
      </motion.div>

      {/* Hint */}
      <span className="nc:pointer-events-none   nc:absolute   nc:bottom-4   nc:start-1/2   nc:-translate-x-1/2   nc:rounded-full   nc:bg-ink/70   nc:px-3   nc:py-1   nc:text-[11px]   nc:font-medium   nc:text-white   nc:opacity-80   nc:backdrop-blur   nc:transition-opacity   nc:duration-500   nc:group-hover:opacity-0">
        برای مقایسه بکشید
      </span>
    </div>
  );
}
