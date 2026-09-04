'use client'

import React, { useRef, useEffect } from 'react'
import Core from 'smooothy'
import { Star, Quote, BadgeCheck } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Review {
  /** Present on DB-fed reviews; absent on fallback mocks. */
  id?: string
  text: string
  name: string
  procedure: string
  rating: number
  date: string
}

interface SmooothyOptions {
  infinite?: boolean
  snap?: boolean
  variableWidth?: boolean
  lerpFactor?: number
  speedDecay?: number
  bounceLimit?: number
  setOffset?: (params: { itemWidth: number; totalWidth: number }) => number
  onUpdate?: (instance: { current: number }) => void
}

interface SmooothyInstance {
  update: () => void
  isDragging: boolean
  speed: number
  target: number
  maxScroll: number
  destroy: () => void
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
/**
 * Fallback shown when the DB has no approved reviews yet. The live data
 * (approved `Review` rows fed from the server page) uses the same shape,
 * so no photos are involved anywhere — letter-initial avatars only.
 */
const FALLBACK_REVIEWS: Review[] = [
  {
    text: 'دکتر کارتر تنها ظاهر مرا تغییر نداد، بلکه اعتماد به نفس مرا نیز متحول ساخت. نتیجه رینوپلاستی به‌طرز باورکردنی طبیعی به نظر می‌رسد — دقیقاً همان چیزی که تصور می‌کردم.',
    name: 'Sarah M.',
    procedure: 'رینوپلاستی',
    rating: 5,
    date: '10 روز پیش',
  },
  {
    text: 'از اولین مشاوره تا دوران نقاهت، هر مرحله با حرفه‌ای‌گری و مراقبتی صمیمانه همراه بود. نتیجه لیفت صورتم به‌زیبایی ظریف و ملایم است.',
    name: 'Jennifer L.',
    procedure: 'لیفت صورت',
    rating: 5,
    date: 'دیروز',
  },
  {
    text: 'دقت و توجه به جزئیات در کارشان بی‌نظیر است. نتیجه بزرگ‌سازی سینه‌ام کاملاً طبیعی به نظر می‌رسد و بالاخره در بدن خودم احساس راحتی می‌کنم.',
    name: 'Amanda R.',
    procedure: 'بزرگ‌سازی سینه',
    rating: 5,
    date: '10 دقیقه پیش',
  },
  {
    text: 'از جراحی پلک می‌ترسیدم، اما دکتر کارتر باعث شد احساس امنیت کنم. نتیجه ده سال از چهره‌ام کم کرد، در حالی که خودِ خودم باقی ماندم.',
    name: 'Rachel T.',
    procedure: 'بلفاروپلاستی (جراحی پلک)',
    rating: 5,
    date: '1 ماه پیش',
  },
  {
    text: 'بعد از سه بار بارداری، عمل لیفت شکم، اندام پیش از بارداری را به من بازگرداند. جای بخیه تقریباً نامرئی است. واقعاً یک هنرمند در کار خودش است.',
    name: 'Michelle K.',
    procedure: 'ابدومینوپلاستی (لیفت شکم)',
    rating: 5,
    date: '4 روز پیش',
  },
  {
    text: 'لیفت ابرو ظریف اما متحول‌کننده بود. احساس می‌کنم استراحت‌کرده، شاداب و کاملاً خودم هستم. تنها پشیمانیم این است که زودتر انجامش ندادم.',
    name: 'Laura B.',
    procedure: 'لیفت ابرو',
    rating: 5,
    date: 'دیروز',
  },
  {
    text: 'قبل از انتخاب دکتر کارتر، با پنج جراح مشورت کردم. صداقت و مهارت او او را از دیگران متمایز می‌کند. نتیجه رینوپلاستی ترمیمی‌ام عالی و بی‌نقص بود.',
    name: 'Catherine W.',
    procedure: 'رینوپلاستی ترمیمی',
    rating: 5,
    date: '2 هفته پیش',
  },
  {
    text: 'لیفت گردنی که جاذبه را به چالش کشید. خط فک من دوباره مشخص شده است و احساس می‌کنم ظاهرم بالاخره با طراوت درونی‌ام همخوانی دارد.',
    name: 'Diane H.',
    procedure: 'لیفت گردن',
    rating: 5,
    date: '2 ماه پیش',
  },
]

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const GAP_VW = 2 // must match CSS mr-[2vw]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface TestimonialsSwiperProps {
  /** Approved reviews fetched server-side; falls back to mock data if empty. */
  reviews?: Review[]
  /** Preformatted Persian stats line, e.g. «۴٫۸ از ۵ · ۱۲ مراجع». */
  statsLine?: string
}

