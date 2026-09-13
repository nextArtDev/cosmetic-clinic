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
- **Trending**: `trendingProduct` (`data-animation-type="style-1"`) — the
  heading is split into two halves and every product card is parked as a
  3D deck (`opacity 0, scale .5, rotationY 70`, all stacked on one x with
  a 10px depth step, `perspective: 1000`). A single `scrub: 1.5` timeline
  (`top top += 55vh` → `bottom bottom -= 35%`, no pin) flies the two title
  halves out to `∓innerWidth / 2` while the deck converges to its resting
  row (`x 0, rotationY 0, scale 1, opacity 1, z 0`). Hover zoom,
  quick-view pill, hover size-rail and spring add-to-cart sit on top.
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
- **Known framing deviation**: `trendingProduct`'s
  `top top += 55vh` → `bottom bottom -= 35%` window was tuned for the
  original's short (349px) horizontal strip. The Iranized section is a
  4×2 grid and therefore much taller, so the same expressions finish the
  scrub with the section's top already scrolled off. The offsets are kept
  verbatim for parity; the animation still completes while the landed row
  is on screen.


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
