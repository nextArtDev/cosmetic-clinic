Your real problem isn't "old phones", Saeed: it's that you mount **8 live WebGL contexts** at once (mobile Safari caps around 8 and evicts the oldest), clone every texture (2x VRAM), run `useFrame` at 60fps forever on all of them, and stack a `backdrop-blur` nav plus two `blur-3xl` blobs over the whole thing. Any of those alone will make a mid-tier Android look "unsupported". So: measure the device instead of guessing, tier the shader instead of killing it, and fix the pin with sticky + `svh`.

## 1. Capability probe: measure, don't sniff

Replace `useWebglSupported` and `useEffectTier` with one probe that compiles **your heaviest real shader** and benchmarks it at your real pixel budget.

```ts
// render-capability.ts
export type RenderTier = 'shader-high' | 'shader-lite' | 'css-rich' | 'css-static'

const ORDER: RenderTier[] = ['shader-high', 'shader-lite', 'css-rich', 'css-static']
export const demote = (t: RenderTier): RenderTier =>
  ORDER[Math.min(ORDER.indexOf(t) + 1, ORDER.length - 1)]
export const isShader = (t: RenderTier) => t.startsWith('shader')

/** Exposes WebGL2 but chokes on multi-octave fbm. Downgrade-only signal, never an upgrade. */
const SLOW_GPU =
  /mali-(4|t6|t7|t8)|adreno\D*(2\d\d|3\d\d|4\d\d|5[0-3]\d)|powervr (sgx|ge8)|videocore|swiftshader|software|basic render|llvmpipe/i

export interface Capability {
  tier: RenderTier
  reason: string
  gpu: string | null
  /** Estimated ms of GPU time for ONE full-canvas frame at `targetPixels`. */
  frameCostMs: number | null
}

const PROBE_VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

/**
 * Honest capability check, cheapest signals first, real GPU work last.
 * `fragmentSource` should be your most expensive shader (chrysalis / tear).
 * `targetPixels` = the real drawing-buffer area you intend to render.
 */
export function probeCapability(
  fragmentSource: string,
  targetPixels: number,
): Capability {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean; effectiveType?: string }
  }

  if (nav.connection?.saveData) return bail('css-rich', 'save-data')
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2)
    return bail('css-rich', 'deviceMemory<=2')
  if (/2g/.test(nav.connection?.effectiveType ?? '')) return bail('css-rich', 'slow-net')

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: true, // rejects software rasterizers outright
  })
  if (!gl) return bail('css-rich', 'no-webgl2')

  const dbg = gl.getExtension('WEBGL_debug_renderer_info')
  const gpu = dbg
    ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) ?? '')
    : null

  const kill = (reason: string, tier: RenderTier = 'css-rich'): Capability => {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return { tier, reason, gpu, frameCostMs: null }
  }

  // three.js prepends `precision highp float;`. Without real fragment highp your
  // fbm/hash math turns to banded mud, which is what "unsupported" usually looks like.
  const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)
  if (!hp || hp.precision < 23) return kill('no-fragment-highp')
  if (gl.getParameter(gl.MAX_TEXTURE_SIZE) < 4096) return kill('max-texture<4096')
  if (gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) < 64)
    return kill('few-frag-uniforms')

  const program = build(gl, PROBE_VERT, `precision highp float;\n${fragmentSource}`)
  if (!program) return kill('shader-compile-failed') // the check you actually wanted

  // --- real GPU cost -------------------------------------------------------
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  gl.useProgram(program)

  const tex = noiseTexture(gl) // real texture fetches, not black samplers
  for (const name of ['uBefore', 'uAfter']) {
    const u = gl.getUniformLocation(program, name)
    if (u) gl.uniform1i(u, 0)
  }
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  const set = (n: string, v: number) => {
    const u = gl.getUniformLocation(program, n)
    if (u) gl.uniform1f(u, v)
  }
  set('uRealBefore', 1); set('uImgAspect', 0.8); set('uPlaneAspect', 0.8)
  set('uProgress', 0.5) // mid-transition: both branches of every shader execute
  set('uTime', 1.2); set('uSeed', 4.4); set('uCenterY', 0.55)

  const px = new Uint8Array(4)
  const samples: number[] = []
  for (let i = 0; i < 9; i++) {
    const t0 = performance.now()
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px) // forces a real flush
    if (i > 0) samples.push(performance.now() - t0) // frame 0 = compile/upload spike
  }
  const probeMs = median(samples)
  const frameCostMs = probeMs * (targetPixels / (512 * 512))
  gl.getExtension('WEBGL_lose_context')?.loseContext()

  const weakCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4
  const slowGpu = Boolean(gpu && SLOW_GPU.test(gpu))

  // 16.6ms is the whole 60fps budget. The shader gets ~6ms; scroll, compositing
  // and the rest of the page need the remainder.
  let tier: RenderTier =
    frameCostMs > 14 ? 'css-rich' : frameCostMs > 6 || slowGpu || weakCpu ? 'shader-lite' : 'shader-high'
  // shader-lite renders at dpr 1 → ~4x fewer fragments. If even that won't fit, drop out.
  if (tier === 'shader-lite' && frameCostMs / 4 > 14) tier = 'css-rich'

  return { tier, reason: `probe ${frameCostMs.toFixed(1)}ms/frame`, gpu, frameCostMs }

  function bail(t: RenderTier, reason: string): Capability {
    return { tier: t, reason, gpu: null, frameCostMs: null }
  }
}

function build(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (process.env.NODE_ENV !== 'production') console.warn(gl.getShaderInfoLog(s))
      gl.deleteShader(s)
      return null
    }
    return s
  }
  const v = compile(gl.VERTEX_SHADER, vs)
  const f = compile(gl.FRAGMENT_SHADER, fs)
  if (!v || !f) return null
  const p = gl.createProgram()!
  gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p)
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null
}

function noiseTexture(gl: WebGL2RenderingContext) {
  const n = 128
  const data = new Uint8Array(n * n * 4)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 256) | 0
  const t = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.generateMipmap(gl.TEXTURE_2D)
  return t
}
```

