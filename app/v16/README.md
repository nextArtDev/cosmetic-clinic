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
- **Hero**: autoplaying slide deck with masked line-reveal headlines,
  crossfade + slow zoom media, scroll-scrub parallax on media and copy,
  rotating orbit badge, animated slide counter and progress line.
- **Trending**: staggered reveals, hover zoom, quick-view pill, hover
  size-rail, spring add-to-cart confirmation.
- **Collection carousel**: scroll-scrub clip-path banner reveal,
  parallax banner image, RTL-aware drag-to-scroll rail with progress.
- **Statement**: word-by-word color-scrub manifesto, parallax collage
  with clip-reveal cards, rotating sale orbit badge.
- **Featured tabs**: autoplay accordion with animated progress bar,
  typewriter line, clip-reveal image panel, popLayout product thumbs.
- **Bundle**: cards settle from a scattered pile, sticky glass bar with
  spring thumbnails and animated progress segments.
- **Burst**: product chips fly out from the section center on enter,
  then follow the cursor with depth-weighted parallax.
- **Best sellers**: rolling-text row titles, cursor-follow image preview.
- **Video marquee**: three stacked infinite marquees with scroll-velocity
  timeScale boost over a parallax, play-on-screen video.
- **Testimonials**: drag carousel with snapping, autoplay and dots.
- **Media grid / duo**: clip-path tile reveals, scrub image scale.
- **Footer**: velocity marquee, parallax watermark outline, animated
  newsletter form with success/error states.
- Header hide-on-scroll-down glass morphing, mega menu with staggered
  items, springy mobile drawers, toasts, dock with layoutId pill.

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
