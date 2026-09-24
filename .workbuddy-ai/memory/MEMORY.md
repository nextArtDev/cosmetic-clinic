# Project memory — cosmetic-clinic (Next 16.3 / App Router)

## The /vN demo-route convention

Every `/vN` is a self-contained port of a reference site. Hard rules:

- All UI in `app/vN/**`; assets in `public/vN/**`.
- Styles are a CSS Module scoped under one wrapper class (`.experience`,
  `.jc-root`, …). **Nothing** targets bare `html`/`body`/`:root`.
- The only global hook is `html[data-vN-active]`, set by the route shell on
  mount and stripped on unmount. Gate any unavoidable global rule on it.
- Data comes from `app/vN/data.ts` behind a `*Repository` seam so Prisma can
  replace it. Copy is original mock content, never the reference's.
- Route-local Tailwind (if used) must be `prefix()`ed and preflight-free.
- Scratch goes to `.tmp-<name>/` (gitignored — add an entry per route).

## General pitfalls (verified)

- Playwright: `page.evaluate(fn, a, b)` takes ONE arg — wrap in an object.
- Next dev 403s on chunks when Origin is `127.0.0.1:3000`; use `localhost:3000`.
  `npx next dev` refuses a second instance — **read its output for the port**;
  this machine has served on :3001 as often as :3000.
- Lenis ignores `scrollIntoView`/`window.scrollTo`; drive probes with
  `page.mouse.wheel` toward an absolute target.
- Framer `whileInView` + `clipPath` is unreliable in Chromium — use GSAP `fromTo`.
- `next/image` lazy-load deadlocks under a fully-clipped reveal ancestor; use a
  plain `<img>` inside masks/parallax wrappers.
- Late layout growth (fonts, images) invalidates every ScrollTrigger below it —
  refresh on `load`, `document.fonts.ready` and a debounced resize.
- Custom cursor: never assign `className` wholesale (strips state classes added
  elsewhere). Don't gate it on `prefers-reduced-motion` — Chrome reports
  `reduce` whenever Windows "Show animations" is off.
- Don't nest `<a>` inside `<a>` — React hydration error.
- **CSS Modules:** a class added from JS (`el.classList.add('x')`) does NOT match
  `.x` in a `.module.css`. Import the name or write `:global(.x)`.
- gsap writes `matrix3d(...)` when `preserve-3d` is set — "at rest?" regex checks
  must handle both.
- `grid-area` is the shorthand for `grid-column` + `grid-row`; a stray
  `[grid-area:unset]` silently clobbers `col-span-*`/`row-span-*`.
- **`npx next build` never completes here** (3 attempts, incl. 40 min). It wipes
  `.next`, takes `.next/lock`, then idles at 0% CPU before compiling anything.
  Recovery: kill the build pids, `rm -rf .next/lock`, `npx next dev`, wait ~3 min.
  Gate changes on `tsc --noEmit` + `eslint` + a dev-mode smoke test instead.
- Windows tooling: `wmic` is gone, the PowerShell tool returns no stdout, and
  `file` is not on PATH — write output to a file and Read it, or shell out from
  node. `taskkill //PID` breaks under Git Bash path munging; use
  `node -e "process.kill(pid)"`.

## Playwright in this repo

- `playwright-core` is a devDep but **no browsers are downloaded**. Launch with
  `executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'`.
- Screenshots → `.screenshots/<route>/` (gitignored); scratch → `.tmp-<name>/`.
- Node's `fetch` sometimes connect-times-out against origins `curl` reaches fine;
  shell out to `curl` via `execFileSync` when a script must fetch.
- `sharp` IS installed — use it to crop/compare screenshots (`crop-region.mjs`,
  `compare.mjs` in `.tmp-jacques/`).

## Route notes

- **/v10** NERVANA (Persian OB/GYN). GSAP+ScrollTrigger for the whole
  `Experience`; Framer only for light reveals. Breakpoints 900/700.
- **/v16** Maya Shopify theme (RTL/Persian). Ports the theme's real `engine.js`
  values. **Palette is monochrome, never beige**: `#fff`/`#000`/`#f4f4f4`/
  `#dddddd`/`#f1f1f1`. `.maya-wrap` = 15px→20px@768, max 1370px@1200 /
  1790px@1441. Pinning = tall stage + sticky panel, never gsap `pin:true`. RTL
  marquees need `direction: ltr` on the track. Spec in `app/v16/README.md`;
  probes in `scripts/maya/*.mjs`.
- **/v22** Elitestone (آریاسنگ, RTL/Persian). `elitone.module.css` scopes under
  `.experience`; `elitone.global.css` emits only `html[data-v22-active]` rules
  (`font-size:10px`, `0.6944vw` from 1200px, 10px from 1900px — the reference's
  whole rem scale). Motion from `dist/js/main.min.js`: title
  `fromTo(lines,{autoAlpha:0,y:'100%',rotateX:-80,rotateZ:10},{delay:.025*i,
  duration:1.5,ease:'expo.out',clearProps:'all'})`; reel
  `to('.swiper-wrapper',{y:innerHeight/1.5})` with `scrub:true`; cursor
  `quickSetter` + lerp `1-Math.pow(.9,.06*deltaMs)`; preloader clipPath wipe.
  Tokens gold `#e0b16b`, cream `#ffeccf`, body `#495057`, ease
  `cubic-bezier(0.83,0,0.17,1)`. Reveals are declarative (`data-es-anim` /
  `data-es-reveal`) and `Experience` runs one `querySelectorAll` pass.
  `splitLines()` in `lib/engine.ts` reimplements SplitText: hard `\n` first, then
  words grouped by `offsetTop`; elements with child elements fall back to one
  masked row — keep animated elements plain text.
