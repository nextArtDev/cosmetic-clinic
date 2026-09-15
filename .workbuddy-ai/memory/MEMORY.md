# /v10 — NERVANA-port for an Iranian OB/GYN (دکتر مریف شریفی)

## Route shape

- `app/v10/` is a self-contained frontend port. `V10Shell` sets
  `html[data-v10-active]` while mounted and gates every global rule on
  that attribute, so the port is invisible outside `/v10`.
- Layout mounts `<SmoothScroll />` (Lenis), `<SiteHeader />`,
  `<Preloader />`, `<CustomCursor />`, `<ScrollProgress />`,
  `{children}`, `<Dialogs />`.
- `app/v10/lib/content.ts` is the single source of truth for copy,
  services, doctor profile, and reviews.
- Cart API is a mock at `app/v10/api/*` (in-memory, no Prisma).

## Motion stack

- GSAP + ScrollTrigger drives the entire `Experience` in
  `components/shiraz.tsx` (useGSAP).
- Framer Motion is used only for the light per-element reveals in
  `components/motion.tsx` (FadeUp / LineReveal / WordReveal). Do NOT
  use Framer for `clipPath` reveals — Chromium cannot interpolate the
  string reliably; use GSAP `fromTo` instead.
- CSS `@keyframes` for the marquees (no JS per frame) and the
  `v10-rotate` ring on the ticker.

## Reusable components

- `components/motion.tsx` — FadeUp, LineReveal, WordReveal, Magnetic,
  Marquee, RotatingText.
- `components/drag-scroller.tsx` — RTL-aware horizontal drag-to-scroll
  with momentum + click-through guard. Use `data-cursor="drag"` on the
  rail host.
- `components/cursor.tsx` — trailing 64px ring, 4 morph states
  (`view` / `drag` / `book` / `discover`), desktop pointers only.
- `components/preloader.tsx` — countdown → slide-up exit, auto-dismiss.
- `components/scroll-progress.tsx` — top hairline bar.

## CSS scope

- Every rule lives under `.v10`, every global rule is gated on
  `html[data-v10-active]`.
- Layout breakpoints: 900px (tablet), 700px (mobile). Hero gains
  `min-height: 100dvh` and reflows to a stacked column on ≤700px.
- Reduced-motion: marquees stop, reveal classes become `opacity:1;
  transform:none`, Lenis is disabled.

## Portrait assets

- `public/v10/assets/doctor-portrait.jpg` ← `public/images/doctors/2.jpeg`
- `public/v10/assets/doctor-clinic.jpg` ← `public/images/doctors/4.jpeg`
- `public/v10/assets/doctor-portrait-alt.jpg` ← `public/images/doctors/1.jpeg`

## Tests / smoke

- `.tmp-nervana/` (gitignored): scratch + Playwright smoke, screenshot
  capture, hero-fit matrix, proxy flag variants.
- `.screenshots/v10/` (gitignored): output PNGs.

## Pitfalls (full detail in 2026-09-14.md)

- Playwright `page.evaluate(fn, a, b)` takes ONE arg — wrap in object.
- Next dev returns 403 on chunks when `Origin` is `127.0.0.1:3000`;
  use `localhost:3000` for tests.
- Lenis ignores `scrollIntoView` / `window.scrollTo`; drive with
  `page.mouse.wheel` toward an ABSOLUTE target.
- Framer `whileInView` + `clipPath` is unreliable in Chromium.
- `next/image` lazy-load deadlocks under a fully-clipped reveal
  ancestor.
- Custom cursor: never `cursor.className = ...` in an applier — it
  strips `is-active`/`is-visible` added elsewhere and leaves the ring
  at opacity 0 while the native cursor is already hidden. Use
  `classList.remove` prev / `classList.add` next.
- Don't gate a custom cursor on `prefers-reduced-motion: reduce` —
  Chrome reports `reduce` whenever Windows "Show animations" is off,
  which silently disables it. Kill transitions in CSS instead.

# /v16 — Maya Shopify theme port (RTL/Persian, isolated demo route)

## Shape

- `app/v16/**` + `public/maya/**`. `MayaApp.tsx` composes the sections in the
  reference's order; `lib/data.ts` is the single source of truth for copy and
  products; `maya.css` (tokens) + `maya-motion.css` (section motion).
- Ports the theme's real `engine.js` (`gsapMayaaThemeExecution`) methods, keyed
  by each section's `methodCalled` attribute — exact `start`/`end`/`scrub`/target
  values. The offline mirror + extracted sections live in `.tmp-maya/`.
- Pinning = tall stage + `position: sticky` panel, never gsap `pin: true`
  (gsap pinning fights Lenis). Scroll distance matches the engine's `end` offset.

## Conventions

- RTL: horizontal animation signs are mirrored through `DIR = -1`.
- Marquees need `direction: ltr` on `.maya-scrollrow`/`-track` — under `rtl` a
  `width: max-content` track overflows *left* and `xPercent 0→-50` walks it off.
- `Reveal` (bits.tsx): when `stagger` is set it batches per `[data-rv]` child;
  a single trigger on a tall wrapper animates its lower rows off-screen.
- Any late layout growth invalidates every ScrollTrigger below it. `MayaApp`
  refreshes on `load` + a debounced `ResizeObserver` on `document.body`.
  Never let an in-flow `<img>` size an `auto` grid row — give the tile a
  definite aspect or `absolute inset-0` the image.

## Pitfalls

- `window.lenis` is a **stub** (only `version`), not the Lenis instance. Plain
  `window.scrollTo(0, y)` does land and stick — use it to park probes.
- gsap writes `matrix3d(...)` whenever `preserve-3d` is set; a "is it at rest?"
  check that only regexes `matrix(` treats a `scale: 20` deck as settled.
- `grid-area` is the **shorthand** for `grid-column` + `grid-row` (+ their
  `-start`/`-end` longhands). A stray `[grid-area:unset]` therefore clobbers
  `col-span-*`/`row-span-*` — it silently turned the `MediaGrid` 2×2 feature tile
  into a 1×1 cell and left a ~190px dead row.
- `MediaGrid` mosaic (4 tiles, `lg:grid-cols-4 lg:grid-rows-2`): tile 0 is the
  2×2 feature and tile 1 is `lg:row-span-2` — 4 tiles cannot cover 8 cells
  otherwise, and the spare cell shows as a hole. The row-spanning tiles must be
  `lg:absolute lg:inset-0`; the single-cell tiles must keep their in-flow
  `aspect-[4/2.1]` box, because that is what sizes the `1fr` rows (make them all
  absolute and the rows collapse to 0).
- `probe-audit.mjs` runs at scroll 0, so a *parallax* element still at its start
  offset can report a transient ancestor clip that is never visible (the footer
  wordmark: `y117`). `probe-mark2.mjs` parks at the bottom and measures the glyph
  rects (`Range.getClientRects`) against the clipper to settle it. Judge a hit by
  whether it is clipped **when on-screen**.
- Known deviation: the reference `media_grid` is a 16-tile Splide mosaic slider;
  this port renders 4 static tiles (`data.promoTiles`). Motion is faithful, tile
  count is not. Documented in `app/v16/README.md`.
- Probe scripts live in `scripts/maya/*.mjs`, run with
  `NODE_PATH="C:/Users/aria/.workbuddy-ai/binaries/node/workspace/node_modules"`
  and the managed node 22 binary against `http://localhost:3000/v16`.
