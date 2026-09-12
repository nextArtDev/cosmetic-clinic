# v20 — IRANFIT (ایرون‌فیت) frontend port

Open `/v20`. A Persian ("Iranized") port of Steve Zim's ATU Mobile training
landing page (https://www.atumobile.com/) — the 8-month streaming program,
"Superhero Nutrition" book section, coach intro, Women's/Men's programs,
pricing table, before/after comparison, app section, testimonials and news
carousel, plus the site's signature multi-step onboarding quiz. All copy is
original Persian mock content; names, prices, plans and contact details are
fictional.

The original is a jQuery/Bootstrap site: almost no CSS keyframes, with
animation driven by JS (`fadeIn`/`fadeOut`/`slideToggle`/animated `scrollTop`)
and a handful of plugins (owl.carousel, magnific-popup, before-after.js,
masonry, video.js). This route re-implements that behaviour natively with
GSAP + framer-motion — see "Parity pass" below for the mapping.

## Isolation (nothing outside these additions is modified)

- `app/v20/**` — the whole experience (22 client components, `iranfit.css`
  design system, `data/` mock seam, `lib/` anim + fa helpers, `layout.tsx`,
  `page.tsx`, `fonts.ts`).
- `app/api/v20/content/route.ts` — additive endpoint mirroring the upstream
  `/api/iranfit/content` route (same `IranfitContent` contract).
- `public/v20/**` — additive assets only (font + 27 `.webp` photos).
- No change to `app/layout.tsx`, `app/globals.css`, the home page, any other
  `/vN` route, `next.config.mjs`, `postcss.config.mjs`, Prisma schema or
  dependencies (gsap, framer-motion and lucide-react were already present).

`iranfit.css` scopes every rule under the `.iranfit-root` wrapper (its
`--if-*` custom props are declared there, never on `:root`), including the
previously unscoped `[data-if-reveal]` initial-hidden rule, which is now
`.iranfit-root [data-if-reveal]`. `Landing` renders `dir="rtl"` on that same
wrapper, so the document-level `lang`/`dir` (owned by the root layout) are
untouched. The route does not use Tailwind utilities at all, so it cannot
collide with the app's classes (`if-*` prefix is unique to this route,
verified by grep). Transient runtime touches (menu/video/lightbox/quiz
scroll-lock via `documentElement.style.overflow`, GSAP ScrollToPlugin's
automatic `scroll-behavior: auto` reset while animating) restore themselves
on cleanup and cannot affect other routes.

`git status` confirms isolation: every changed/added path lives under
`app/v20/`, `app/api/v20/` or `public/v20/`.

## Sections (in render order)

`IRANFIT_SECTIONS` (`data/types.ts`) drives the progress rail and the nav
spy. Eleven entries, numbered with Persian digits in the UI:

| # | id | Component | Mirrors (original) |
|---|----|-----------|--------------------|
| ۱ | `hero` | `Hero.tsx` | `section_main` |
| ۲ | `program` | `Plans.tsx` | `section_trainigvideos` (8 month cards, "SIGNUP TO WATCH") |
| ۳ | `book` | `Book.tsx` | `section_orderbook` |
| ۴ | `coach` | `Coach.tsx` + `Gallery.tsx` | `section_about` (photo wall + "MEET STEVE ZIM") |
| ۵ | `programs` | `Programs.tsx` | `section_programs` (Women's/Men's split + PLAY) |
| ۶ | `pricing` | `Pricing.tsx` | `section_pricingtable` |
| ۷ | `beforeafter` | `BeforeAfter.tsx` | `section_beforeafter` (ba-slider) |
| ۸ | `app` | `AppSection.tsx` | `section_anytime` |
| ۹ | `stories` | `Testimonials.tsx` | `section_testimonials` |
| ۱۰ | `news` | `News.tsx` | `section_news` (owl carousel) |
| ۱۱ | `join` | `CtaBand.tsx` | closing CTA |

Supporting components: `Nav` (hide-on-scroll-down + mobile menu + quiz CTA),
`Footer`, `Marquee`, `ProgressRail` (scroll spy), `BackToTop`, `Magnetic`,
`ScrollCue` (per-section "scroll down" cue, mirrors `.scrolldown`),
`VideoModal` (shared video player), `QuizModal` (onboarding quiz).

