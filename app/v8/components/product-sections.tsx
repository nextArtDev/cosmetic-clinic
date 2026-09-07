'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { steps, details } from '../lib/content'
import { Arrow, Reveal, ease } from './primitives'
import { ProductSequence } from './sequence'
import { PlayMark } from './hero'

const toPersianDigits = (value: number) =>
  String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

export function HowToUse() {
  const ref = useRef<HTMLElement>(null)
  const [model, setModel] = useState<'online' | 'inperson'>('online')
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', value =>
    setActive(Math.min(3, Math.floor(value * 4))),
  )
  const items = steps[model]
  return (
    <section id="how-to-use" className="steps-section" ref={ref}>
      <div className="steps-sticky">
        <img
          className="steps-background"
          src="/v8/media/steps-background.webp"
          alt=""
          loading="lazy"
        />
        <div className="steps-heading">
          <Reveal>
            <h2>
              <span>دریافت درمان در مهر</span>خیلی ساده است
            </h2>
          </Reveal>
          <div className="segmented-control" aria-label="روش مراجعه">
            <button
              className={model === 'online' ? 'selected' : ''}
              onClick={() => {
                setModel('online')
                setActive(0)
              }}
              aria-pressed={model === 'online'}
            >
              نوبت آنلاین
            </button>
            <button
              className={model === 'inperson' ? 'selected' : ''}
              onClick={() => {
                setModel('inperson')
                setActive(0)
              }}
              aria-pressed={model === 'inperson'}
            >
              مراجعه حضوری
            </button>
          </div>
        </div>
        <div className="step-fan" aria-live="polite">
          {items.map((step, index) => {
            const distance = index - active
            return (
              <motion.button
                key={`${model}-${index}`}
                className={`step-card ${index === active ? 'active' : ''}`}
                onClick={() => setActive(index)}
                aria-label={`${toPersianDigits(index + 1)}. ${step.fa}`}
                aria-pressed={active === index}
                aria-hidden={Math.abs(distance) > 2}
                tabIndex={Math.abs(distance) > 2 ? -1 : 0}
                animate={{
                  x: `${distance * 80 - 50}%`,
                  y: reduced ? 0 : Math.abs(distance) * 24,
                  rotate: reduced ? 0 : distance * 12,
                  scale: active === index ? 1 : 0.91,
                  opacity: Math.abs(distance) > 2 ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 24 }}
                style={{ zIndex: 5 - Math.abs(distance) }}
              >
                <span className="step-number">۰{toPersianDigits(index + 1)}</span>
                <img src={`/v8/media/${step.image}`} alt="" loading="lazy" />
                <span className="step-caption">{step.fa}</span>
              </motion.button>
            )
          })}
        </div>
        <div className="step-navigation">
          <button
            className="round-button"
            onClick={() => setActive((active + 3) % 4)}
            aria-label="مرحله قبل"
          >
            <Arrow direction="left" size={20} />
          </button>
          <span>
            ۰{toPersianDigits(active + 1)}
            <span className="muted"> / ۰۴</span>
          </span>
          <button
            className="round-button"
            onClick={() => setActive((active + 1) % 4)}
            aria-label="مرحله بعد"
          >
            <Arrow size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}

export function TwoTouches() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section className="two-touch-section" ref={ref}>
      <div className="two-touch-sticky">
        <div className="two-touch-header shell">
          <Reveal>
            <p className="eyebrow">برای هر تخصص، یک مسیر مشخص</p>
            <h2>{'تشخیص شفاف در\nیک جلسه'}</h2>
          </Reveal>
          <Reveal className="two-touch-description" delay={0.1}>
            <p>
              پزشک شما از قبل نتیجه آزمایش‌ها و سوابق را در پرونده الکترونیک می‌بیند؛ جلسه
              معاینه فقط برای شما و مشکل امروزتان صرف می‌شود.
            </p>
            <p>
              بعد از ویزیت، برنامه درمانی کتبی و قابل فهم تحویل می‌گیرید — با زمان‌بندی
              مشخص برای هر مرحله و شماره تماس مستقیم برای سؤالات بعدی.
            </p>
          </Reveal>
        </div>
        <ProductSequence
          name="touch"
          count={27}
          progress={scrollYProgress}
          fallback="product-mini.webp"
          className="touch-sequence"
          label="محیط معاینه و تجهیزات کلینیک"
        />
        <p className="sequence-caption">تکنولوژی پیشرفته، اما با کلامی ساده برای شما.</p>
      </div>
    </section>
  )
}

