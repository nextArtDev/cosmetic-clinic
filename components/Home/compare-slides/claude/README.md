# Cosmetic Comparator

A scroll-scrubbed, GPU-shader before/after gallery built for cosmetic-procedure
photography. Sixteen hand-written transition studies (tear, peel, dissolve,
ripple, laser, cells, kintsugi, frost, silk, iris, bubbles, ink, mosaic,
bloom, thread, chrysalis), each locked 1:1 to scroll position via raw
`MotionValue` reads inside `useFrame` — no lag, no debounce.

The three newest — `bloom`, `thread`, `chrysalis` — are the beauty-specific
studies: a flower-petal reveal, a literal PDO thread-lift sweep, and an
iridescent "chrysalis" split for the emotional hero case. See `shaders.ts`
for the inline rationale on each.

## Install

```bash
npm i three @react-three/fiber @react-three/drei framer-motion
```

Requires `next/image`, and a `cn()` helper at `@/lib/utils` (the standard
shadcn/ui utility — `clsx` + `tailwind-merge`). Swap the import in
`cosmetic-comparator.tsx` if your project names it differently.

## Files

| File | Responsibility |
|---|---|
| `types.ts` | Public prop/data types — start here |
| `theme.ts` | Default theme tokens + English/Persian copy |
| `shaders.ts` | The 16 GLSL fragment shaders |
| `hooks.ts` | `prefers-reduced-motion`, WebGL2 detection, hold-to-preview |
| `use-effect-tier.ts` | Live paint benchmark (clip-path + backdrop-filter) for CSS/GSAP tier |
| `effect-mesh.tsx` | The `<Canvas>` mesh that runs a shader |
| `fallback-stage.tsx` | CSS `clip-path` comparator used when WebGL is unavailable |
| `compare-handle.tsx` | The dedicated hold-to-compare button |
| `comparison-stage.tsx` | One sticky shader stage: frame, progress rail, chips |
| `cosmetic-comparator.tsx` | Public component: hero, quick nav, shader stage list |
| `BeforeAfterRevealSlider.tsx` | **New** — GSAP pinned scroll reveal, single before/after pair |
| `BeforeAfterCompareLite.tsx` | **New** — lightweight tap/drag comparator, no pin, no gsap |
| `AdaptiveBeforeAfter.tsx` | **New** — picks `RevealSlider` / `CompareLite` via `useEffectTier()` |
| `adaptive-cosmetic-comparator.tsx` | **New** — top-level adapter: shaders when possible, adaptive fallback otherwise |
| `index.ts` | Barrel export |

## Usage

### Recommended: adaptive (shaders when possible, tiered CSS fallback)

```tsx
import AdaptiveCosmeticComparator from '@/components/compare-slides/claude/adaptive-cosmetic-comparator'

<AdaptiveCosmeticComparator
  items={CASES}
  direction="rtl"
/>
```

This is the "best results" entry point. It:

1. Probes for **WebGL2** (three.js r163+ requires it). If supported → renders the shader comparator (`CosmeticComparator` + `EffectMesh` + 16 shaders).
2. Otherwise → renders `AdaptiveBeforeAfter` per item, which uses the live paint benchmark to pick:
   - **'rich'** / **'reduced'** → `BeforeAfterRevealSlider` (GSAP pinned split reveal with parallax)
   - **'lite'** → `BeforeAfterCompareLite` (tap/drag, no pin, no gsap)

Both heavy renderers are lazy-loaded via `next/dynamic` (`ssr: false`): a device that falls back never downloads three.js, and a device that runs shaders never downloads gsap.

### Shader-only

```tsx
import { CosmeticComparator } from '@/components/compare-slides/claude'

<CosmeticComparator items={CASES} showHero={false} direction="rtl" />
```

### CSS/GSAP-only (no WebGL needed)

```tsx
import AdaptiveBeforeAfter from '@/components/compare-slides/claude/AdaptiveBeforeAfter'

<AdaptiveBeforeAfter
  before={{ src: beforePhoto, alt: 'Before' }}
  after={{ src: afterPhoto, alt: 'After' }}
  title="Rhinoplasty"
/>
```

