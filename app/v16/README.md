# /v16 — Maya storefront (animation-complete port, isolated demo route)

Open `/v16`. A faithful port of the Maya Shopify theme experience
(reference: https://maya-theme-empower.myshopify.com/, via
`chat-clone/shpfy-in-v2-maya`), fully Iranized. The home page, root
layout, global stylesheet, Prisma schema, Next configuration and all
existing API endpoints are unchanged — `git status` shows only
`app/v16/` + `public/maya/` as new.

## Animation stack (what makes it feel like the original)
- **Lenis** smooth scroll (duration 1.15, expo easing) synced to
  **GSAP ScrollTrigger** via `gsap.ticker`; torn down cleanly on unmount.
- **Global chrome** (`maya-motion.css` + `components/Motion.tsx`): the
  theme's preloader with 4-phase colour flux and a progress bar, the
  two-panel edge-split wipe, the thin custom scrollbar (drag-to-scroll),
  the mobile action dock, a rotating circular-text badge and a
  back-to-top button. Preloader + scrollbar are desktop-only, matching
  the theme's own `max-width: 767px` bail-out.
- **Hero**: autoplaying slide deck with masked line-reveal headlines,
  crossfade + slow zoom media, rotating orbit badge, animated slide
  counter and progress line — plus the `bannerSlider` pinned scrub
  (200svh stage / sticky panel) that drives the marquee, slide fade,
  media parallax, overlay rise and control fade-out.
- **Trending**: `trendingProduct` (`data-animation-type="style-1"`). Layout
  is a port of `trending-products.css`: the heading is split into two
  halves that live in a two-column grid (`grid-template-areas:
  "main-front main-back"`) and a single row of 8 narrow tiles
  (`flex: 0 1 calc(20% - 20px)` → 149px each at 1440) spans both columns
  *on top of* them, so at rest the giant 110px heading is visible only
  through the gaps between tiles. Below 768px the heading is hidden (the
  theme shows a static one instead) and the tiles become a horizontal
  scroll-snap carousel. Every tile is parked as a 3D deck (`opacity 0,
  scale .5, rotationY 70`, all stacked on one x with a 10px depth step,
  `perspective: 1000`); a single `scrub: 1.5` timeline
  (`top top += 55vh` → `bottom bottom -= 35%`, no pin) flies the two
  heading halves out to `∓innerWidth / 2` while the deck converges to its
  resting row (`x 0, rotationY 0, scale 1, opacity 1, z 0`). Hover reveals
  a quick-view pill and the size rail.
- **Collection carousel**: `collectionCarousel` pinned scrub — the track
  translates by `scrollWidth - innerWidth` with an RTL-aware sign while
  the progress rule scales 0 → 1 and the active caption flips.
- **Statement**: `richText` colour-based radial reveal — `--maya-reveal`
  scrubs 100% → 0% while the SALE badge scales 20 → 1 and the collection
  thumbnails converge from `(i - centre) * 55px`.
- **Featured tabs**: `featuredCollectionsList` — the section pins for
  250svh while the hero image slides in from `xPercent -100 / scale .7`,
  the description rail grows to full width, a thin rule sweeps
  `scaleX 0 → 1 → 0` and the active heading's characters reveal with
  `rotationX: 90`. Autoplay accordion, typewriter line and popLayout
  product thumbs are layered on top.
- **Bundle**: `mixAndMatchBundle` — products are round-robined into
  `--masonry-column-count` columns (2 → 5, responsive) and the even/odd
  columns drift up over a 150% scrub at different durations (1.2 vs 2)
  so they lead and lag each other. Sticky glass bar with spring
  thumbnails and animated progress segments.
- **Burst**: the original section is a bare decorative cannon — an
  `aria-hidden` `<burst-efects data-effect="school-pride">` whose only job
  is to fire the engine's `sideConfetti` (two edge cannons, `startVelocity
  80`, particles `#ffff00` / `#bb0000` / `#ffffff`, star + heart shapes).
  Reproduced dependency-free on a `<canvas>` in `components/Confetti.tsx`
  (own particle loop; no `canvas-confetti`). The product chips fly out
  from the section center on enter and then follow the cursor with
  depth-weighted parallax.
