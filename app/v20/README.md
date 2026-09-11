# v20 — IRANFIT (ایرون‌فیت) frontend port

Open `/v20`. A port of the Persian "IRANFIT" fitness landing from
`C:\Users\aria\Desktop\chat-clone\atumobile` (`src/app/iranfit`), itself a
Persian re-imagining of the structure and art direction of
https://www.atumobile.com/ (Steve Zim's ATU Mobile training site: 8-month
program accordion, "Superhero Nutrition" book section, coach intro, pricing
table, streaming section, testimonials, news carousel). All copy is original
Persian mock content; names, prices, plans and contact details are fictional.

## Isolation (nothing outside these additions is modified)

- `app/v20/**` — the whole experience (16 client components, `iranfit.css`
  design system, `data/` mock seam, `lib/` anim + fa helpers, `layout.tsx`,
  `page.tsx`, `fonts.ts`). Copied from upstream with only the differences
  listed below.
- `app/api/v20/content/route.ts` — additive endpoint mirroring the upstream
  `/api/iranfit/content` route (same `IranfitContent` contract).
- `public/v20/**` — additive assets only (font + three photos).
- No change to `app/layout.tsx`, `app/globals.css`, the home page, any other
  `/vN` route, `next.config.mjs`, `postcss.config.mjs`, Prisma schema or
  dependencies (gsap, framer-motion and lucide-react were already present).

`iranfit.css` scopes every rule under the `.iranfit-root` wrapper (its
`--if-*` custom props are declared there, never on `:root`), including the
previously unscoped `[data-if-reveal]` initial-hidden rule, which is now
`.iranfit-root [data-if-reveal]`. `Landing` renders `dir="rtl"` on that same
wrapper, so the document-level `lang`/`dir` (owned by the root layout) are
untouched. The route does not use Tailwind utilities at all, so it cannot
collide with the app's classes (`if-*` prefix is unique to this route,
verified by grep). Transient runtime touches (menu/video scroll-lock via
`documentElement.style.overflow`, GSAP ScrollToPlugin's automatic
`scroll-behavior: auto` reset while animating) restore themselves on cleanup
and cannot affect other routes.

## Differences from upstream (intentional, minimal)

1. **Font**: upstream loaded Vazirmatn via `next/font/google`, unreliable from
   this app's Iran-network build environment. As in `/v17` and `/v18`, the
   variable TTF of the official `vazirmatn` package (v33.0.3) is self-hosted
   at `public/v20/fonts/Vazirmatn.ttf` (SIL OFL 1.1, `fonts/OFL.txt`) and
   `fonts.ts` serves it through `next/font/local`. The `--font-iranfit`
   variable name and the CSS consumption in `iranfit.css` are unchanged.
2. **Data seam**: upstream read plans/testimonials/posts from a Drizzle/
   Postgres schema and fell back to the bundled mock. This repo's database
   must stay untouched, so `data/index.ts` keeps the exact
   `getIranfitContent(): Promise<IranfitContent>` contract but serves the
   bundled mock directly (the same pattern as `/v17` and `/v18`). Components
   are unchanged.
3. **lucide-react**: this repo pins v1.33.0, which dropped the legacy alias
   `DownloadCloud`. `AppSection.tsx` imports its current name with a local
   alias (`CloudDownload as DownloadCloud`), so the component body is
   unchanged.
4. **Metadata**: title/description moved from the route layout into
   `page.tsx` per this repo's `/vN` convention, plus
   `robots: { index: false, follow: false }` and a "| v20 demo" title
   suffix.
5. **`[data-if-reveal]` CSS rule**: scoped under `.iranfit-root` (see
   Isolation) — same computed styles inside the route, but it can no longer
   match any element outside it.

## Assets (all under `public/v20/`)

Upstream shipped no `public/` folder — its three local images
(`/iranfit/media/hero|nutrition|coach.jpg`) 404'd even in the source project,
and Pexels (its remote media) is unreachable from this network. Following the
user's direction to source from the original site, the three slots are filled
from https://www.atumobile.com/ (same art direction the upstream design
imitates):

- `media/hero.jpg` — `section_main_bg.jpg` (1920×1100), the site's hero
  background.
- `media/nutrition.jpg` — `section_orderbook_bg.jpg` (1489×980), the book
  section's background photo.
- `media/coach.jpg` — `section_about_item.jpg` (630×634), the Steve Zim
  portrait used in the original's "Meet Steve Zim" gallery.
- `fonts/Vazirmatn.ttf` + `OFL.txt` — Vazirmatn, SIL OFL 1.1.

News-card and phone-screen photos stay on their upstream Pexels URLs (they are
part of the mock data); the hero demo video likewise keeps the upstream
Pexels video/poster URLs in `Landing.tsx`. On networks where Pexels is
filtered these simply show the poster/alt, exactly as upstream shipped.
Verify reuse rights of site-derived imagery before any public/production
use.

## Verification performed

- `bun run typecheck` and scoped ESLint on `app/v20` + `app/api/v20`.
- Dev-server smoke test: `/v20` renders the landing (RTL, `.iranfit-root`,
  dark theme, GSAP reveals) and `/` renders the production home page
  unchanged; `git status` shows only the new files listed above.
