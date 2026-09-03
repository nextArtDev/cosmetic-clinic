'use client'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CreativeCompare — cinematic, scroll-scrubbed GPU before/after showcase
 *  Next.js (App Router) · TypeScript · @react-three/fiber · drei · Framer Motion
 *
 *  deps:  npm i three @react-three/fiber @react-three/drei framer-motion
 *
 *  13 shader transitions tailored for cosmetic / aesthetic surgery storytelling,
 *  each scrubbed 1:1 by scroll (sticky stage, raw MotionValue → zero lag):
 *
 *   01 tear     — torn-paper strip rips open            (لیفت صورت)
 *   02 peel     — diagonal page-curl + paper backside   (پیلینگ شیمیایی)
 *   03 dissolve — golden ember dissolve                 (جوانسازی پوست)
 *   04 ripple   — liquid serum wave w/ refraction       (مزوتراپی)
 *   05 laser    — clinical laser scan + chromatic beam  (لیزر درمانی)
 *   06 cells    — voronoi cell regeneration             (میکرونیدلینگ)
 *   07 kintsugi — golden cracks repair (kintsugi)       (ترمیم اسکار)
 *   08 frost    — cryo frost melting w/ drips           (کرایوتراپی)
 *   09 silk     — flowing silk wave + pearlescent sheen (هایفوتراپی)
 *   10 iris     — surgical spotlight iris w/ rays       (بلفاروپلاستی)
 *   11 bubbles  — effervescent serum bubbles            (فیلر لب)
 *   12 ink      — watercolor wash w/ pigment ring       (میکروپیگمنتیشن)
 *   13 mosaic   — digital 3D-scan tile flip             (رادیوفرکانس)
 *
 *  No `before` photo? The shader synthesizes a perfectly-aligned aged
 *  grayscale "before" from the after image. Pass real before/after
 *  StaticImageData for production and the real texture is used.
 *
 *  SYNC/STICKY NOTES (keep these!):
 *   • `overflow-x-clip` everywhere (never overflow-hidden) so sticky works.
 *   • Shader reads RAW scrollYProgress in useFrame → perfect scroll lock-step.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { StaticImageData } from 'next/image'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { cn } from '@/lib/utils'

/* demo assets (swap with your StaticImageData imports in production) */
const PORTRAIT_ONE =
  'https://image.qwenlm.ai/public_source/e4b775a1-d2fa-4bd6-9ca6-66cc577a50d5/102f38cb4-894d-4d86-9c4a-1310c2577ff5.png'
const PORTRAIT_TWO =
  'https://image.qwenlm.ai/public_source/e4b775a1-d2fa-4bd6-9ca6-66cc577a50d5/17c1288ff-4564-4ebd-9302-2d47add9ecd9.png'
const SMILE_CLOSEUP =
  'https://image.qwenlm.ai/public_source/e4b775a1-d2fa-4bd6-9ca6-66cc577a50d5/1019cc87f-1942-48f9-a7ba-4f7897d18309.png'
const EYES_CLOSEUP =
  'https://image.qwenlm.ai/public_source/e4b775a1-d2fa-4bd6-9ca6-66cc577a50d5/1e3dbefec-78c5-42d0-8262-6ae8845f436e.png'
const LIPS_CLOSEUP =
  'https://image.qwenlm.ai/public_source/e4b775a1-d2fa-4bd6-9ca6-66cc577a50d5/11dd1179b-fa77-4e5f-ad8f-a0afe4e81577.png'

/* ─────────────────────────── helpers ─────────────────────────── */

const toSrc = (src: string | StaticImageData) =>
  typeof src === 'string' ? src : src.src

const toPersianDigits = (input: number | string) =>
  String(input).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])

/* ─────────────────────────── GLSL ─────────────────────────── */

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const COMMON = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uBefore;
uniform sampler2D uAfter;
uniform float uRealBefore;
uniform float uImgAspect;
uniform float uPlaneAspect;
uniform float uProgress;
uniform float uTime;
uniform float uSeed;
uniform float uCenterY;