- **/v23** jacques-cie.com (دکتر پارسا و همکاران, RTL/Persian). See below.

## /v23 — jacques-cie.com port

Reference is a **Vue 3 + Vite SPA on headless Craft CMS** (not static). Harvest
its own artefacts, not its HTML: `dist/assets/app-*.css` + 8 per-component lazy
sheets; the *lazy JS chunks* hold the site's motion (the entry bundle only has
the GSAP/Lenis libraries); content via `POST /api/arepa/graphql` needing
`Authorization: Bearer <gqlToken>` + `Arepa-Csrf-Token: <csrf>` from
`GET /api/arepa/{get_gql_token,get_csrf_token}`. Without them it returns a
misleading `403 … doesn't have access to the "Français" site`.

`app/v23/`: `{layout,page}.tsx`, `{data,types,fonts}.ts`, `lib/engine.ts`,
`components/{Experience,Header,Hero,Blocks,Footer,Bits,Contact}.tsx`,
`styles/jacques.{module,global}.css`. Wrapper class `.jc-root`.

**`styles/jacques.module.css` is GENERATED** by `.tmp-jacques/port-css.mjs` from
the reference sheets. Hand edits go in `.tmp-jacques/overrides.css`, which the
script appends. Three traps it handles — all three caused real bugs:

1. **Stripping `[data-v-*]` also strips a unit of specificity.** Vue scoped CSS
   gets +1 class from the attribute, which is how `.c-footer__grid[data-v-x]
   {display:grid}` beats the *later* utility `.l-container{display:block}`. Drop
   it and the utility wins → the footer collapsed 4 cols → 1 (1577px → 792px
   once fixed). Fix: scoped-origin selectors get the wrapper doubled
   (`.jc-root.jc-root :global(...)`), tier included in the dedupe key.
2. **Never regroup rules by media query.** `.col-2-md` (768) then `.col-5-xl`
   (1200) override the same selector; bucketing into `Map<media, rules[]>`
   reorders by first-encounter so the narrower breakpoint wins. Walk the source
   in order and emit as you go.
3. **The wrapper needs `isolation: isolate`.** The reference paints its background
   on `<body>`, which propagates to the canvas (painted first) — so the hero photo
   at `z-index:-2` shows. On the wrapper, an ordinary in-flow box, it paints after
   negative-z descendants and vanishes.

Motion (from the bundle, exact): Lenis `duration:1.2, lerp:.6,
easing: min(1,1.001-2^(-8t))`; hero blur `blur(10rem)/scale(1.1)` → `blur(0)/
scale(1)` 200ms after mount, 1.6s, `CustomEase("0.66,0,0.34,1")`; hero overlay by
scroll **delta** ±0.004 clamped [0.1,0.4]; image parallax 130% wrapper / 30-130
travel / `scrub:.8`; banner `maxX` 60|50|40 and `maxY` -10|-30|-40 at xl|lg|below.
Header self-measures and publishes `--header-height` / `--header-with-logo-height`
(logo + 80) — upstream onto `document.body`, **here onto the wrapper**.
Measured parity: header 130px exact, with-logo 194.984375px exact, footer 792 vs
804, page height 7019 vs 7247.

Also: `.c-icon svg * { fill: currentColor }` turns stroked icons into solid
blobs — the port's outline icons need an explicit `fill: none`.

Not ported (deliberate): sub-routes (nav/cards use in-page anchors) and the
reference's `.c-overlay` (empty, full-screen, `pointer-events:auto` — it would
swallow clicks).

## Non-/vN routes: /demo and /outreach

- **`/demo`** — public outreach landing page (`app/demo/`), the single short link
  the sales campaign sends. `noindex`. Samples grouped by specialty, `/v1`
  booking funnel featured. `WHATSAPP_NUMBER` lives in `app/demo/data.ts`
  (the placeholder renders a setup banner on purpose).
- **`/outreach`** — internal console (`app/outreach/`, `app/api/outreach/`).
  Gated on `OUTREACH_ENABLED="true"`; 404 otherwise. Data:
  `data/outreach/contacts.json` (built by `scripts/build-outreach-contacts.mjs`)
  + `state.json`; **`/data/outreach/` is gitignored** (real phone numbers).
  Sending is click-to-chat `wa.me` links, never automation — bulk-sending from a
  personal number gets it banned.

### Pitfalls hit while building those

- `server-only` is **not** a dependency here — don't import it.
- eslint has `react-hooks/set-state-in-effect` as an **error**: hydrate from
  localStorage with `useSyncExternalStore`, not `useState` + `useEffect`.
- Keep node-importing modules out of client components (split shared types into
  their own file) or `node:fs` lands in the browser bundle.

### Outreach copy rules (operator-set, do not drift)

- Templates in `app/outreach/lib/templates.ts`, mirrored in
  `marketing/whatsapp-outreach-fa.md`. **Colloquial (شکسته) only** — no formal
  register. **No sender name, no doctor name in the message text** (the name is
  shown in the console UI for identification only). No link in the first message.
  Always an opt-out line.
- Priority tiers are stamped on the data, not computed in the UI: tier 1 =
  `+98913`, tier 2 = rest of Iran, tier 3 = abroad. Console defaults to tier 1.
- `scripts/probe-outreach.mjs` browser-verifies the console + /demo and cleans up
  `state.json` afterwards. It asserts colloquial-present AND formal-absent — run
  it when editing copy.
