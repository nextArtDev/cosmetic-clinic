# Project memory — cosmetic-clinic (Next 16 / App Router)

## The /vN demo-route convention

Every `/vN` is a self-contained port of a reference site. Hard rules:

- All UI lives in `app/vN/**`; assets in `public/vN/**`.
- Styles are a CSS Module scoped under one wrapper class (`.experience`,
  `.iranfit-root`, …). **Nothing** targets bare `html`/`body`/`:root`.
- The only global hook allowed is an attribute the route shell sets while
  mounted and strips on unmount: `html[data-vN-active]`. Gate any unavoidable
  global rule on it.
- Data comes from `app/vN/data.ts` behind a `*Repository` seam so Prisma can
  replace it later. Copy is original mock content, never the reference's.
- Route-local Tailwind (if used) must be `prefix()`ed and preflight-free.

## General pitfalls (verified)

- Playwright: `page.evaluate(fn, a, b)` takes ONE arg — wrap in an object.
- Next dev 403s on chunks when Origin is `127.0.0.1:3000`; use `localhost:3000`.
- Lenis ignores `scrollIntoView` / `window.scrollTo`; drive probes with
  `page.mouse.wheel` toward an absolute target.
- Framer `whileInView` + `clipPath` is unreliable in Chromium — use GSAP
  `fromTo`.
- `next/image` lazy-load deadlocks under a fully-clipped reveal ancestor; use
  plain `<img>` inside masks/parallax wrappers.
- Late layout growth (fonts, images) invalidates every ScrollTrigger below it —
  refresh on `load`, `document.fonts.ready` and a debounced resize.
- Custom cursor: never assign `className` wholesale (strips state classes added
  elsewhere). Don't gate it on `prefers-reduced-motion` — Chrome reports
  `reduce` whenever Windows "Show animations" is off.
- Don't nest `<a>` inside `<a>` — React hydration error.
- **CSS Modules gotcha:** a class added from JS (`el.classList.add('x')`) does
  NOT match `.x` in a `.module.css`. Import the name or write `:global(.x)`.
- gsap writes `matrix3d(...)` when `preserve-3d` is set — regex "at rest?"
  checks must handle both.
- `grid-area` is the shorthand for `grid-column` + `grid-row`; a stray
  `[grid-area:unset]` silently clobbers `col-span-*`/`row-span-*`.
- **`npx next build` never completes here** (3 attempts, incl. 40 min). It
  wipes `.next`, takes `.next/lock`, then idles at 0% CPU before compiling
  anything. Not the safe-delete guard; not a concurrent `next start`.
  Recovery: kill the build pids, `rm -rf .next/lock`, `npx next dev`, wait
  ~3 min. Gate changes on `tsc --noEmit` + `eslint` + dev-mode smoke instead.
- Windows tooling: `wmic` is gone and the PowerShell tool returns no stdout —
  write output to a file and Read it, or shell out from node
  (`child_process.execSync('tasklist ...')`). `taskkill //PID` breaks under
  Git Bash path munging; use `node -e "process.kill(pid)"`.

## Playwright in this repo

- `playwright-core` is a devDep but **no browsers are downloaded**. Launch with
  `executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'`.
- Screenshots go to `.screenshots/<route>/` (gitignored); scratch to
  `.tmp-<name>/` (gitignored, add a `.gitignore` entry per route).

## Route notes

- **/v10** NERVANA port (Persian OB/GYN). GSAP+ScrollTrigger for the whole
  `Experience`; Framer only for light reveals. Breakpoints 900/700.
- **/v16** Maya Shopify theme port (RTL/Persian). Ports the theme's real
  `engine.js` values. **Palette is monochrome, never beige**: `#fff` / `#000` /
  `#f4f4f4` / `#dddddd` / `#f1f1f1`. `.maya-wrap` = 15px→20px@768, max
  1370px@1200 / 1790px@1441. Pinning = tall stage + sticky panel, never gsap
  `pin:true`. RTL marquees need `direction: ltr` on the track. Spec in
  `app/v16/README.md`; probes in `scripts/maya/*.mjs`.