float hash21(vec2 p){
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
vec2 coverUv(vec2 uv){
  vec2 s = vec2(1.0);
  if (uImgAspect > uPlaneAspect) { s.x = uPlaneAspect / uImgAspect; }
  else { s.y = uImgAspect / uPlaneAspect; }
  return uv * s + (1.0 - s) * 0.5;
}
/* real before texture, or synthesized aged-grayscale from the after image */
vec3 fetchBefore(vec2 buv, vec3 afterCol){
  if (uRealBefore > 0.5) return texture2D(uBefore, buv).rgb;
  float l = dot(afterCol, vec3(0.299, 0.587, 0.114));
  l = pow(l, 1.2);
  l = mix(l, l * l * 1.35 + 0.03, 0.35);
  l *= 0.90 + 0.10 * fbm(buv * 60.0);
  float wr = smoothstep(0.52, 0.78, fbm(buv * vec2(16.0, 26.0) + 7.3));
  l *= 1.0 - wr * 0.14;
  return vec3(l) * vec3(0.99, 0.98, 0.96);
}
`

/* 01 — torn paper */
const FRAG_TEAR = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float eased = p * p * (3.0 - 2.0 * p);
  float halfH = eased * 0.62;

  float fiber = fbm(vec2(uv.x * 70.0, uv.y * 6.0));
  float nT = fbm(vec2(uv.x * 8.0 + uSeed, 2.3));
  float nB = fbm(vec2(uv.x * 8.0 + uSeed + 53.0, 9.1));
  float topE = uCenterY + halfH + (nT - 0.5) * 0.10 + (fiber - 0.5) * 0.02;
  float botE = uCenterY - halfH + (nB - 0.5) * 0.10 + (fiber - 0.5) * 0.02;

  float inside = step(0.002, halfH) * step(uv.y, topE) * step(botE, uv.y);
  float d = min(topE - uv.y, uv.y - botE);

  vec3 col = mix(beforeC, afterC, inside);
  float innerSh = (1.0 - smoothstep(0.0, 0.07, max(d, 0.0))) * inside;
  col *= 1.0 - innerSh * 0.38;

  float rimW = 0.02 + 0.025 * fbm(vec2(uv.x * 90.0, uv.y * 10.0));
  float rim = (1.0 - smoothstep(0.0, rimW, abs(d))) * step(0.002, halfH);
  vec3 paper = vec3(0.97, 0.96, 0.93) * (0.82 + 0.18 * fbm(vec2(uv.x * 140.0, uv.y * 16.0)));
  col = mix(col, paper, clamp(rim, 0.0, 1.0));

  float outSh = (1.0 - smoothstep(-0.06, 0.0, min(d, 0.0))) * (1.0 - inside) * step(0.002, halfH);
  col *= 1.0 - outSh * 0.18;

  gl_FragColor = vec4(col, 1.0);
}
`

/* 02 — page curl / peel */
const FRAG_PEEL = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  vec2 dir = normalize(vec2(1.0, 0.62));
  float x = dot(uv, dir);
  float wob = (fbm(uv * 3.5 + uSeed) - 0.5) * 0.03;
  float edge = mix(-0.8, 1.9, p) + wob;
  float flapW = 0.34;

  vec3 col;
  if (x <= edge) {
    float dE = edge - x;
    float bulge = exp(-pow(dE / 0.14, 2.0));
    vec2 buv2 = coverUv(uv + dir * (bulge * 0.025));
    col = texture2D(uAfter, buv2).rgb;
    col += bulge * 0.10;
  } else if (x <= edge + flapW) {
    float t = clamp((x - edge) / flapW, 0.0, 1.0);
    float cyl = sin(t * 3.14159);
    vec3 paper = vec3(0.96, 0.95, 0.92) * (0.62 + 0.45 * cyl);
    vec2 muv = coverUv(uv - dir * (2.0 * (x - edge)));
    vec3 back = texture2D(uAfter, muv).rgb;
    float bl = dot(back, vec3(0.333));
    paper = mix(paper, vec3(bl) * vec3(0.97, 0.96, 0.94), 0.18);
    col = paper;
  } else {
    float dF = x - (edge + flapW);
    float sh = 1.0 - smoothstep(0.0, 0.20, dF);
    col = beforeC * (1.0 - sh * 0.40);
  }
  gl_FragColor = vec4(col, 1.0);
}
`

/* 03 — golden ember dissolve */
const FRAG_DISSOLVE = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float n = fbm(buv * 3.0 + uSeed) * 0.65 + fbm(buv * 8.0 + uSeed * 2.0) * 0.35;
  float t = p * 1.15;

  float reveal = 1.0 - smoothstep(t - 0.02, t + 0.02, n);
  float glow = 1.0 - smoothstep(0.0, 0.09, abs(n - t));

  vec3 col = mix(beforeC, afterC, reveal);
  vec3 gold = vec3(0.85, 0.68, 0.35);
  col = mix(col, gold * 1.25, glow * 0.85);
  col += gold * glow * 0.25;

  vec2 g = floor(uv * 140.0);
  float h = hash21(g + floor(uTime * 6.0));
  float spark = step(0.997, h) * glow;
  col += vec3(1.0, 0.9, 0.6) * spark;

  gl_FragColor = vec4(col, 1.0);
}
`