- **Best sellers**: `bestSellingProducts` — the section pins for 200svh
  while the rows rise and the titles roll in on their X axis; the row
  counter gets a 3D mousemove tilt. Rolling-text hover and cursor-follow
  image preview sit on top.
- **Video marquee**: `videoWithTextOverlay` with
  `data-animation-type="tilt"` — the section pins for `height / 1.5`
  while the media rotates to −4° and shrinks to 70%
  (`media-width-large` → `--overlay-media-size: .7`), the radius media
  animates its border-radius, the text marquee rises from
  `yPercent 100 → 0`, and the content swaps to its active state at
  progress ≥ 0.5. The marquee list is pre-rotated −4° like the theme's
  `.video-with-text-marquee-list`.
- **Testimonials**: drag carousel with snapping, autoplay and dots.
- **Media grid / duo**: clip-path tile reveals; the duo uses
  `mediaWithTextSec` with `data-animation-type="square"` — both panels
  start fully off-canvas at `xPercent ±100` and slide toward each other
  to `∓15%` across the section's entry (not pinned, per the engine).
- **Collapsible content**: the theme's `<accordion-details>` custom
  element — open is `height 300ms` with the content fading in over
  `250ms` from `translateY`, close is `250ms`, all on
  `cubic-bezier(0.4, 0, 0.2, 1)`, single-open per container.
- **Scrolling text**: two duplicated runs looping at −50% for a seamless
  marquee, the second half rendered as outlined stroke text.
- **Stacked collection**: 6-column cascade with per-item offsets,
  `ScrollTrigger.batch` staggering and second-image hover swaps.
- **Footer**: velocity marquee, parallax watermark outline, animated
  newsletter form with success/error states, and the theme's
  `<details is="accordion-details">` link columns — forced open on
  desktop, collapsible on mobile.
- Header hide-on-scroll-down glass morphing, mega menu with staggered
  items, springy mobile drawers, toasts, dock with layoutId pill.

## Motion parity notes
- The port is driven by the theme's own `engine.js`
  (`gsapMayaaThemeExecution`): each section here reproduces the matching
  `methodCalled` method, including its exact start/end offsets, `scrub`
  value and target values. `data-animation-type` / `data-animation-style`
  / `data-block-size` are read from the section attributes.
- Pinning uses a tall stage + `position: sticky` panel rather than gsap's
  own `pin: true`, because gsap pinning fights Lenis. The scroll distance
  is kept equal to the engine's `end` offset (`+=150%`, `+=height/1.5`,
  `+=height × 1.5`, …).
- **RTL marquee fix**: `.maya-scrollrow` / `.maya-scrollrow-track` are
  forced to `direction: ltr`. With `direction: rtl` a `width: max-content`
  track overflows to the *left* of its `overflow: hidden` parent, and the
  `xPercent: 0 → -50` loop then walks it entirely off-screen. Persian
  runs inside keep their own bidi ordering.
