# /v23 — دکتر پارسا و همکاران · a full port of https://jacques-cie.com/

Persian (فارسی، RTL) port of Jacques + Cie, a dental and implantology clinic in
Sainte-Foy, Québec, re-authored as the fictional Tehran clinic
**کلینیک دندانپزشکی و ایمپلنت دکتر پارسا و همکاران**.

The route is self-contained. Every file lives under `app/v23/`, every asset
under `public/v23/`, and the only global hook it emits is
`html[data-v23-active]` — an attribute the shell sets while mounted and strips
on unmount. The home page and every other route see the document exactly as
they left it.

---

## How the reference is built

Knowing this is what makes the port possible, so it is worth writing down.

jacques-cie.com is **not** a static site. It is a **Vue 3 SPA built with Vite**,
rendered client-side into `<div id="app">`, on a **headless Craft CMS** backend:

| Layer | What it is |
| --- | --- |
| Markup | Vue 3, scoped styles via `[data-v-*]` attributes |
| Styles | One base sheet + per-component sheets, lazy-loaded per route |
| Motion | GSAP + ScrollTrigger, plus Lenis for smooth scroll |
| Content | Craft CMS GraphQL at `/api/arepa/graphql` |
| Type | Aeonik (one family for both headings and body) |

Two details drive the whole design:

1. **`html { font-size: 10px }`**, switching to `clamp(10px, .532vw, 12px)` at
   1440px. The entire layout and type scale is expressed in `rem`, so those two
   numbers are what make the design breathe on large screens. This is why the
   port needs a global hook at all.

2. **The header measures itself in JS** and publishes `--header-height`,
   `--header-inner-height` and `--header-with-logo-height` (logo height + 80).
   The hero's negative top margin and its `padding-top` are both derived from
   them.

### Auth on the content API

The GraphQL endpoint is not public — every request needs both tokens:

```
Authorization: Bearer <gqlToken>      # from GET /api/arepa/get_gql_token
Arepa-Csrf-Token: <csrfToken>         # from GET /api/arepa/get_csrf_token
```

Requesting it without them returns `403 Schema doesn't have access to the
"Français" site`, which is misleading — the schema is fine, the tokens are
missing. The port does not talk to the reference at runtime; the content was
pulled once and re-authored.

---

## Layout

```
app/v23/
  layout.tsx               pass-through; imports the route-local global sheet
  page.tsx                 reads the repository, wraps in the font variable
  fonts.ts                 Vazirmatn (the Persian stand-in for Aeonik)
  types.ts                 the content model + the SiteRepository interface
  data.ts                  original Persian mock content
  styles/
    jacques.module.css     GENERATED — see "Regenerating the stylesheet"
    jacques.global.css     the one gated global rule
  lib/
    engine.ts              Lenis, breakpoints, image parallax, scroll driver
  components/
    Experience.tsx         root: the isolation boundary + block dispatch
    Header.tsx             l-header, self-measuring, fullscreen nav
    Hero.tsx               c-hero-base: blur reveal + delta-driven overlay
    Blocks.tsx             the four Neo block types the home page uses
    Footer.tsx             l-footer
    Bits.tsx               Icon, Logo, Surtitle, WordsList, Picture, Button
    Contact.tsx            address / particulars / socials (header + footer)
```

---

## The isolation contract

Three rules make this route incapable of affecting the live site.

**1. Every style rule is scoped under `.jc-root`.**
`styles/jacques.module.css` is a CSS Module in which every generated rule is
rewritten to `.jc-root :global(<original selector>)`. There is no rule anywhere
in the route that can match an element outside the wrapper.

**2. The single global rule is attribute-gated.**
`styles/jacques.global.css` contains exactly two declarations — the 10px rem
base and its 1440px clamp — both under `html[data-v23-active]`. The shell sets
that attribute on mount and removes it on unmount, so on every other route the
sheet is inert. This is the *only* global thing the route touches.

**3. Measurements go on the wrapper, not on `<body>`.**
The reference writes its header and footer heights onto `document.body`. Doing
that here would leak `--header-height` into the production layout, so
`Experience` writes them onto the `.jc-root` element instead. Every consumer is
a descendant and inherits exactly the same values — verified: the port computes
`--header-height: 130px`, identical to the reference.

---

## Motion, transcribed

Every number below was read out of the reference's own bundle, not eyeballed.

**Lenis** — the literal object the reference constructs:

```js
new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
  lerp: 0.6, wheelMultiplier: 1, touchMultiplier: 1, infinite: false,
})
```

driven by hand with `requestAnimationFrame`, with `ScrollTrigger.update()` on
every frame.

**Hero** (`Hero.tsx`) — three things move:

- The photograph starts at `filter: blur(10rem); transform: scale(1.1)` in CSS
  and is tweened to `blur(0rem); scale: 1` **200 ms after mount**, over 1.6 s on
  `CustomEase("0.66, 0, 0.34, 1")`. That is the page's opening gesture.
- A fixed overlay above the image fades **by scroll delta, not position**:
  `+0.004` per downward frame, `-0.004` per upward frame, clamped to
  `[0.1, 0.4]`. It settles wherever the user stopped.