const TestimonialsSwiper: React.FC<TestimonialsSwiperProps> = ({
  reviews,
  statsLine,
}) => {
  const list = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS
  const stats =
    statsLine ??
    `${list.length > 0 ? list[0].rating : 5} · ${list.length} مراجع`
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const container = containerRef.current
    if (!wrapper || !container) return

    const slides = Array.from(wrapper.children) as HTMLElement[]

    const preventSelect = (e: Event) => e.preventDefault()
    wrapper.addEventListener('selectstart', preventSelect)
    wrapper.style.userSelect = 'none'
    wrapper.style.webkitUserSelect = 'none'
    wrapper.style.touchAction = 'pan-y'

    const slider = new (Core as unknown as new (
      el: HTMLElement,
      opts: SmooothyOptions,
    ) => SmooothyInstance)(wrapper, {
      infinite: false,
      snap: false,
      variableWidth: true,
      lerpFactor: 0.045,
      speedDecay: 0.97,
      bounceLimit: 0,

      /*
       * FIX: Account for gaps between cards.
       * smooothy's totalWidth = sum of offsetWidth (no margins).
       * We need: maxScroll such that last card ends at containerWidth.
       * Formula: setOffset = containerWidth - (N-1) * gap
       */
      setOffset: ({ itemWidth }: { itemWidth: number; totalWidth: number }) => {
        const containerWidth = container.offsetWidth
        const gap = window.innerWidth * (GAP_VW / 100)
        const numCards = list.length
        // Optional: add a small buffer so the last card doesn't touch the edge
        const endBuffer = itemWidth * 0.08
        return containerWidth - (numCards - 1) * gap - endBuffer
      },

      onUpdate: ({ current }: { current: number }) => {
        const vwPeek = window.innerWidth * 0.08

        slides.forEach((slide, i) => {
          const w = slide.offsetWidth
          const slideLeft = slide.offsetLeft + current
          const isLast = i === slides.length - 1

          // Exit animation: cards rotate & scale as they leave left edge
          if (slideLeft < 0 && !isLast) {
            const ratio = Math.min(1, Math.abs(slideLeft) / w)
            slide.style.cssText = `
              transform: translateX(${
                current + Math.abs(slideLeft) + ratio * vwPeek
              }px) rotate(${-8 * ratio}deg) scale(${1 - ratio * 0.2});
              z-index: ${i + 1};
              opacity: ${1 - ratio * 0.4};
            `
          } else {
            slide.style.cssText = `
              transform: translateX(${current}px);
              z-index: ${i + 1};
              opacity: 1;
            `
          }
        })
      },
    })

    let animId: number
    let wasDragging = false
    let momentum = 0
    const MOMENTUM_MULTIPLIER = 10
    const MOMENTUM_DECAY = 0.96

    function animate(): void {
      slider.update()

      if (slider.isDragging) {
        wasDragging = true
        momentum = 0
      } else if (wasDragging) {
        momentum = slider.speed * MOMENTUM_MULTIPLIER
        wasDragging = false
      }

      if (Math.abs(momentum) > 0.5) {
        slider.target += momentum
        momentum *= MOMENTUM_DECAY
        slider.target = Math.max(slider.maxScroll, Math.min(0, slider.target))
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      wrapper.removeEventListener('selectstart', preventSelect)
      slider.destroy()
    }
  }, [list.length])

  return (
    <section className="w-full min-h-screen flex flex-col lg:flex-row items-center bg-canvas-deep overflow-hidden py-14 lg:py-0">
      {/* Left — refined typography */}
      <div
        dir="rtl"
        className="w-full lg:w-[36%] flex flex-col items-start px-6 lg:px-[4vw] justify-center shrink-0"
      >
        <span className="text-gilded text-xs tracking-[0.35em] uppercase mb-4 font-medium">
          دیدگاه مراجعین
        </span>

        <h2 className="text-2xl sm:text-3xl lg:text-[2.8vw] uppercase leading-[1.05] text-balance font-serif text-cream mb-4">
          روایت‌های
          <br />
          <em className="text-gild-bright not-italic">دگرگونی</em>
        </h2>

        <p className="text-[13px] lg:text-[0.85vw] text-cream-dim leading-relaxed max-w-xs text-pretty">
          تجربه‌های واقعی مراجعان ما؛ اعتمادشان، هنر ما — هر روایت گواهی است بر
          ظرافت جراحی زیبایی مدرن.
        </p>

        <div className="mt-7 flex items-center gap-3">
          <div className="flex -space-x-2">
            {list.slice(0, 4).map((r, i) => (
              <div
                key={r.id ?? i}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-gild-bright via-gilded to-gild-deep flex items-center justify-center text-canvas-deep text-[11px] font-bold border-2 border-canvas-deep"
              >
                {r.name.trim().charAt(0)}
              </div>
            ))}
          </div>
          <div>
            <div className="flex gap-px mb-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="fill-gild-bright text-gild-bright"
                  size={9}
                />
              ))}
            </div>
            <span className="text-xs text-cream-dim tabular-nums">{stats}</span>
          </div>
        </div>
      </div>

      {/* Right — swipeable cards */}
      <div
        ref={containerRef}
        className="w-full lg:w-[64%] h-[72vh] lg:h-screen overflow-clip relative flex items-center"
      >
        <div
          ref={wrapperRef}
          className="flex h-full items-center will-change-transform cursor-grab active:cursor-grabbing"
        >
          {list.map((review, i) => (
            <ReviewCard
              key={review.id ?? i}
              review={review}
              isLast={i === list.length - 1}
            />
          ))}
        </div>

        <div className="absolute bottom-28 left-6 flex items-center gap-2 text-cream-dim/60 text-xs pointer-events-none select-none animate-ping ">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m5 12 4-4" />
            <path d="m5 12 4 4" />
            {/* <path d="m19 12-4-4" /> */}
            {/* <path d="m19 12-4 4" /> */}
          </svg>
          {/* برای کاوش بکشید */}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Review Card                                                        */