- **Rotating circular text** is a port of the `<rotating-text>` element,
  *not* an SVG `textPath`: each character is absolutely positioned at
  `left: 50%` with `transform-origin: 0 calc(var(--diameter) / 2)` and
  rotated by its index, which lays the string on a circle; the wrapper
  then spins on `40s linear infinite` (the theme's `.rotate-infinite`).
  The theme's hardcoded `index * 10.5deg` step only closes the circle for
  its own 34-character English string, so the step here is derived from
  the character count instead, and — because `10.5deg` assumes LTR — the
  orbit is walked counter-clockwise for RTL so the string reads in its
  natural direction. Hidden under `prefers-reduced-motion`, matching the
  theme's `html.no-animation` bail-out.
- **Trending framing**: because the rebuilt section is 333px tall (the
  reference is 349px), the engine's `top top += 55vh` →
  `bottom bottom -= 35%` window resolves to a ~240px scrub that starts with
  the section fully visible and finishes with it still framed (measured:
  y 1305 → 1548 at 1440×900). Keep it short — stretching this section back
  into a multi-row grid is what made the animation finish off-screen.
- **Full-bleed hero media**: the hero media is `absolute inset-0` over the
  whole sticky panel (the theme's `d-media-fixed`), so the control band and
  the marquee overlay sit *on* the photograph. It previously lived inside
  the `flex-1` stage, which stopped 68px short of the panel and left a bare
  strip of section background under the image.
- **One mobile dock, not two**: the theme's only bottom bar is the
  `mobile-action-dock` section, so `components/MobileDock.tsx` is the single
  source. `Footer.tsx` used to render a second, differently-shaped pill nav
  on the same edge — it was an invention and has been removed.
- **`richText` — the scaled element is a blob, not the badge**: the engine's
  `gsap.set([rich-animated-color], { scale: 20 })` targets `.animate-round`,
  a decorative disc in `.animate-round-wrap` (absolute, `inset: 0`,
  `overflow: hidden`) sized and placed to sit exactly behind the centre
  badge. It opens the section as a solid accent field and collapses into the
  badge backing. Scaling the SALE badge instead — as this port originally
  did — blows it up 20× and paints the whole viewport clay for the first half
  of the pin. The collection row is also `.collection-items-7`: seven
  *circular* cells (70 / 100 / 140 / 180 / 140 / 100 / 70 at ≥1200px) that
  overlap via negative margins, pinned to the bottom of the panel, not a row
  of rounded rectangles.
- **Staggered `Reveal` triggers per child, not per wrapper**: a wrapper
  holding the five FAQ rows spans ~530px, so a single trigger on its top edge
  fires while the last rows are still below the fold — they then animate
  where nobody can see them (measured: 0px visible at rest). `Reveal` now
  uses `ScrollTrigger.batch` over the `[data-rv]` children, so each row has
  its own `start` while rows entering together still cascade. Same reasoning
  behind moving `StackedCollection`'s batch from `top 94%` to the engine's
  `top 80%`.
- **ScrollTrigger positions must survive late layout**: the page is full of
  `loading="lazy"` imagery, and *any* post-load growth invalidates every
  trigger below it — the reveals then fire early and play off-screen. Two
  things keep this honest: the `MediaGrid` grid no longer grows (its
  spanning tile had `lg:aspect-auto` + an in-flow `<img>`, so the image's
  intrinsic height sized both `auto` rows and took the grid from 354px to
  640px — +286px of document height), and `MayaApp` now refreshes on
  `load` plus a debounced `ResizeObserver` on `document.body` (the theme's
  own `autoRefreshEvents: "DOMContentLoaded,load,resize"`). Verified: the
  document is a constant 20208px from first paint to the bottom at 1440×900
  (measured at nine scroll positions, 1.5s → bottom, zero drift).
- **The container gutter is 15/20px, not 40/56px**: `.maya-wrap` was originally
  built with `padding-inline: 1.25rem / 2.5rem / 3.5rem` and a 1440px cap. The
  reference's global `.container` (base.css) is `padding: 0 15px`, `0 20px` from
  768px up, with `--container: 100% → 1370px @1200 → 1790px @1441`. The two only
  agreed by coincidence at ~1440px viewport (1330px content both ways), so the
  port was 40px narrower at 768–1199 and up to 72px narrower at 1200–1440 —
  measured against the mirror at eight widths. `.maya-wrap` now transcribes the
  reference exactly; the mosaic's mobile columns immediately moved 170px → 175px
  and its desktop cells `654×390` → `655×390`, matching the reference to the
  pixel. Document height moved only 20552 → 20555 and stayed constant (it is now
  20208 after the `featured_collections_tabs` re-port shortened that section's
  stage), and the
  clipping/early-reveal audit was byte-identical afterwards (73 desktop / 129
  mobile hits, 8/8 reveals settled, 0 console errors).
- **Footer watermark**: Vazirmatn's ascent+descent is ~1.37em, so the line
  box needs at least that or the footer's `overflow-hidden` shears the bottom
  off "مایا". The parallax is also driven off the whole `<footer>` rather
  than the wordmark's own box — its bottom *is* the document bottom, so
  `end: "bottom bottom"` landed on the last scrollable pixel and the scrub
  never reached 1, leaving the word ~75px low and clipped.
- **`media_grid` — the mosaic is a port, not an approximation**: this section
  carries no `methodCalled` in the reference, so it has **no engine animation
  and no entrance reveal**; the mosaic itself is the animation. The port now
  reproduces it: **eight cells** in a packed grid (4×4 at ≥768px, 2×8 below,
  `--column-gap` 20/10px, `--desktop-height` 185px, `--mobile-height` 100px,
  `--card-radius` 40/20px), each cell its own one-or-two-slide loop slider
  driven by the cell's own Splide `direction` — `ltr`, `rtl` or **`ttb`** — so
  cells advance along different axes. The two edge arrows advance all eight
  together (the reference calls `go()` on every instance) and only reveal while
  the pointer is in the outer 20% of the window; a 1500px spotlight disc lerps
  toward the cursor at 0.3; and the section scheme rotates on each step. Spans,
  directions, caption anchors, the one CTA and the four pastel schemes are
  transcribed from the reference's `#media-grid-item-*` style block and its
  `.scheme-*` rules (see `lib/data.ts`).
  Two deliberate adaptations: captions are anchored at the inline-**start**
  (right) rather than the reference's physical left, and the arrow pair is
  mirrored for RTL (left edge = forward). The seven images load **eagerly** —
  the off-axis slides are clipped outside their cell, so `loading="lazy"`
  defers them and the first advance lands on a blank tile.
  Verified by `probe-mosaic` / `probe-cap-mobile`, cell for cell against the
  mirror: desktop `317.5px × 4` cols / `minmax(185px, auto)` rows / 20px gap,
  cells `655×390` (2×2), `318×390` (1×2), `318×185` (1×1), section 940px
  (4 rows × 185 + 3 × 20 gaps + 2 × 70 padding); mobile `175px × 2` cols /
  `minmax(100px, auto)` rows / 10px gap with the reference's own mobile spans,
  cells `360×210 / 175×100 / 175×210` — every one identical to the mirror.
  Every cell's track transform and caption entrance matches its axis; 0 console
  errors.
- **The mosaic's mobile captions scroll — and the reference does too**: at
  390px the two 1×1 mobile cells (2 and 5, both `100px` tall) hold a
  centre/top caption whose content is taller than the cell. `probe-cap-mobile`
  measures the mirror overflowing those same two cells by **100px and 153px**
  against the port's 47px and 96px, so the port clips *less* than the source.
  This is the reference's own design, not a defect: its `.media-grid-content`
  is `max-height: calc(100% - 30px)` + `overflow: hidden; overflow-y: auto`,
  and its caption is `position: absolute` so it never sizes the row. Don't
  "fix" it by growing the cells — that would break the packed mosaic and the
  constant document height.
- **`featured_collections_tabs` — four stacked layers, not a list**: the
  section (`FeaturedTabs.tsx`) was originally ported as three full-width list
  rows with the display heading inside a white pill. That is not the reference's
  shape, and it broke visibly: a long Persian heading wrapped and its trailing
  glyphs landed *outside* the pill's painted background (`::before { inset: 0 }`
  paints exactly the element box, so any wrap "crashes" the label). The
  reference — `methodCalled="featuredCollectionsList"` — is four layers in one
  pinned stage, and the port now reproduces them:
  - `.maya-ft-front` — the section head, absolutely centred, faded out
    (`fade-out-text`) once the pin starts;
  - `.maya-ft-tabs` — a centred glass chip deck, **106×86** desktop / 80×60
    mobile, where the active chip expands to **475×86** / **280×60** and
    reveals its `white-space: nowrap` label (the reference's `.list-tab-text`);
  - `.maya-ft-textcol` — the active collection's display heading + paragraphs,
    all three stacked in one grid cell;
  - `.maya-ft-mediacol` — the media mosaic: a full-bleed `list-mainmedia` plus
    two square tiles (`--image-ratio: 100%`), the caption pill, and one
    full-width tile (`ratio: 60%`).

  Each collection therefore owns **four images** (one hero + three tiles), which
  is what the engine's `onUpdate` animates: past ~72% of the pin every
  `mainmedia` scales to `0` while every `multi-media-img` scales to `1`, so the
  single hero *resolves into* the mosaic. The three timeline phases are kept
  (hero in from `xPercent -100 / scale .7`; the description rail `width 0 → 100%`;
  the rule `scaleX 0 → 1 → 0`), and each collection swaps the section's colour
  scheme, transcribed from the reference's three `.scheme-*` rules (crimson /
  olive / orange radials) into the component's `SCHEMES` array.
  Verified: chips `106×86 / 475×86` desktop and `80×60 / 280×60` mobile (exact
  reference values), hero transform `matrix(0.7,…,−536,0) → matrix(1,0,0,1,0,0)`,
  tiles resolving to `243×243` + `506×304`, `docH` constant 20208, audit 73
  desktop / 128 mobile with 8/8 reveals and 0 console errors, no `overflowX`.
- **The tabs pin is desktop-only — below 768px the section just flows**: this
  is the single easiest way to get this section wrong. `featured-collections-tabs.css`
  scopes *both* the chip deck's `position: fixed` and the head's / hero's
  `position: absolute` inside `@media(min-width: 768px)`. Below that the wrapper
  becomes a plain three-row grid — `"collection-heading" / "collection-tab" /
  "collection-tabcontent"` — and every layer sits in flow. The port originally
  applied the sticky `100svh` panel at *every* breakpoint, which forced the
  767px-tall media column into an 844px box and overflowed it by **265px**: the
  wide mosaic tile was never visible at all (clipped 250px) and the caption pill
  was half cut (32px). The fix is a `gsap.matchMedia` branch — ≥768px keeps the
  scrub and the phase-4 `onUpdate`, <768px pins nothing and scales nothing, so
  the hero keeps its 300px `--media-height` and the mosaic stacks beneath it.
  Mobile geometry then matches the reference element for element: `main 360×300`,
  squares `175×175`, wide `360×216`, caption pill `58px` tall hugging its text.
  Two details that follow from it: the caption pill's height is
  `--text-box-height: 58px` at **every** size (no mobile override), and the
  description rail's `width` must be *cleared* rather than set to `100%` on
  mobile, because the engine only grows it on the pinned path.
- **The palette is monochrome — keep it that way**: the port shipped a warm
  cream/brown theme (`--color-maya-cream: #f2ede4`, a brown `--color-maya-clay`)
  for a long time. The reference's `:root, .scheme-primary` is white/black:
  `body-background #ffffff`, `text/heading-color #000000`,
  `card-background #f4f4f4`, `border-color #dddddd`,
  `body-alternate-background #f1f1f1`, `image-bg #a9a3a3`, buttons `#000` on
  `#fff`. Token *names* were kept so all 24 components kept working; only the
  values changed, plus a new `--color-maya-card` for the card surface.
  `probe-colors.mjs` samples every section's computed background/text in both
  the port and the mirror — use it before and after any token change.
- **Historical pitfall (that rewrite retired)**: the previous Tailwind grid
  carried a leftover `lg:[grid-area:unset]`. `grid-area` is the shorthand for
  `grid-column` + `grid-row` (+ their `-start`/`-end` longhands), so it won the
  cascade and wiped `lg:col-span-2 lg:row-span-2` — the 2×2 tile rendered 1×1
  and the second row was left empty. Worth remembering anywhere a span utility
  sits beside an `area` utility.


## Boundaries
- Route: `app/v16/` — layout mounts `#maya-root` (rtl/fa) + `maya.css`
  only. No shared chrome of the production site renders here.
- CSS: a second, route-only Tailwind v4 build (no preflight; source
  scanning pinned to `app/v16`) plus hand-written `.maya-*` classes.
  Every token is `--color-maya-*`, every keyframe `maya-*`. The sheet is
  loaded only by this layout — verified the home page's CSS chunk
  contains zero maya rules.
- Fonts: self-hosted Vazirmatn variable font (`public/maya/vazirmatn.woff2`).
- Assets: `public/maya/img/` + `public/maya/media/` pulled from the
  original Shopify CDN.
- Backend: `/v16/api/maya/products` (GET mock catalog) and
  `/v16/api/maya/newsletter` (POST, in-memory; no Prisma table). Swap the
  bodies for real queries when this route goes live.
- Cart persistence: `v16-maya-cart` localStorage key (prefixed to avoid
  clashes).
- The MayaApp effect temporarily sets `html.lang/dir` and body colors and
  restores the previous values on unmount, so other routes are untouched.

## Connecting your Prisma/backend
`app/v16/lib/data.ts` getters are async and return plain serializable data
— swap their bodies with Prisma queries; components never change. Replace
the mock newsletter handler with a real insert. Add auth, rate limiting,
payment verification and inventory checks before production.

Note: this is a demo reproduction of the reference storefront's patterns
and media, not a pixel-for-pixel or animation-timing-identical copy of the
third-party Shopify runtime.
