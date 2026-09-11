# v19 — گل / سیم (Flowers Sim) frontend port

Open `/v19`. A port of the Persian "گل / سیم" (Flowers Sim) monobouquet shop
frontend from `C:\Users\aria\Desktop\chat-clone\flower` (`src/app/flowers`),
itself a Persian recreation of the public https://flowers-sim.ru/ homepage,
following the proven /v7 → /v18 isolation pattern. Pricing, orders and
messages are demo content only; the UI states this.

## Isolation (nothing outside these additions is modified)

- `app/v19/**` — the whole experience. `FlowersExperience.tsx`,
  `_lib/catalog.ts` and `FlowersExperience.module.css` are **verbatim copies**
  of upstream (relative imports keep working), with two behavior-preserving
  lint adaptations in the component (see below). `_components/FlowersMotion.tsx`
  + `FlowersMotion.module.css` are the **new, additive** motion layer that
  restores the original site's animations (see "Motion layer" below).
  `flowers.tailwind.css` keeps
  the upstream contract (`fl:` prefix, `source(none)`, no Preflight) but uses
  the repo-proven /v18 import form (`layer(...) prefix(fl)`), because this
  repo's Tailwind 4.3.3 ignores the bare-import `prefix(fl)` and emits
  unprefixed `.hidden`/`.transition` (candidates leaked from the module CSS
  text) — the adaptation emits only `.fl\:*` utilities and scans only
  `FlowersExperience.tsx`, so it cannot affect the application's utilities.
- `app/api/flowers/orders/route.ts` + `app/api/flowers/contact/route.ts` —
  verbatim upstream mock endpoints (the URLs the UI already calls), so the
  component body needed **zero** changes. Both are DB-free; orders returns a
  `SIM-…` receipt (no payment, no persistence). The only edit is the catalog
  import path (`@/app/flowers/_lib/catalog` → `@/app/v19/_lib/catalog`).
- `public/flowers/**` — additive assets only (see below).
- No change to `app/layout.tsx`, `app/globals.css`, the home page, any other
  `/vN` route, `next.config.mjs`, `postcss.config.mjs`, Prisma schema or
  dependencies (motion and lucide-react were already present; every imported
  lucide icon verified in v1.33.0).

`FlowersExperience.module.css` scopes every rule through hashed CSS-Module
classes on the `.experience` wrapper (custom props and the `SimVazir`
`@font-face` are declared there, never on `:root`/document). Client-side DOM
writes are limited to the modal focus trap (body overflow restored on
unmount) and the namespaced `sim-flowers-cart-v1` localStorage key.
`flowers.tailwind.css` can only emit `.fl\:*` utilities used inside
`app/v19/_components`, so it cannot affect the application's utilities or
theme. The metadata moves from the upstream route layout into `page.tsx` per
this repo's `/vN` convention, plus `robots: { index: false, follow: false }`
and a "| v19 demo" title suffix. The `lang`/`dir` wrapper lives on the
`/v19` layout div, not on `<html>`.## Differences from upstream (intentional, minimal)

1. **Tailwind entry**: see above — the repo-proven /v18 import form replaces
   the upstream bare import, and `@source` scans only the component file.