/* ------------------------------------------------------------------ */
const ReviewCard: React.FC<{ review: Review; isLast: boolean }> = ({
  review,
  isLast,
}) => (
  <div
    className={[
      'shrink-0 pointer-events-none',
      'w-[78vw] sm:w-[52vw] lg:w-[27vw] xl:w-[23vw]',
      'h-[45vh] lg:h-[36vw] lg:max-h-[500px]',
      'rounded-3xl p-6 lg:p-7',
      'bg-gradient-to-br from-canvas-raised/80 to-canvas/95',
      'backdrop-blur-sm border border-white/10 shadow-2xl',
      'flex flex-col justify-between',
      !isLast ? 'mr-[2vw]' : '',
    ].join(' ')}
  >
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star
              key={i}
              className="fill-gild-bright text-gild-bright"
              size={13}
            />
          ))}
        </div>
        <Quote className="text-gilded/20" size={26} strokeWidth={1.5} />
      </div>

      <span className="inline-flex items-center self-start gap-1.5 px-3 py-1 bg-gilded/10 border border-gilded/25 rounded-full text-xs text-gild-bright font-medium tracking-wide">
        <span className="w-1 h-1 rounded-full bg-gilded" />
        {review.procedure}
      </span>

      <blockquote className="text-cream text-[13px] sm:text-sm lg:text-[0.95vw] leading-[1.65] font-normal text-pretty">
        &ldquo;{review.text}&rdquo;
      </blockquote>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gild-bright via-gilded to-gild-deep flex items-center justify-center text-canvas-deep font-serif text-sm font-semibold shadow-lg">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="text-cream text-[13px] font-medium leading-tight">
            {review.name}
          </p>
          <span className="flex items-center gap-1 text-cream-dim text-xs mt-0.5">
            <BadgeCheck size={10} className="text-gild-bright" />
            مراجع تأییدشده
          </span>
        </div>
      </div>
      <span className="text-cream-dim/70 text-xs tabular-nums">
        {review.date}
      </span>
    </div>
  </div>
)

export default TestimonialsSwiper