export function FilmSection({ onVideo }: { onVideo: () => void }) {
  return (
    <section className="film-section">
      <img
        src="/v8/media/video-background.webp"
        alt="فضای آرامبخش بخش روان‌پزشکی کلینیک مهر"
        loading="lazy"
      />
      <div className="film-overlay" />
      <button className="film-action" onClick={onVideo}>
        <span className="round-button">
          <PlayMark />
        </span>
        <span>{'ببینید چرا بیماران\nبه مهر اعتماد دارند'}</span>
      </button>
    </section>
  )
}

export function Specifications() {
  const ref = useRef<HTMLElement>(null)
  const [model, setModel] = useState<'original' | 'mini'>('original')
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useTransform(scrollYProgress, [0, 0.65], [0, 1])
  const visibleDetails = model === 'original' ? details : [details[0], details[1], details[3]]
  const detail = visibleDetails[Math.min(active, visibleDetails.length - 1)]
  return (
    <section id="specifications" className="specs-section" ref={ref}>
      <div className="specs-sticky">
        <Reveal className="specs-heading">
          <h2>کیفیت در جزئیات هر واحد پنهان است</h2>
        </Reveal>
        <div className="specs-wordmark" aria-hidden="true">
          مهر<sup>®</sup>
          {model === 'mini' && <span>سرپایی</span>}
        </div>
        <div className="specs-stage">
          {model === 'original' ? (
            <ProductSequence
              name="detail"
              count={33}
              progress={progress}
              fallback="product.webp"
              label="نمای نزدیک از فضای تشخیصی کلینیک مهر"
            />
          ) : (
            <motion.img
              key="mini"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="specs-mini-image"
              src="/v8/media/product-mini.webp"
              alt="بخش سرپایی و مشاوره کلینیک مهر"
            />
          )}
          <div className="hotspots">
            {visibleDetails.map((item, i) => (
              <button
                key={item.title}
                className={`hotspot ${active === i ? 'active' : ''}`}
                style={{
                  left: `${model === 'mini' ? [53, 49, 45][i] : item.x}%`,
                  top: `${model === 'mini' ? [25, 43, 70][i] : item.y}%`,
                }}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-label={item.title}
                aria-pressed={active === i}
              >
                {toPersianDigits(i + 1)}
              </button>
            ))}
          </div>
        </div>
        <div className="specs-bottom shell">
          <div>
            <div className="segmented-control specs-switch">
              <button
                className={model === 'original' ? 'selected' : ''}
                onClick={() => {
                  setModel('original')
                  setActive(0)
                }}
                aria-pressed={model === 'original'}
              >
                کل مجموعه
              </button>
              <button
                className={model === 'mini' ? 'selected' : ''}
                onClick={() => {
                  setModel('mini')
                  setActive(0)
                }}
                aria-pressed={model === 'mini'}
              >
                بخش سرپایی
              </button>
            </div>
            <p className="specs-hint">روی هر واحد کلیک کنید تا جزئیاتش را ببینید.</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${model}-${active}`}
              className="spec-detail-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease }}
            >
              <span className="spec-detail-number">۰{toPersianDigits(active + 1)}</span>
              <div>
                <h3>{detail.title}</h3>
                <p>{detail.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
