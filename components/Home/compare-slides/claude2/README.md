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
| `shaders.ts` | The 13 GLSL fragment shaders |
| `device-tier.ts` | Measures GPU capability by timing our own shader, not device sniffing |
| `hooks.ts` | `prefers-reduced-motion`, WebGL detection, hold-to-preview, device tier, lazy-mount |
| `effect-mesh.tsx` | The `<Canvas>` mesh that runs a shader, at a tier-appropriate quality |
| `fallback-stage.tsx` | CSS `clip-path` comparator used when WebGL is unavailable |
| `compare-handle.tsx` | The dedicated hold-to-compare button — isolated from the scrollable photo area |
| `comparison-stage.tsx` | One sticky stage: frame, progress rail, chips |
| `cosmetic-comparator.tsx` | Public component: hero, quick nav, stage list |
| `index.ts` | Barrel export |

## Usage

```tsx
import { CosmeticComparator } from '@/components/cosmetic-compare'

<CosmeticComparator
  items={[
    {
      id: 'rhinoplasty-01',
      effect: 'tear',
      procedureLabel: 'Rhinoplasty',
      effectLabel: 'Torn Paper',
      before: { src: beforePhoto, alt: 'Patient before, front profile' },
      after: { src: afterPhoto, alt: 'Patient after, front profile' },
    },
  ]}
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
- **Graceful WebGL degradation** — three tiers, not one switch.
  `useDeviceTier()` (in `hooks.ts`, backed by `device-tier.ts`) actually
  renders one of this component's own fbm-heavy shaders on the visitor's
  GPU at a tiny resolution and times it with `gl.finish()` forcing real
  completion, rather than guessing capability from device or browser
  identity — plenty of "old" phones have fine GPUs, and plenty of "new"
  budget phones don't, so a model-name blocklist would be both unreliable
  and unfair. The result maps to:
  - **`high`** — the full shader, `uOctaves = 4`, dpr up to 2×, MSAA on.
  - **`mid`** — the *same* shader, `uOctaves = 2` (see the `uOctaves`
    uniform in `shaders.ts`, which lets `fbm()` break out of its noise loop
    early), dpr capped at 1×, MSAA off. Still a real shader, just cheaper —
    a phone that can't afford full quality still gets the actual effect
    instead of being silently downgraded to the CSS fallback.
  - **`low`** (or no WebGL at all) — `FallbackStage`, the CSS `clip-path`
    comparator, reading the identical `progress`/`preview` motion values so
    behavior is consistent even though the mechanic is simpler.

  To find out which tier your real visitors land in, pass
  `onDeviceTierResolved` — it fires once per mount with the renderer
  string, measured benchmark ms, and chosen tier, so you can send it to
  analytics instead of guessing. To see a specific tier yourself without
  the hardware, pass `qualityOverride="low" | "mid" | "high"`.

- **Lazy-mounted canvases fix the pinning lag** — this was the bigger
  culprit, and it wasn't a low-end-only problem. The original mounted all
  16 stages' `<Canvas>` elements immediately, each running its own render
  loop regardless of visibility. Mobile browsers commonly cap concurrent
  WebGL contexts around 8–16, so a 16-stage gallery could exhaust that
  limit outright, and even well within it, 16 live render loops plus 16
  sticky elements is real main-thread and GPU work happening constantly,
  on any device. `useLazyMount` (in `hooks.ts`) uses an `IntersectionObserver`
  to mount a stage's `<Canvas>` only once it's within ~65% of a viewport
  height away, and unmount it again once it's well past — freeing the GPU
  context and stopping the render loop for anything not actually on
  screen. Stages that are close but not yet live show a plain, static
  `next/image` of the "after" photo instead, so nothing pops in empty.
  Paired with `content-visibility: auto` on each stage's outer wrapper
  (a no-op in browsers that don't support it), the browser can also skip
  layout/paint work for stages far down the page entirely.
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
- The GPU benchmark in `device-tier.ts` runs once per mount and adds a
  small amount of idle-time work (a shader compile + a few draw calls at
  96×96). It's deferred via `requestIdleCallback` so it shouldn't compete
  with first paint, but if you're rendering many independent
  `CosmeticComparator` instances on one page, resolve the tier once
  yourself (`classifyDeviceTier()`) and pass it to each via
  `qualityOverride` rather than letting each instance benchmark separately.
- `content-visibility: auto` combined with `position: sticky` is
  well-supported in Chromium and current Safari; older WebViews that
  ignore it simply keep normal layout/paint behavior — it's an additive
  optimization, not a dependency.
