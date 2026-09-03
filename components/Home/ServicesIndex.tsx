'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { ArrowUpLeft } from 'lucide-react'
import gsap from 'gsap'

type ServiceItem = {
  id: string
  title: string
  description?: string
  image: string
  href: string
}

/* Signature ease of the awwwards-landing-page Projects pattern. */
const EASE_ENTER: [number, number, number, number] = [0.76, 0, 0.24, 1]
const EASE_EXIT: [number, number, number, number] = [0.32, 0, 0.67, 0]

const scaleVariants: Variants = {
  initial: { scale: 0 },
  enter: { scale: 1, transition: { duration: 0.4, ease: EASE_ENTER } },
  closed: { scale: 0, transition: { duration: 0.4, ease: EASE_EXIT } },
}

/* Description-pattern per-word mask reveal (word-level split keeps Persian
   letter shaping intact; the padding hack stops descender clipping). */
const wordMask: Variants = {
  closed: { y: '110%' },
  open: (i: number) => ({
    y: '0%',
    transition: { duration: 0.8, ease: EASE_ENTER, delay: 0.04 * i },
  }),
}

const HEADING =
  'از رینوپلاستی تا لیفت بدن — هر پرونده با یک مشاورهٔ دقیق آغاز میشود.'

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/**
 * Services index — port of the awwwards-landing-page "Projects" +
 * "Description" patterns onto the clinic's committed stage palette.
 * Rows list the clinic's procedures; on fine-pointer desktops a floating
 * preview panel and a gilded "مشاهده" pill follow the cursor (transform-only
 * gsap.quickTo, unlike the template's left/top). Rows link to /booking so the
 * hover preview is decorative, never the only path.
 */
export function ServicesIndex({ items }: { items: ServiceItem[] }) {
  const [modal, setModal] = useState({ active: false, index: 0 })
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, amount: 0.4 })

  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduced = useReducedMotion()
  const canHover = finePointer && !reduced
  const firstMove = useRef(true)
  const previewRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const movers = useRef<{
    px: (v: number) => void
    py: (v: number) => void
    cx: (v: number) => void
    cy: (v: number) => void
  } | null>(null)

  useEffect(() => {
    if (!canHover) return
    const preview = previewRef.current
    const pill = pillRef.current
    if (!preview || !pill) return

    const ctx = gsap.context(() => {
      gsap.set([preview, pill], { xPercent: -50, yPercent: -50 })
      movers.current = {
        px: gsap.quickTo(preview, 'x', { duration: 0.8, ease: 'power3' }),
        py: gsap.quickTo(preview, 'y', { duration: 0.8, ease: 'power3' }),
        cx: gsap.quickTo(pill, 'x', { duration: 0.5, ease: 'power3' }),
        cy: gsap.quickTo(pill, 'y', { duration: 0.5, ease: 'power3' }),
      }
    })
    return () => {
      movers.current = null
      ctx.revert()
    }
  }, [canHover])

  const handleMouseMove = (e: React.MouseEvent) => {
    const m = movers.current
    if (!m) return
    if (firstMove.current) {
      // Snap on entry instead of flying in from the last/initial position.
      gsap.set([previewRef.current, pillRef.current], {
        x: e.clientX,
        y: e.clientY,
      })
      firstMove.current = false
    }
    m.px(e.clientX)
    m.py(e.clientY)
    m.cx(e.clientX)
    m.cy(e.clientY)
  }

  const showReveal = !reduced

  return (
    <section
      className="relative bg-canvas-deep px-5 py-20 md:px-10 md:py-28"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        firstMove.current = true
        setModal((m) => (m.active ? { ...m, active: false } : m))
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div ref={headRef}>
          <p className="font-serif text-3xl leading-[1.35] text-cream md:text-5xl md:leading-[1.25]">
            {HEADING.split(' ').map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
              >
                {showReveal ? (
                  <motion.span
                    className="inline-block"
                    variants={wordMask}
                    custom={i}
                    initial="closed"
                    animate={inView ? 'open' : 'closed'}
                  >
                    {word}
                  </motion.span>
                ) : (
                  word
                )}
                {'\u00A0'}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          {items.map((item, index) => (
            <Link
              key={item.id}
              href="/booking"
              className="group relative flex items-baseline gap-5 border-t border-glass-border py-6 last:border-b md:gap-8 md:py-8"
              onMouseEnter={() => canHover && setModal({ active: true, index })}
              onMouseLeave={() =>
                canHover &&
                setModal((m) => (m.active ? { ...m, active: false } : m))
              }
            >
              <span className="font-numeric text-xs tabular-nums text-gilded md:text-sm">
                {(index + 1).toLocaleString('fa-IR')}
              </span>
              <span className="font-serif text-2xl text-cream transition-colors duration-300 group-hover:text-gild-bright md:text-4xl">
                {item.title}
              </span>
              <span className="pointer-events-none ms-auto hidden items-baseline gap-3 sm:flex">
                {item.description && (
                  <span className="text-xs text-cream-dim md:text-sm">
                    {item.description}
                  </span>
                )}
                <ArrowUpLeft
                  size={18}
                  className="text-gilded opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/booking"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gilded/40 px-7 py-3 text-sm font-semibold text-gild-bright transition-colors duration-300 hover:border-gilded hover:bg-gilded/10"
          >
            رزرو مشاوره
            <ArrowUpLeft size={16} aria-hidden />
          </Link>
        </div>
      </div>

      {/* Floating preview + cursor pill — desktop fine-pointer only, purely
         decorative (rows themselves carry the content and the link). */}
      <motion.div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
      >
        <motion.div
          variants={scaleVariants}
          initial="initial"
          animate={modal.active && canHover ? 'enter' : 'closed'}
        >
          <div className="-translate-x-1/2 -translate-y-1/2">
            <div className="relative aspect-[4/5] w-64 overflow-hidden rounded-2xl border border-glass-border bg-canvas-raised shadow-2xl shadow-black/60 md:w-72">
              <motion.div
                className="absolute inset-0"
                animate={{ y: `${-modal.index * 100}%` }}
                transition={{ duration: 0.4, ease: EASE_ENTER }}
              >
                {items.map((item) => (
                  <div key={item.id} className="relative h-full w-full">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="288px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        ref={pillRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
      >
        <motion.div
          variants={scaleVariants}
          initial="initial"
          animate={modal.active && canHover ? 'enter' : 'closed'}
        >
          <div className="-translate-x-1/2 -translate-y-[190%]">
            <span className="inline-flex items-center rounded-full bg-gilded px-3 py-1 text-[11px] font-bold text-canvas-deep shadow-lg shadow-black/40">
              مشاهده
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