`failIfMajorPerformanceCaveat` plus the highp check plus a real compile of `FRAGMENT_SHADERS.chrysalis` catches the three ways devices actually fail. The benchmark catches the fourth: compiles fine, runs at 9fps.

## 2. Tier provider with a live watchdog

Static detection is never enough, thermal throttling happens 20 seconds in. So keep watching and demote mid-session.

```tsx
// render-tier.tsx
'use client'

import {
  createContext, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react'
import { FRAGMENT_SHADERS } from './shaders'
import { demote, probeCapability, type Capability, type RenderTier } from './render-capability'

const KEY = 'cc-tier-v3'
const Ctx = createContext<RenderTier>('css-rich')
export const useRenderTier = () => useContext(Ctx)

export function RenderTierProvider({
  children,
  onProbe,
}: {
  children: ReactNode
  /** Ship this to analytics. It's how you build a real device matrix. */
  onProbe?: (cap: Capability) => void
}) {
  // Start pessimistic: 'css-rich' renders identically on server and client, so no
  // hydration mismatch and no capable-device flash of a broken canvas.
  const [tier, setTier] = useState<RenderTier>('css-rich')
  const tierRef = useRef(tier)
  const apply = (next: RenderTier) => {
    if (ORDER_INDEX[next] === ORDER_INDEX[tierRef.current]) return
    tierRef.current = next
    setTier(next)
    try { localStorage.setItem(KEY, next) } catch {}
  }

  useEffect(() => {
    let cached: string | null = null
    try { cached = localStorage.getItem(KEY) } catch {}

    const run = () => {
      if (cached && cached in ORDER_INDEX) return apply(cached as RenderTier)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetPixels = window.innerWidth * dpr * (window.innerHeight * 0.78) * dpr
      const cap = probeCapability(FRAGMENT_SHADERS.chrysalis, targetPixels)
      onProbe?.(cap)
      apply(cap.tier)
    }

    // Never probe during hydration or first paint; it's a synchronous GPU stall.
    const idle = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
    const handle = idle(run)

    // Watchdog: 12 consecutive frames worse than 28ms means this device is
    // losing, whatever the probe said. Thermal throttle, background tabs, cheap GPU.
    let raf = 0, last = performance.now(), bad = 0
    const tick = (now: number) => {
      const dt = now - last
      last = now
      if (dt > 28 && dt < 400) bad++ // >400ms = tab was backgrounded, not jank
      else bad = Math.max(0, bad - 1)
      if (bad >= 12) { bad = 0; apply(demote(tierRef.current)) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onLost = (e: Event) => { e.preventDefault(); apply('css-rich') }
    window.addEventListener('webglcontextlost', onLost, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('webglcontextlost', onLost, true)
      ;(window as any).cancelIdleCallback?.(handle)
    }
  }, [onProbe])

  return <Ctx.Provider value={tier}>{children}</Ctx.Provider>
}

const ORDER_INDEX: Record<RenderTier, number> = {
  'shader-high': 0, 'shader-lite': 1, 'css-rich': 2, 'css-static': 3,
}
```