/* 04 — liquid serum ripple */
const FRAG_RIPPLE = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float h = mix(-0.12, 1.12, p);
  float surface = h
    + 0.05 * sin(uv.x * 16.0 + uTime * 1.6)
    + 0.03 * sin(uv.x * 37.0 - uTime * 2.3)
    + 0.03 * (fbm(vec2(uv.x * 6.0, uTime * 0.4) + uSeed) - 0.5);

  float reveal = 1.0 - smoothstep(surface - 0.006, surface + 0.006, uv.y);
  float glow = 1.0 - smoothstep(0.0, 0.06, abs(uv.y - surface));

  /* refraction wobble right at the liquid line */
  vec2 ruv = uv + vec2(0.0, 0.012 * sin(uv.x * 28.0 + uTime * 2.6)) * glow;
  vec3 afterR = texture2D(uAfter, coverUv(ruv)).rgb;

  vec3 col = mix(beforeC, afterR, reveal);
  col = mix(col, vec3(0.75, 0.90, 0.95), glow * 0.45);
  col += vec3(0.75, 0.90, 0.95) * glow * 0.20;
  col += vec3(0.60, 0.85, 0.90) * reveal * 0.06
       * (0.5 + 0.5 * sin(uv.x * 40.0 + uv.y * 30.0 + uTime * 2.0));

  gl_FragColor = vec4(col, 1.0);
}
`

/* 05 — clinical laser scan */
const FRAG_LASER = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float line = mix(1.12, -0.12, p);
  float treated = smoothstep(line - 0.004, line + 0.004, uv.y);
  float glow = 1.0 - smoothstep(0.0, 0.10, abs(uv.y - line));

  vec3 col = mix(beforeC, afterC, treated);

  /* chromatic fringe at the beam */
  float ca = glow * 0.7;
  col.r = mix(col.r, texture2D(uAfter, coverUv(uv + vec2(0.005, 0.0))).r, ca);
  col.b = mix(col.b, texture2D(uAfter, coverUv(uv - vec2(0.005, 0.0))).b, ca * (1.0 - treated));
  col = mix(col, vec3(0.65, 0.95, 0.90), glow * 0.75);
  col += vec3(0.65, 0.95, 0.90) * glow * 0.30;

  /* diagnostic scanlines on the untreated side */
  float scan = 0.5 + 0.5 * sin(uv.y * 420.0);
  col *= (1.0 - treated) * (1.0 - scan * 0.07) + treated;

  float spark = step(0.996, hash21(vec2(floor(uv.x * 180.0), floor(uTime * 9.0))));
  col += vec3(0.80, 1.0, 0.95) * spark * glow;

  gl_FragColor = vec4(col, 1.0);
}
`

