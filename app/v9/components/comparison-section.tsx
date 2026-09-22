'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import Link from 'next/link'
import { Arrow, SectionTitle } from './visuals'

/**
 * Before/after comparison section for /v9.
 *
 * The mechanic is the home page's comparator — one frame, two plates of the
 * same procedure, wiped against each other (see
 * components/Home/compare-slides/claude2). Everything around it is the port's
 * own, though: the card IS a treatment card, down to the 20px 60px frame, the
 * white hairline inset outline, the bottom shade with the white display title
 * over it, and the hover arrow. The chips and the knob follow .video-toggle's
 * on-photo language — white hairline, #34263930 glass, backdrop blur — and
 * the offset #cba4c4 edge drifts on scroll like .specialty-outline does.
 *
 * Plates are real dental before/after photography, normalised to the 5:4
 * window of .compare-frame and living in public/v9/images/results.
 */

type ComparisonCase = {
  id: string
  title: string
  href: string
  before: string
  after: string
  beforeAlt: string
  afterAlt: string
}

const CASES: ComparisonCase[] = [
  {
    id: 'orthodontics',
    title: 'ارتودنسی',
    href: '/v9/treatments/orthodonti#invisalign',
    before: '/v9/images/results/orthodontics-before.webp',
    after: '/v9/images/results/orthodontics-after.webp',
    beforeAlt: 'دندان‌های نامنظم پیش از درمان ارتودنسی',
    afterAlt: 'دندان‌ها در مسیر درمان ارتودنسی',
  },
  {
    id: 'implant',
    title: 'ایمپلنت',
    href: '/v9/treatments/dandan#implant',
    before: '/v9/images/results/implant-before.webp',
    after: '/v9/images/results/implant-after.webp',
    beforeAlt: 'بیمار پیش از کاشت ایمپلنت دندان',
    afterAlt: 'بیمار پس از کاشت ایمپلنت دندان',
  },
  {
    id: 'scaling',
    title: 'جرم‌گیری',
    href: '/v9/treatments/tandorosti-dehan#scaling',
    before: '/v9/images/results/scaling-before.webp',
    after: '/v9/images/results/scaling-after.webp',
    beforeAlt: 'دندان‌ها پیش از جرم‌گیری',
    afterAlt: 'دندان‌ها پس از جرم‌گیری',
  },
  {
    id: 'prosthesis',
    title: 'دندان مصنوعی',
    href: '/v9/treatments/dandan#crowns',
    before: '/v9/images/results/prosthesis-before.webp',
    after: '/v9/images/results/prosthesis-after.webp',
    beforeAlt: 'بیمار پیش از دریافت دندان مصنوعی',
    afterAlt: 'بیمار پس از دریافت دندان مصنوعی',
  },
]

const MIN_SPLIT = 0.06
const MAX_SPLIT = 0.94
/** Where the wipe rests once the card has scrolled into view. */
const REST_SPLIT = 0.58
/** Where the wipe starts, so the reveal reads as "the result appearing". */
const START_SPLIT = 0.12

const clampSplit = (value: number) =>
  Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, value))

