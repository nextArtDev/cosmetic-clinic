"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   ConfettiBurst — a dependency-free reproduction of the theme's
   <burst-efects> custom element.

   The theme's element is a thin IntersectionObserver wrapper around
   canvas-confetti. This storefront configures it as:

     data-trigger-position="top"   → fire when rect.top <= 0
     data-effect="school-pride"    → sideConfetti()
     data-trigger-once="true"      → observer.disconnect() after firing
     data-duration="3"             → ignored: the element reads
                                     `dataset.duartion` (typo), so it
                                     falls back to the 1000ms default

   canvas-confetti is not a dependency of this project, so the two
   effects the theme can actually reach here (school-pride + the
   `cannon` default) are re-implemented on a plain canvas using the
   library's particle model: per frame the velocity is damped by
   `decay`, gravity is added to the vertical velocity, and each
   particle carries a `ticks` lifetime.
   ============================================================ */

const STAR_PATH =
  "M43.767 59.6698L31.4327 53.1854L19.094 59.6698C14.3183 62.187 8.68819 58.1198 9.60225 52.7741L11.9573 39.0363L1.97805 29.3081C-1.89655 25.5351 0.242508 18.9273 5.60265 18.1492L19.396 16.1429L25.5655 3.64453C27.971 -1.22187 34.901 -1.20781 37.2995 3.64453L43.467 16.1429L57.2604 18.1492C62.6135 18.9265 64.7643 25.5308 60.885 29.3081L50.9057 39.0363L53.2608 52.7741C54.1737 58.1143 48.5592 62.1831 43.767 59.6698Z";
const HEART_PATH =
  "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z";
/* natural bounds of each path, used to normalise it to a particle size */
const STAR_BOX = { size: 64, cx: 32, cy: 31 };
const HEART_BOX = { size: 278, cx: 121.5, cy: 155 };

type Shape = "rect" | "star" | "heart";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: Shape;
  rot: number;
  rotSpeed: number;
  scalar: number;
  ticks: number;
  decay: number;
  gravity: number;
  drift: number;
  wobble: number;
  wobbleSpeed: number;
};

