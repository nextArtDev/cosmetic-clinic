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