/* 06 — cellular regeneration (organic voronoi flip) */
const FRAG_CELLS = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  vec2 w = vec2(fbm(uv * 4.0 + uSeed), fbm(uv * 4.0 + uSeed + 9.0));
  vec2 g = uv * 20.0 + w * 1.5;
  vec2 cid = floor(g);
  float r = hash21(cid + uSeed);

  float reveal = smoothstep(r * 0.9, r * 0.9 + 0.10, p);
  float glow = (1.0 - smoothstep(0.0, 0.14, abs(p - r * 0.9 - 0.05))) * 0.8;

  vec2 f = fract(g);
  float b = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
  float border = 1.0 - smoothstep(0.0, 0.07, b);

  vec3 col = mix(beforeC, afterC, reveal);
  col = mix(col, vec3(0.90, 0.75, 0.45), glow * 0.35);
  col *= 1.0 - border * 0.12;

  gl_FragColor = vec4(col, 1.0);
}
`

/* 07 — kintsugi: golden crack repair */
const FRAG_KINTSUGI = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  vec2 guv = uv * 5.5 + uSeed;
  vec2 ip = floor(guv);
  vec2 fp = fract(guv);

  float d1 = 8.0; float d2 = 8.0; vec2 cell = ip;
  for (int y = -1; y <= 1; y++){
    for (int x = -1; x <= 1; x++){
      vec2 off = vec2(float(x), float(y));
      vec2 rp = vec2(hash21(ip + off + uSeed), hash21(ip + off + uSeed + 3.7));
      vec2 delta = off + rp - fp;
      float d = dot(delta, delta);
      if (d < d1) { d2 = d1; d1 = d; cell = ip + off; }
      else if (d < d2) { d2 = d; }
    }
  }

  float edge = sqrt(d2) - sqrt(d1);
  float crack = 1.0 - smoothstep(0.0, 0.07, edge);
  float region = hash21(cell + uSeed + 8.1);
  float reveal = smoothstep(region * 0.75 + 0.15, region * 0.75 + 0.30, p);
  float crackOn = crack * smoothstep(0.02, 0.22, p);

  vec3 col = mix(beforeC, afterC, max(reveal, crackOn * 0.9));
  col = mix(col, vec3(0.87, 0.69, 0.35) * 1.35, crackOn * 0.85);
  col += vec3(0.87, 0.69, 0.35) * crackOn * (1.0 - smoothstep(0.0, 0.18, edge)) * 0.2;

  gl_FragColor = vec4(col, 1.0);
}
`

/* 08 — cryo frost melt */
const FRAG_FROST = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float melt = mix(1.15, -0.20, p);
  float n = fbm(uv * vec2(7.0, 9.0) + uSeed);
  float line = melt + (n - 0.5) * 0.22;

  float frost = smoothstep(line - 0.01, line + 0.01, uv.y);
  vec3 frostCol = beforeC * 0.45 + vec3(0.80, 0.88, 0.97) * 0.62;
  float sp = step(0.993, hash21(floor(uv * 160.0) + uSeed));
  frostCol += sp * 0.6;

  vec3 col = mix(afterC, frostCol, frost);
  float edgeGlow = 1.0 - smoothstep(0.0, 0.05, abs(uv.y - line));
  col += vec3(0.80, 0.92, 1.0) * edgeGlow * 0.35;

  /* melting drips hanging below the line */
  float streak = smoothstep(0.55, 0.80, fbm(vec2(uv.x * 34.0, uSeed)));
  float drip = streak * (1.0 - frost) * smoothstep(line - 0.22, line, uv.y);
  col = mix(col, frostCol * 0.92, drip * 0.55);

  gl_FragColor = vec4(col, 1.0);
}
`

/* 09 — silk wave */
const FRAG_SILK = /* glsl */ `
void main(){
  vec2 uv = vUv;
  float p = clamp(uProgress, 0.0, 1.0);
  float line = mix(-0.3, 1.3, p);
  float warp = 0.10 * sin(uv.y * 7.0 + uTime * 0.9) + 0.05 * sin(uv.y * 17.0 - uTime * 1.4);
  float x = uv.x + warp * 0.5;

  float reveal = 1.0 - smoothstep(line - 0.28, line + 0.28, x);
  float sheen = reveal * (1.0 - reveal) * 4.0;

  vec2 buv = coverUv(uv + vec2(warp * 0.06 * sheen, 0.0));
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(coverUv(uv), afterC);

  vec3 col = mix(beforeC, afterC, reveal);
  col += vec3(0.98, 0.90, 0.80) * sheen * 0.22;
  col += vec3(0.85, 0.75, 0.95) * sheen * 0.10 * sin(uv.y * 40.0 + uTime);

  gl_FragColor = vec4(col, 1.0);
}
`

/* 10 — surgical spotlight iris */
const FRAG_IRIS = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  vec2 q = vec2((uv.x - 0.5) * uPlaneAspect, uv.y - uCenterY);
  float d = length(q);
  float radius = mix(-0.08, 1.45, p);

  float reveal = 1.0 - smoothstep(radius - 0.10, radius, d);
  float ring = 1.0 - smoothstep(0.0, 0.09, abs(d - radius));

  vec3 col = mix(beforeC, afterC, reveal);
  col = mix(col, vec3(1.0, 0.92, 0.72), ring * 0.6);
  col += vec3(1.0, 0.92, 0.72) * ring * 0.25;

  float ang = atan(q.y, q.x);
  float rays = 0.5 + 0.5 * sin(ang * 28.0 + uTime * 1.5);
  col += rays * ring * 0.12;
  col *= 1.0 - (1.0 - reveal) * 0.22;

  gl_FragColor = vec4(col, 1.0);
}
`