Wire `onProbe` to your analytics and you'll have the answer to "which devices don't support this" in a week, with actual GPU strings and ms numbers, instead of a UA blocklist that rots.

**Keep `prefers-reduced-motion` out of the tier.** Your current `useEffectTier` collapses them, which is wrong: reduced-motion means "no autoplay ambient", not "your GPU is bad". Scroll-scrub is user-driven and stays.

## 3. Shader tiering, not shader on/off

```ts
// quality.ts
import type { RenderTier } from './render-capability'

/** Prepended to COMMON. Halves fbm cost and kills per-frame hash sparkle on lite. */
export const qualityPrelude = (tier: RenderTier) =>
  tier === 'shader-high'
    ? '#define FBM_OCTAVES 4\n#define AMBIENT 1\n'
    : '#define FBM_OCTAVES 2\n#define AMBIENT 0\n'
```

Then in `shaders.ts` make `fbm` respect it and gate the sparkle blocks:

```glsl
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < FBM_OCTAVES; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v / (1.0 - pow(0.5, float(FBM_OCTAVES)));  // normalize so lite matches high
}
```

```glsl
// e.g. in FRAG_LASER / FRAG_DISSOLVE
#if AMBIENT
  float spark = step(0.996, hash21(vec2(floor(uv.x * 180.0), floor(uTime * 9.0))));
  col += vec3(0.80, 1.0, 0.95) * spark * glow;
#endif
```

Export shaders as a function of tier so the `key={effect}` on `shaderMaterial` becomes `key={effect + tier}` and recompiles cleanly on demotion.

## 4. Fix the pin (this is most of your mobile lag)

```tsx
// comparison-stage.tsx — the shell. Sticky, not JS-pinned.
<section
  id={`stage-${item.id}`}
  ref={trackRef}
  className="relative h-[240svh] [contain:layout_paint_style]"
>
  <div className="sticky top-0 h-[100svh] overflow-hidden">
    {near ? <StageVisual … /> : null}
  </div>
</section>
```

Five rules that matter here:

- **`svh`, never `vh` or `dvh`.** `dvh` re-resolves as the mobile URL bar collapses, which relayouts a 1640vh document mid-scroll. `svh` is a fixed number. If you need JS pin math, cache viewport height and **ignore height-only resizes** on touch devices.
- **Native `sticky` over GSAP `pin`.** ScrollTrigger pinning fights iOS async scrolling and adds pin-spacers; sticky is composited by the browser for free. If you must keep ScrollTrigger, at minimum set `pinType: 'transform'` and don't run `normalizeScroll` on mobile.
- **Keep `overflow-x-clip`, do not "fix" it to `overflow-x-hidden`.** `hidden` on one axis forces `auto` on the other, which creates a scroll container and silently kills every `sticky` inside it.
- **Only one canvas alive.** Gate `near` with an IntersectionObserver at `rootMargin: '60% 0px 60% 0px'` and unmount outside it. With `-40vh` overlap you'll have at most two mounted, which is inside every browser's context cap.
- **Delete the mobile blur.** The fixed `backdrop-blur-md` nav sits over a repainting canvas and forces a full-viewport blur every frame, and the two `blur-3xl` blobs allocate huge offscreen buffers.

```tsx
// nav: solid on touch, glass only where it's cheap
className="fixed inset-x-0 top-0 z-50 border-b border-[var(--cc-border)] bg-[var(--cc-bg)]
           supports-[backdrop-filter]:lg:bg-[var(--cc-bg)]/75 supports-[backdrop-filter]:lg:backdrop-blur-md"
```

```tsx
// blobs: a radial-gradient is free, filter: blur() on a 52rem box is not
<div aria-hidden className="pointer-events-none absolute -top-52 left-1/2 h-[28rem] w-[52rem]
  -translate-x-1/2 [background:radial-gradient(closest-side,color-mix(in_oklch,var(--cc-accent)_16%,transparent),transparent)]" />
```