function CompareCard({ item }: { item: ComparisonCase }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLButtonElement>(null)
  /** Live wipe position as a fraction of the frame, measured from its
   *  physical left edge: the "after" plate occupies `split`, the "before"
   *  plate the remainder. Mirroring rtl by putting after on the left keeps
   *  the reading order starting on the before side. */
  const split = useRef(REST_SPLIT)
  const dragging = useRef(false)
  const intro = useRef<number | null>(null)

  // Written straight to the DOM: this changes on every pointermove, and a
  // re-render per frame across four cards is exactly what makes a drag feel
  // sticky.
  const paint = useCallback((next: number) => {
    const frame = frameRef.current
    if (!frame) return
    split.current = next
    frame.style.setProperty('--compare-split', next.toFixed(4))
    const percent = Math.round(next * 100)
    knobRef.current?.setAttribute('aria-valuenow', String(percent))
    knobRef.current?.setAttribute('aria-valuetext', `${percent} درصد`)
  }, [])

  const stopIntro = useCallback(() => {
    if (intro.current !== null) {
      cancelAnimationFrame(intro.current)
      intro.current = null
    }
  }, [])

  // The reveal the rest of the port gets from ScrollTrigger: the wipe opens
  // from the before plate to the result as the card arrives.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(REST_SPLIT)
      return
    }
    paint(START_SPLIT)
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        const started = performance.now()
        const duration = 1100
        const step = (now: number) => {
          const progress = Math.min(1, (now - started) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          paint(START_SPLIT + (REST_SPLIT - START_SPLIT) * eased)
          intro.current = progress < 1 ? requestAnimationFrame(step) : null
        }
        intro.current = requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )
    observer.observe(frame)
    return () => {
      observer.disconnect()
      stopIntro()
    }
  }, [paint, stopIntro])

  const splitAt = useCallback((clientX: number) => {
    const frame = frameRef.current
    if (!frame) return split.current
    const rect = frame.getBoundingClientRect()
    if (!rect.width) return split.current
    return clampSplit((clientX - rect.left) / rect.width)
  }, [])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    stopIntro()
    dragging.current = true
    frameRef.current?.classList.add('is-dragging')
    frameRef.current?.setPointerCapture(event.pointerId)
    paint(splitAt(event.clientX))
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    paint(splitAt(event.clientX))
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    dragging.current = false
    frameRef.current?.classList.remove('is-dragging')
    if (frameRef.current?.hasPointerCapture(event.pointerId)) {
      frameRef.current.releasePointerCapture(event.pointerId)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 0.12 : 0.04
    let next = split.current
    if (event.key === 'ArrowLeft') next -= step
    else if (event.key === 'ArrowRight') next += step
    else if (event.key === 'Home') next = MIN_SPLIT
    else if (event.key === 'End') next = MAX_SPLIT
    else return
    event.preventDefault()
    stopIntro()
    paint(clampSplit(next))
  }

  return (
    <article className="compare-card" data-reveal>
      <div className="compare-glow" aria-hidden="true" />
      <div className="compare-edge" aria-hidden="true" />

      <div
        ref={frameRef}
        className="compare-frame"
        role="group"
        aria-label={`مقایسه پیش و پس از ${item.title}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onContextMenu={(event) => event.preventDefault()}
      >
        {/* Only the photography scales on hover, like .treatment-card > img.
            The divider rides inside it so the wipe edge can never drift away
            from the line while the plate grows. */}
        <div className="compare-media">
          <div className="compare-layer compare-before">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.before}
              alt={item.beforeAlt}
              width="1000"
              height="800"
              draggable={false}
              loading="lazy"
            />
          </div>
          <div className="compare-layer compare-after">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.after}
              alt={item.afterAlt}
              width="1000"
              height="800"
              draggable={false}
              loading="lazy"
            />
          </div>

          <div className="compare-shade" aria-hidden="true" />

          <div className="compare-divider">
            <button
              ref={knobRef}
              type="button"
              role="slider"
              aria-label={`جابه‌جایی مقایسه پیش و پس از ${item.title}`}
              aria-valuemin={Math.round(MIN_SPLIT * 100)}
              aria-valuemax={Math.round(MAX_SPLIT * 100)}
              aria-valuenow={Math.round(REST_SPLIT * 100)}
              aria-valuetext={`${Math.round(REST_SPLIT * 100)} درصد`}
              className="compare-knob"
              onKeyDown={onKeyDown}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5.5 2.5 2 7l3.5 4.5M8.5 2.5 12 7l-3.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="compare-outline" aria-hidden="true" />
        {/* The frame's and the slider's aria-labels already spell the
            comparison out, so the chips stay decorative. */}
        <span className="compare-chip is-before" aria-hidden="true">
          قبل
        </span>
        <span className="compare-chip is-after" aria-hidden="true">
          بعد
        </span>
        <h3 className="compare-title">{item.title}</h3>

        <Link
          className="compare-arrow"
          href={item.href}
          aria-label={`${item.title} — مشاهده درمان`}
          // Otherwise the frame's drag handler would jump the wipe before the
          // navigation lands.
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Arrow diagonal />
        </Link>
      </div>
    </article>
  )
}

export function ComparisonSection() {
  return (
    <section
      id="results"
      className="compare-section section-shell"
      aria-label="نتایج درمان؛ مقایسه پیش و پس از درمان"
    >
      <div className="compare-head">
        <p className="eyebrow" data-reveal>
          نتایج واقعی بیماران
        </p>
        <SectionTitle text="لبخند، پیش و پس از درمان" />
        <p className="section-paragraph" data-reveal>
          دستگیره را بکشید تا تفاوت را ببینید. هر مورد، نتیجه یکی از
          درمان‌های تخصصی کلینیک است؛ از ارتودنسی و ایمپلنت تا جرم‌گیری و
          دندان مصنوعی.
        </p>
      </div>

      <div className="compare-grid">
        {CASES.map((item) => (
          <CompareCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