type Shot = {
  angle: number;
  originX: number;
  colors: string[];
  particleCount: number;
  startVelocity: number;
  spread: number;
  shapes?: Shape[];
  scalar?: [number, number];
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

/** canvas-confetti's `sideConfetti` (the `school-pride` effect). */
const SCHOOL_PRIDE: Shot[] = [
  { angle: 60, originX: 0, colors: ["#ffff00", "#bb0000", "#ffffff"], particleCount: 3, startVelocity: 80, spread: 33 },
  { angle: 120, originX: 1, colors: ["#ffff00", "#bb0000", "#ffffff"], particleCount: 3, startVelocity: 80, spread: 33 },
  {
    angle: 60,
    originX: 0,
    colors: ["#ffff00", "#bb0000", "#ffffff"],
    particleCount: 3,
    startVelocity: 80,
    spread: 33,
    shapes: ["star", "heart"],
    scalar: [1, 1.5],
  },
  {
    angle: 120,
    originX: 1,
    colors: ["#ffff00", "#bb0000", "#ffffff"],
    particleCount: 3,
    startVelocity: 80,
    spread: 33,
    shapes: ["star", "heart"],
    scalar: [1, 1.5],
  },
];

/** canvas-confetti's `cannonConfetti` (the element's default effect). */
function cannonShots(): Shot[] {
  const colors = ["#ffffff", "#e9fa01", "#f93963", "#0b55e8", "#7c0e8f"];
  const pick = () => colors[Math.floor(Math.random() * colors.length)];
  return [
    {
      angle: 90,
      originX: rand(0, 1),
      colors: [pick()],
      particleCount: 1,
      startVelocity: 0,
      spread: 360,
      scalar: [0.6, 1.1],
    },
    {
      angle: 90,
      originX: rand(0, 1),
      colors: [pick()],
      particleCount: 1,
      startVelocity: 0,
      spread: 360,
      scalar: [1.5, 2],
    },
  ];
}

export function ConfettiBurst({
  effect = "school-pride",
  duration = 1000,
  triggerPosition = "top",
  triggerOnce = true,
  zIndex = 100,
}: {
  effect?: "school-pride" | "cannon";
  duration?: number;
  triggerPosition?: "top" | "center" | "bottom";
  triggerOnce?: boolean;
  zIndex?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const star = new Path2D(STAR_PATH);
    const heart = new Path2D(HEART_PATH);

    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let endAt = 0;
    let lastShot = 0;
    /* school-pride fires its 4 shots every frame; cannon emits at a
       steadier pace so the two don't look identical */
    const shotGap = effect === "cannon" ? 60 : 0;

    const spawn = (shots: Shot[]) => {
      for (const shot of shots) {
        const rad = Math.PI / 180;
        const base = -shot.angle * rad;
        const spread2D = shot.spread * rad;
        for (let i = 0; i < shot.particleCount; i++) {
          const a = base + (Math.random() * spread2D - spread2D / 2);
          const v = shot.startVelocity * rand(0.6, 1);
          const shape: Shape = shot.shapes
            ? shot.shapes[Math.floor(Math.random() * shot.shapes.length)]
            : Math.random() < 0.65
              ? "rect"
              : "star";
          particles.push({
            x: shot.originX * window.innerWidth,
            y: window.innerHeight * 0.5,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v,
            color: shot.colors[Math.floor(Math.random() * shot.colors.length)],
            shape,
            rot: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.22, 0.22),
            scalar: shot.scalar ? rand(shot.scalar[0], shot.scalar[1]) : 1,
            ticks: 200,
            decay: 0.9,
            gravity: 1,
            drift: 0,
            wobble: rand(0, Math.PI * 2),
            wobbleSpeed: rand(0.05, 0.14),
          });
        }
      }
    };

    const drawShape = (p: Particle) => {
      const s = p.scalar;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        const w = 9 * s;
        const h = 5 * s;
        /* the flake tumbles: squash horizontally with the wobble phase */
        ctx.scale(Math.max(0.25, Math.abs(Math.cos(p.wobble))), 1);
        ctx.fillRect(-w / 2, -h / 2, w, h);
      } else {
        const box = p.shape === "star" ? STAR_BOX : HEART_BOX;
        const target = 16 * s;
        const k = target / box.size;
        ctx.scale(k, k);
        ctx.translate(-box.cx, -box.cy);
        ctx.fill(p.shape === "star" ? star : heart);
      }
      ctx.restore();
    };

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const now = performance.now();
      if (effect === "cannon" && now < endAt && now - lastShot >= shotGap) {
        lastShot = now;
        spawn(cannonShots());
      }

      const next: Particle[] = [];
      for (const p of particles) {
        p.vx = p.vx * p.decay + p.drift;
        p.vy = p.vy * p.decay + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.wobble += p.wobbleSpeed;
        p.ticks -= 1;
        if (p.ticks > 0 && p.y < window.innerHeight + 40) {
          drawShape(p);
          next.push(p);
        }
      }
      particles = next;
      ctx.restore();

      if (particles.length || (effect === "cannon" && now < endAt)) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const fire = () => {
      if (running) return;
      running = true;
      endAt = performance.now() + duration;
      lastShot = 0;
      particles = [];
      if (effect === "school-pride") {
        /* the theme's frame() loop re-fires all four shots until `end` */
        const loop = () => {
          if (performance.now() >= endAt) return;
          spawn(SCHOOL_PRIDE);
          raf = requestAnimationFrame(loop);
        };
        loop();
      }
      raf = requestAnimationFrame(frame);
    };

    /* The theme gates this behind an IntersectionObserver with
       threshold [0, .5, 1]. That is unreliable for an anchor as tall as
       the section (the ratio never reaches 1, and for a section more
       than 2x the viewport the .5 crossing never happens either), so we
       evaluate the same trigger-position test directly on scroll. */
    let queued = false;
    const evaluate = () => {
      queued = false;
      const rect = host.getBoundingClientRect();
      const hit =
        triggerPosition === "top"
          ? rect.top <= 0
          : triggerPosition === "center"
            ? rect.top + rect.height / 2 <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2
            : rect.bottom >= window.innerHeight;
      if (!hit) return;
      fire();
      if (triggerOnce) window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    evaluate();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [effect, duration, triggerPosition, triggerOnce]);

  return (
    <>
      {/* the observed anchor — mirrors the theme's empty <burst-efects> */}
      <span ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0 block" />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ zIndex }}
      />
    </>
  );
}
