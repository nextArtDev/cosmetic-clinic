'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarCheck, MapPin, UserRound } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

// Register ScrollTrigger safely for React
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `

.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;

  /* Clinic dark-cinematic surface: overrides the root light tokens locally,
     so every token-based utility inside (bg-background, text-foreground,
     text-muted-foreground, border-border, the pill vars below) flips dark
     without touching the rest of the site. Uses the home "stage" palette
     so the footer continues the landing's warm canvas seamlessly. */
  --background: var(--home-canvas);
  --foreground: var(--home-cream);
  --border: rgba(227, 201, 143, 0.14);
  --muted-foreground: var(--home-cream-dim);

  /* Dynamic Variables using standard shadcn/tailwind v4 tokens (with safe fallbacks) */
  --pill-bg-1: color-mix(in oklch, var(--foreground, #0a0a0a) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground, #0a0a0a) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background, #ffffff) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground, #0a0a0a) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background, #ffffff) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground, #0a0a0a) 8%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--foreground, #0a0a0a) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground, #0a0a0a) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground, #0a0a0a) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background, #ffffff) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground, #0a0a0a) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive, #ef4444) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive, #ef4444) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground, #0a0a0a) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground, #0a0a0a) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary, #6366f1) 15%, transparent) 0%,
    color-mix(in oklch, var(--secondary, #a5b4fc) 15%, transparent) 40%,
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) {
  .footer-glass-pill:hover {
    background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
    border-color: var(--pill-border-hover);
    box-shadow:
        0 20px 40px -10px var(--pill-shadow-hover),
        inset 0 1px 1px var(--pill-highlight-hover);
    color: var(--foreground);
  }
}

/* Giant Background Text Masking — fluid on every screen */
.footer-giant-bg-text {
  font-size: clamp(5.5rem, 26vw, 30rem);
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground, #0a0a0a) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground, #0a0a0a) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}

/* Respect users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-footer-breathe,
  .animate-footer-scroll-marquee,
  .animate-footer-heartbeat {
    animation: none;
  }
}
`

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency, touch-aware)
// -------------------------------------------------------------------------
export type MagneticButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      as?: React.ElementType
    }

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as = 'button', ...props }, forwardedRef) => {
    const Component = as as unknown as React.FC<Record<string, unknown>>
    const localRef = useRef<HTMLElement>(null)

    useEffect(() => {
      if (typeof window === 'undefined') return
      const element = localRef.current
      if (!element) return

      // Skip magnetic effect on touch devices & reduced-motion users
      const isCoarsePointer =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (isCoarsePointer || prefersReducedMotion) return

      const ctx = gsap.context(() => {
        // gsap-performance: frequently updated properties (mouse follower)
        // must use gsap.quickTo() — one reused tween per property instead of
        // creating a new tween on every mousemove.
        const shared = { duration: 0.4, ease: 'power2.out' }
        const xTo = gsap.quickTo(element, 'x', shared)
        const yTo = gsap.quickTo(element, 'y', shared)
        const rotationXTo = gsap.quickTo(element, 'rotationX', shared)
        const rotationYTo = gsap.quickTo(element, 'rotationY', shared)
        const scaleTo = gsap.quickTo(element, 'scale', shared)

        gsap.set(element, { transformPerspective: 700 })

        // Measure on enter (and on scroll while hovered, rAF-throttled) —
        // never interleave a getBoundingClientRect() read with every write.
        let rect = { left: 0, top: 0, width: 0, height: 0 }
        let measureRaf = 0
        const measure = () => {
          measureRaf = 0
          rect = element.getBoundingClientRect()
        }
        const queueMeasure = () => {
          if (!measureRaf) measureRaf = requestAnimationFrame(measure)
        }

        const handleMouseEnter = () => {
          measure()
          scaleTo(1.05)
        }

        const handleMouseMove = (e: MouseEvent) => {
          const x = e.clientX - rect.left - rect.width / 2
          const y = e.clientY - rect.top - rect.height / 2
          xTo(x * 0.4)
          yTo(y * 0.4)
          rotationXTo(-y * 0.15)
          rotationYTo(x * 0.15)
        }

        const handleMouseLeave = () => {
          // One tween per leave is fine — the hot path is mousemove.
          // Adding the gsap.to() directly inside the context callback is
          // enough — ctx.revert() cleans up any in-flight tweens created
          // while the context is active. (gsap.context already records
          // them; no separate contextSafe wrapping needed here.)
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: 'elastic.out(1, 0.3)',
            duration: 1.2,
            overwrite: true,
          })
        }

        window.addEventListener('scroll', queueMeasure, { passive: true })
        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mousemove', handleMouseMove)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
          if (measureRaf) cancelAnimationFrame(measureRaf)
          window.removeEventListener('scroll', queueMeasure)
          element.removeEventListener('mouseenter', handleMouseEnter)
          element.removeEventListener('mousemove', handleMouseMove)
          element.removeEventListener('mouseleave', handleMouseLeave)
        }
      }, element)

      return () => ctx.revert()
    }, [])

    const PolymorphicTag = Component as unknown as React.FC<
      Record<string, unknown>
    >
    return (
      <PolymorphicTag
        ref={(node: HTMLElement) => {
          localRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef)
            (forwardedRef as React.RefObject<HTMLElement | null>).current = node
        }}
        className={cn('cursor-pointer', className)}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </PolymorphicTag>
    )
  },
)
MagneticButton.displayName = 'MagneticButton'

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const FALLBACK_SERVICES = [
  'جراحی بینی',
  'فیس‌لیفت',
  'لیپوساکشن',
  'پروتز زیبایی',
]