## 5. Shared scroll loop, one rAF for the whole gallery

Eight `useScroll` instances means eight rAF loops each measuring rects. Collapse to one, and write a CSS variable so the fallback needs zero React renders.

```ts
// use-stage-progress.ts
'use client'
import { useEffect, useRef } from 'react'
import { useMotionValue } from 'framer-motion'

type Entry = { el: HTMLElement; write: (p: number) => void; near: boolean }
const entries = new Set<Entry>()
let raf = 0

function loop() {
  const vh = window.innerHeight
  // All reads first, all writes second: one layout pass, no thrash.
  const reads: [Entry, number][] = []
  for (const e of entries) {
    if (!e.near) continue
    const r = e.el.getBoundingClientRect()
    const span = r.height - vh
    reads.push([e, span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span))])
  }
  for (const [e, p] of reads) e.write(p)
  raf = reads.length ? requestAnimationFrame(loop) : 0
}
const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }

export function useStageProgress(near: boolean) {
  const trackRef = useRef<HTMLElement | null>(null)
  const progress = useMotionValue(0)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const entry: Entry = {
      el,
      near,
      write: (p) => {
        progress.set(p)
        // CSS-tier stages read --p directly. No React, no style-object churn.
        el.style.setProperty('--p', p.toFixed(4))
      },
    }
    entries.add(entry)
    kick()
    return () => { entries.delete(entry) }
  }, [near, progress])

  return { trackRef, progress }
}
```

## 6. The luxury fallback that actually works

Your current one sets a `clip-path` **string** every single frame on a `fill` image, which repaints the full frame off the main thread's critical path and looks like a plain wipe. This version moves only `transform` (compositor-only, zero repaint), and reads like a silk curtain drawing back: hairline champagne seam, warm bleed ahead of the edge, static grain and vignette, drag and hold both supported.

```tsx
// luxury-fallback-stage.tsx
'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef } from 'react'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'
import type { ComparatorCopy, ComparisonItem } from './types'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export function LuxuryFallbackStage({
  item, copy, progress, preview, interactive = true,
}: {
  item: ComparisonItem
  copy: ComparatorCopy
  progress: MotionValue<number>
  preview: MotionValue<number | null>
  /** false on the 'css-static' tier: drag only, no scroll scrub. */
  interactive?: boolean
}) {
  const root = useRef<HTMLDivElement>(null)
  const dragRef = useRef<number | null>(null)

  // One write per frame, to a custom property. Every transform below derives
  // from it in CSS, so the compositor does the work and React never re-renders.
  const commit = useCallback((raw: number) => {
    const p = dragRef.current ?? raw
    root.current?.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4))
  }, [])

  useMotionValueEvent(progress, 'change', (v) => { if (interactive) commit(v) })
  useMotionValueEvent(preview, 'change', (v) => { if (v !== null) commit(v) })
  useEffect(() => { commit(interactive ? progress.get() : 0.5) }, [commit, interactive, progress])

  // Drag: only the handle claims the gesture, so vertical scroll is never stolen.
  const onDrag = (e: React.PointerEvent) => {
    const box = root.current?.getBoundingClientRect()
    if (!box) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = 1 - (e.clientY - box.top) / box.height
    commit(0)
  }
  const endDrag = () => { dragRef.current = null; commit(progress.get()) }

  return (
    <div
      ref={root}
      style={{ ['--p' as string]: '0' }}
      className="relative h-full w-full overflow-hidden rounded-[2px] bg-[var(--cc-surface)]
                 [--seam:color-mix(in_oklch,var(--cc-accent)_82%,white)]"
    >
      <Image
        src={item.before?.src ?? item.after.src}
        alt={item.before?.alt ?? copy.beforeLabel(item.procedureLabel)}
        fill sizes="(max-width: 640px) 92vw, 46vw" draggable={false}
        className="pointer-events-none select-none object-cover
                   [filter:grayscale(0.32)_contrast(0.94)_brightness(0.88)]"
      />

      {/* Curtain: slides down out of frame at p=0. Parent overflow does the clipping. */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0, calc((1 - var(--p)) * 100%), 0)' }}
      >
        {/* Counter-translate so the after photo stays registered with the before. */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: 'translate3d(0, calc((var(--p) - 1) * -100%), 0)' }}
        >
          <Image
            src={item.after.src} alt={item.after.alt}
            fill sizes="(max-width: 640px) 92vw, 46vw" draggable={false}
            className="pointer-events-none select-none object-cover"
          />
        </div>
      </div>

      {/* Seam: hairline + warm bleed spilling onto the untouched plate above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px will-change-transform"
        style={{
          transform: 'translate3d(0, calc((1 - var(--p)) * 100%), 0)',
          boxShadow:
            '0 0 0 0.5px var(--seam), 0 -1px 2px color-mix(in oklch, var(--seam) 55%, transparent), 0 -26px 34px -14px color-mix(in oklch, var(--cc-accent) 34%, transparent)',
          opacity: 'calc(min(var(--p), 1 - var(--p)) * 2.4 + 0.25)',
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.05]"
           style={{ backgroundImage: GRAIN }} />
      <div aria-hidden className="pointer-events-none absolute inset-0
           [background:radial-gradient(120%_85%_at_50%_38%,transparent_42%,color-mix(in_oklch,var(--cc-bg)_72%,transparent)_100%)]" />

      {/* The only element that captures pointers. touch-action stays on the handle. */}
      <div
        onPointerDown={onDrag}
        onPointerMove={(e) => dragRef.current !== null && onDrag(e)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="slider" aria-label={copy.fallbackDragHint}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={50}
        tabIndex={0}
        className="absolute end-3 top-1/2 grid h-16 w-9 -translate-y-1/2 cursor-ns-resize
                   touch-none place-items-center rounded-full border border-[var(--cc-border)]
                   bg-[color-mix(in_oklch,var(--cc-bg)_66%,transparent)]"
      >
        <span className="h-8 w-px bg-[var(--cc-accent)]/60" />
      </div>
    </div>
  )
}
```

