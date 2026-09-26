# cosmetic-clinic (Next 16.3 / App Router)

## /vN convention
Each /vN ports a reference site, self-contained. UI in `app/vN/**`, assets in
`public/vN/**`. Styles scoped to one wrapper (`#vN-root`); **nothing** targets
bare `html`/`body`/`:root`. Only global hook `html[data-vN-active]`, set on
mount and *restored* on unmount. Data via `app/vN/data.ts` behind a
`*Repository` seam for Prisma later. Scratch → `.tmp-<name>/` (gitignored).
**Per-route specs live in each route's README.**

## Pitfalls (each cost real time)
- **Isolation:** prefix every vendored selector with the route ID — an ID beats
  host utilities regardless of chunk order. Hand fixes double the wrapper
  (`#vN-root.vN-root`) to beat vendored per-element classes (1,3,0).
- Wrapper needs `isolation: isolate` (the reference paints bg on `<body>`, which
  propagates to the canvas; a negative-z child vanishes on a normal box) and
  `overflow-x: clip`, never `hidden` (clip preserves sticky/fixed).
- **Never regroup CSS by media query** — `.col-2-md`(768)/`.col-5-xl`(1200)
  override the same selector; bucketing lets the narrower win. Emit in order.
- **GSAP:** `gsap.timeline({scrollTrigger: vars})` does NOT adopt a pre-created
  `ScrollTrigger` — pass the vars object or the timeline runs free and snaps to
  its last keyframe. For `tt_animation`-style data: first effect per property
  name wins; only that one gets `immediateRender: true`.
- **RTL:** a physical-LTR reference under `<html dir="rtl">` must pin
  `direction: ltr; unicode-bidi: isolate` on the wrapper and RTL the copy
  elements only, else wide scroll strips re-anchor off-screen.
- Lenis owns the scroll: `window.scrollTo` is fought by its rAF loop — drive
  probes with `page.mouse.wheel`. `scrub:1.3` lags the scroll by 1.3s.
- Playwright: `page.evaluate(fn,a,b)` takes ONE arg — pass an object. No browsers
  downloaded; launch Chrome via `executablePath`.
- `next/image` deadlocks under a fully-clipped reveal ancestor — use plain
  `<img>`. A CSS-Module class added from JS needs `:global(.x)`.
- Next dev 403s on chunks from `127.0.0.1:3000`; use `localhost:3000`, and read
  its output for the port (it refuses a second instance).
- **`npx next build` never completes here** (wipes `.next`, takes `.next/lock`,
  idles at 0% CPU). Kill pids, `rm -rf .next/lock`, `npx next dev`. Gate on
  `tsc --noEmit` + `eslint` + a dev smoke test.

## Route index
/v10 · /v16 · /v22 · /v23 · /v24 — RTL Persian ports, each with its own README;
/v23 and /v24 GENERATE their stylesheet from the reference's CSS.

## /demo, /outreach
`/demo` outreach landing (noindex); `/outreach` console gated on
`OUTREACH_ENABLED="true"`. `/data/outreach/` is gitignored (real numbers).
Sending is click-to-chat `wa.me`, never automation. `server-only` is NOT a dep.
eslint's `react-hooks/set-state-in-effect` is an ERROR — hydrate with
`useSyncExternalStore`. Outreach copy: colloquial only, no sender/doctor name,
no link in the first message, always an opt-out line.
