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