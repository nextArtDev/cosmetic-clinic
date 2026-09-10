# v18 — Melius (ملیوس) frontend port

Open `/v18`. A port of the Persian "Melius" creative-AI frontend from
`C:\Users\aria\Desktop\chat-clone\melus-v2` (`src/app/melius` +
`src/features/melius`), itself a Persian adaptation of the public
https://www.melius.com/ site (not a pixel-perfect reproduction of its
proprietary WebGL scene). Pricing, credits, plans and generation are demo
content only; the UI states this. Replaces the earlier Hezar Frame port that
this route previously carried. Tests (`tests/melius.smoke.mjs`) were
intentionally not ported, per request.

## Isolation (nothing outside these additions is modified)

- `app/v18/**` — the whole experience. `MeliusExperience.tsx`, `data.ts` and
  `Melius.module.css` carry the upstream content with only three token-level
  differences (font-face source line, lucide import aliases, video file
  extension — all listed below).
- `app/api/melius/demo/route.ts` — additive endpoint the UI already calls;
  validation and response contract identical to upstream
  (`src/app/api/melius/demo/route.ts`).
- `public/melius/**` — additive assets only.
- No change to `app/layout.tsx`, `app/globals.css`, the home page, any other
  `/vN` route, `next.config.mjs`, `postcss.config.mjs`, Prisma schema or
  dependencies (framer-motion and lucide-react were already present).

`Melius.module.css` scopes every rule through hashed CSS-Module classes on the
`.root` wrapper (its custom props are declared there, never on `:root`).
`melius.tailwind.css` is a dedicated Tailwind v4 CSS-first entry with the
`mel:` prefix, a local `@source` allowlist and **no Preflight** — it cannot
affect the application's utilities or theme. Only the `@source` path differs
from upstream (the feature files live inside `app/v18/` here instead of
`src/features/melius/`).

## Differences from upstream (intentional, minimal)

1. **Font**: the upstream `public/melius/fonts/` shipped only `OFL.txt` — its
   `Vazirmatn.woff2` binary is missing from the source project. As in `/v17`,
   the variable TTF of the official `vazirmatn` package (v33.0.3) is served at
   `/melius/fonts/Vazirmatn.ttf` and the single `@font-face` line switches
   `src` accordingly (`format('truetype-variations')`, weight range 100-900,
   family `MeliusVazir` unchanged). License: SIL OFL 1.1 (`fonts/OFL.txt`).
2. **lucide-react**: this repo pins v1.33.0, which dropped the legacy aliases
   `Globe2` and `Layers3`. The import uses their current names with local
   aliases (`Earth as Globe2`, `Layers as Layers3`), so the component body is
   unchanged.
3. **Persistence**: upstream saved demo requests into a Drizzle/Postgres table
   (`melius_demo_requests`) via `server/repository.ts`. This repo has no
   Drizzle and its database must stay untouched, so — the same pattern as
   `/v17` — `app/v18/_server/demo-repository.ts` keeps the exact API contract
   (`{ id }`) with a non-persistent in-memory adapter. The API route is
   otherwise identical to upstream (same validation, same demo-image mapping).
4. **Metadata**: title/description moved from the route layout into
   `page.tsx` per this repo's `/vN` convention, plus
   `robots: { index: false, follow: false }` and a "| v18 demo" title suffix.

## Assets (all under `public/melius/`)

The upstream project referenced `/melius/images/*.webp` but shipped no image
binaries, and melius.com serves its media client-side (not harvestable), so
the gallery was re-sourced from Wikimedia Commons (open licenses), matched to
the mock's own art direction, converted to WebP (sharp, max 1600px, q82):

- `hero-1` perfume bottle droplets / `hero-2` abstract expressionism "Fathers
  will live" (Fons Heijnsbroek) / `hero-3` made-to-order patina leather shoe /
  `hero-5` film set Moscow / `hero-7` + `hero-11` Sheikh Lotfollah mosque
  Isfahan ceiling / `hero-10` foggy old growth forest / `hero-16` orange juice
  in sunny backyard / `hero-17` "Slow Journey in Monochrome" (Ariel López
  Arancibia) / `hero-19` "Splash and Colors of Joy" Holi / `hero-20` vintage
  Kodak folding camera / `hero-23` "Amour de Minuit" dark red rose / `hero-24`
  "Morning Light Harmony" terraces / `product` canvas sneaker studio shot /
  `coin` 2018 Jerusalem gold coin.
- `agencies.mp4` — ArtHouse Studio / Pexels, video 6573930, HD 1920×1080 24fps
  (the same credited cinematic film the source project used for its earlier
  showreel). The upstream webm binary was unobtainable (Wikimedia rate-limited
  the fetch mid-session), so the one token in `MeliusExperience.tsx` changed
  `agencies.webm` → `agencies.mp4` to match the actual container.
- `fonts/Vazirmatn.ttf` + `OFL.txt` — Vazirmatn, SIL OFL 1.1.

The prompt→image mapping in the demo API (forest→10, leather shoe→3,
flower/Isfahan→23, orange drink→16) stays intact with these picks. Review the
per-file Commons licenses (CC BY / CC BY-SA) before any public/production use.

## Verification performed

- `bun run typecheck`, scoped ESLint on `app/v18` + `app/api/melius`.
- Dev-server smoke test: `/v18` renders the experience (RTL, hero, module CSS,
  fonts, gallery) and `/` renders the production home page unchanged;
  `POST /api/melius/demo` returns `201` demo receipts (signup/generate) and
  `400` on invalid payloads; `git status` shows only the new additive paths.