`css-static` renders the same component with `interactive={false}`: no scroll math at all, just the handle. That's the honest floor for a Mali-400.

## 7. `EffectMesh` bugs worth fixing regardless of tier

```tsx
// Don't clone textures. clone() = a second GPU upload of the same bitmap,
// so 8 stages × 2 photos becomes 32 uploads. Configure in place instead.
const [beforeTex, afterTex] = useTexture([beforeSrc, afterSrc], (loaded) => {
  const list = Array.isArray(loaded) ? loaded : [loaded]
  for (const t of list) {
    t.anisotropy = Math.min(maxAniso, tier === 'shader-high' ? 8 : 2)
    t.colorSpace = THREE.SRGBColorSpace
    t.generateMipmaps = true
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.needsUpdate = true
  }
})

// uPlaneAspect is a resize concern, not a per-frame one.
const { size, invalidate } = useThree()
useEffect(() => {
  const m = materialRef.current
  if (m) m.uniforms.uPlaneAspect.value = size.width / size.height
  invalidate()
}, [size, invalidate])

// With frameloop="demand", ambient motion is the only reason to run continuously.
useFrame((state) => { /* uProgress from preview ?? progress, uTime only if ambient */ })
```

And the Canvas:

```tsx
<Canvas
  frameloop={tier === 'shader-high' && !reduceAmbientMotion ? 'always' : 'demand'}
  dpr={tier === 'shader-high' ? [1, 2] : 1}
  gl={{ antialias: false, alpha: false, depth: false, stencil: false,
        powerPreference: tier === 'shader-high' ? 'high-performance' : 'default' }}
  performance={{ min: 0.5 }}
>
  <AdaptiveDpr />
  …
</Canvas>
```

On `demand`, subscribe `progress.on('change', invalidate)` so scrubbing still renders 1:1 but a parked page burns nothing.

---

**Delete:** `useWebglSupported`, `useEffectTier` (the `clip-path` + `backdrop-filter` probe measures the wrong thing entirely), and the old `FallbackStage`. **Keep** `usePrefersReducedMotion` and `useHoldPreview`, both are fine, just add an 8px movement slop before `start()` commits so a scroll-intending touch on the handle doesn't snap to before.

Order of impact if you only do three things: one canvas at a time, `sticky` + `svh` instead of JS pinning, kill the mobile `backdrop-blur`. That alone will make most of the "unsupported" devices suddenly look supported.