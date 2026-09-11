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
  lint adaptations in the component (see below). `flowers.tailwind.css` keeps
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

## Verification performed

- `bun run typecheck`, scoped ESLint on `app/v19` + `app/api/flowers`.
- Dev-server smoke test: `/v19` renders the experience (RTL, hero, module CSS,
  fonts, catalog) and `/` renders the production home page unchanged;
  `POST /api/flowers/orders` returns `201` mock receipts and `400` on invalid
  payloads; `POST /api/flowers/contact` returns the mock acknowledgment;
  `git status` shows only the new additive paths.