2. **Lint adaptations in `FlowersExperience.tsx`** (behavior-preserving, to
   satisfy this repo's newer `eslint-plugin-react-hooks`): the
   `closeRef.current = …` render-phase write moved into a run-every-render
   `useEffect`, and the post-mount localStorage cart hydration effect is
   wrapped in `eslint-disable react-hooks/set-state-in-effect`. Runtime
   behavior is identical to upstream.
3. **Metadata**: title/description moved from the route layout into
   `page.tsx` per this repo's `/vN` convention, plus
   `robots: { index: false, follow: false }` and a "| v19 demo" title suffix.
4. **API import path**: the orders route imports the catalog from
   `@/app/v19/_lib/catalog`; everything else in both API routes is verbatim
   upstream.

## Assets (all under `public/flowers/`)

The upstream project referenced `/flowers/*.webp`, `blossom.mp4` and
`vazirmatn.woff2` but shipped only `OFL.txt` — every media binary was missing
from the source project. Assets were re-sourced from the original
https://flowers-sim.ru/ (a Tilda site; `static.tildacdn.com` CDN), matched to
each slot by the original page's DOM structure (Tilda record blocks) and
AI-image filenames, then converted to WebP (sharp, max 1600px, q82):

| slot | source (flowers-sim.ru block) |
| --- | --- |
| `hero.webp` | `m-vasilyev_Fashionab.png` — hero artboard portrait |
| `blossom.mp4` | `m-vasilyev_A_white_o.mp4` — header "Catalog ®" preview video |
| `quiet.webp` | `kseniya0686_White_ca.jpg` — "single flower, quietly" story |
| `gift.webp` | `CRAFTCRIMINALS_a_bea.jpg` — "bouquet as an emotional gesture" story (also the gift category, as upstream shares one file) |
| `interior.webp` | `mingyun0753_A_cozy_c.jpg` — "an extension of your space" story |
| `calla.webp` | `ponderchen_white_cal.jpg` — white calla store product |
| `tulip.webp` | `jfar_39030_A_white_t.jpg` — "The tulip — white" store product |
| `iris.webp` | `juliaabasova_A_viole.jpg` — violet store product (پرپل → زنبق) |
| `daisy.webp` | `adhock_A_single_dais.jpg` — daisy store product |
| `home.webp` | `kwcreative_4k_studio.jpg` — "For the house" category |
| `office.webp` | `mbwebmaster_a_vibran.jpg` — "For the office" category |
| `event.webp` | `magickandhealing_Rea.jpg` — "For the event" category |
| `vazirmatn.woff2` | identical file already shipped at `public/maya/vazirmatn.woff2` |
| `OFL.txt` | verbatim from upstream |

The original site reserves all rights on its imagery — same caveat as the
upstream recreation; review before any public/production use.

## Motion layer (`_components/FlowersMotion.*`)

The upstream recreation kept the layout and copy but dropped most of the
original's motion. This layer restores it. It is a **purely additive**
pair of files — nothing in `FlowersExperience.tsx`'s markup contract changed,
and every primitive is opt-in. All nine behaviours below were derived from
the raw Tilda page (`static.tildacdn.com`, project 20781156 / page 112456266):
46 inline scripts, 145 `data-animate-sbs-*` configs (25 distinct groups:
29 intoview fade-in, 24 hover opacity-swap, 17 scroll/pin) and 31 live
scroll screenshots were captured to establish ground truth.

| primitive | original source | notes |
| --- | --- | --- |
| `NoiseOverlay` | `inline/40` (`noise.gif`, 70px tile, 15% opacity, fixed) | recreated as an inline SVG-turbulence tile — no binary asset needed |
| `BlurText` | GSAP 3.11.4 + SplitType + ScrollTrigger (`inline/43`) | reveals on scroll-in with a blur+opacity stagger; **splits per word**, not per character, because Arabic-script glyphs lose their cursive joins when split |
| `LinkSlide` | duplicated `data-content` label, `transform: translateY` on hover | measured live: mask `13px/13px` + `overflow:hidden`, duplicate label at `top:13px`, alt colour `#a72d25` |
| `CursorLayer` | StringTune StringCursor, lerp `0.75` | hover preview follows `[data-flower-cursor]` / `[data-flower-cursor-label]`; **native cursor is preserved** (the original never sets `cursor:none`) |
| `StickyHeader` | fixed 120px bar `rec1835390891`, slides in after ~82% of the first screen | includes logo, nav, preview thumbnail, scroll progress and cart |
| `PinnedShowcase` | 4686px pinned cross-fade, `rec1825455681` | four full-bleed layers pinned over `count * 100vh`; per-layer opacity via `useTransform`, `fade = 0.45 / count` |
| `ZoomLightbox` | tilda-zoom (8 zoomable images on the original) | one overlay for the route's three zoom hosts — story, space and product detail |
| `Rule` | literal `11111111111` runs | **static** hairline — the original runs are not animated, so neither is this |
| `useSmoothScroll` | SmoothScroll.js `{stepSize:80, animationTime:1400}` | Lenis 1.3.26 replacement, desktop fine-pointer + non-reduced only; returns a `scrollTo(id)` that anchors use |

Two supporting details:

- **`useSafeReducedMotion`** replaces `useReducedMotion()`. The latter reads
  the media query during the first client render, so a reduced-motion visitor
  hydrates against server HTML rendered with motion enabled (React logged a
  mismatch for `scale(1.035)` and `autoPlay`). The wrapper reports `false` on
  the server and first client render, then applies the real preference in an
  effect — same shape as the existing cart-hydration effect.
- **Reduced-motion fallbacks**: `PinnedShowcase` swaps to a `.pinStatic` grid
  (absolute layers would otherwise collapse to zero height), `CursorLayer`
  and the grain layer are hidden, and `useSmoothScroll` never initialises.

### Deliberately *not* ported

These are original-site features that were reviewed and skipped on purpose:

- `cursor: none` — the original does **not** hide the native cursor, so
  neither do we.
- Tilda's animated marquee — the `11111111111` runs are static in the
  original (see `Rule`).
- Tilda cart modal (type 706) and tilda-slds product popups — the route
  already ships its own cart/modal UI, and the upstream recreation never
  wired them.

## Verification performed

- `bun run typecheck`, scoped ESLint on `app/v19` + `app/api/flowers`.
- Dev-server smoke test: `/v19` renders the experience (RTL, hero, module CSS,
  fonts, catalog) and `/` renders the production home page unchanged;
  `POST /api/flowers/orders` returns `201` mock receipts and `400` on invalid
  payloads; `POST /api/flowers/contact` returns the mock acknowledgment;
  `git status` shows only the new additive paths.
- **Motion layer** (headless Chromium, live dev server): desktop 1440×900,
  mobile 390×844 and `prefers-reduced-motion: reduce` all render with **zero
  console/page errors**; the grain, sticky header and pinned showcase appear
  on `/v19` and are absent on `/`, `/v18` (`/v20` and `/v21` keep their own
  pre-existing grain layers); mobile reports no horizontal overflow; the
  reduced-motion pass swaps the pin for `.pinStatic` (4 cards), hides the
  cursor layer and leaves the blur spans readable.
- Production build (`next build`) and a `/v19` production smoke test.
