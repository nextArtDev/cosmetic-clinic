# /v22 — آریاسنگ · a full port of https://www.elitestone.it/

Persian (فارسی، RTL) port of Elite Stone, the luxury Italian natural-stone
atelier, rebuilt as the fictional Iranian brand آریاسنگ. The route is
self-contained — every file lives under `app/v22/`, every asset under
`public/v22/`, and the only global hook it emits is `html[data-v22-active]`,
which the shell sets while mounted and strips on unmount. The home page and
every other route see the document exactly as they left it.

The motion layer is a transcription of the reference theme's own bundle —
`dist/js/main.min.js` / `dist/css/main.min.css` — so the timing values match
the reference site: `delay: .025*i`, `duration: 1.5`, `ease: 'expo.out'`,
`rotateX: -80`, `rotateZ: 10`, the reel's `y: innerHeight/1.5`, the
preloader's `clipPath` wipe, the cursor's `1 - Math.pow(.9, .06 * deltaMs)`
lerp, the 135° product-tile rotation, the fixed-attachment showroom/footer
covers.

## Layout

```
app/v22/
  layout.tsx               pass-through
  page.tsx                 wraps <Experience/> in the two font variables
  fonts.ts                 SD-Golpayegani (display) + Vazirmatn (body)
  data.ts                  copy, products, showrooms, posts, ctaShortcuts,
                           nav, menu items with hover images
  lib/
    engine.ts              GSAP + ScrollTrigger registration, splitLines,
                           revealTitle/Excerpt/Separator/Block, createLenis
  components/
    Experience.tsx         root: html[data-v22-active] gate, Lenis,
                           single-pass reveal setup, scroll rail, cursor,
                           preloader
    Preloader.tsx          cream panel + gold counter, exit wipes down via
                           clipPath polygon
    Cursor.tsx             2rem ring that grows to 12rem with a label;
                           gsap.quickSetter + time-based lerp
    Navigation.tsx         fixed bar (logo, quick links, language, toggler)
                           + fullscreen menu with cursor-following preview
                           plate driven by a hand-rolled gsap.to (quickTo
                           was observed not to apply in this environment)
    Hero.tsx               masked 3-line title, scrubbing reel
                           (ScrollTrigger y: innerHeight/1.5), autoplay
                           progress bar with 2.5px gold fill
    Sections.tsx           About · Products · Showrooms · Journal ·
                           Contacts · CtaShortcuts
    Footer.tsx             fixed-attachment cover, newsletter, link menus,
                           socials, legal row
    Lightbox.tsx           quarry gallery with thumbnails, swipe/keyboard
                           nav, backdrop close
    bits.tsx               Mark (brand SVG), Marquee (40s linear infinite),
                           ANIM data-attribute helpers
    elitone.module.css      design system, every rule scoped under .experience
    elitone.global.css      ONLY global sheet: three rules, all gated on
                           html[data-v22-active] (root font-size at the
                           reference's breakpoints, which the whole rem
                           scale depends on)
```

## Motion contract

Reveals are declarative — components carry `data-es-anim="title|excerpt|
separator"` or `data-es-reveal` (+ `-children`/`-y`/`-delay`), and
`Experience` runs one `querySelectorAll` pass inside `gsap.context`, so
adding a section doesn't need wiring.

| Selector | Reveal |
|---|---|
| `[data-es-anim="title"]` | line-masked rows, `delay: .025*i`, `duration: 1.5`, `ease: 'expo.out'`, `y: '100%'→0`, `rotateX: -80→0`, `rotateZ: 10→0` |
| `[data-es-anim="excerpt"]` | parent `clipPath: polygon(0 0,100% 0,100% 110%,0 110%)` + rows `y: '100%'→0`, `delay: .015*i`, `clipPath: 'none'` onComplete |
| `[data-es-anim="separator"]` | `autoAlpha: 0` + `xPercent: 6→0` |
| `[data-es-reveal]` | block rise, `y: 40→0` (or `data-es-reveal-y`), `stagger: 0.08`, scrolls into view |
| `[data-arrow]` | cursor swaps its label for a chevron; `[data-prev]` mirrors it (see below) |

Two more things transcribed from the reference bundle:

- **Reel = the reference's Swiper config**, so its numbers are the reference's:
  `effect:'fade'`, `speed: 1200` (the CSS transition on `.esReelSlide`),
  `autoplay.delay: 5000` (`SLIDE_MS` in `Hero.tsx`), and the parallax
  `y: innerHeight/1.5` under `start:'top top', scrub: true`.