- **/v22** Elitestone port (آریاسنگ, RTL/Persian). See below.

## /v22 — Elitestone (elitestone.it) port

Shape: `app/v22/{data,fonts}.ts`, `app/v22/lib/engine.ts`,
`app/v22/components/{Experience,Navigation,Hero,Sections,Footer,Lightbox,
Cursor,Preloader,bits}.tsx`, `elitone.module.css` + `elitone.global.css`
(only `html[data-v22-active]` rules: `font-size: 10px`, `0.6944vw` from
1200px, 10px from 1900px — the reference's whole rem scale depends on it).

Motion values lifted from the reference's `dist/js/main.min.js`:

- title: `fromTo(lines, {autoAlpha:0,y:'100%',rotateX:-80,rotateZ:10},
  {delay:.025*i, duration:1.5, ease:'expo.out', ..., clearProps:'all'})`
- excerpt: parent `clipPath: polygon(0 0,100% 0,100% 110%,0 110%)`, then lines
  `y:'100%'→0`, `delay:.015*i`, `clearProps`, `clipPath:'none'` onComplete
- reel: `timeline({scrollTrigger:{trigger:header,start:'top top',scrub:true}})
  .to('.swiper-wrapper',{y: innerHeight/1.5})`
- preloader: counter out → viewport `fromTo({autoAlpha:.25,y:innerHeight/1.25},
  {duration:1.5,ease:'expo.out'})` → panel `clipPath` wipe down
- cursor: `gsap.quickSetter` + lerp `c = 1 - Math.pow(.9, .06 * deltaMs)`
- product tile hover: `translateY(tile/7) rotate(135deg) scale(0.75)` + long
  shadow. Post cover hover: `img scale(0.6)` + marquee reveal.

Tokens: gold `#e0b16b`, soft `#f0cf9d`, cream `#ffeccf`, body `#495057`,
dark `#1a1a1a`, dim `#adb5bd`; ease `cubic-bezier(0.83,0,0.17,1)`.

Reveals are declarative: components carry `data-es-anim="title|excerpt|
separator"` or `data-es-reveal` (+ `-children`/`-y`/`-delay`), and `Experience`
runs one `querySelectorAll` pass over them inside `gsap.context`.

`splitLines()` in `lib/engine.ts` reimplements SplitText (paid): honours hard
`\n` first, then groups words by `offsetTop`. Elements with child elements fall
back to one masked row — keep animated elements plain text.

`public/v22/img/*.jpg` were HTML error pages, not images; replaced with real
Unsplash photos (15 files).

## /v9 — Rafaela Salvato port (dental clinic, RTL/Persian)

`app/v9/{fonts.ts,globals.css}`, `app/v9/lib/{content,use-page-motion}.ts`,
`app/v9/components/{home-page,sections,visuals,site-shell,comparison-section,…}`.
Salvato is a *dermatology* template re-authored for کلینیک دکتر سپیده نادری;
every `/v9/images/*` asset is dental stock, not the source's.

**The design language** (what makes a new component belong here):
- Tokens: `--cream #f7f5f1`, `--plum #58476d`, `--ink #3d3d3d`, `--pink`,
  `--yellow`, `--mint`, `--purple`. `--sans` = Shabnam, `--display` =
  FarsiAdad. Never `:root`; everything hangs off `.v9` / `html[data-v9-active]`.
- Signature frames are **asymmetric radii**: `20px 60px` (treatment cards,
  contact backdrop), `120px 20px` (technology video), `20px 216px 216px 216px`
  (specialty/contact photo).
- Every band is **one viewport** (`height: 100svh` / `85svh` / fixed px) and
  either a 50/50 copy+art split or a centred stack — not a plain
  "head + grid + padding" block.
- On-photo elements are **white**: `.card-outline` (inset 18px, `1px solid
  #ffffff80`, radius `12px 44px`, hover `#ffffffd0`), `.card-shade`
  (`linear-gradient(0deg, #30253177, transparent 55%)`), `.treatment-card h2`
  (display 28px/64px, `bottom: 9px`), `.card-arrow` (white, opacity 0 →
  translate(7px,7px) on hover). Controls use `.video-toggle`'s glass:
  `1px solid #ffffff70` + `#34263930` + `backdrop-filter: blur(8px)`.
- Hover on a photo card = the **image** scales 1.055 under a static frame
  (`transition: transform 1s cubic-bezier(0.22,1,0.36,1)`).
- Reveals are declarative: `data-word-reveal` / `data-reveal` /
  `.organic-backdrop`, all handled by `usePageMotion`. Drifting offset outlines
  (`.specialty-outline`, `.technology-outline`) are a signature — a new section
  with a frame should add one.

**`/v9` results section** (`components/comparison-section.tsx` + the
`.compare-*` block in `globals.css`, placed after `SpecialtySections`):
- The card IS a treatment-card clone; the comparator wipe lives inside it.
- Plates: `public/v9/images/results/{orthodontics,implant,scaling,prosthesis}-{before,after}.webp`,
  regenerated by `scripts/v9/build-results.mjs [srcDir]` — sharp crops every
  plate of a pair to the **same 5:4 window** as `.compare-frame`, otherwise the
  two layers misalign through the wipe.
- The wipe is a CSS var (`--compare-split`, fraction from the frame's physical
  left; "after" occupies the left so RTL still opens on the before side) written
  **imperatively** on pointermove — no React state, or the drag goes sticky.
- The divider must live **inside** `.compare-media` (the element that scales on
  hover); outside it, the clip edge drifts away from the line as the plate grows.
- `scripts/v9/results-probe.mjs [baseUrl]` — 17 assertions (plates decode, drag,
  knob travel, hover scale/arrow/outline, keyboard, mobile column count).

## Non-/vN routes: /demo and /outreach

- **`/demo`** — public outreach landing page (`app/demo/`), the single short
  link the sales campaign sends. `noindex`. Samples grouped by specialty,
  `/v1` booking funnel featured. Set `WHATSAPP_NUMBER` in `app/demo/data.ts`
  (placeholder renders a setup banner on purpose).
- **`/outreach`** — internal console (`app/outreach/`, `app/api/outreach/`).
  Gated on `OUTREACH_ENABLED="true"`; 404 otherwise. Data:
  `data/outreach/contacts.json` (built by
  `scripts/build-outreach-contacts.mjs`) + `state.json`; **`/data/outreach/`
  is gitignored** (real phone numbers). Sending is click-to-chat `wa.me`
  links, never automation — bulk-sending from a personal number gets it
  banned.

### Pitfalls hit while building those

- `server-only` is **not** a dependency here — don't import it.
- eslint has `react-hooks/set-state-in-effect` as an **error**: hydrate from
  localStorage with `useSyncExternalStore`, not `useState` + `useEffect`.
- Keep node-importing modules out of client components (split shared types
  into their own file) or `node:fs` lands in the browser bundle.
- `npx next dev` refuses to start a second instance — it prints the port/PID
  of the running one. **Read that output instead of assuming a port**: the
  repo's server has been seen on :3001 *and* on :3000 (whichever the machine
  happens to own at the time).

### Outreach copy rules (operator-set, do not drift)

- Templates live in `app/outreach/lib/templates.ts`, mirrored in
  `marketing/whatsapp-outreach-fa.md`. **Colloquial (شکسته) only** — no formal
  register. **No sender name, no doctor name in the message text** (the name is
  shown in the console UI for identification only). No link in the first
  message. Always an opt-out line.
- Priority tiers are stamped on the data, not computed in the UI:
  tier 1 = `+98913`, tier 2 = rest of Iran, tier 3 = abroad. Console defaults
  to tier 1.
- `scripts/probe-outreach.mjs` browser-verifies the console + /demo and cleans
  up `state.json` afterwards. It asserts colloquial-present AND
  formal-absent — when editing copy, run it.
