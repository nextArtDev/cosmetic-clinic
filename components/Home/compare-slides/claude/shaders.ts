import type { TransitionEffect } from './types'

/**
 * All 13 fragment shaders read a normalized `uProgress` (0–1) each frame and
 * a shared `fetchBefore()` helper that either samples a real "before"
 * texture or synthesizes an aged plate from the "after" texture. Nothing
 * here is procedure-specific — labeling lives entirely in `ComparisonItem`.
 */

export const VERT = /* glsl */ `
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

  float ca = glow * 0.7;
  col.r = mix(col.r, texture2D(uAfter, coverUv(uv + vec2(0.005, 0.0))).r, ca);
  col.b = mix(col.b, texture2D(uAfter, coverUv(uv - vec2(0.005, 0.0))).b, ca * (1.0 - treated));
  col = mix(col, vec3(0.65, 0.95, 0.90), glow * 0.75);
  col += vec3(0.65, 0.95, 0.90) * glow * 0.30;

  float scan = 0.5 + 0.5 * sin(uv.y * 420.0);
  col *= (1.0 - treated) * (1.0 - scan * 0.07) + treated;

  float spark = step(0.996, hash21(vec2(floor(uv.x * 180.0), floor(uTime * 9.0))));
  col += vec3(0.80, 1.0, 0.95) * spark * glow;

  gl_FragColor = vec4(col, 1.0);
}
`

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

  float streak = smoothstep(0.55, 0.80, fbm(vec2(uv.x * 34.0, uSeed)));
  float drip = streak * (1.0 - frost) * smoothstep(line - 0.22, line, uv.y);
  col = mix(col, frostCol * 0.92, drip * 0.55);

  gl_FragColor = vec4(col, 1.0);
}
`

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

/** 14 — petal bloom: an organic flower-shaped reveal, radiating from the
 *  focal point with soft blush edge-glow and drifting pollen dust. Reads
 *  like a bloom opening rather than the plain circular wipe of `iris`. */
const FRAG_BLOOM = /* glsl */ `
void main(){
  vec2 uv = vUv;
  vec2 buv = coverUv(uv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(buv, afterC);

  float p = clamp(uProgress, 0.0, 1.0);
  vec2 q = vec2((uv.x - 0.5) * uPlaneAspect, uv.y - uCenterY);
  float ang = atan(q.y, q.x);
  float dist = length(q);

  float petals = 6.0;
  float lobe = 0.5 + 0.5 * sin(petals * ang * 0.5 + uSeed);
  float boundary = mix(-0.10, 1.55, p) * (0.72 + 0.34 * lobe);

  float reveal = 1.0 - smoothstep(boundary - 0.05, boundary + 0.02, dist);
  float rim = 1.0 - smoothstep(0.0, 0.045, abs(dist - boundary));

  vec3 col = mix(beforeC, afterC, reveal);
  vec3 blush = vec3(0.93, 0.62, 0.66);
  col = mix(col, blush, rim * 0.55);
  col += blush * rim * 0.20;

  vec2 g = floor(uv * 90.0);
  float dust = step(0.994, hash21(g + floor(uTime * 4.0))) * rim;
  col += vec3(1.0, 0.85, 0.80) * dust;

  gl_FragColor = vec4(col, 1.0);
}
`

/** 15 — thread lift: several golden suture lines sweep left to right,
 *  cinching the after-image slightly toward each thread as it passes, with
 *  a traveling glint. Named directly after the procedure it depicts. */
const FRAG_THREAD = /* glsl */ `
void main(){
  vec2 uv = vUv;
  float p = clamp(uProgress, 0.0, 1.0);

  float threadCount = 5.0;
  float row = floor(uv.y * threadCount);
  float rowT = fract(uv.y * threadCount);
  float phase = hash21(vec2(row, uSeed)) * 6.28318;
  float wave = 0.10 * sin(uv.x * 14.0 + phase) * (0.4 + 0.6 * rowT);
  float threadY = (row + 0.5) / threadCount + wave * 0.15;

  float distToThread = abs(uv.y - threadY);
  float threadLine = 1.0 - smoothstep(0.0, 0.006, distToThread);

  float sweep = mix(-0.15, 1.15, p);
  float revealX = smoothstep(sweep - 0.10, sweep, uv.x);

  float pull = (1.0 - smoothstep(0.0, 0.05, distToThread)) * revealX * 0.012;
  vec2 liftedUv = uv + vec2(0.0, pull);

  vec2 buv = coverUv(liftedUv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(coverUv(uv), afterC);

  vec3 col = mix(beforeC, afterC, revealX);

  vec3 gold = vec3(0.86, 0.70, 0.38);
  float glintPos = fract(sweep * 1.3 + row * 0.13);
  float glint = threadLine * (1.0 - smoothstep(0.0, 0.04, abs(uv.x - glintPos)));
  col = mix(col, gold * 1.4, threadLine * revealX * 0.35);
  col += gold * glint * 0.6;

  gl_FragColor = vec4(col, 1.0);
}
`

/** 16 — metamorphosis: the frame splits down a central seam like a
 *  chrysalis opening; each half eases outward as it reveals, with an
 *  iridescent, soap-bubble shimmer along the seam. The emotional
 *  "transformation" piece — a good pick for a featured/hero case. */
const FRAG_CHRYSALIS = /* glsl */ `
vec3 iridescence(float t){
  return 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + t));
}

void main(){
  vec2 uv = vUv;
  float p = clamp(uProgress, 0.0, 1.0);

  float cx = 0.5 + (fbm(vec2(uv.y * 3.0, uSeed)) - 0.5) * 0.03;
  float side = uv.x - cx;
  float dist = abs(side);

  float crack = smoothstep(0.0, 0.55, p) * 0.5;
  float open = smoothstep(crack - 0.02, crack + 0.02, dist);

  float wingPull = (1.0 - open) * p * 0.10 * sign(side);
  vec2 wingUv = uv - vec2(wingPull, 0.0);

  vec2 buv = coverUv(wingUv);
  vec3 afterC = texture2D(uAfter, buv).rgb;
  vec3 beforeC = fetchBefore(coverUv(uv), afterC);

  vec3 col = mix(beforeC, afterC, open);

  float edgeGlow = 1.0 - smoothstep(0.0, 0.03, abs(dist - crack));
  vec3 shimmer = iridescence(uv.y * 2.0 + uTime * 0.15 + uSeed);
  col = mix(col, shimmer, edgeGlow * 0.55 * step(0.001, crack));
  col += shimmer * edgeGlow * 0.25 * step(0.001, crack);

  gl_FragColor = vec4(col, 1.0);
}
`

export const FRAGMENT_SHADERS: Record<TransitionEffect, string> = {
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
  bloom: COMMON + FRAG_BLOOM,
  thread: COMMON + FRAG_THREAD,
  chrysalis: COMMON + FRAG_CHRYSALIS,
}