/* 11 — effervescent serum bubbles */
const FRAG_BUBBLES = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float rise = p * 1.5;

  float top = rise * 1.3 - 0.15;
  float base = 1.0 - smoothstep(top - 0.3, top, uv.y);

  vec2 g = uv * vec2(12.0, 16.0);
  vec2 cid = floor(g);
  vec2 f = fract(g) - 0.5;
  vec2 rnd = vec2(hash21(cid + uSeed), hash21(cid + uSeed + 5.0));
  float thr = rnd.x * 0.9 + (1.0 - uv.y) * 0.45;
  float on = smoothstep(thr, thr + 0.10, rise);
  float rad = 0.10 + 0.28 * rnd.y;
  float d = length(f - (rnd - 0.5) * 0.4);

  float bubble = on * (1.0 - smoothstep(rad - 0.03, rad, d));
  float rim = on * (1.0 - smoothstep(0.0, 0.05, abs(d - rad)));
  float reveal = clamp(base + bubble, 0.0, 1.0);

  vec3 col = mix(beforeC, afterC, reveal);
  col = mix(col, vec3(0.85, 0.95, 1.0), rim * 0.35);

  gl_FragColor = vec4(col, 1.0);
}
`

/* 12 — watercolor / pigment wash */
const FRAG_INK = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  float blob = fbm(uv * 3.0 + uSeed) * 0.65 + fbm(uv * 7.0 + uSeed * 2.0) * 0.35;
  float level = mix(1.05, -0.15, p);

  float reveal = smoothstep(level, level + 0.10, blob);
  float ringBand = smoothstep(level - 0.14, level, blob)
                 * (1.0 - smoothstep(level, level + 0.14, blob));

  vec3 col = mix(beforeC, afterC, reveal);
  col = mix(col, vec3(0.75, 0.35, 0.45), ringBand * 0.35);

  gl_FragColor = vec4(col, 1.0);
}
`

/* 13 — digital 3D-scan mosaic */
const FRAG_MOSAIC = /* glsl */ `
void main(){
  vec2 uv = vUv;
  float p = clamp(uProgress, 0.0, 1.0);
  vec2 scale = vec2(26.0, 34.0);
  vec2 g = floor(uv * scale);
  float r = hash21(g + uSeed);

  float reveal = smoothstep(r * 0.85 + 0.08, r * 0.85 + 0.14, p + (1.0 - uv.y) * 0.08);
  float fresh = reveal * (1.0 - reveal) * 4.0;

  vec2 off = vec2((hash21(g + floor(uTime * 12.0)) - 0.5) * 0.02 * fresh, 0.0);
  vec2 buv = coverUv(uv + off);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  vec3 col = mix(beforeC, afterC, reveal);

  vec2 f = fract(uv * scale);
  float b = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
  float border = 1.0 - smoothstep(0.0, 0.09, b);
  col += vec3(0.45, 0.80, 0.90) * border * fresh * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`

