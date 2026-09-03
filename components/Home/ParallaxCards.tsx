'use client'

import { ReactLenis } from 'lenis/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  ParallaxCards — data-driven bento grid, mobile-first
 * ─────────────────────────────────────────────────────────────────────────
 *  What changed from the original 3-card static markup, and why:
 *
 *   • Data-driven. `items` is now an array (10 by default via `demoItems`,
 *     but any length works) instead of three hard-coded <aside>/<div>
 *     blocks — one card template, mapped.
 *
 *   • Mobile-first grid. The original had `min-w-[1200px]` on the grid
 *     and a fixed `h-[700px]`, which forces horizontal scrolling on any
 *     phone — there's no way to make a 1200px-wide grid fit a 375px
 *     screen. It's replaced with `grid-cols-1` (stacked, one per row) by
 *     default, `sm:grid-cols-2` at 640px, `lg:grid-cols-4` at 1024px —
 *     card height comes from `aspect-[4/5]` on mobile and from
 *     grid-auto-rows once the bento spans kick in at `sm:`.
 *
 *   • The original's `speed[i]` array only had 4 entries, so card index
 *     4+ would read `undefined` and silently break the tween. Replaced
 *     with a repeating `DRIFT_PATTERN` that's safe for any item count.
 *
 *   • Parallax drift is toned down on mobile (a fraction of the desktop
 *     amount, vertical-only — no x-drift fighting a vertical thumb
 *     scroll) and zeroed under `prefers-reduced-motion`.
 *
 *   • Each card's photo is a real background now (`next/image fill`)
 *     with a bottom scrim for text contrast, instead of a flat color.
 *     Only the first two images are `priority` (above-the-fold on both
 *     mobile and desktop); the rest lazy-load.
 *
 *   • Titles get a small per-card reveal (SplitText lines, slide + fade)
 *     as they scroll into view, on top of the parallax drift — skipped
 *     entirely under reduced motion.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface ParallaxCardItem {
  title: string
  image: string | StaticImageData
  href?: string
  ctaLabel?: string
  /** CTA pill background color. */
  accent?: string
  /** Force a specific desktop span instead of the auto bento pattern. */
  span?: 'sm' | 'md' | 'lg'
}

interface ParallaxCardsProps {
  items?: ParallaxCardItem[]
  className?: string
}

// Repeats indefinitely, so this scales past 10 items without index errors.
const SPAN_PATTERN: Array<'sm' | 'md' | 'lg'> = [
  'lg',
  'sm',
  'sm',
  'md',
  'sm',
  'sm',
  'md',
  'sm',
  'sm',
  'lg',
]

const SPAN_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  lg: 'sm:col-span-2 sm:row-span-2',
  md: 'sm:col-span-2 sm:row-span-1',
  sm: 'sm:col-span-1 sm:row-span-1',
}

// Per-card vertical drift %, desktop baseline — mobile uses a fraction of it.
const DRIFT_PATTERN = [-18, 22, -12, 28, -24, 16, -20, 12, -26, 20]

function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

const demoItems: ParallaxCardItem[] = Array.from({ length: 10 }, (_, i) => ({
  title: [
    'Fan Freaking Tastic!',
    'Realize this might be it.',
    "It's your time to shine.",
    'Built for the bold.',
    'Slow down. Look closer.',
    'Every detail, considered.',
    'Where craft meets scale.',
    'Small moves, big shifts.',
    'Say it without saying it.',
    'Start before you\u2019re ready.',
  ][i],
  image: `https://picsum.photos/seed/parallax-card-${i}/900/1100`,
  href: '#',
  ctaLabel: 'Go Bonkers.',
  accent: '#f5d033',
}))

const ParallaxCards = ({
  items = demoItems,
  className,
}: ParallaxCardsProps) => {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isMobile = useMediaQuery('(max-width: 639px)')

  useGSAP(
    () => {
      if (!sectionRef.current) return
      const cards = cardRefs.current.filter(
        (el): el is HTMLDivElement => el !== null,
      )
      const splits: SplitText[] = []

      cards.forEach((card, i) => {
        const drift = DRIFT_PATTERN[i % DRIFT_PATTERN.length]
        // Mobile: light, vertical-only drift so cards don't fight the
        // thumb-scroll. Desktop: adds a little x-drift for the bento feel.
        const yPercent = reduceMotion ? 0 : drift * (isMobile ? 0.35 : 1)
        const xPercent = reduceMotion || isMobile ? 0 : drift * 0.4

        gsap.from(card, {
          yPercent,
          xPercent,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        if (reduceMotion) return
        const heading = card.querySelector<HTMLElement>('[data-card-title]')
        if (!heading) return
        const split = new SplitText(heading, {
          type: 'lines',
          linesClass: 'overflow-hidden',
        })
        splits.push(split)
        gsap.from(split.lines, {
          yPercent: 110,
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      // SplitText mutates the DOM (wraps each line in a span) — that's
      // not a gsap tween, so useGSAP's automatic context revert won't
      // undo it on its own. Revert explicitly on cleanup/re-run.
      return () => splits.forEach((split) => split.revert())
    },
    { scope: sectionRef, dependencies: [items, reduceMotion, isMobile] },
  )

  return (
    <ReactLenis root>
      <section
        ref={sectionRef}
        className={cn(
          'relative w-full bg-background px-4 py-16 sm:px-8 sm:py-24 lg:px-12',
          className,
        )}
      >
        <div
          className={cn(
            'mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4',
            'sm:grid-cols-2 sm:gap-5 sm:[grid-auto-rows:minmax(200px,1fr)]',
            'lg:grid-cols-4 lg:[grid-auto-rows:minmax(180px,1fr)]',
          )}
        >
          {items.map((item, i) => {
            const span = item.span ?? SPAN_PATTERN[i % SPAN_PATTERN.length]
            return (
              <div
                key={`${item.title}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className={cn(
                  'para-bonkers group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border-4 border-foreground p-5',
                  'sm:aspect-auto sm:p-6 lg:p-8',
                  SPAN_CLASSES[span],
                )}
                style={{ boxShadow: '5px 5px 0 var(--foreground)' }}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  priority={i < 2}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/0"
                />
                <div className="relative z-10 flex flex-col gap-3">
                  <h3
                    data-card-title
                    className="m-0 text-[clamp(1.3rem,4.2vw,2.1rem)] font-extrabold leading-[1.05] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.5)] sm:w-[85%]"
                  >
                    {item.title}
                  </h3>
                  {item.href && (
                    <Link
                      href={item.href}
                      className="cta w-fit rounded-[0.4rem] px-[0.8em] py-[0.35em] text-sm font-semibold text-black transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                      style={{ backgroundColor: item.accent ?? '#ffffff' }}
                    >
                      {item.ctaLabel ?? 'مشاهده'}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </ReactLenis>
  )
}

export default ParallaxCards

/**
 * ── Usage ──────────────────────────────────────────────────────────────
 *
 * <ParallaxCards
 *   items={[
 *     { title: 'Case 01', image: caseOne, href: '/cases/01', accent: '#f5d033' },
 *     { title: 'Case 02', image: caseTwo, href: '/cases/02', accent: '#00ff75' },
 *     // ...up to however many you want — the span pattern repeats.
 *   ]}
 * />
 *
 * With no `items` prop it renders 10 placeholder cards (picsum photos) so
 * you can see the bento layout and parallax before wiring real data in.
 * ──────────────────────────────────────────────────────────────────────
 */
