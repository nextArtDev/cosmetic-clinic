# v17 — Privy (Sobha Privy Collection) frontend port

Open `/v17`. A byte-exact port of the Persian "Privy" concept frontend from
`C:\Users\aria\Desktop\chat-clone\sobha-privy-collection` (`src/app/privy`),
which itself is a concept reinterpretation of https://sobha-privy-collection.com/.
Project names, specifications, geography and inquiries are demo content only.

## Isolation (nothing outside these additions is modified)

- `app/v17/**` — the whole experience. `PrivyExperience.tsx`, `data.ts`,
  `privy.module.css`, `privy.tailwind.css` are copied byte-exact from the
  upstream project.
- `app/api/privy/inquiries/route.ts` — additive endpoint the form already
  calls; validation identical to upstream.
- `public/privy/**` — additive assets only.
- No change to `app/layout.tsx`, `app/globals.css`, home page, any `/vN`,
  `next.config.mjs`, `postcss.config.mjs`, Prisma schema or dependencies
  (framer-motion and lucide-react were already present).

`privy.module.css` scopes every rule through hashed CSS-Module classes on the
`.experience` wrapper (its custom props are declared there, never on `:root`).
`privy.tailwind.css` is a separate Tailwind v4 CSS-first entry with the `pv:`
prefix, a local `@source` allowlist and **no Preflight** — its variables are
`--pv-*` and it cannot affect the application's utilities. Only two lines
differ from upstream content (both required by environment, documented below).

## Differences from upstream (intentional, minimal)

1. `privy.module.css` font-face: the upstream `Vazirmatn.woff2` binary was not
   recoverable from the source project (only its `OFL.txt` survived), so the
   variable TTF from the official `vazirmatn` npm package (v33.0.3,
   `fonts/variable/Vazirmatn[wght].ttf`) is served as `/privy/fonts/Vazirmatn.ttf`
   with `format('truetype-variations')`. Family name `PrivyVazir` is unchanged.
2. `data.ts`: the Caspian residence image path uses `caspian.webp` (the sourced
   asset is WebP) instead of `caspian.jpg`.
3. The inquiry repository (`app/v17/_server/inquiry-repository.ts`) keeps the
   upstream API contract but persists in memory (60s duplicate window) instead
   of the upstream Drizzle/Postgres table — the clinic's database stays clean.

## Assets (all under `public/privy/`)

Sourced from the original site (lazy-loaded `@md/@xxl` renditions) and its
Kinescope video host, to reproduce the exact art direction:

- `images/hero.jpg` + `intro.mp4` — Kinescope asset `sobha_ribbons_loop_v4`
  (poster 2560×1440 + 1080p H.264 fMP4 loop) of the metallic-ribbon hero.
- `images/sublime.webp` — original `5.sublime/background@xxl` (2016×1092).
- `images/interior.webp` — original `7.tenets/background@xxl` (2016×1680).
- `images/penthouse.webp` — original `2.luxury-homes/top-large@xxl` (840×1204).
- `images/caspian.webp` — original `11.journey/background@xxl` (2016×2770).
- `images/villa.jpg` — Ahmet ÇÖTÜR / Pexels, photo 28054849 (same credit as
  upstream README).
- `fonts/Vazirmatn.ttf` + `OFL.txt` — Vazirmatn, SIL OFL 1.1.

Verify reuse rights of site-derived imagery before any public/production use.

## Verification performed

- `bun run typecheck` and scoped ESLint on `app/v17` + `app/api/privy`.
- Dev-server smoke test: `/v17` renders the experience (RTL, `data-privy-root`)
  and `/` renders the production home page unchanged; `git status` shows only
  the new files listed above.