type CompareEffect =
  | 'tear'
  | 'peel'
  | 'dissolve'
  | 'ripple'
  | 'laser'
  | 'cells'
  | 'kintsugi'
  | 'frost'
  | 'silk'
  | 'iris'
  | 'bubbles'
  | 'ink'
  | 'mosaic'

const FRAGMENTS: Record<CompareEffect, string> = {
  tear: COMMON + FRAG_TEAR,
  peel: COMMON + FRAG_PEEL,
  dissolve: COMMON + FRAG_DISSOLVE,
  ripple: COMMON + FRAG_RIPPLE,
  laser: COMMON + FRAG_LASER,
  cells: COMMON + FRAG_CELLS,
  kintsugi: COMMON + FRAG_KINTSUGI,
  frost: COMMON + FRAG_FROST,
  silk: COMMON + FRAG_SILK,
  iris: COMMON + FRAG_IRIS,
  bubbles: COMMON + FRAG_BUBBLES,
  ink: COMMON + FRAG_INK,
  mosaic: COMMON + FRAG_MOSAIC,
}

/* ─────────────────────────── GPU mesh ─────────────────────────── */

interface EffectMeshProps {
  effect: CompareEffect
  beforeSrc: string
  afterSrc: string
  hasRealBefore: boolean
  seed: number
  centerY: number
  /** RAW scroll progress — read every frame for 1:1 scrub sync */
  progress: MotionValue<number>
}