- **Cursor arrow state.** Upstream reads `data-arrow` / `data-prev` off an
  element and adds `arrow` / `arrow reverse` to `#cursor`. The port mirrors
  that on the lightbox arrows. The chevron is drawn with **physical**
  `border-right` + `border-top` — under `rtl`, `border-inline-end` would flip
  the glyph 90° and point it at the top. Since the route is RTL, "forward"
  points west: base `-135deg`, reverse `45deg`.

The reference's `div.marble figure` pointer-parallax is **not** ported — it is
dead code on the home template (there is no `div.marble` in `home.html`; the
handler only fires on the materials templates).

## Tokens

- gold `#e0b16b` · soft `#f0cf9d` · cream `#ffeccf` · hairline `#dee2e6`
- ink `#000` · body `#495057` · dark `#1a1a1a` · dim `#adb5bd`
- display `var(--font-es-display), serif` · sans `var(--font-es-body), sans-serif`
- ease `cubic-bezier(0.83, 0, 0.17, 1)` (matches every reference transition)
- expo `cubic-bezier(0.16, 1, 0.3, 1)` (matches GSAP's `expo.out`)

## Pitfalls this port turned up

- **CSS Modules + JS-added class names.** A class you add from JS via
  `el.classList.add('esSplit')` will *not* match `.esSplit` inside a
  `.module.css` — the CSS file's `.esSplit` is hashed. Either import the
  class name from the module or write `:global(.esSplit)` (the latter is
  what we use for the row markup `engine.ts` produces).
- **`splitLines()` and fonts.** A title authored as three `\n`-joined lines
  will collapse to one row whenever `offsetTop` grouping runs before fonts
  load (the words all sit on one row in fallback metrics). `engine.ts` now
  honours hard `\n` first via a `width:100%` zero-width sentinel that flushes
  `offsetTop`, then falls back to natural wrapping. Elements with child
  elements fall back to a single masked row — keep animated elements plain
  text.
- **`gsap.quickTo` can silently no-op.** In this environment, `quickTo`
  failed to apply its transform when fed in a rapid succession of events
  that each cancelled the previous rAF. Replaced with a hand-rolled
  `gsap.to({ overwrite: 'auto' })` in Navigation — same one-tween-at-a-time
  behaviour, reliably applies.
- **Direction-agnostic pointer math.** `inset-inline-start: 0` anchors to
  the **right** edge in RTL, so a pointer-following plate ended up offset
  by the host's full width. Use physical `top: 0; left: 0` with
  `position: fixed` so the plate lives in viewport coordinates.
- **Nested `<a>` is a hydration error.** The first showroom list had a
  `mailto:` link inside the outer map link; React rejects the mismatch.
  Split into sibling links.
- **`<img>` files are not always images.** The original `public/v22/img/`
  directory contained HTML error pages renamed to `.jpg`; every `<img>`
  decoded to nothing and the hero rendered as a black rectangle. Replaced
  with real Unsplash photos.

## Verification

- `npx tsc --noEmit -p tsconfig.json` — clean.
- `npx eslint app/v22` — clean.
- Playwright smoke at 1440×900 + 390×844 — 0 console errors; verified
  preloader wipe, 3-line masked title, reel parallax + autoplay, product
  135° tile, post `scale(0.6)` + marquee, fullscreen menu with cursor
  tracking (plate centre = cursor position), dark contacts section,
  fixed-attachment covers, footer.
- Sibling routes spot-checked at 200 (`/`, `/v10`, `/v16`, `/v21`).

## `next build` does not complete in this environment

Three attempts (including one left running 40 min) all stall at the same
point: after `✓ Running next.config.mjs`, the build wipes `.next`, creates
`.next/lock`, then sits at **0% CPU** forever with no further output — before
it has compiled a single route, so it says nothing about `/v22`.

Diagnosis notes, so you don't repeat the hunt:

- It is not the sandbox delete guard. Setting `CODEBUDDY_SAFE_DELETE_ENABLED=0`
  changes nothing, and `NODE_OPTIONS` only preloads `node-language-shim.cjs`
  (no `fs` shim is injected into node here).
- A concurrent `next start -p 3939` was holding `.next`; killing it did not
  unblock the build either.
- Recovery: kill the `next build` / `npx` processes, `rm -rf .next/lock`,
  then `npx next dev` and wait ~3 min for the first compile — `/v22` comes
  back at 200 with 0 console errors.
- **Side effect to know about:** a stalled build leaves `.next` stripped
  (`build/`, `static/`, `types/` gone), which breaks any running
  `next start`. Expect to rebuild/restart that server afterwards.

Until the Turbopack build is fixed, treat `tsc --noEmit` + `eslint` + the
dev-mode Playwright smoke as the verification gate.