const MarqueeItem = ({
  services,
  keyPrefix = '',
}: {
  services: string[]
  keyPrefix?: string
}) => (
  <div className="flex items-center gap-8 md:gap-12 px-4 md:px-6 whitespace-nowrap">
    {services.map((service) => (
      <span
        key={keyPrefix + service}
        className="inline-flex items-center gap-8 md:gap-12"
      >
        <span>{service}</span>
        <span className="text-gilded/60">✦</span>
      </span>
    ))}
  </div>
)

interface CinematicFooterProps {
  /** Active specializations from the DB, shown in the marquee. */
  services?: string[]
  /** Server-rendered slot (e.g. the review form) shown under the links. */
  reviewSlot?: React.ReactNode
}

export function CinematicFooter({
  services,
  reviewSlot,
}: CinematicFooterProps) {
  const serviceNames =
    services && services.length > 0 ? services : FALLBACK_SERVICES
  const wrapperRef = useRef<HTMLDivElement>(null)
  const giantTextRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  // The footer lives in the (home) layout, so it does NOT remount on client
  // navigation. Re-run the GSAP context per route, otherwise ScrollTrigger
  // keeps the previous page's measurements and the scrubbed content can stay
  // stuck at opacity 0 (footer looks like it "disappeared").
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!wrapperRef.current) return

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: '10vh', scale: 0.8, opacity: 0 },
        {
          y: '0vh',
          scale: 1,
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 90%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )

      // Staggered Content Reveal — starts as soon as the curtain enters the
      // viewport, so on tall mobile pages the content is fully visible before
      // the very last scroll pixel (mobile bars make "exact bottom" fuzzy).
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 75%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )
    }, wrapperRef)

    // The footer sits at the very bottom of a page whose height keeps changing
    // AFTER mount (lazy images, canvases, video posters). Stale ScrollTrigger
    // measurements left the content stuck at opacity 0 — re-measure whenever
    // the document height settles.
    let raf = 0
    let lastHeight = document.body.offsetHeight
    const ro = new ResizeObserver(() => {
      const h = document.body.offsetHeight
      if (h === lastHeight) return
      lastHeight = h
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    ro.observe(document.body)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('load', onLoad)
      ctx.revert()
    }
  }, [pathname])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box.
        Uses 100svh (with 100vh fallback via class) to avoid mobile
        browser-chrome jump.
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{
          height: '100svh',
          clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)',
        }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
        <footer
          className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground cinematic-footer-wrapper"
          style={{ height: '100svh' }}
        >
          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            aria-hidden
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            FAZELI
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-8 md:top-12 left-0 w-full overflow-hidden border-y border-border/50 bg-background/60 backdrop-blur-md py-3 md:py-4 z-10 -rotate-1 md:-rotate-2 scale-[1.06] md:scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs sm:text-sm font-bold tracking-wide text-muted-foreground">
              <MarqueeItem services={serviceNames} />
              <div aria-hidden className="contents">
                <MarqueeItem services={serviceNames} keyPrefix="dup-" />
              </div>
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 min-h-0 flex-col items-center justify-center px-5 sm:px-6 mt-14 sm:mt-16 md:mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="max-w-4xl text-4xl sm:text-6xl md:text-7xl xl:text-8xl leading-[1.05] font-black footer-text-glow tracking-tight text-balance mb-8 sm:mb-10 md:mb-12 text-center"
            >
              آمادهٔ تغییر هستید؟
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div
              ref={linksRef}
              className="flex flex-col items-center gap-5 md:gap-6 w-full"
            >
              {/* Primary actions */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
                <MagneticButton
                  as={Link}
                  href="/booking"
                  className="footer-glass-pill w-full sm:w-auto justify-center px-6 sm:px-8 md:px-10 py-4 md:py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <CalendarCheck className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  رزرو نوبت آنلاین
                </MagneticButton>

                <MagneticButton
                  as={Link}
                  href="/user"
                  className="footer-glass-pill w-full sm:w-auto justify-center px-6 sm:px-8 md:px-10 py-4 md:py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <UserRound className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ویزیت‌های من
                </MagneticButton>
              </div>

              {/* Secondary Text Links */}
              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 md:gap-5 w-full mt-1 md:mt-2">
                {[
                  { label: 'خانه', href: '/' },
                  { label: 'خدمات', href: '/#services' },
                  { label: 'نتایج', href: '/#results' },
                  { label: 'نظرات مراجعین', href: '/#testimonials' },
                  { label: 'ورود', href: '/signin' },
                ].map((link) => (
                  <MagneticButton
                    key={link.href}
                    as={Link}
                    href={link.href}
                    className="footer-glass-pill px-4 sm:px-5 md:px-6 py-2.5 md:py-3 rounded-full text-muted-foreground font-medium text-xs sm:text-sm hover:text-foreground"
                  >
                    {link.label}
                  </MagneticButton>
                ))}
              </div>

              {/* Contact strip */}
              <div className="flex flex-wrap justify-center gap-2.5 w-full mt-1">
                <span className="footer-glass-pill px-5 md:px-6 py-2.5 rounded-full flex items-center gap-2 text-muted-foreground text-xs sm:text-sm cursor-default">
                  <MapPin size={14} className="shrink-0 text-gilded/70" />
                  آدرس مطب: اصفهان، خیابان رودکی — کلینیک دکتر شبنم فضلی
                </span>
              </div>

              {/* Review submission slot (session-gated server-side) */}
              {reviewSlot}
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-8 px-5 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6">
            {/* Copyright */}
            <div className="text-muted-foreground text-xs md:text-sm font-semibold tracking-widest text-center order-2 md:order-1">
              © {new Date().getFullYear()} کلینیک دکتر شبنم فضلی — تمامی حقوق
              محفوظ است.
            </div>

            {/* "Made with Love" Badge */}
            {/* <div className="footer-glass-pill px-5 md:px-6 py-2.5 md:py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-border/50">
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold tracking-widest">
                ساخته‌شده با
              </span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-destructive">
                ❤
              </span>
              <span className="text-muted-foreground text-[10px] md:text-xs font-bold tracking-widest">
                در اصفهان
              </span>
            </div> */}

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-11 h-11 md:w-12 md:h-12 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                ></path>
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  )
}