function EffectMesh({
  effect,
  beforeSrc,
  afterSrc,
  hasRealBefore,
  seed,
  centerY,
  progress,
}: EffectMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const loaded = useTexture([beforeSrc, afterSrc])
  const [beforeTex, afterTex] = loaded as [THREE.Texture, THREE.Texture]

  const beforeTexWithAniso = useMemo(() => {
    if (!beforeTex) return beforeTex
    const clone = beforeTex.clone()
    clone.anisotropy = 8
    return clone
  }, [beforeTex])

  const afterTexWithAniso = useMemo(() => {
    if (!afterTex) return afterTex
    const clone = afterTex.clone()
    clone.anisotropy = 8
    return clone
  }, [afterTex])

  const uniforms = useMemo(
    () => ({
      uBefore: { value: beforeTexWithAniso },
      uAfter: { value: afterTexWithAniso },
      uRealBefore: { value: hasRealBefore ? 1 : 0 },
      uImgAspect: {
        value:
          ((afterTexWithAniso?.image as { width?: number } | null)?.width ??
            1024) /
          ((afterTexWithAniso?.image as { height?: number } | null)?.height ??
            1024),
      },
      uPlaneAspect: { value: 0.8 },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSeed: { value: seed },
      uCenterY: { value: centerY },
    }),
    [beforeTexWithAniso, afterTexWithAniso, hasRealBefore, seed, centerY],
  )

  useFrame((state) => {
    const material = materialRef.current
    if (!material) return
    material.uniforms.uProgress.value = progress.get()
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uPlaneAspect.value = state.size.width / state.size.height
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        key={effect}
        ref={materialRef}
        vertexShader={VERT}
        fragmentShader={FRAGMENTS[effect]}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ─────────────────────────── sticky scroll stage ─────────────────────────── */

interface StageItem {
  effect: CompareEffect
  after: string | StaticImageData
  before?: string | StaticImageData
  caption: string
  effectTitle: string
  focusY?: number
  seed?: number
}

function ScrollStage({ item, index }: { item: StageItem; index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const beforeChipOpacity = useTransform(scrollYProgress, [0.28, 0.48], [1, 0])
  const afterChipOpacity = useTransform(scrollYProgress, [0.52, 0.74], [0, 1])

  const [pct, setPct] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (value) =>
    setPct(Math.round(value * 100)),
  )

  const afterSrc = toSrc(item.after)
  const beforeSrc = item.before ? toSrc(item.before) : afterSrc

  return (
    <div ref={sectionRef} id={`stage-${index}`} className="relative h-[240vh]">
      {/* NOTE: never put overflow-hidden on any ancestor of this sticky node */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-4 px-4 py-6">
        {/* stage heading */}
        <div className="flex items-baseline gap-3">
          <span className="text-[11px] font-semibold tabular-nums text-[#a08243]">
            {toPersianDigits(String(index + 1).padStart(2, '0'))}
          </span>
          <h3 className="text-lg font-bold text-[#f3ecd9] sm:text-xl">
            {item.effectTitle}
          </h3>
          <span className="hidden text-xs text-[#8d8064] sm:block">
            {item.caption}
          </span>
        </div>

        {/* gilded frame */}
        <div dir="ltr" className="relative w-[min(84vw,400px)]">
          {/* progress rail */}
          <div className="absolute -left-7 top-0 hidden h-full w-px overflow-hidden bg-white/10 sm:block">
            <motion.div
              style={{ scaleY: scrollYProgress }}
              className="h-full w-full origin-top bg-gradient-to-b from-[#e8cf96] to-[#8f7136]"
            />
          </div>

          <div className="rounded-[22px] bg-[linear-gradient(150deg,#efe3c8_0%,#c9a962_30%,#8f7136_52%,#c9a962_74%,#efe3c8_100%)] p-[1.5px] shadow-[0_36px_100px_-32px_rgba(201,169,98,0.4)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20.5px] bg-[#141210]">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#26221b] via-[#1b1814] to-[#26221b]" />

              <Canvas
                dpr={[1, 2]}
                gl={{
                  antialias: true,
                  alpha: true,
                  powerPreference: 'high-performance',
                }}
                className="absolute inset-0"
              >
                <Suspense fallback={null}>
                  <EffectMesh
                    effect={item.effect}
                    beforeSrc={beforeSrc}
                    afterSrc={afterSrc}
                    hasRealBefore={Boolean(item.before)}
                    seed={item.seed ?? 7.3}
                    centerY={item.focusY ?? 0.5}
                    progress={scrollYProgress}
                  />
                </Suspense>
              </Canvas>

              <motion.div
                style={{ opacity: beforeChipOpacity }}
                className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-3.5 py-1.5 text-[12px] font-medium text-white shadow-lg backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#9a9a9a]" />
                پیش از {item.caption}
              </motion.div>

              <motion.div
                style={{ opacity: afterChipOpacity }}
                className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-3.5 py-1.5 text-[12px] font-medium text-white shadow-lg backdrop-blur-md"
              >
                پس از {item.caption}
                <span className="h-1.5 w-1.5 rounded-full bg-[#e0c184]" />
              </motion.div>

              <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
                <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium tabular-nums text-[#f3e7c8] backdrop-blur-md">
                  {toPersianDigits(pct)}٪
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="flex flex-col items-center gap-1 text-[11px] text-[#8d8064]">
          <span>برای تحول، اسکرول کنید</span>
          <motion.span
            aria-hidden
            animate={{ y: [0, 5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[#c9a962]"
          >
            ⌄
          </motion.span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── showcase page ─────────────────────────── */

const SHOWCASE: StageItem[] = [
  {
    effect: 'tear',
    after: PORTRAIT_ONE,
    caption: 'لیفت صورت',
    effectTitle: 'پارگی کاغذ',
    focusY: 0.84,
    seed: 7.3,
  },
  {
    effect: 'peel',
    after: PORTRAIT_TWO,
    caption: 'پیلینگ شیمیایی',
    effectTitle: 'پیچِ صفحه',
    focusY: 0.76,
    seed: 21.7,
  },
  {
    effect: 'dissolve',
    after: SMILE_CLOSEUP,
    caption: 'جوانسازی پوست',
    effectTitle: 'غبار طلایی',
    focusY: 0.5,
    seed: 3.1,
  },
  {
    effect: 'ripple',
    after: PORTRAIT_ONE,
    caption: 'مزوتراپی',
    effectTitle: 'موج سرم',
    focusY: 0.8,
    seed: 11.4,
  },
  {
    effect: 'laser',
    after: PORTRAIT_TWO,
    caption: 'لیزر درمانی',
    effectTitle: 'اسکن لیزر',
    focusY: 0.72,
    seed: 5.9,
  },
  {
    effect: 'cells',
    after: SMILE_CLOSEUP,
    caption: 'میکرونیدلینگ',
    effectTitle: 'نوسازی سلولی',
    focusY: 0.5,
    seed: 14.2,
  },
  {
    effect: 'kintsugi',
    after: PORTRAIT_ONE,
    caption: 'ترمیم اسکار',
    effectTitle: 'درز طلایی',
    focusY: 0.8,
    seed: 2.8,
  },
  {
    effect: 'frost',
    after: PORTRAIT_TWO,
    caption: 'کرایوتراپی',
    effectTitle: 'ذوب یخ',
    focusY: 0.74,
    seed: 9.6,
  },
  {
    effect: 'silk',
    after: PORTRAIT_ONE,
    caption: 'هایفوتراپی',
    effectTitle: 'موج ابریشم',
    focusY: 0.82,
    seed: 17.5,
  },
  {
    effect: 'iris',
    after: EYES_CLOSEUP,
    caption: 'بلفاروپلاستی',
    effectTitle: 'دریچه نور',
    focusY: 0.55,
    seed: 4.4,
  },
  {
    effect: 'bubbles',
    after: LIPS_CLOSEUP,
    caption: 'فیلر لب',
    effectTitle: 'حباب‌های سرم',
    focusY: 0.5,
    seed: 8.8,
  },
  {
    effect: 'ink',
    after: PORTRAIT_TWO,
    caption: 'میکروپیگمنتیشن',
    effectTitle: 'آبرنگ',
    focusY: 0.72,
    seed: 13.7,
  },
  {
    effect: 'mosaic',
    after: SMILE_CLOSEUP,
    caption: 'رادیوفرکانس',
    effectTitle: 'موزاییک دیجیتال',
    focusY: 0.5,
    seed: 6.2,
  },
]

const CreativeCompare = () => {
  return (
    /* overflow-x-clip (NOT overflow-hidden!) so position:sticky survives */
    <main
      dir="rtl"
      className="relative w-full overflow-x-clip bg-[#0f0d09] text-[#f3ecd9]"
    >
      {/* quick-jump nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0f0d09]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5 sm:justify-center">
          {SHOWCASE.map((item, navIndex) => (
            <a
              key={item.effect}
              href={`#stage-${navIndex}`}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-[#b3a687] transition-colors hover:border-[#c9a962]/50 hover:text-[#e8cf96]"
            >
              {toPersianDigits(String(navIndex + 1).padStart(2, '0'))}{' '}
              {item.effectTitle}
            </a>
          ))}
        </div>
      </nav>

      {/* ambient gold glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#c9a962]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#8f7136]/10 blur-3xl"
      />

      {/* hero */}
      <header className="relative flex min-h-[72vh] flex-col items-center justify-center gap-6 px-6 pt-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-semibold tracking-[0.35em] text-[#a08243]"
        >
          گالری سینمایی جراحی زیبایی
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-3xl font-black leading-[1.4] sm:text-5xl sm:leading-[1.4]"
        >
          سیزده روایت GPU از تحول؛
          <span className="bg-gradient-to-l from-[#e8cf96] to-[#8f7136] bg-clip-text text-transparent">
            {' '}
            از پارگی کاغذ تا درز طلایی
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a962]" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#c9a962]" />
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a962]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md text-sm leading-7 text-[#b3a687] sm:text-base"
        >
          هر قاب با اسکرول شما زنده می‌شود؛ کاملاً همگام با حرکت چرخ ماوس.
        </motion.p>
      </header>

      {/* stages */}
      {SHOWCASE.map((item, stageIndex) => (
        <ScrollStage key={item.effect} item={item} index={stageIndex} />
      ))}

      {/* outro */}
      <footer className="relative flex flex-col items-center gap-4 px-6 py-24 text-center">
        <span className="h-1.5 w-1.5 rotate-45 bg-[#c9a962]" />
        <p className="max-w-md text-sm leading-7 text-[#8d8064]">
          برای تصاویر واقعی کلینیک، کافی است جفت‌های پیش/پس را به‌صورت
          StaticImageData به همین صحنه‌ها بدهید؛ هر افکت بدون تغییرِ API کار
          می‌کند.
        </p>
      </footer>
    </main>
  )
}

export default CreativeCompare