- The heading and copy drift apart on opposite signs of the same progress term
  (`1 - (rect.top + 400) / (innerHeight / 2)`).

All three are suppressed below `lg` (1024px), exactly as upstream.

**Image parallax** (`engine.ts`) — the reference's `ImageBase`:

```
wrapper height = 130%
travel         = 30 / (100 + 30) * 100 = 23.077%
ease           = none
scrollTrigger  = { start: <'top bottom' if below fold else 'top top'>,
                   end: 'bottom top', scrub: 0.8 }
```

with the reference's own clamp so gsap cannot overshoot past the wrapper.

**Transition banner** (`Blocks.tsx`) — four values from one position term `z`:

```
overlay = clamp(0, 1, 1 - rect.top / (innerHeight / 2))
image2  translateX = -clamp(0, 20, z * 20)          # always leftward
image3  translateX =  clamp(0, maxX, z * maxX)
        translateY =  clamp(0, maxY, z * maxY)
scale   =  clamp(1, 1.1, 1 + z * 0.1)
```

`maxX` is 60 / 50 / 40 and `maxY` is -10 / -30 / -40 at xl / lg / below — which
is what makes the drift feel tighter on phones than on a wide desktop.

**Words list** — pure CSS in the reference, so it stays pure CSS here. The
`-is-animated` flag fires a `slide-up` keyframe with a per-child delay (`.3s`
stagger short, `.2s` long). `WordsList` only sets the flag; the hero uses an
IntersectionObserver, the banner drives it from scroll, as upstream does.

**Microinteractions** — all carried by the ported CSS, which is why the markup
reproduces the reference's class contract exactly. The buttons' label/gap
transitions, the service card's hover, the underline links, the socials' fill
swap: all of it is the reference's own `cubic-bezier(.66, 0, .34, 1)` at `.3s`.

---

## What is deliberately different

- **Language and direction.** The layout is mirrored via `direction: rtl` on the
  wrapper. Because the reference is built almost entirely on CSS Grid and flex,
  and grid line numbering follows the inline direction, `col-4 start-6` lands on
  the opposite side automatically and `align-items: flex-start` moves the hero
  heading to the right edge, where a Persian hero belongs. A handful of physical
  offsets needed overriding individually — see the override block at the foot of
  `jacques.module.css`.
- **Type.** Aeonik is a Latin grotesque with no Persian coverage. Vazirmatn
  keeps the reference's one-family system (Aeonik is declared as *both*
  `--ff-heading` and `--ff-paragraph` upstream) rather than inventing a
  display/body pairing the reference does not have.
- **The logo.** The reference's mark and wordmark are both SVGs. The mark is
  redrawn as a 30×30 tooth glyph (the `.-logo` rule pins exactly that square
  footprint). The three-line wordmark cannot be lifted from a Latin SVG, so it
  is typeset as text — but it keeps the `.line line-N` contract, so the
  reference's own `.line` reveal rule and stagger still drive it.
- **Copy.** Entirely original Persian content. Nothing is translated from the
  reference; the layout is what is being cloned, not the prose.
- **Routing.** The reference is a multi-route SPA (services, guides, portraits,
  contact, …). Only the home route is ported; nav and card links point at
  in-page anchors rather than dead sub-routes.
- **Sub-pages and the booking funnel.** The reference's "Prendre rendez-vous"
  posts to an external booking system; here it is a mock anchor.

---

## Regenerating the stylesheet

`styles/jacques.module.css` is generated and says so at the top. Do not
hand-edit it — edit `.tmp-jacques/overrides.css` (the hand-written tail) and
re-run:

```bash
node .tmp-jacques/port-css.mjs
cp .tmp-jacques/out/jacques.module.css app/v23/styles/jacques.module.css
```

The script reads the reference's own sheets from `.tmp-jacques/assets/`, strips
the Vue `[data-v-*]` scope attributes and the per-component `<Transition>`
boilerplate, drops document-level selectors that cannot be re-homed, and
rewrites everything else to `.jc-root :global(<selector>)`.

**Rules stay in source order.** This is load-bearing: the reference overrides
the same selector across breakpoints (`.col-2-md` at 768px, then `.col-5-xl` at
1200px), so grouping the output by media query would let the narrower breakpoint
win and silently break the grid. The script also verifies that every animation
name it emits has a matching `@keyframes`.

---

## Swapping in Prisma

`data.ts` exports `mockRepository`, an object implementing `SiteRepository`
(`getHome`, `getSettings`, `getNavigation`, `listServices`, `listGuides`). Every
component reads through that interface, and the shapes mirror what the
reference's own GraphQL endpoint returns.

Pointing the route at a real database means writing one more object with those
five methods and passing it in `page.tsx`. No component changes.

---

## Verifying

```bash
npx tsc --noEmit
npx eslint app/v23
```

Then load `/v23` and confirm:

- `document.documentElement.getAttribute('data-v23-active')` is `''` while the
  route is mounted, and `null` after navigating away.
- `getComputedStyle(document.documentElement).fontSize === '10px'`.
- The home page's own `--header-height` is unaffected by visiting `/v23`.

Capture helpers live in `.tmp-jacques/` (`capture.mjs` for the reference,
`capture-v23.mjs` for the port, `probe-diff.mjs` to diff their geometry).