## Parity pass (added after the initial port)

The initial port covered roughly the first six sections. This pass closed the
gap against the original:

- **Programs** (`Programs.tsx`) — cinematic two-up Women's/Men's split with
  hover zoom, a pulsing play disc and a shared video modal. The GSAP parallax
  runs on a dedicated `.if-program-parallax` wrapper so it never collides with
  the `<img>`'s own CSS hover-zoom `transform`.
- **Before/After** (`BeforeAfter.tsx`) — drag-to-compare slider. Position is
  written straight to the `--if-ba` custom property (no React re-render while
  dragging); `clip-path: inset()` does the reveal. Pointer Events with
  `setPointerCapture` unify mouse/touch/pen; keyboard supported
  (Arrow/Home/End, Shift = 10). A GSAP intro sweep (88 → 50) plays once and is
  skipped under `prefers-reduced-motion`.
- **Gallery + lightbox** (`Gallery.tsx`) — asymmetric photo grid with a
  framer-motion zoom lightbox (prev/next, keyboard, swipe, counter, captions).
- **Onboarding quiz** (`QuizModal.tsx`) — the original's signature multi-step
  flow, rebuilt as one animated modal: 10 steps (gender → age → body → BMI →
  shape → level → goal → days → contact → done), progress bar, animated step
  transitions, per-step validation, auto BMI + band, gender-specific shape
  vocabulary, and a plan recommendation on the summary step.
- **Scroll cues** (`ScrollCue.tsx`) — the original put a "SCROLL DOWN" cue in
  nearly every section; now shared across Programs / BeforeAfter / Coach.
- **Upgraded** `Plans` (locked month-preview card + "sign up to watch" gate →
  quiz), `Testimonials` (real avatars, GSAP autoplay progress bar, hover-pause,
  swipe, keyboard), `News` ("all news" CTA, swipe, keyboard), `Nav`
  (hide-on-scroll-down, menu CTA, coach link) and `Hero` (CTA opens the quiz).

`Landing.tsx` owns the shared `VideoModal` and `QuizModal`. The quiz is
remounted via `key={quizKey}` (bumped in `openQuiz`) so it always opens in a
pristine state — this replaced a state-reset effect that tripped
`react-hooks/set-state-in-effect`.

### Two layout constraints worth knowing before editing

1. **Stacking contexts.** `.if-container` sets `z-index: 2`, which creates a
   stacking context. A `position: fixed` child inside it can therefore be
   trapped *below* the fixed `.if-rail` (z-index 70) even with a higher
   `z-index`. This is why `Gallery` is rendered as a **sibling** of
   `.if-container` inside the Coach section (wrapping only its own grid), and
   why the fixed `QuizModal` / `VideoModal` / lightbox live outside any
   `z-index`ed ancestor.
2. **One transform per element.** `[data-if-reveal]` elements are staggered by
   the generic GSAP reveal in `Landing.tsx`. Do not add a second tween that
   also writes `transform` to the same node — they fight. (The gallery tiles
   were briefly double-tweened this way; the dedicated tween was removed.)

## Differences from upstream (intentional, minimal)

1. **Font**: upstream loaded Vazirmatn via `next/font/google`, unreliable from
   this app's Iran-network build environment. As in `/v17` and `/v18`, the
   variable TTF of the official `vazirmatn` package (v33.0.3) is self-hosted
   at `public/v20/fonts/Vazirmatn.ttf` (SIL OFL 1.1, `fonts/OFL.txt`) and
   `fonts.ts` serves it through `next/font/local`. The `--font-iranfit`
   variable name and the CSS consumption in `iranfit.css` are unchanged.
2. **Data seam**: upstream read plans/testimonials/posts from a Drizzle/
   Postgres schema and fell back to the bundled mock. This repo's database
   must stay untouched, so `data/index.ts` keeps the exact
   `getIranfitContent(): Promise<IranfitContent>` contract but serves the
   bundled mock directly (the same pattern as `/v17` and `/v18`). Components
   are unchanged.
3. **lucide-react**: this repo pins v1.33.0, which dropped the legacy alias
   `DownloadCloud`. `AppSection.tsx` imports its current name with a local
   alias (`CloudDownload as DownloadCloud`), so the component body is
   unchanged.
