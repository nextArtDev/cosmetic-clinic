# /v24 — کلینیک دندانپزشکی سپیدار

A Persian dental-clinic route that is a **verbatim port of [numa.uprock.pro](https://numa.uprock.pro/)** — its DOM, its generated stylesheet, and its motion spec, reproduced as closely as the artefacts allow. Copy and clinic details are fictional mock content; nothing here is connected to a live booking, payment, or patient-record system.

The reference is not a React app. It is a page emitted by a site builder (`<meta content="Taptop" name="generator">`, Russian locale, about an insulin pump), so there is no component tree to read and no source to port. What it does have is three things worth harvesting, and all three are used here:

| harvested artefact | what it gives us |
| --- | --- |
| the generated HTML | the exact DOM, element for element |
| 7 generated CSS sheets | the exact layout, typography and breakpoints |
| a 126 KB inline JSON blob | **the exact motion spec — as data** |

That last one is the key to the whole port. In the reference, motion is not code; it is a data structure describing `element → animation → per-breakpoint params → effects`, where each effect carries `keyframes` plus `startKeyframe`/`endKeyframe` on a normalised 0–100 scale. It is extracted verbatim into `data/animations.json` (92 animated elements) and interpreted by `lib/motion.ts`.

## Routes

- `/v24` — the ported landing page
- `/v24/services` — service listing (mock)
- `/v24/services/[slug]` — service detail (mock static slugs)

Only the landing page is a port. The two sub-routes are the mock "important routes" a real backend will eventually feed, so they carry the clinic's own chrome rather than the reference's.

## Route boundary

Everything lives under `app/v24/**`; media under `public/v24/**` (22 MB). Shared Tailwind/PostCSS config, the root layout, and every production component are untouched — `git diff` on `app/globals.css app/layout.tsx package.json package-lock.json next.config.mjs postcss.config.mjs tsconfig.json` is empty.

Isolation rests on three mechanisms, in order of importance:

1. **Every vendored selector is prefixed with `#v24-root`.** An ID outranks any host utility regardless of stylesheet order, so the generated CSS physically cannot reach outside the wrapper — 2067 top-level selectors, 0 without the prefix, 0 `:root`, 0 bare `html`/`body`.
2. **Hand-written corrections double the wrapper class** (`#v24-root.v24-root`, specificity 2,0,0) so they outrank the vendored per-element classes, which reach (1,3,0). They win on specificity, not on import order.
3. **The only document-level hook is `html[data-v24-active]`**, set on mount and *restored* (not merely removed) on unmount. It gates exactly five `html.lenis` declarations in `styles/numa.global.css` — Lenis drives the real window scroll, so those classes land on `<html>` and cannot be scoped.

`styles/numa.vendor.css` is **generated** by `.tmp-numa/build-vendor-css.mjs` and must not be hand-edited. Three things that script gets right, each of which caused a real bug when wrong:

- `url()` references are rewritten to mirrored local paths, and the reference's `@keyframes spin` is namespaced to `v24-spin`.
- Inline `<style>` blocks that the sheets depend on are kept, in order.
- Selectors are emitted **in source order**. Bucketing rules by media query reorders them, and because `.col-2-md` (768px) and `.col-5-xl` (1200px) override the same selector, reordering silently lets the narrower breakpoint win.

## The RTL decision

This is the one place the port deliberately does **not** do the obvious thing.

The reference is a strictly *physical* LTR design: wide flex strips translated leftward by scroll, plus absolute `left:`/`right:` offsets. The host document is `<html dir="rtl">` (a Persian site, which must not be touched). Inheriting that direction re-anchors every one of those strips to the right edge and parks it off-screen — `.numbers__wrapper` measured `x = -6341px` instead of `-137px`, and whole sections rendered as empty bands.

So the wrapper pins `direction: ltr` and `unicode-bidi: isolate`, and RTL is applied to **copy-holding elements only** (`.h1`, `.text`, `p`, `li`, …) via a `:is(...)` list in `styles/numa.theme.css`. Physical-order widgets (`.timeline__time`, `.numbers-*`, `.metrics__lottie-block`) explicitly stay LTR.

The authored-for-RTL mock sub-routes opt back in with `v24-root--rtl`.

## Motion

`lib/motion.ts` interprets `data/animations.json` with GSAP + ScrollTrigger + CustomEase + Lenis. The single most important detail in the file:

> `getScrollTrigger()` in the reference returns a **vars object**, not a ScrollTrigger instance, and hands it straight to `gsap.timeline({scrollTrigger: vars})`. GSAP does **not** adopt a pre-created instance passed that way, so calling `ScrollTrigger.create()` yourself leaves the timeline unlinked — it plays freely to completion the moment it is built, and every scrubbed element snaps to its final keyframe. The numbers strip jumped to `translate(-265.83vw)` at 8% of its travel. Pass the vars object.

Other fidelity details, all read off the reference's own `tt_animation.js`:

- `buildKeyframes()` folds each effect's from/to keyframe onto its `startKeyframe`/`endKeyframe` percentage, and **the first effect touching a property name wins** — so a later effect on the same property contributes only its end state. An element like `ir5h3h6ou` therefore fades in at 35–43%, holds to 69%, and fades back out by 77%; `opacity: 0` at the end of the scrub is correct, not a bug.
- `APPEAR_ON_SCREEN` uses `toggleActions: 'play none restart reset'`, or `'play none none none'` when `iterations === 1`.
- Only the **first effect of each property name** gets `immediateRender: true`; the rest are explicitly false. Without that, two `fromTo`s at position 0 both render immediately and the later one's "from" state stomps the earlier one.
- Lenis runs the reference's own options (`lerp 0.05, duration 1.2, wheelMultiplier 1.0, normalizeWheel false`). `normalizeWheel` was dropped from Lenis 1.3's types, so the object is widened rather than the value quietly changed.

Because Lenis owns the scroll, `window.scrollTo` is fought by its rAF loop — drive any probe with wheel events.

Teardown is total: every registration goes through a `collect()` helper that **throws** if its callback returns no cleanup function (a teardown written as the body would otherwise attach and detach in the same tick, silently), and the destroy path kills any stray ScrollTrigger whose element is inside the route subtree.

## Content seam

`types.ts` defines `V24Repository`; `data.ts` exports `mockRepository`. Pages call the repository on the server and pass typed content into the client experience. Swap in a Prisma-backed implementation without touching components.

## Not ported (deliberate)

- **The five MP4s.** The origin host is unreachable from this machine and all five CORS relays failed (429 / 522 / 403 / 401 / a 302 back to the origin). Each `<video>` keeps its `<source>`-less element and gains a mirrored `poster` still — which is what the reference itself shows via its `.video-poster` overlay. There are no 404s.
- **Sub-routes.** The reference's nav and cards use in-page anchors instead.

## Regenerating

Scratch and tooling live in `.tmp-numa/` (gitignored):

```
seed-media-map.mjs     rebuilds media-map.json from the mirror logs (idempotent)
mirror-extra.mjs       mirrors the CSS-referenced assets + vendors lottie-player.js
build-vendor-css.mjs   emits styles/numa.vendor.css + numa.global.css
port-jsx.mjs           regenerates sections/*.tsx from the harvested HTML
```

`port-jsx.mjs` repairs the reference's invalid markup on the way through: `href` on a non-anchor becomes `data-href`, `tab` becomes `data-tab`, stray `s`/`support'` attributes are dropped, and a `<video>` with no mirrored source loses `src` and gains a `poster`.

## Verification

`tsc --noEmit` is clean project-wide; `eslint app/v24` reports 0 errors (93 `no-img-element` warnings, all deliberate — a plain `<img>` is required inside clipped reveal ancestors, where `next/image`'s lazy load deadlocks).

```bash
node .tmp-numa/probe-v24.mjs
```

14 browser checks, currently all passing: the document attribute is set and restored, the wrapper keeps the reference's physical LTR while copy resolves RTL, the wide strip starts on-screen and travels, **every one of the 80 scrubbed elements lights up somewhere in its own travel**, both mock sub-routes render, and after navigating away the home page has no `v24` nodes and no `lenis` class. It also asserts 0 failed requests and 0 page errors.

`node .tmp-numa/shots-v24.mjs` captures an 11-position screenshot series at 1440×900 and 390×844 into `.screenshots/v24/`.
