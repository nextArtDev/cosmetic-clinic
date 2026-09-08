'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Plus } from 'lucide-react'
import { benefits } from '../lib/content'
import { Arrow, BrandIcon, FlowLines, Reveal, ease } from './primitives'
import { ProductSequence } from './sequence'
import { PlayMark } from './hero'

export function About() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useTransform(scrollYProgress, [0, 0.9], [0, 1])
  // The reference site's l-description-content pattern: the statement
  // rises slightly as the sequence takes over, then fades out.
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -70])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [1, 1, 0.2])
  return (
    <section ref={ref} id="about" className="about-section">
      <div className="about-sticky">
        <FlowLines />
        <motion.div
          className="about-statement shell"
          style={{ y: reduced ? 0 : titleY, opacity: reduced ? 1 : titleOpacity }}
        >
          <p className="eyebrow">آشنایی با کلینیک قلب مهر</p>
          <h2>
            از نوار قلب تا اکو و تست ورزش؛ تشخیص، درمان و پیگیری قلب شما — همه با یک پزشک،
            یک پرونده و یک استاندارد.
          </h2>
        </motion.div>
        <ProductSequence name="intro" count={60} progress={progress} className="about-sequence" />
        <div className="about-notes shell">
          <div className="surface-note">
            <BrandIcon name="heart" />
            <h3>در قلب تهران، نزدیک شما</h3>
            <p>
              مجهز به نوار قلب، اکو، تست ورزش و هولتر فشار خون؛ بدون معطلی و بدون
              رفت‌وآمد بین چند مرکز.
            </p>
          </div>
          <p className="about-small">
            از تشخیص تا پیگیری، همه مسیر درمان قلبی شما یک‌جا مدیریت می‌شود.
            <a href="#benefits" className="text-link">
              آشنایی با خدمات قلب
              <Arrow direction="down" size={18} />
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export function Benefits() {
  const [expanded, setExpanded] = useState<number | null>(null)
  return (
    <section id="benefits" className="benefits-section" aria-label="خدمات قلب کلینیک قلب مهر">
      <div className="benefits-stack shell">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.image}
            className={`benefit-card ${expanded === index ? 'is-expanded' : ''}`}
            style={{ top: `${40 + index * 20}px`, backgroundColor: benefit.color }}
          >
            <div className="benefit-copy">
              <BrandIcon name={benefit.icon} />
              <h2>{benefit.title}</h2>
              <p>{benefit.description}</p>
              <div className="benefit-bottom">
                <span>
                  ۰{index + 1} <span className="muted">/ ۰۳</span>
                </span>
                <button
                  className="round-button"
                  aria-expanded={expanded === index}
                  aria-label="باز کردن توضیحات بیشتر"
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <Plus size={24} strokeWidth={1.2} />
                </button>
              </div>
            </div>
            <div className="benefit-image">
              <img src={`/v8/media/${benefit.image}`} alt={benefit.title} loading="lazy" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const travelCaptions = [
  'پرونده الکترونیک قلبی شما همه‌جا همراهتان است؛ نوار قلب و اکوی قبلی برای ویزیت بعدی، همان لحظه آماده است.',
  'برنامه کنترل فشار خون، نوبت‌های پیگیری و یادآور داروها از ابتدای مسیر مشخص است؛ بدون سردرگمی و اتلاف وقت.',
  'در منزل، محل کار یا سفر — خط تماس و مشاوره پیامکی دستیار دکتر صادقی همیشه در دسترس شماست.',
]

export function WithYou() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 7])
  const y = useTransform(scrollYProgress, [0, 1], [30, -35])
  useMotionValueEvent(scrollYProgress, 'change', value =>
    setActive(Math.min(2, Math.floor(value * 3))),
  )
  return (
    <section ref={ref} className="with-you-section">
      <div className="with-you-sticky">
        <FlowLines />
        <div className="with-you-layout shell">
          <Reveal className="with-you-heading">
            <h2>
              <span>مراقبت پیوسته،</span>همیشه همراه شما
            </h2>
          </Reveal>
          <motion.img
            className="travel-product"
            src="/v8/media/stylist.webp"
            alt="تیم کلینیک قلب مهر در حال هماهنگی برنامه پیگیری بیمار"
            loading="lazy"
            style={{ rotate: reduced ? 0 : rotate, y: reduced ? 0 : y }}
          />
          <div className="travel-card-wrap">
            <AnimatePresence mode="wait">
              <motion.article
                key={active}
                className="travel-card"
                initial={{ opacity: 0, y: reduced ? 0 : 35, rotate: reduced ? 0 : 4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -25 }}
                transition={{ duration: 0.5, ease }}
              >
                <span className="tiny-label">۰{active + 1} / ۰۳</span>
                <img
                  src={`/v8/media/person-${active + 1}.jpg`}
                  alt="بیماران قلبی در جلسه پیگیری درمان"
                  loading="lazy"
                />
                <p>{travelCaptions[active]}</p>
              </motion.article>
            </AnimatePresence>
            <div className="travel-controls">
              <button
                className="round-button"
                onClick={() => setActive((active + 2) % 3)}
                aria-label="داستان قبلی"
              >
                <Arrow direction="left" size={18} />
              </button>
              <div className="progress-dots">
                {travelCaptions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`داستان پیگیری ${i + 1}`}
                    aria-pressed={i === active}
                    className={active === i ? 'active' : ''}
                  />
                ))}
              </div>
              <button
                className="round-button"
                onClick={() => setActive((active + 1) % 3)}
                aria-label="داستان بعدی"
              >
                <Arrow size={18} />
              </button>
            </div>
          </div>
          <p className="travel-description">
            ساختار کلینیک طوری طراحی شده که همه مراحل قلبی — از نوار قلب تا نوبت پیگیری —
            برای راحتی شما و بدون معطلی هماهنگ شود.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Beauty({ onVideo }: { onVideo: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-55, 55])
  return (
    <>
      <section className="beauty-section" ref={ref}>
        <motion.picture className="beauty-background" style={{ y: reduced ? 0 : y }}>
          <source media="(max-width: 600px)" srcSet="/v8/media/beauty-mobile.webp" />
          <img src="/v8/media/beauty.webp" alt="حس آرامش و اطمینان در محیط درمان قلب" loading="lazy" />
        </motion.picture>
        <div className="beauty-marquee" aria-label="قلبی آرام، هر روز">
          <div className="marquee-track" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>قلبی آرام</span>
            ))}
          </div>
        </div>
        <div className="beauty-message shell">
          <Reveal>
            <h2>قلبی آرام، برای هر روز زندگی</h2>
            <p>
              تپش نگران‌کننده نداشتن، نفس بدون تنگی و فشار خونی که می‌شود به آن اعتماد کرد —
              این حق شماست.
            </p>
          </Reveal>
          <button
            className="beauty-play round-button"
            onClick={onVideo}
            aria-label="تماشای معرفی کلینیک قلب"
          >
            <PlayMark />
          </button>
        </div>
      </section>
      <section className="care-section">
        <div className="care-card shell">
          <Reveal className="care-product">
            <h2>{'مراقبت از\nقلب شما'}</h2>
            <img
              src="/v8/media/hair-product.webp"
              alt="تجهیزات تشخیصی قلب کلینیک قلب مهر"
              loading="lazy"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              کلینیک قلب مهر با این هدف ساخته شد که بیمار قلبی برای هر مرحله درمان، بین چند
              مرکز و چند پرونده سرگردان نشود. تجربه شانزده سال تخصص قلب و عروق دکتر صادقی
              نشان داد بیشتر نگرانی‌های بیماران از پراکندگی مسیر درمان شروع می‌شود؛ پس نوار
              قلب، اکو، تست ورزش و پیگیری را یک‌جا جمع کردیم.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              استاندارد درمان ما ساده است: شنیدن کامل شرح حال، معاینه بدون عجله، تشخیص شفاف و
              برنامه‌ای که خودتان هم آن را می‌فهمید.
            </p>
            <span className="care-signature">کلینیک قلب مهر. قلبی آرام، هر روز.</span>
          </Reveal>
        </div>
      </section>
    </>
  )
}