4. **Metadata**: title/description moved from the route layout into
   `page.tsx` per this repo's `/vN` convention, plus
   `robots: { index: false, follow: false }` and a "| v20 demo" title
   suffix.
5. **`[data-if-reveal]` CSS rule**: scoped under `.iranfit-root` (see
   Isolation) — same computed styles inside the route, but it can no longer
   match any element outside it.

## Assets (all under `public/v20/`)

Upstream shipped no `public/` folder — its three local images
(`/iranfit/media/hero|nutrition|coach.jpg`) 404'd even in the source project,
and Pexels (its remote media) is unreachable from this network. Following the
user's direction to source from the original site, all imagery is downloaded
from https://www.atumobile.com/ (same art direction the upstream design
imitates).

**All 27 photos are `.webp`** (converted by the user from the original `.jpg`
downloads, identical base names, to cut repo size). Every reference in
`data/mock.ts` and the components uses `.webp`; there are no `.jpg` references
left in `app/v20/**`. If you add an asset, convert to `.webp` and match the
naming.

| Group | Files | Source |
|-------|-------|--------|
| Section backgrounds | `hero`, `nutrition`, `coach` | `section_main_bg`, `section_orderbook_bg`, `section_about_item` |
| Month cards | `month-1` … `month-8` | `trainigvideo1-8` |
| Programs | `program-women`, `program-men` | `program_women`, `program_men` |
| Gallery | `gallery-1` … `gallery-8` | `section_about_item*` |
| Testimonial avatars | `user-1` … `user-3` | `testimonials_user1-3` |
| News cards | `news-1` … `news-3` | `news_img1-3` |

Plus `fonts/Vazirmatn.ttf` + `OFL.txt` (Vazirmatn, SIL OFL 1.1).

Remote media is kept only for the demo **videos** (hero + program clips use
shared Pexels URLs with local `.webp` posters). On networks where Pexels is
filtered these simply show the poster, exactly as upstream shipped. Verify
reuse rights of site-derived imagery before any public/production use.

## Verification performed

- `npx tsc --noEmit` → 0 errors; `npx eslint app/v20 app/api/v20` → 0 problems.
- Dev-server smoke test (`localhost:3120`): `/v20` → HTTP 200 with all 11
  section ids present and 25 distinct `.webp` refs (no stray `.jpg`);
  `/api/v20/content` → 200; home `/` → 200 unchanged.
- Headless browser suite (Playwright + system Chrome, **0 JS errors**):
  69/69 scroll reveals fired; no horizontal overflow at 1440 or 390 px;
  before/after drag + keyboard; gallery lightbox open/next/Escape with
  scroll-lock restored; full 10-step quiz (validation, auto BMI ۲۶.۸ —
  اضافه وزن, summary chips, recommendation "پلن حرفه‌ای", 100 % progress);
  testimonial autoplay progress + arrows; news track translation; nav
  hide-down/show-up; plans card → quiz; programs play → video modal with the
  correct caption/poster; mobile menu + CTA + quiz (374×507 in 390×844) and
  tap-to-compare.
- `git status --porcelain` → all 50 changed/added paths inside
  `app/v20/`, `app/api/v20/`, `public/v20/`.

> **Note on the dev server:** Next.js 16's dev server rejects requests whose
> `Origin` header does not match the dev host — testing against
> `http://127.0.0.1:PORT` returns **403 on all `/_next/static/chunks/*.js`**
> (nothing hydrates). Point browser tests at `http://localhost:PORT` instead.

### Dev-only console noise (not defects)

If you open `/v20` in a browser that has **extensions installed**, React may
report a hydration mismatch on the News carousel arrows
(`disabled={true}` vs `disabled={null}`). This is environmental, not a code
bug: `idx` and `max` are both `0` on the server *and* on the client's first
render, so the markup is identical by construction. A clean browser profile
reports **0 hydration warnings and 0 console messages** on `/v20`.

Related: the News "next" arrow renders `disabled` until the `ResizeObserver`
takes its first measurement (immediately after hydration) and `max` becomes
non-zero. That is a normal post-hydration state update, not a mismatch.