### Single-pair GSAP reveal (no adaptive, no shader)

```tsx
import BeforeAfterRevealSlider from '@/components/compare-slides/claude/BeforeAfterRevealSlider'

<BeforeAfterRevealSlider
  before={{ src: beforePhoto, alt: 'Before' }}
  after={{ src: afterPhoto, alt: 'After' }}
  beforeSide="right"
  title="Rhinoplasty"
/>
```

### Single-pair lite (no pin, no gsap, touch-first)

```tsx
import BeforeAfterCompareLite from '@/components/compare-slides/claude/BeforeAfterCompareLite'

<BeforeAfterCompareLite
  before={{ src: beforePhoto, alt: 'Before' }}
  after={{ src: afterPhoto, alt: 'After' }}
/>
```

See `example-usage.tsx` for a full page wiring real assets, `next/font`, and
locale copy.

## Design decisions worth knowing about

- **No hardcoded demo data.** The original component shipped with five
  fixed placeholder photos and Persian-only copy baked into JSX. Everything
  content-shaped now comes through `items`, `copy`, and `direction` — the
  component has no opinion about which clinic or which language it's for.
- **`before` is optional.** If you only have "after" photography for a case,
  omit `before` and the shader synthesizes an aged, desaturated plate from
  the after image (`uRealBefore` uniform flips off `fetchBefore()`'s texture
  sample). Real pairs are still strongly preferred — see the footnote copy.
- **Graceful WebGL degradation.** `useWebglSupported()` feature-detects on
  mount; if WebGL is unavailable the same `items` render through
  `FallbackStage`, a plain `next/image` + animated `clip-path` comparator
  reading the identical `progress`/`preview` motion values, so behavior is
  consistent even though the transition mechanic is simpler.
- **Reduced motion is respected without disabling the component.**
  Scroll-scrubbing is user-initiated, so it's left on. What's frozen is the
  *ambient* animation — sparkle particles, ripple oscillation — that plays
  automatically via `uTime`, per `prefers-reduced-motion: reduce`.
- **Hold-to-reveal lives on a dedicated control, not the photo.** The first
  version bound `pointerdown`/`pointerup` to the entire frame and set
  `touch-action: none` on it so the gesture would register. On touch, that's
  a scroll-blocker: `pointerdown` fires the instant a finger lands, before
  the browser can tell a tap-and-hold apart from the first frame of a scroll
  drag, so `touch-action: none` prevented the frame from ever handing that
  touch off to page scroll — every scroll attempt over a stage reset it to
  "before" and ate the gesture. Fixed by moving the whole interaction to
  `CompareHandle`, a small explicit button pinned at the bottom of the
  frame; the photo frame itself stays `touch-action: pan-y` and never
  captures a pointer, so scrolling through the gallery works exactly like
  scrolling past a photo, on any device. The button also picks up real
  keyboard support (hold Enter/Space) for a11y, since "hold" has no natural
  keyboard equivalent otherwise.
- **Theming is CSS-variable based**, set once on the root `<main>` via
  `theme.ts:themeToCssVars()`. Override any subset of the 9 tokens without
  touching component internals; the default "Atelier" palette (vitrine
  black, champagne accent, garnet "before" marker) is deliberately not the
  black+neon or cream+terracotta AI-design defaults.
- **RTL is a first-class prop**, not a hardcoded `dir="rtl"` — logical
  Tailwind classes (`start-`/`end-`) are used throughout so the layout
  mirrors correctly for `direction="rtl"` consumers (e.g. `FA_COPY`).

## Known trade-offs

- Textures are loaded via `@react-three/drei`'s `useTexture`, which
  suspends — wrap consumers accordingly if you render many stages on a
  slow connection; consider paginating `items` for long case libraries.
- The synthesized "before" plate is a stylistic approximation, not a
  medical rendering — never present it as an authentic pre-procedure photo
  to patients or in advertising; use it only as a placeholder until real
  before photography is available.
